const express = require("express");
const router = express.Router();
const pool = require("../db");

// 3. Consultar historial de transacciones de un portafolio
router.get("/:portfolioId", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, a.symbol, a.name 
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE portfolio_id = ?
     ORDER BY date ASC`,
    [req.params.portfolioId]
  );
  res.json(rows);
});

module.exports = router;
