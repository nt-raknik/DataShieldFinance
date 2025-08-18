
-- ==========================================
-- SAMPLE DATA
-- ==========================================

INSERT INTO users (name, email)
VALUES ('John Doe', 'john@example.com');

INSERT INTO assets (symbol, name, asset_type, currency, sector)
VALUES 
('AAPL', 'Apple Inc.', 'stock', 'USD', 'Technology'),
('BTC-USD', 'Bitcoin', 'crypto', 'USD', NULL);

INSERT INTO transactions (user_id, asset_id, date, type, quantity, price, fees)
VALUES
(1, 1, '2025-08-01', 'buy', 10, 180.50, 1.00),
(1, 1, '2025-08-10', 'buy', 5, 185.00, 1.00),
(1, 2, '2025-08-05', 'buy', 0.1, 65000.00, 5.00);

INSERT INTO market_prices (asset_id, date, close_price)
VALUES
(1, '2025-08-14', 190.00),
(2, '2025-08-14', 68000.00);

INSERT INTO holdings (user_id, asset_id, quantity, avg_cost)
VALUES
(1, 1, 15, 182.00),
(1, 2, 0.1, 65000.00);

-- ==========================================
-- EXAMPLE QUERIES
-- ==========================================

-- 1. Current portfolio value
SELECT 
    h.asset_id,
    a.symbol,
    h.quantity,
    mp.close_price,
    (h.quantity * mp.close_price) AS market_value,
    (h.quantity * h.avg_cost) AS cost_basis,
    ((h.quantity * mp.close_price) - (h.quantity * h.avg_cost)) AS unrealized_gain
FROM holdings h
JOIN assets a ON h.asset_id = a.asset_id
JOIN market_prices mp ON h.asset_id = mp.asset_id
WHERE mp.date = (SELECT MAX(date) FROM market_prices WHERE asset_id = h.asset_id)
AND h.user_id = 1;

-- 2. Transaction history for a user
SELECT 
    t.date, a.symbol, t.type, t.quantity, t.price, t.fees
FROM transactions t
JOIN assets a ON t.asset_id = a.asset_id
WHERE t.user_id = 1
ORDER BY t.date DESC;

-- 3. Total portfolio gain/loss
SELECT 
    SUM(h.quantity * mp.close_price) AS total_value,
    SUM(h.quantity * h.avg_cost) AS total_cost_basis,
    SUM((h.quantity * mp.close_price) - (h.quantity * h.avg_cost)) AS total_unrealized_gain
FROM holdings h
JOIN market_prices mp ON h.asset_id = mp.asset_id
WHERE mp.date = (SELECT MAX(date) FROM market_prices WHERE asset_id = h.asset_id)
AND h.user_id = 1;
