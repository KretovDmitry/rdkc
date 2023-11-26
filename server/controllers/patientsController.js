const { Patient, CurrentPatient } = require("../models/models");
const ApiError = require("../error/ApiError");
const { makeUniqueDirectory } = require("../fs/dirAPI");
const { createWord } = require("../fs/docx");

class PatientsController {
  static publicPatientData = [
    "id",
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
  ];
  async create(req, res, next) {
    try {
      const { dataValues: curPatient } = await CurrentPatient.findOne({
        where: { emiasId: req.body.emiasPatientId },
        attributes: {
          exclude: ["id", "createdAt", "updatedAt"],
        },
      });
      const [patient] = await Patient.findOrCreate({
        where: { emiasId: req.body.emiasPatientId },
        defaults: { ...curPatient },
        attributes: PatientsController.publicPatientData,
      });
      const newPatientFolder = await makeUniqueDirectory(patient.shortName);
      createWord(newPatientFolder, patient.shortName);
      return res.json({ ...patient });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const patients = await CurrentPatient.findAll({
        attributes: PatientsController.publicPatientData,
      });
      return res.json(patients);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new PatientsController();
