const { Patient } = require("../models/models");
const ApiError = require("../error/ApiError");

class PatientController {
  async create(req, res, next) {
    try {
      const newStaff = await Patient.create({ ...req.body });
      return res.json(newStaff);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const staff = await Patient.findAll();
      return res.json(staff);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { id } = req.params;
    try {
      const staff = await Patient.findOne({ where: { id } });
      return res.json(staff);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new PatientController();
