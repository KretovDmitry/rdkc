const { Hospital } = require("../models/models");
const ApiError = require("../error/ApiError");

class HospitalController {
  async create(req, res, next) {
    try {
      const { hospital, emiasHospital } = req.body;
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
}

module.exports = new HospitalController();
