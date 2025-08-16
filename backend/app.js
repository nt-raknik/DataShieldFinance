import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// PORTFOLIOS
// ============================

// Obtener todos los portafolios de un usuario
app.get("/users/:userId/portfolios", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM portfolios WHERE user_id = ?",
    [req.params.userId]
  );
  res.json(rows);
});

// Crear un nuevo portafolio
app.post("/users/:userId/portfolios", async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query(
    "INSERT INTO portfolios (user_id, name) VALUES (?, ?)",
    [req.params.userId, name]
  );
  res.json({ portfolio_id: result.insertId, name });
});

// Eliminar un portafolio
app.delete("/portfolios/:portfolioId", async (req, res) => {
  await db.query("DELETE FROM portfolios WHERE portfolio_id = ?", [
    req.params.portfolioId,
  ]);
  res.json({ message: "Portfolio deleted" });
});

// ============================
// ASSETS EN PORTAFOLIOS
// ============================

// Obtener todos los assets de un portafolio
app.get("/portfolios/:portfolioId/assets", async (req, res) => {
  const [rows] = await db.query(
    `SELECT a.* 
     FROM portfolio_assets pa
     JOIN assets a ON pa.asset_id = a.asset_id
     WHERE pa.portfolio_id = ?`,
    [req.params.portfolioId]
  );
  res.json(rows);
});

// Agregar un asset a un portafolio
app.post("/portfolios/:portfolioId/assets", async (req, res) => {
  const { asset_id } = req.body;
  await db.query(
    "INSERT IGNORE INTO portfolio_assets (portfolio_id, asset_id) VALUES (?, ?)",
    [req.params.portfolioId, asset_id]
  );
  res.json({ message: "Asset added to portfolio" });
});

// Eliminar un asset de un portafolio
app.delete("/portfolios/:portfolioId/assets/:assetId", async (req, res) => {
  await db.query(
    "DELETE FROM portfolio_assets WHERE portfolio_id = ? AND asset_id = ?",
    [req.params.portfolioId, req.params.assetId]
  );
  res.json({ message: "Asset removed from portfolio" });
});

// ============================
// LISTA DE ASSETS DISPONIBLES
// ============================
app.get("/assets", async (req, res) => {
  const [rows] = await db.query("SELECT asset_id, symbol, name FROM assets");
  res.json(rows);
});

app.listen(3000, () => {
  console.log("✅ API running on http://localhost:3000");
});