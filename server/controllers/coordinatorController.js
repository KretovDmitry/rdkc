const { Hospital } = require("../models/models");
const ApiError = require("../error/ApiError");

class CoordinatorController {
  async create(req, res, next) {
    try {
      const { lastName, firstName, middleName, cellPhoneNumber } = req.body;
      const newHospital = await Hospital.create({ hospital, emiasHospital });
      return res.json(newHospital);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res) {
    const hospitals = await Hospital.findAll();
    return res.json(hospitals);
  }
  async getOne(req, res, next) {
    const { id } = req.params;
    if (!id) {
      return next(ApiError.badRequest("Не задан ID"));
    }
    const hospital = await Hospital.findOne({ where: { id } });
    return res.json(hospital);
  }
}

module.exports = new CoordinatorController();
