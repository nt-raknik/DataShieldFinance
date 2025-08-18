const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getAssetPerformance } = require("../services/performance");
const { noticias, marketNews } = require("../services/financial-data-client");

// 2. Consultar assets correspondientes a un portafolio
router.get("/noticias", async (req, res) => {

  //Api de ERik
  //console.log("Pruebas sobre las noticias de Erik");
  //const data = await noticias();
  //return res.json(data);
  //return getNoticias.noticias();

  //Api de Noel 
  console.log("Pruebas sobre las noticias de Noel");
  const data = await marketNews("general",{});
  return res.json(data);
});

// 2. Consultar assets correspondientes a un portafolio
router.get("/:portfolioId", async (req, res) => {
  console.log("Fetching assets for portfolio:", req.params.portfolioId);
  const [rows] = await pool.query(
    `SELECT DISTINCT a.* 
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE t.portfolio_id = ?`,
    [req.params.portfolioId]
  );
  res.json(rows);
});

// 5. Agregar asset a un portafolio (via transacción BUY)
router.post("/add", async (req, res) => {
  const { portfolio_id, asset_id, quantity, price } = req.body;
  await pool.query(
    `INSERT INTO transactions 
     (portfolio_id, asset_id, date, type, quantity, price) 
     VALUES (?, ?, CURDATE(), 'buy', ?, ?)`,
    [portfolio_id, asset_id, quantity, price]
  );
  res.json({ message: "Asset added to portfolio" });
});

// 6. Eliminar asset de un portafolio (via transacción SELL)
router.post("/remove", async (req, res) => {
  const { portfolio_id, asset_id, quantity, price } = req.body;
  await pool.query(
    `INSERT INTO transactions 
     (portfolio_id, asset_id, date, type, quantity, price) 
     VALUES (?, ?, CURDATE(), 'sell', ?, ?)`,
    [portfolio_id, asset_id, quantity, price]
  );
  res.json({ message: "Asset removed (sell transaction created)" });
});

// 7a. Performance de un asset
router.get("/:portfolioId/:assetId/performance", async (req, res) => {
  const { portfolioId, assetId } = req.params;
  try {
    const result = await getAssetPerformance(portfolioId, assetId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating asset performance" });
  }
});

module.exports = router;
