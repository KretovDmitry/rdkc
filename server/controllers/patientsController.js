const { Patient, CurrentPatient } = require("../models/models");
const ApiError = require("../error/ApiError");
const { makeDirectory } = require("../fs/mkdir");
const rootDirectory = "Z:\\Пациенты все\\Пациенты 2023\\13 Тест";

class PatientsController {
  async create(req, res, next) {
    try {
      const currentPatient = await CurrentPatient.findOne({
        where: { emiasId: req.body.data },
        attributes: {
          exclude: ["isDead", "deadDate", "deadTime", "createdAt", "updatedAt"],
        },
      });
      console.log(currentPatient);
      const newPatient = await Patient.create({
        emiasId: currentPatient.emiasId,
        lastName: currentPatient.lastName,
        firstName: currentPatient.firstName,
        middleName: currentPatient.middleName,
        birthDate: currentPatient.birthDate,
        age: currentPatient.age,
        isAdult: currentPatient.isAdult,
        gender: currentPatient.gender,
        isIdentified: currentPatient.isIdentified,
        snils: currentPatient.snils,
        documentTypeName: currentPatient.documentTypeName,
        documentSer: currentPatient.documentSer,
        documentNum: currentPatient.documentNum,
        omsNumber: currentPatient.omsNumber,
        omsCompany: currentPatient.omsCompany,
      });
      const dirName = newPatient.fullName;
      await makeDirectory(rootDirectory, dirName);
      return res.json({ data: newPatient, success: true });
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
