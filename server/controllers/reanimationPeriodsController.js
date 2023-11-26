const {
  ReanimationPeriod,
  CurrentReanimationPeriod,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class ReanimationPeriodsController {
  async testCRP(req, res, next) {
    try {
      const newReanimationPeriod = await CurrentReanimationPeriod.create({
        ...req.body,
      });
      return res.json({
        id: newReanimationPeriod.id,
        newReanimationPeriod,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async testRP(req, res, next) {
    try {
      const newReanimationPeriod = await ReanimationPeriod.create({
        ...req.body,
      });
      return res.json({
        id: newReanimationPeriod.id,
        newReanimationPeriod,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async create(req, res, next) {
    try {
      const { dataValues: curRP } = await CurrentReanimationPeriod.findOne({
        where: { objectValue: req.body.objectValue },
        attributes: {
          exclude: ["id", "createdAt", "updatedAt"],
        },
      });
      const [rp] = await ReanimationPeriod.findOrCreate({
        where: { objectValue: req.body.objectValue },
        defaults: { ...curRP },
      });
      return res.json({ ...rp });
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
  // async getOne(req, res, next) {
  //   const { status } = req.params;
  //   try {
  //     const patient = await Request.findOne({ where: { id } });
  //     return res.json(patient);
  //   } catch (e) {
  //     next(ApiError.badRequest(e.message));
  //   }
  // }
}

module.exports = new ReanimationPeriodsController();
