const request = require("supertest");
const express = require("express");
const app = express();
const portfoliosRoutes = require("../routes/portfolios");
const assetsRoutes = require("../routes/assets");
const transactionsRoutes = require("../routes/transactions");

app.use("/api/portfolios", portfoliosRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/transactions", transactionsRoutes);

describe("Portfolio API", () => {
  // Test GET portfolios by user
  it("should get portfolios for a user", async () => {
    const res = await request(app).get("/api/portfolios/user/1");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test POST create portfolio
  /*
  it("should create a new portfolio", async () => {
    const res = await request(app)
      .post("/api/portfolios")
      .send({ user_id: 1, name: "Test Portfolio" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
  */
  // Test GET assets by portfolio
  it("should get assets in portfolio", async () => {
    const res = await request(app).get("/api/assets/1");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test POST add asset
  /*
  it("should add an asset to portfolio", async () => {
    const res = await request(app)
      .post("/api/assets/add")
      .send({ portfolio_id: 1, ticker: "TSLA", quantity: 5 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Asset added successfully");
  });
  
  // Test POST remove asset
  it("should remove an asset from portfolio", async () => {
    const res = await request(app)
      .post("/api/assets/remove")
      .send({ portfolio_id: 1, ticker: "TSLA", quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Asset removed successfully");
  });
*/
  // Test GET transactions
  it("should get transactions for a portfolio", async () => {
    const res = await request(app).get("/api/transactions/1");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test GET performance of single asset
  /*
  it("should get performance of an asset", async () => {
    const res = await request(app).get("/api/assets/1/2/performance");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("PnL");
    expect(res.body).toHaveProperty("OHLCV");
  });
  */
  // Test GET performance of entire portfolio
  /*
  it("should get portfolio performance", async () => {
    const res = await request(app).get("/api/portfolios/1/performance");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("PnL");
    expect(res.body).toHaveProperty("OHLCV");
  });
  */
});
