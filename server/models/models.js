const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "USER", allowNull: false },
  },
  { underscored: true },
);

const Staff = sequelize.define(
  "staff",
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
  { freezeTableName: true, underscored: true },
);

const Patient = sequelize.define(
  "Patient",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    emiasId: { type: DataTypes.STRING, unique: true, allowNull: false },
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
  },
  { underscored: true },
);

const Schedule = sequelize.define(
  "Schedule",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
  },
  { underscored: true },
);

const Request = sequelize.define(
  "Request",
  {
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
    childrenCenter: DataTypes.BOOLEAN,
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
    drugCorrection: { type: DataTypes.BOOLEAN, defaultValue: null },
    respiratoryCorrection: { type: DataTypes.BOOLEAN, defaultValue: null },
    answerPath: DataTypes.STRING,
    answerSentToAFL: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
    },
  },
  { underscored: true },
);

const CurrentPatient = sequelize.define(
  "CurrentPatient",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    emiasId: { type: DataTypes.STRING, unique: true, allowNull: false },
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
  },
  { underscored: true },
);

const CurrentRequest = sequelize.define(
  "CurrentRequest",
  {
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
      defaultValue: null,
    },
    tmk: DataTypes.BOOLEAN,
    childrenCenter: DataTypes.BOOLEAN,
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
    drugCorrection: { type: DataTypes.BOOLEAN, defaultValue: null },
    respiratoryCorrection: { type: DataTypes.BOOLEAN, defaultValue: null },
    answerPath: DataTypes.STRING,
    answerSentToAFL: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
    },
  },
  { underscored: true },
);

const ReanimationPeriod = sequelize.define(
  "ReanimationPeriod",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    error: DataTypes.BOOLEAN,
    hasReanPeriod: DataTypes.BOOLEAN,
    emiasId: DataTypes.STRING,
    objectValue: DataTypes.STRING,
    emiasPatientId: DataTypes.STRING,
    startDate: DataTypes.STRING,
    startTime: DataTypes.STRING,
    endDate: DataTypes.STRING,
    endTime: DataTypes.STRING,
    result: DataTypes.STRING,
    isRean: DataTypes.BOOLEAN,
  },
  { underscored: true },
);

const CurrentReanimationPeriod = sequelize.define(
  "CurrentReanimationPeriod",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    error: DataTypes.BOOLEAN,
    hasReanPeriod: DataTypes.BOOLEAN,
    emiasId: DataTypes.STRING,
    objectValue: DataTypes.STRING,
    emiasPatientId: DataTypes.STRING,
    startDate: DataTypes.STRING,
    startTime: DataTypes.STRING,
    endDate: DataTypes.STRING,
    endTime: DataTypes.STRING,
    result: DataTypes.STRING,
    isRean: DataTypes.BOOLEAN,
  },
  { underscored: true },
);

Patient.hasMany(Request, {
  foreignKey: {
    allowNull: false,
  },
});
Request.belongsTo(Patient);

User.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(User);

Staff.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Staff);

ReanimationPeriod.hasMany(Request, { foreignKey: { allowNull: true } });
Request.belongsTo(ReanimationPeriod);

Staff.hasMany(Schedule, { foreignKey: { allowNull: false } });
Schedule.belongsTo(Staff);

module.exports = {
  User,
  Staff,
  Patient,
  ReanimationPeriod,
  Request,
  Schedule,
  CurrentPatient,
  CurrentRequest,
  CurrentReanimationPeriod,
};
