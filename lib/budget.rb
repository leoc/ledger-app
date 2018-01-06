class BudgetSummaryReport < LedgerWeb::Report
  def self.run(limit=nil, force_now=false)
    limit_sql = limit ? "limit #{limit.to_i}" : ""
    if force_now
      params[:month] = Date.new(Date.today.year, Date.today.month, 1)
    end
    month_where = params[:month] ? 'xtn_month = :month' : '1 = 1'
    from_query("""
      with budget_summary as (
      select
          b.xtn_month,
          x.account as account,
          x.amount as expense,
          b.amount as budgeted
      from (
          select
               xtn_month,
               account,
               sum(amount) as amount
          from
               budget_months
          where
               amount > 0
               and #{month_where}
          group by
               xtn_month,
               account
      ) b
      left outer join (
          select
              ledger.xtn_month,
              budget_periods.account,
              sum(ledger.amount) as amount
          from
              ledger
          cross join budget_periods
          where #{month_where} and ledger.account ~ budget_periods.account
          group by
              ledger.xtn_month,
              budget_periods.account
      ) x on b.account = x.account and x.xtn_month = b.xtn_month
      where b.amount > 0
      order by
         b.xtn_month,
         x.account
      )
      select
          xtn_month as \"Month\",
          sum(budgeted) as \"Budget\",
          coalesce(sum(expense), 0) as \"Spent\",
          sum(budgeted) - coalesce(sum(expense), 0) as \"Diff\"
      from
          budget_summary
      where
          #{month_where}
      group by
          xtn_month
      order by
          xtn_month desc
      #{limit_sql}
    """)
  end
end
