const { Request } = require("../models/models");
const ApiError = require("../error/ApiError");
const { loadWork } = require("../emias/emiasAPI");
const { HOSPITALS } = require("../emias/constants");

class RequestController {
  async create(req, res, next) {
    try {
      const newRequest = await Request.create({ ...req.body });
      return res.json(newRequest);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const patients = await loadWork();
      const formattedPatients = patients.map((patient) => {
        patient["Lpu_Nick"] =
          HOSPITALS[patient["Lpu_Nick"]] || patient["Lpu_Nick"];
        return patient;
      });
      return res.json(formattedPatients);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { status } = req.params;
    try {
      const patient = await Request.findOne({ where: { id } });
      return res.json(patient);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new RequestController();
