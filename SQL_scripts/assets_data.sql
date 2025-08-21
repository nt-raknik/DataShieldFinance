INSERT IGNORE INTO assets (symbol, name, asset_type, currency, sector) VALUES
-- 📈 Stocks
('AAPL', 'Apple Inc.', 'stock', 'USD', 'Technology'),
('MSFT', 'Microsoft Corp.', 'stock', 'USD', 'Technology'),
('TSLA', 'Tesla Inc.', 'stock', 'USD', 'Automotive'),
('AMZN', 'Amazon.com Inc.', 'stock', 'USD', 'Consumer Discretionary'),
('GOOGL', 'Alphabet Inc. (Class A)', 'stock', 'USD', 'Technology'),
('NFLX', 'Netflix Inc.', 'stock', 'USD', 'Entertainment'),
('NVDA', 'NVIDIA Corp.', 'stock', 'USD', 'Semiconductors'),
('BABA', 'Alibaba Group Holding Ltd.', 'stock', 'USD', 'E-Commerce'),
('JPM', 'JPMorgan Chase & Co.', 'stock', 'USD', 'Financials'),
('KO', 'Coca-Cola Company', 'stock', 'USD', 'Consumer Staples'),
('WMT', 'Walmart Inc.', 'stock', 'USD', 'Retail'),
('DIS', 'The Walt Disney Company', 'stock', 'USD', 'Entertainment'),

-- 🏦 Bonds
('US10Y', 'US Treasury 10Y Bond', 'bond', 'USD', 'Government'),
('US30Y', 'US Treasury 30Y Bond', 'bond', 'USD', 'Government'),
('MX10Y', 'Mexican Government Bond 10Y', 'bond', 'MXN', 'Government'),
('EU5Y', 'European Union 5Y Bond', 'bond', 'EUR', 'Government'),
('CORP-AA', 'Corporate Bond AA Rated', 'bond', 'USD', 'Corporate'),

-- 💰 Cash
('USD-CASH', 'US Dollars Cash', 'cash', 'USD', 'Cash'),
('MXN-CASH', 'Mexican Peso Cash', 'cash', 'MXN', 'Cash'),
('EUR-CASH', 'Euro Cash', 'cash', 'EUR', 'Cash'),

-- ₿ Crypto
('BTC', 'Bitcoin', 'crypto', 'USD', 'Cryptocurrency'),
('ETH', 'Ethereum', 'crypto', 'USD', 'Cryptocurrency'),
('USDT', 'Tether USD', 'crypto', 'USD', 'Stablecoin'),
('BNB', 'Binance Coin', 'crypto', 'USD', 'Cryptocurrency'),
('XRP', 'Ripple', 'crypto', 'USD', 'Cryptocurrency'),
('SOL', 'Solana', 'crypto', 'USD', 'Cryptocurrency'),
('DOGE', 'Dogecoin', 'crypto', 'USD', 'Meme Coin'),
('ADA', 'Cardano', 'crypto', 'USD', 'Cryptocurrency'),

-- 📊 Funds / ETFs
('VFIAX', 'Vanguard 500 Index Fund Admiral Shares', 'fund', 'USD', 'Index Fund'),
('QQQ', 'Invesco QQQ Trust', 'fund', 'USD', 'ETF'),
('SPY', 'SPDR S&P 500 ETF Trust', 'fund', 'USD', 'ETF'),
('ARKK', 'ARK Innovation ETF', 'fund', 'USD', 'ETF'),
('EFA', 'iShares MSCI EAFE ETF', 'fund', 'USD', 'International Equity'),
('VNQ', 'Vanguard Real Estate ETF', 'fund', 'USD', 'Real Estate');
