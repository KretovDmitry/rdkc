const { Patient } = require("../models/models");
const ApiError = require("../error/ApiError");

class PatientController {
  async create(req, res, next) {
    try {
      const newPatient = await Patient.create({ ...req.body });
      return res.json(newPatient);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const patients = await Patient.findAll();
      return res.json(patients);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { id } = req.params;
    try {
      const patient = await Patient.findOne({ where: { id } });
      return res.json(patient);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new PatientController();
