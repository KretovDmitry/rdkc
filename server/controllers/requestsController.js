const { Request, CurrentRequest } = require("../models/models");
const ApiError = require("../error/ApiError");

class RequestsController {
  async create(req, res, next) {
    const {
      emiasPatientId,
      isRean,
      patientId,
      userId,
      staffIds,
      newReanimationPeriodId,
    } = req.body;
    try {
      const requestsForPatient = await CurrentRequest.findAll({
        where: { emiasPatientId: emiasPatientId },
        attributes: {
          exclude: ["id", "createdAt", "updatedAt"],
        },
      });
      const requests = {
        existingRequests: [],
        newRequests: [],
      };
      for (const request of requestsForPatient) {
        if (isRean) {
          request.dataValues.isRean = isRean;
        }
        const doesExist = await Request.findOne({
          where: { emiasRequestNumber: request.dataValues.emiasRequestNumber },
        });
        if (doesExist) {
          requests.existingRequests.push(doesExist);
        } else {
          const newRequest = await Request.create({
            ...request.dataValues,
            PatientId: patientId,
            UserId: userId,
            staffId: staffIds[request.dataValues.emiasRequestNumber],
            ReanimationPeriodId: newReanimationPeriodId,
          });
          requests.newRequests.push(newRequest);
        }
      }
      res.json({ createdRequests: requests });
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

module.exports = new RequestsController();
