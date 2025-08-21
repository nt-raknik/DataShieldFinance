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


// --- NUEVO: crear transacción genérica (buy/sell/dividend/deposit/withdrawal)
// POST /api/transactions
// body: { portfolio_id, asset_id, date, type, quantity, price, fees?, notes? }
router.post("/", async (req, res, next) => {
  try {
    const { portfolio_id, asset_id, date, type, quantity, price, fees, notes } = req.body || {};

    if (!portfolio_id || !asset_id || !date || !type || quantity === undefined || price === undefined) {
      return res.status(400).json({ error: "portfolio_id, asset_id, date, type, quantity, price son obligatorios" });
    }
    const VALID_TYPES = new Set(['buy','sell','dividend','deposit','withdrawal']);
    if (!VALID_TYPES.has(type)) return res.status(400).json({ error: "type inválido" });

    const qty = Number(quantity);
    const prc = Number(price);
    if (!(qty >= 0) || !(prc >= 0)) return res.status(400).json({ error: "quantity >= 0 y price >= 0" });

    const [result] = await pool.query(
      `INSERT INTO transactions (portfolio_id, asset_id, date, type, quantity, price, fees, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [portfolio_id, asset_id, date, type, qty, prc, Number(fees ?? 0), notes ?? null]
    );

    res.status(201).json({
      transaction_id: result.insertId,
      portfolio_id, asset_id, date, type,
      quantity: qty, price: prc, fees: Number(fees ?? 0), notes: notes ?? null
    });
  } catch (err) { next(err); }
});

module.exports = router;
