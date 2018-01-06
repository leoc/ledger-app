require 'rubygems'
require 'ledger_web'
# require 'grack'
require 'rack/rewrite'
require 'rest-client'

ENV['INLINEDIR'] = Dir.mktmpdir

LedgerWeb::Config.instance.load_user_config(File.dirname(__FILE__))
LedgerWeb::Database.connect

lib_dir = File.join(File.dirname(__FILE__), "lib")
$LOAD_PATH.unshift(lib_dir)
Dir[File.join(lib_dir, "*.rb")].each {|file| require File.basename(file) }

LedgerWeb::Application.set(:public_folder, File.join(File.dirname(__FILE__), 'public'))
ledger = LedgerWeb::Application.new

# use Rack::Auth::Basic, 'Ledger' do |username, password|
#   username == ENV['LEDGER_USERNAME'] && password == ENV['LEDGER_PASSWORD']
# end

use Rack::Rewrite do
  r301 '/reports/dashboard', '/reports/_dashboard'
end

# repo = Grack::App.new(
#   project_root: ENV['PROJECT_ROOT'],
#   upload_pack: true,
#   receive_pack: true
# )

require 'sinatra/base'

class LedgerCapture < Sinatra::Base
  get '' do
    "list transactions"
  end
  post '' do
    content_type :json
    transaction = JSON.parse(request.body.read)
    puts transaction.inspect
    File.open(ENV['LEDGER_CAPTURE_FILE'], 'a') { |f| f.write(<<XTN) }

#{transaction['date'].gsub('-', '/')} * #{transaction['payee']}
    ; location: #{transaction['location']}
    #{transaction['account']}  #{transaction['amount']} EUR
    #{transaction['creditAccount']}
XTN
    {:success => "ok"}.to_json
  end
  put '' do
    "Modifying existing transaction"
  end
end

run(
  Rack::URLMap.new(
    # '/repo' => repo,
    '/public' => Rack::File.new('./public'),
    # '/files' => Rack::File.new(File.dirname(ENV['LEDGER_FILE'])),
    '/maps' => Proc.new do |env|
      ['200', {'Content-Type' => 'text/html'}, [RestClient.get("https://maps.googleapis.com#{env['REQUEST_URI']}").body]]
    end,
    '/transactions' => LedgerCapture.new,
    '/' => ledger
  )
)
