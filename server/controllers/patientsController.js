const { Patient, CurrentPatient } = require("../models/models");
const ApiError = require("../error/ApiError");
const { makeUniqueDirectory } = require("../fs/dirAPI");
const { createWord } = require("../fs/docx");

class PatientsController {
  async create(req, res, next) {
    try {
      const isExists = await Patient.findOne({
        where: { emiasId: req.body.emiasPatientId },
      });
      if (isExists)
        return res.json({
          existingPatient: {
            fullName: isExists.fullName,
            shortName: isExists.shortName,
            emiasId: isExists.emiasId,
            id: isExists.id,
            updatedAt: isExists.updatedAt,
            createdAt: isExists.createdAt,
          },
          success: true,
        });
      const { dataValues } = await CurrentPatient.findOne({
        where: { emiasId: req.body.emiasPatientId },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      delete dataValues.id;
      const newPatient = await Patient.create({
        ...dataValues,
      });
      const newPatientFolder = await makeUniqueDirectory(newPatient.shortName);
      createWord(newPatientFolder, newPatient.shortName);
      return res.json({
        createdPatient: {
          fullName: newPatient.fullName,
          shortName: newPatient.shortName,
          emiasId: newPatient.emiasId,
          id: newPatient.id,
          updatedAt: newPatient.updatedAt,
          createdAt: newPatient.createdAt,
        },
        success: true,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const patients = await CurrentPatient.findAll({
        attributes: [
          "fullName",
          "shortName",
          "emiasId",
          "lastName",
          "firstName",
          "middleName",
          "birthDate",
          "age",
          "isAdult",
          "gender",
          "isIdentified",
          "isDead",
        ],
      });
      return res.json(patients);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new PatientsController();
