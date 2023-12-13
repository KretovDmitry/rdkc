const { Request, CurrentRequest, Patient } = require("../models/models");
const ApiError = require("../error/ApiError");
const { fillOldReport } = require("../fs/excel");
const { makeUniqueDirectory } = require("../fs/dirAPI");
const { createWord } = require("../fs/docx");
const { DEBUG } = require("../emias/constants");

class RequestsController {
  async create(req, res, next) {
    const plugStaffId = 170;
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
          exclude: ["id", "isCreated", "createdAt", "updatedAt"],
        },
      });
      const requests = {};
      const newRequestNumbers = [];
      for (const request of requestsForPatient) {
        if (isRean) {
          request.isRean = isRean;
        }
        const [req] = await Request.findOrCreate({
          where: { emiasRequestNumber: request.emiasRequestNumber },
          defaults: {
            ...request.dataValues,
            PatientId: patientId,
            UserId: userId,
            staffId: staffIds[request.emiasRequestNumber] || plugStaffId,
            ReanimationPeriodId: newReanimationPeriodId,
          },
        });
        requests[req.id] = { ...req };
        if (req._options.isNewRecord) {
          newRequestNumbers.push(req.emiasRequestNumber);
        }
      }
      const respond = (success) => {
        if (DEBUG) {
          console.log(new Date().toLocaleString("ru"), "success", success);
        }
        res.json({ success: success, requests });
      };
      if (newRequestNumbers.length) {
        fillOldReport(newRequestNumbers).then(async (success) => {
          if (success) {
            for (const num of newRequestNumbers) {
              await CurrentRequest.update(
                { isCreated: true },
                {
                  where: {
                    emiasRequestNumber: num,
                  },
                },
              );
            }
            const patient = await Patient.findOne({
              where: { emiasId: emiasPatientId },
            });
            const newPatientFolder = await makeUniqueDirectory(
              patient.fullName,
              patient.birthDate,
            );
            createWord(newPatientFolder, patient.shortName);
          } else {
            for (const num of newRequestNumbers) {
              await Request.destroy({
                where: { emiasRequestNumber: num },
              });
            }
          }
          respond(success);
        });
      } else {
        respond(true);
      }
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
  // async getOne(req, res, next) {
  //   const { status } = req.params;
  //   try {
  //     const patient = await Request.findOne({ where: { id } });
  //     return res.json(patient);
  //   } catch (e) {
  //     next(ApiError.badRequest(e.message));
  //   }
  // }
}

module.exports = new RequestsController();
