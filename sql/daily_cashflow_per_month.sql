with
  days as (
    select x, date_trunc('day', xtn_date) as xtn_date, date_trunc('month', xtn_date) as xtn_month
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
  ),
  daily_cashflow as (
  select
  xtn_date::date,
  xtn_month::date,
  coalesce((select sum(case when amount > 0 then amount else 0 end) from assets where xtn_date = days.xtn_date), 0) as cash_in,
  coalesce((select sum(case when amount < 0 then amount else 0 end) from assets where xtn_date = days.xtn_date), 0) as cash_out,
  coalesce((select sum(amount) from assets where xtn_date = days.xtn_date), 0) as net
  from days
  )
  select
  xtn_date as "Date",
  cash_in as "Cash In",
  cash_out as "Cash Out",
  cash_in + cash_out as "Net",
  net as "Net2",
  coalesce((select sum(case when net > 0 then net else 0 end) from daily_cashflow a where daily_cashflow.xtn_month <= xtn_date and xtn_date <= daily_cashflow.xtn_date), 0) as "Accumulated Cash In",
  coalesce((select sum(case when net < 0 then net else 0 end) from daily_cashflow a where daily_cashflow.xtn_month <= xtn_date and xtn_date <= daily_cashflow.xtn_date), 0) as "Accumulated Cash Out"
  from daily_cashflow
  where xtn_month = '2018-03-01';
