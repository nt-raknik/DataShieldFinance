const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getPortfolioPerformance } = require("../services/performance");
const { body, param } = require("express-validator");
const { runValidations } = require("../src/middlewares/validate");

// 1. Consultar portafolios de un usuario
// GET /portfolios/user/:userId
router.get("/user/:userId",
  runValidations([ param("userId").isInt({ min: 1 }).withMessage("userId inválido") ]),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const [rows] = await pool.query(
        `SELECT portfolio_id, user_id, name, description, created_at
         FROM portfolios WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      res.json(rows);
    } catch (err) { next(err); }
  }
);

// 4. Agregar portafolio nuevo
// POST /portfolios
router.post("/",
  runValidations([
    body("user_id").isInt({ min: 1 }).withMessage("user_id inválido"),
    body("name").isString().trim().isLength({ min: 1, max: 100 }).withMessage("name requerido (1-100)"),
    body("description").optional().isString().trim().isLength({ max: 255 })
  ]),
  async (req, res, next) => {
    const { user_id, name, description } = req.body;
    try {
      const [[exists]] = await pool.query(
        `SELECT 1 FROM portfolios WHERE user_id = ? AND name = ? LIMIT 1`,
        [user_id, name]
      );

      if (exists) {
        return res.status(409).json({
          error: "PortfolioNameExists",
          message: `User ${user_id} already has a portfolio named "${name}".`
        });
      }

      const [result] = await pool.query(
        `INSERT INTO portfolios (user_id, name, description)
         VALUES (?, ?, ?)`,
        [user_id, name, description ?? null]
      );

      return res.status(201).json({ portfolio_id: result.insertId });
    } catch (err) {
      return next(err);
    }
  }
);




// 7b. Performance de un portafolio
// GET /portfolios/:portfolioId/performance (sin cambios, solo valida)
router.get("/:portfolioId/performance",
  runValidations([ param("portfolioId").isInt({ min: 1 }).withMessage("portfolioId inválido") ]),
  async (req, res, next) => {
    try {
      const { getPortfolioPerformance } = require("../services/performance");
      const data = await getPortfolioPerformance(Number(req.params.portfolioId));
      res.json(data);
    } catch (err) { next(err); }
  }
);

router.get("/:portfolioId/holdings", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.asset_id,
        a.symbol,
        a.name,
        SUM(CASE WHEN t.type = 'buy' THEN t.quantity 
                WHEN t.type = 'sell' THEN -t.quantity
                ELSE 0 END) AS quantity,
        -- Get the latest buy price for the asset
        (SELECT price FROM transactions 
         WHERE asset_id = a.asset_id AND portfolio_id = ? AND type = 'buy' 
         ORDER BY date DESC, transaction_id DESC LIMIT 1) AS price,
        -- Get the fees from the latest buy transaction
        (SELECT fees FROM transactions 
         WHERE asset_id = a.asset_id AND portfolio_id = ? AND type = 'buy' 
         ORDER BY date DESC, transaction_id DESC LIMIT 1) AS fees
      FROM 
        transactions t
      JOIN 
        assets a ON t.asset_id = a.asset_id
      WHERE 
        t.portfolio_id = ?
        AND t.type IN ('buy', 'sell')
      GROUP BY 
        a.asset_id, a.symbol, a.name
      HAVING 
        SUM(CASE WHEN t.type = 'buy' THEN t.quantity 
                WHEN t.type = 'sell' THEN -t.quantity
                ELSE 0 END) > 0
      ORDER BY 
        a.symbol
    `, [req.params.portfolioId, req.params.portfolioId, req.params.portfolioId]);
    
    res.json(rows);
  } catch (err) {
    console.error("Error fetching holdings:", err);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

// Add this to routes/portfolios.js if it doesn't already exist
router.delete("/user/:userId/portfolio/:portfolioId", async (req, res) => {
  try {
    const { userId, portfolioId } = req.params;
    
    // Delete the portfolio
    const result = await pool.query(
      "DELETE FROM portfolios WHERE user_id = ? AND portfolio_id = ?",
      [userId, portfolioId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    
    res.json({ success: true, message: "Portfolio deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete portfolio" });
  }
});

// GET /portfolios/:portfolioId/holdings/value-breakdown
// Devuelve: total_value_usd y cada holding con value_usd y weight (%)
router.get("/:portfolioId/holdings/value-breakdown", async (req, res, next) => {
  try {
    const { portfolioId } = req.params;

    // Cantidad neta (compras - ventas) + último precio de compra para cada asset
    const [rows] = await pool.query(
      `
      SELECT 
        a.asset_id,
        a.symbol,
        a.name,
        -- Cantidad neta
        SUM(CASE 
              WHEN t.type = 'buy'  THEN t.quantity
              WHEN t.type = 'sell' THEN -t.quantity
              ELSE 0 
            END) AS quantity,
        -- Último precio de compra para estimar valor (puedes sustituir por precio de mercado)
        (
          SELECT tt.price 
          FROM transactions tt
          WHERE tt.asset_id = a.asset_id 
            AND tt.portfolio_id = ? 
            AND tt.type = 'buy'
          ORDER BY tt.date DESC, tt.transaction_id DESC
          LIMIT 1
        ) AS last_buy_price
      FROM transactions t
      JOIN assets a ON t.asset_id = a.asset_id
      WHERE 
        t.portfolio_id = ?
        AND t.type IN ('buy','sell')
      GROUP BY a.asset_id, a.symbol, a.name
      HAVING SUM(CASE WHEN t.type = 'buy' THEN t.quantity 
                      WHEN t.type = 'sell' THEN -t.quantity 
                      ELSE 0 END) > 0
      ORDER BY a.symbol
      `,
      [portfolioId, portfolioId]
    );

    // Calcular valor y pesos
    const enriched = rows.map(r => {
      const qty   = Number(r.quantity ?? 0);
      const price = Number(r.last_buy_price ?? 0);
      const value = qty * price;  // << usa último precio de compra (sustituible por precio de mercado)
      return {
        asset_id: r.asset_id,
        symbol: r.symbol,
        name: r.name,
        quantity: qty,
        price_usd: price,
        value_usd: value
      };
    });

    const totalValue = enriched.reduce((acc, x) => acc + (x.value_usd || 0), 0);
    const withWeights = enriched.map(x => ({
      ...x,
      weight: totalValue > 0 ? (x.value_usd / totalValue) * 100 : 0
    }));

    res.json({
      portfolio_id: Number(portfolioId),
      total_value_usd: totalValue,
      holdings: withWeights
    });
  } catch (err) {
    console.error("Error in value-breakdown:", err);
    next(err);
  }
});


module.exports = router;
