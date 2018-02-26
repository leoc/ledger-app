module Constants
  CURRENT_ACCOUNTS = 'Assets:(Cash|Fidor|DKB|PayPal)'
  LONG_TERM_FUNDS  =
    'Assets:Funds:(Emergency|Travel|Legal|Living:Household|Auto|Bike|Education|Entertainment|Medical|Clothes|Gifts|Investable)'
  LONG_TERM_LIABILITIES = 'Liabilities:(Loans)'
  LIQUID_TICKERS   = 'VASIX|\$'
end

if ENV['RACK_ENV'] != 'production'
  LedgerWeb::Database.handle.logger = Logger.new($stdout)
end
