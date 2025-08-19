-- ==========================================
-- DATABASE: Multi Portfolio per User
-- ==========================================

CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    base_currency CHAR(3) DEFAULT 'USD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PORTFOLIOS TABLE
-- ==========================================
CREATE TABLE portfolios (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, name) -- Un mismo usuario no repite nombre de portafolio
);

-- ==========================================
-- ASSETS TABLE
-- (Global catálogo de instrumentos financieros)
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
-- (Ahora ligadas a portfolio_id, no solo al user)
-- ==========================================
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    asset_id INT NOT NULL,
    date DATE NOT NULL,
    type ENUM('buy','sell','dividend','deposit','withdrawal') NOT NULL,
    quantity DECIMAL(18,6) NOT NULL,
    price DECIMAL(18,6) NOT NULL,
    fees DECIMAL(18,2) DEFAULT 0.00,
    notes TEXT,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX(portfolio_id),
    INDEX(asset_id),
    INDEX(date)
);
