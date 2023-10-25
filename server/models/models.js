const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "USER", allowNull: false },
});

const Staff = sequelize.define(
  "Staff",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    specialty: { type: DataTypes.STRING },
    emiasSpecialty: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING, allowNull: false },
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.firstName} ${this.middleName}`;
      },
    },
    shortName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.firstName[0]}.${this.middleName[0]}.`;
      },
    },
    dateOfBirth: DataTypes.DATEONLY,
    email: { type: DataTypes.STRING, unique: true },
    cellPhoneNumber: { type: DataTypes.STRING, unique: true },
    emiasLogin: { type: DataTypes.STRING, unique: true },
    emiasPassword: DataTypes.STRING,
    departmentHead: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: {
      type: DataTypes.STRING,
      defaultValue: "PHYSICIAN",
      allowNull: false,
    },
  },
  { timestamps: false, freezeTableName: true },
);

const Patient = sequelize.define("Patient", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasId: { type: DataTypes.STRING, unique: true, allowNull: false },
  requests: DataTypes.ARRAY(DataTypes.STRING),
  lastName: DataTypes.STRING,
  firstName: DataTypes.STRING,
  middleName: DataTypes.STRING,
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.lastName} ${this.firstName} ${this.middleName}`;
    },
  },
  shortName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.lastName} ${this.firstName[0]}.${this.middleName[0]}.`;
    },
  },
  birthDate: DataTypes.STRING,
  age: DataTypes.STRING,
  isAdult: DataTypes.BOOLEAN,
  gender: DataTypes.STRING,
  isIdentified: { type: DataTypes.BOOLEAN, defaultValue: false },
  snils: { type: DataTypes.STRING, unique: true },
  documentTypeName: DataTypes.STRING,
  documentSer: DataTypes.STRING,
  documentNum: DataTypes.STRING,
  omsNumber: { type: DataTypes.STRING, unique: true },
  omsCompany: DataTypes.STRING,
  isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
  deadDate: { type: DataTypes.STRING, defaultValue: null },
  deadTime: { type: DataTypes.STRING, defaultValue: null },
  // TODO reanimationStory: { type: DataTypes.JSON },
});

const Schedule = sequelize.define("Schedule", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  startDate: DataTypes.DATEONLY,
  endDate: DataTypes.DATEONLY,
  startTime: DataTypes.TIME,
  endTime: DataTypes.TIME,
});

const Request = sequelize.define("Request", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasRequestNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  emiasCreationDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emiasCreationTime: DataTypes.STRING,
  status: { type: DataTypes.STRING, allowNull: false },
  isRean: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tmk: DataTypes.BOOLEAN,
  lpu: DataTypes.STRING,
  specialty: { type: DataTypes.STRING, allowNull: false },
  diagnosis: { type: DataTypes.STRING, allowNull: false },
  diagnosisCode: { type: DataTypes.STRING, allowNull: false },
  IsIcdCodeValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  responseArrivalTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  responseUploadTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  drugCorrection: { type: DataTypes.BOOLEAN, defaultValue: false },
  respiratoryCorrection: { type: DataTypes.BOOLEAN, defaultValue: false },
  answerPath: DataTypes.STRING,
  answerSentToAFL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const CurrentPatient = sequelize.define("CurrentPatient", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasId: { type: DataTypes.STRING, unique: true, allowNull: false },
  // requests: DataTypes.ARRAY(DataTypes.STRING),
  lastName: DataTypes.STRING,
  firstName: DataTypes.STRING,
  middleName: DataTypes.STRING,
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.lastName} ${this.firstName} ${this.middleName}`;
    },
  },
  shortName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.lastName} ${this.firstName[0]}.${this.middleName[0]}.`;
    },
  },
  birthDate: DataTypes.STRING,
  age: DataTypes.STRING,
  isAdult: DataTypes.BOOLEAN,
  gender: DataTypes.STRING,
  isIdentified: { type: DataTypes.BOOLEAN, defaultValue: false },
  snils: { type: DataTypes.STRING, unique: true },
  documentTypeName: DataTypes.STRING,
  documentSer: DataTypes.STRING,
  documentNum: DataTypes.STRING,
  omsNumber: { type: DataTypes.STRING, unique: true },
  omsCompany: DataTypes.STRING,
  isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
  deadDate: { type: DataTypes.STRING, defaultValue: null },
  deadTime: { type: DataTypes.STRING, defaultValue: null },
  // TODO reanimationStory: { type: DataTypes.JSON },
});

const CurrentRequest = sequelize.define("CurrentRequest", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasPatientId: DataTypes.STRING,
  emiasRequestNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  emiasCreationDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emiasCreationTime: DataTypes.STRING,
  status: { type: DataTypes.STRING, allowNull: false },
  isRean: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tmk: DataTypes.BOOLEAN,
  lpu: DataTypes.STRING,
  specialty: { type: DataTypes.STRING, allowNull: false },
  diagnosis: { type: DataTypes.STRING, allowNull: false },
  diagnosisCode: { type: DataTypes.STRING, allowNull: false },
  IsIcdCodeValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  responseArrivalTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  responseUploadTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  drugCorrection: { type: DataTypes.BOOLEAN, defaultValue: false },
  respiratoryCorrection: { type: DataTypes.BOOLEAN, defaultValue: false },
  answerPath: DataTypes.STRING,
  answerSentToAFL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Patient.hasMany(Request, { foreignKey: { allowNull: true } });
Request.belongsTo(Patient);

User.hasMany(Request, {
  foreignKey: { name: "physicianId", allowNull: true },
});
Request.belongsTo(User, {
  foreignKey: { name: "coordinatorId", allowNull: true },
});

Staff.hasMany(Schedule, { foreignKey: { allowNull: false } });
Schedule.belongsTo(Staff);

module.exports = {
  User,
  Staff,
  Patient,
  Request,
  Schedule,
  CurrentPatient,
  CurrentRequest,
};
