const { Patient, CurrentPatient } = require("../models/models");
const ApiError = require("../error/ApiError");
const { makeUniqueDirectory } = require("../fs/dirAPI");
const rootDirectory = "Z:\\Пациенты все\\Пациенты 2023\\13 Тест";

class PatientsController {
  async create(req, res, next) {
    try {
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
      const patientsDirName = await makeUniqueDirectory(
        rootDirectory,
        newPatient.shortName,
      );
      await makeUniqueDirectory(patientsDirName, "Ответы специалистов");
      return res.json({ newPatient, success: true });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const patients = await CurrentPatient.findAll();
      return res.json(patients);
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
