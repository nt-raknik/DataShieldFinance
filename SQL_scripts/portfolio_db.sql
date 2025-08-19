-- ==========================================
-- DATABASE: Single User Financial Portfolio
-- ==========================================

CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- ==========================================
-- USERS TABLE (even if single user, future-proof)
-- ==========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ASSETS TABLE
-- ==========================================
CREATE TABLE assets (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    asset_type ENUM('stock','bond','crypto','fund','cash') NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    sector VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, currency)
);

-- ==========================================
-- TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    date DATE NOT NULL,
    type ENUM('buy','sell','dividend','deposit','withdrawal') NOT NULL,
    quantity DECIMAL(18,6) NOT NULL,
    price DECIMAL(18,6) NOT NULL,
    fees DECIMAL(18,2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX(user_id),
    INDEX(asset_id),
    INDEX(date)
);

-- ==========================================
-- HOLDINGS TABLE (cached for faster queries)
-- ==========================================
CREATE TABLE holdings (
    holding_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    quantity DECIMAL(18,6) NOT NULL,
    avg_cost DECIMAL(18,6) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    UNIQUE(user_id, asset_id)
);

-- ==========================================
-- MARKET PRICES TABLE
-- ==========================================
CREATE TABLE market_prices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    date DATE NOT NULL,
    close_price DECIMAL(18,6) NOT NULL,
    high_price DECIMAL(18,6),
    low_price DECIMAL(18,6),
    volume BIGINT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    UNIQUE(asset_id, date),
    INDEX(asset_id),
    INDEX(date)
);
