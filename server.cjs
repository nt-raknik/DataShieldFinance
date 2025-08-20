// server.cjs
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const app = express();

// ----- Middlewares base -----
app.use(express.json());

// CORS: ajusta CORS_ORIGINS en .env (ej: http://localhost:5173)
const origins = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: origins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Seguridad y logs
app.use(helmet());
app.use(morgan("dev"));

// Rate limit básico (ajusta si hace falta)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,                 // 300 req por ventana
  standardHeaders: true,
  legacyHeaders: false
}));

// ----- Healthcheck -----
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ----- Rutas -----
const portfoliosRoutes = require("./routes/portfolios");
const assetsRoutes = require("./routes/assets");
const transactionsRoutes = require("./routes/transactions");

app.use("/api/portfolios", portfoliosRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/transactions", transactionsRoutes);

// ----- 404 -----
app.use((req, res, _next) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// ----- Handler global de errores -----
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);

  // Duplicados (UNIQUE/PK) MySQL
  if (err?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Duplicate entry", details: err.sqlMessage });
  }

  // Errores de validación (si tus rutas los marcan como { type: "validation" })
  if (err?.type === "validation") {
    return res.status(400).json({ error: "ValidationError", details: err.details });
  }

  // Fallback
  res.status(500).json({ error: "InternalServerError" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
