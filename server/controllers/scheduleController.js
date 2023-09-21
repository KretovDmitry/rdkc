const { Schedule } = require("../models/models");
const ApiError = require("../error/ApiError");

class HospitalController {
  async create(req, res, next) {
    try {
      const { hospital, emiasHospital } = req.body;
      const newHospital = await Schedule.create({ hospital, emiasHospital });
      return res.json(newHospital);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    const { coordinatorId, physicianId, date } = req.params;
    if (!date) {
      return next(ApiError.badRequest("Не задана дата"));
    }
    if (!coordinatorId && !physicianId) {
    }
    if (!coordinatorId && physicianId) {
    }
    if (coordinatorId && !physicianId) {
    }
    if (coordinatorId && physicianId) {
    }
    const schedule = await Schedule.findOne({ where: { id } });
    return res.json(schedule);

    const hospitals = await Schedule.findAll();
  }
  async getOne(req, res, next) {
    const { coordinatorId, physicianId, date } = req.params;
    if (!date) {
      return next(ApiError.badRequest("Не задана дата"));
    }
    if (!coordinatorId && !physicianId) {
    }
    if (!coordinatorId && physicianId) {
    }
    if (coordinatorId && !physicianId) {
    }
    if (coordinatorId && physicianId) {
    }
    const schedule = await Schedule.findOne({ where: { id } });
    return res.json(schedule);
  }
}

module.exports = new HospitalController();
