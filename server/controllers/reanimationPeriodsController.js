const {
  ReanimationPeriod,
  CurrentReanimationPeriod,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class ReanimationPeriodsController {
  async create(req, res, next) {
    try {
      const newReanimationPeriod = await ReanimationPeriod.create({
        ...req.body,
      });
      return res.json(newReanimationPeriod);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const reanimationPeriods = await CurrentReanimationPeriod.findAll();
      return res.json(reanimationPeriods);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { status } = req.params;
    try {
      const patient = await Request.findOne({ where: { id } });
      return res.json(patient);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ReanimationPeriodsController();
