const { Coordinator } = require("../models/models");
const ApiError = require("../error/ApiError");

class CoordinatorController {
  async create(req, res, next) {
    try {
      const newCoordinator = await Coordinator.create({ ...req.body });
      return res.json(newCoordinator);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const coordinators = await Coordinator.findAll();
      return res.json(coordinators);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { id } = req.params;
    try {
      const coordinator = await Coordinator.findOne({ where: { id } });
      return res.json(coordinator);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new CoordinatorController();
