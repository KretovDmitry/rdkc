const { Physician } = require("../models/models");
const ApiError = require("../error/ApiError");

class PhysicianController {
  async create(req, res, next) {
    try {
      const newPhysician = await Physician.create({ ...req.body });
      return res.json(newPhysician);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const physicians = await Physician.findAll();
      return res.json(physicians);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { id } = req.params;
    try {
      const physician = await Physician.findOne({ where: { id } });
      return res.json(physician);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new PhysicianController();
