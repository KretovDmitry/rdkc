const { Icd } = require("../models/models");
const ApiError = require("../error/ApiError");

class IcdController {
  async create(req, res, next) {
    try {
      const newIcd = await Icd.create({ ...req.body });
      return res.json(newIcd);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res, next) {
    const icds = await Icd.findAll();
    return res.json(icds);
  }
}

module.exports = new IcdController();
