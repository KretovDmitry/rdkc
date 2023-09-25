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
  emiasServerId: { type: DataTypes.STRING, unique: true, allowNull: false },
  ident: { type: DataTypes.BOOLEAN, defaultValue: false },
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
  dateOfBirth: DataTypes.DATEONLY,
  gender: DataTypes.STRING,
  snils: { type: DataTypes.STRING, unique: true },
  omsNumber: { type: DataTypes.STRING, unique: true },
  omsCompany: DataTypes.STRING,
  isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
  deadDate: { type: DataTypes.DATEONLY, defaultValue: null },
  deadTime: { type: DataTypes.TIME, defaultValue: null },
  // TODO reanimationStory: { type: DataTypes.JSON },
});

const Icd = sequelize.define(
  "Icd",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    icdCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false },
);

const Hospital = sequelize.define(
  "Hospital",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hospital: { type: DataTypes.STRING, allowNull: false },
    emiasHospital: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false },
);

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
  internalSerial: {
    type: DataTypes.FLOAT(10),
  },
  requestDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  requestTime: DataTypes.TIME,
  isAdultAtRequestDate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isRean: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  icdCode: { type: DataTypes.STRING, allowNull: false },
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
  serviceCode: {
    type: DataTypes.STRING,
    defaultValue: "A13.29.009.2",
  },
  result: DataTypes.STRING,
  answerPath: DataTypes.STRING,
  answerSentToAFL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isRejected: { type: DataTypes.BOOLEAN, defaultValue: false },
});

Hospital.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Hospital);

Patient.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Patient);

Staff.hasMany(Request, {
  foreignKey: { name: "physicianId", allowNull: false },
});
Request.belongsTo(Staff, {
  foreignKey: { name: "coordinatorId", allowNull: false },
});

Staff.hasMany(Schedule, { foreignKey: { allowNull: false } });
Schedule.belongsTo(Staff);

module.exports = {
  User,
  Staff,
  Icd,
  Hospital,
  Patient,
  Request,
  Schedule,
};
