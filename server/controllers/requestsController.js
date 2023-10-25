const { Request, CurrentRequest } = require("../models/models");
const ApiError = require("../error/ApiError");

class PatientsController {
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
      const requests = await CurrentRequest.findAll();
      return res.json(requests);
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

module.exports = new PatientsController();
