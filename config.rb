Encoding.default_internal = Encoding::UTF_8
Encoding.default_external = Encoding::UTF_8

LedgerWeb::Config.new do |config|
  config.set :database_url, "postgres://#{ENV['DB_USERNAME'] || 'postgres'}:#{ENV['DB_PASSWORD'] || ''}@#{ENV['DB_HOST'] || 'localhost'}:#{ENV['DB_PORT'] || '5432'}/#{ENV['DB_NAME'] || 'ledger'}"
  config.set :index_report, :monthly_snapshot
  config.set :ledger_format, "%(quoted(xact.beg_line)),%(quoted(date)),%(quoted(payee)),%(quoted(account)),%(quoted(commodity(scrub(display_amount)))),%(quoted(quantity(scrub(display_amount)))),%(quoted(cleared)),%(quoted(virtual)),%(quoted(join(note | xact.note))),%(quoted(cost)),%(quoted(code)),%(quoted(filename))\n"
  config.set :ledger_columns, [ :xtn_id, :xtn_date, :note, :account, :commodity, :amount, :cleared, :virtual, :tags, :cost, :checknum, :filename ]
  config.set :additional_view_directories, [File.join(File.dirname(__FILE__), 'views')]

  config.set :watch_interval, 30
  config.set :watch_stable_count, 1

  config.set :files_seen, {}
  config.set :file_count, 0
  config.add_hook :before_insert_row do |row|
    row[:filename] = config.get(:last_file) if row[:filename] =~ /\/budget.ledger$/

    filename = row[:filename]
    unless config.get(:files_seen)[filename]
      count = config.get(:file_count)
      count += 1
      puts "File #{count}"
      config.set(:file_count, count)
      config.get(:files_seen)[filename] = count
    end

    row[:commodity] = row[:commodity].gsub(/"/, '')

    row[:xtn_id] = row[:xtn_id].to_i + (config.get(:files_seen)[filename] * 1_000_000)

    tags_hash = {}
    comments = []
    row[:tags].strip.split('\n').each do |tag|
      if tag =~ /([^:]+):(.*)/
        k,v = tag.split(/:\s+/, 2)
        next if k.nil? || v.nil?

        k = k.strip
        v = v.strip
        tags_hash[k] = v
      elsif tag =~ /:([^:]+):/
        bool_tags = tag.split(':').reject { |t| t == '' }
        bool_tags.each do |bool_tag|
          tags_hash[bool_tag] = true
        end
      else
        comments.push(tag)
      end
    end
    row[:comments] = comments.map(&:strip).join("\n")
    row[:jtags] = tags_hash.to_json

    reference_date = Date.new(2011, 4, 15)

    xtn_date = Date.strptime(row[:xtn_date], "%Y/%m/%d")

    row[:pay_period] = 2

    if xtn_date >= reference_date then
      if xtn_date.day <= 15
        row[:pay_period] = 1
      end
    else
      if xtn_date.day <= 6 or xtn_date.day >= 22 then
        row[:pay_period] = 1
      end
    end

    row

  end

  config.add_hook :after_insert_row do |row|
    config.set(:last_file, row[:filename])
  end

  config.add_hook :before_load do |db|
    config.set :load_start, Time.now.utc
    d = Digest::SHA1.new
    puts "Calculating checksum"

    d.file(ENV['LEDGER_FILE'])

    config.set :checksum, d.hexdigest()
    puts "Done calculating checksum"
  end

  config.add_hook :after_load do |db|
    puts "Loading budget"

    db["delete from budget_periods"].delete

    path = File.join(File.dirname(ENV['LEDGER_FILE']), "budget_periods.csv")

    next unless File.exists?(path)

    puts "loading budgets #{path}"

    CSV.foreach(path, :headers => true) do |row|
      db[:budget_periods].insert(row.to_hash)
    end

    puts "Done loading budget"
  end

  config.add_hook :after_load do |db|
    puts "Inserting update record"
    now = Time.now.utc
    start = config.get :load_start
    checksum = config.get :checksum

    puts "Doing insert"
    db[:update_history].insert(
      :updated_at => now,
      :num_seconds => now - start,
      :checksum => checksum
    )
    puts "Done Inserting Update Record"
  end

  config.add_hook :after_load do |db|
    puts "Updating xtn_week"
    db["update ledger set xtn_week = date_trunc('week', xtn_date)::date"].update
  end

  config.add_hook :after_load do |db|
    puts "Updating calendar"
    db["delete from calendar"].delete
    db.run("insert into calendar select xtn_date, date_trunc('week', xtn_date)::date as xtn_week, date_trunc('month', xtn_date)::date as xtn_month, date_trunc('year', xtn_date)::date as xtn_year, to_char(xtn_date, 'ID')::integer as dow, to_char(xtn_date, 'W')::integer as wom, to_char(xtn_date, 'IW')::integer as woy from (select ('2007-01-01'::date + (x || ' days')::interval)::date as xtn_date from generate_series(0,20000) x) x")
  end
end
