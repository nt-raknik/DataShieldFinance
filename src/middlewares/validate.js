// src/middlewares/validate.js
const { validationResult } = require("express-validator");

function runValidations(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)));
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const details = result.array().map(e => ({ field: e.path, msg: e.msg }));
    const err = new Error("ValidationError");
    err.type = "validation";
    err.details = details;
    return next(err);
  };
}

module.exports = { runValidations };
