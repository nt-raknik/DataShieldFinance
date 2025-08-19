const express = require("express");
const app = express();
app.use(express.json());

const portfoliosRoutes = require("./routes/portfolios");
const assetsRoutes = require("./routes/assets");
const transactionsRoutes = require("./routes/transactions");

app.use("/api/portfolios", portfoliosRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/transactions", transactionsRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
