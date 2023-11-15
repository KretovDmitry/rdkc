const { Patient, CurrentPatient } = require("../models/models");
const ApiError = require("../error/ApiError");
const { makeUniqueDirectory } = require("../fs/dirAPI");
const { createWord } = require("../fs/docx");

class PatientsController {
  async create(req, res, next) {
    try {
      const doesExist = await Patient.findOne({
        where: { emiasId: req.body.emiasPatientId },
      });
      if (doesExist)
        return res.json({
          id: doesExist.id,
          existingPatient: {
            fullName: doesExist.fullName,
            emiasId: doesExist.emiasId,
            id: doesExist.id,
            updatedAt: doesExist.updatedAt,
            createdAt: doesExist.createdAt,
          },
        });
      const { dataValues } = await CurrentPatient.findOne({
        where: { emiasId: req.body.emiasPatientId },
        attributes: {
          exclude: ["id", "createdAt", "updatedAt"],
        },
      });
      const newPatient = await Patient.create({
        ...dataValues,
      });
      const newPatientFolder = await makeUniqueDirectory(newPatient.shortName);
      createWord(newPatientFolder, newPatient.shortName);
      return res.json({
        id: newPatient.id,
        createdPatient: {
          fullName: newPatient.fullName,
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
