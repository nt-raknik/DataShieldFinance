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

module.exports = router;
