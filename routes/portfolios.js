const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getPortfolioPerformance } = require("../services/performance");

// 1. Consultar portafolios de un usuario
router.get("/user/:userId", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM portfolios WHERE user_id = ?",
    [req.params.userId]
  );
  res.json(rows);
});

// 4. Agregar portafolio nuevo
router.post("/", async (req, res) => {
  const { user_id, name, description } = req.body;
  await pool.query(
    "INSERT INTO portfolios (user_id, name, description) VALUES (?, ?, ?)",
    [user_id, name, description]
  );
  res.json({ message: "Portfolio created" });
});

// 7b. Performance de un portafolio
router.get("/:portfolioId/performance", async (req, res) => {
  const portfolioId = req.params.portfolioId;
  try {
    const result = await getPortfolioPerformance(portfolioId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating performance" });
  }
});

module.exports = router;
