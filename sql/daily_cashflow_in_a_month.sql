with
  days as (
    select
      x,
      xtn_date::date as xtn_date,
      date_trunc('month', xtn_date) as xtn_month
    from (
      select x, (select min(xtn_month) from ledger) + (x || ' days')::interval as xtn_date
      from generate_series(0,2500) x
    ) x
  ),
  assets as (
    select
      xtn_date,
      xtn_month,
      xtn_year,
      amount
    from ledger
    where account ~ 'Assets:(Cash|Fidor|DKB|PayPal)'
    order by xtn_date, amount
  )
    select
    xtn_date as "Date",
    starting as "Starting",
    cash_in as "Cash In",
    cash_out as "Cash Out",
    cash_in + cash_out as "Net",
    nettt as "Net2",
    ending as "Ending",
    cash_in_acc as "Cash In Acc",
    cash_out_acc as "Cash Out Acc",
    fund_balance as "Fund Balance",
    ending - fund_balance as "Available Cash"
    from (
    select
    days.xtn_date as xtn_date,
    days.xtn_month::date as xtn_month,
    coalesce((select sum(amount) from assets where xtn_date < days.xtn_date),0) as starting,
    coalesce((select sum(case when amount > 0 then amount else 0 end) from assets where xtn_date = days.xtn_date), 0) as cash_in,
    coalesce((select sum(case when amount > 0 then amount else 0 end) from assets where days.xtn_month <= xtn_date and xtn_date <= days.xtn_date), 0) as cash_in_acc,
    coalesce((select sum(case when amount < 0 then amount else 0 end) from assets where xtn_date = days.xtn_date), 0) as cash_out,
    coalesce((select sum(case when amount < 0 then amount else 0 end) from assets where days.xtn_month <= xtn_date and xtn_date <= days.xtn_date), 0) as cash_out_acc,
    coalesce((select sum(amount) from assets where xtn_date = days.xtn_date), 0) as nettt,
    coalesce((select sum(amount) from assets where xtn_date <= days.xtn_date), 0) as ending,
    coalesce((select sum(amount) from assets where days.xtn_month <= xtn_date and xtn_date <= days.xtn_date), 0) as oending,
    coalesce((select sum(amount) from ledger where account ~ 'Assets:Funds' and ledger.xtn_date <= days.xtn_date),0) as fund_balance
    from days
    ) x
  where xtn_month = '2018-03-01'
;
