const { Staff } = require("../models/models");
const ApiError = require("../error/ApiError");

class StaffController {
  async create(req, res, next) {
    try {
      const newStaff = await Staff.create({ ...req.body });
      return res.json(newStaff);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const staff = await Staff.findAll();
      return res.json(staff);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { id } = req.params;
    try {
      const staff = await Staff.findOne({ where: { id } });
      return res.json(staff);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new StaffController();
