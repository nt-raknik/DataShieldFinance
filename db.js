const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "tu_password",
  database: "portfolio_db"
});

module.exports = pool;
