class CashFlowReport < LedgerWeb::Report
  def self.run(timespan: 'month', date: Date.today.strftime('%Y-%m-01'))
    date_eq = "xtn_#{timespan} = '#{date}'"
    query = """
      with months as (
        select
          x,
          xtn_date,
          date_trunc('year', xtn_date) as xtn_year
        from (
          select
            x,
            (select min(xtn_month) from ledger where account ~ '#{Constants::CURRENT_ACCOUNTS}') + (x || ' months')::interval as xtn_date
           from
             generate_series(0,120) x
        ) x
      ),
      assets as (
        select
          xtn_date,
          xtn_month,
          xtn_year,
          amount
        from
          ledger
        where
          account ~ '#{Constants::CURRENT_ACCOUNTS}'
        order by
          xtn_date,
          amount
      )
      select
        xtn_month as \"Month\",
        starting as \"Starting\",
        cash_in as \"Cash In\",
        cash_out as \"Cash Out\",
        cash_in + cash_out as \"Net\",
        ending as \"Ending\",
        fund_balance as \"Fund Balance\",
        ending - fund_balance as \"Available Cash\"
      from (
        select
          months.xtn_date::date as xtn_month,
          months.xtn_year::date as xtn_year,
          coalesce((select sum(amount) from assets where xtn_date < months.xtn_date),0) as starting,
          coalesce((select sum(case when amount > 0 then amount else 0 end) from assets where xtn_date between months.xtn_date and (months.xtn_date + '1 month'::interval) - '1 day'::interval), 0) as cash_in,
          coalesce((select sum(case when amount < 0 then amount else 0 end) from assets where xtn_date between months.xtn_date and (months.xtn_date + '1 month'::interval) - '1 day'::interval), 0) as cash_out,
          coalesce((select sum(amount) from assets where xtn_date <= (months.xtn_date + '1 month'::interval) - '1 day'::interval), 0) as ending,
          coalesce((select sum(amount) from ledger where account ~ 'Assets:Funds' and ledger.xtn_month <= months.xtn_date),0) as fund_balance
        from
          months
        where
          xtn_date + '1 month'::interval <= date_trunc('month', now()::date) + '1 month'::interval
      ) x
      where #{date_eq}
    """
    from_query(query)
  end
end
