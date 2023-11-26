const { PythonShell } = require("python-shell");
const { Request, Patient, Staff, User } = require("../models/models.js");

async function fillOldReport(emiasRequestNumbers) {
  const data = {};
  for (const emiasRequestNumber of emiasRequestNumbers) {
    const req = await Request.findOne({
      where: { emiasRequestNumber: emiasRequestNumber },
      attributes: {
        exclude: [
          "id",
          "emiasPatientId",
          "emiasRequestNumber",
          "emiasCreationTime",
          "status",
          "tmk",
          "childrenCenter",
          "diagnosis",
          "responseArrivalTimestamp",
          "responseUploadTimestamp",
          "drugCorrection",
          "respiratoryCorrection",
          "answerPath",
          "answerSentToAFL",
          "isCreated",
          "createdAt",
          "updatedAt",
          "ReanimationPeriodId",
        ],
      },
    });
    const patient = await Patient.findOne({
      where: { id: req.PatientId },
      attributes: {
        exclude: [
          "id",
          "emiasId",
          "documentTypeName",
          "documentSer",
          "documentNum",
          "isDead",
          "deadDate",
          "deadTime",
          "age",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    const specialist = await Staff.findOne({ where: { id: req.staffId } });
    const coordinator = await User.findOne({ where: { id: req.UserId } });
    data[emiasRequestNumber] = {
      ...req.dataValues,
      ...patient.dataValues,
      specialist: specialist.shortName,
      coordinator: coordinator.shortName,
    };
  }
  let options = {
    mode: "text",
    pythonPath:
      "C:\\Users\\User\\Projects\\PycharmProjects\\RDKC\\venv\\Scripts\\python",
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath: "C:\\Users\\User\\Projects\\PycharmProjects\\RDKC",
  };
  const shell = new PythonShell("excel.py", options);
  shell.send(JSON.stringify(data));
  shell.on("message", function (message) {
    console.log(message);
  });
  return await new Promise((resolve) =>
    shell.end(function (err, code, signal) {
      if (err) {
        console.log(err);
      }
      console.log("The exit code was: " + code);
      console.log("The exit signal was: " + signal);
      console.log("finished");
      resolve(code === 0);
    }),
  );
}

module.exports = { fillOldReport };
