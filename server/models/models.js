const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "USER", allowNull: false },
});

const Coordinator = sequelize.define(
  "Coordinator",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lastName: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: false },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.firstName} ${this.middleName}`;
      },
    },
    dateOfBirth: { type: DataTypes.DATEONLY },
    shortName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.firstName[0]}.${this.middleName[0]}.`;
      },
    },
    cellPhoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  { timestamps: false },
);

const Physician = sequelize.define(
  "Physician",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    specialty: { type: DataTypes.STRING, allowNull: false },
    emiasSpecialty: { type: DataTypes.STRING, allowNull: false },
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
    email: { type: DataTypes.STRING, unique: true },
    cellPhoneNumber: { type: DataTypes.STRING, unique: true },
    emiasLogin: { type: DataTypes.STRING, unique: true },
    emiasPassword: DataTypes.STRING,
    departmentHead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false },
);

const Patient = sequelize.define("Patient", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasId: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  emiasServerId: { type: DataTypes.INTEGER, unique: true, allowNull: false },
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
  snils: { type: DataTypes.INTEGER, unique: true },
  omsNumber: { type: DataTypes.INTEGER, unique: true },
  omsCompany: DataTypes.STRING,
  isRejected: { type: DataTypes.BOOLEAN, defaultValue: false },
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
  year: { type: DataTypes.INTEGER(4), validate: { min: 2020, max: 2030 } },
  month: { type: DataTypes.INTEGER(2), validate: { min: 1, max: 12 } },
  shifts: DataTypes.RANGE(DataTypes.DATE),
});

const Rejection = sequelize.define("Rejection", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  isRean: { type: DataTypes.BOOLEAN, defaultValue: true },
  isAdultAtRequestDate: { type: DataTypes.BOOLEAN, defaultValue: true },
  requestDate: { type: DataTypes.DATEONLY, allowNull: false },
  icdCode: { type: DataTypes.STRING, allowNull: false },
  cause: DataTypes.STRING,
  comment: DataTypes.STRING,
  correctRetry: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Request = sequelize.define("Request", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasRequestNumber: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  internalSerial: {
    type: DataTypes.FLOAT(10),
    allowNull: false,
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
  serviceCode: {
    type: DataTypes.STRING,
    defaultValue: "A13.29.009.2",
  },
  responseUploadTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  answerPath: DataTypes.STRING,
  answerSentToAFL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Hospital.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Hospital);

Patient.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Patient);

Physician.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Physician);

Coordinator.hasMany(Request, { foreignKey: { allowNull: false } });
Request.belongsTo(Coordinator);

Hospital.hasMany(Rejection, { foreignKey: { allowNull: false } });
Rejection.belongsTo(Hospital);

Patient.hasMany(Rejection, { foreignKey: { allowNull: false } });
Rejection.belongsTo(Patient);

Coordinator.hasMany(Rejection, { foreignKey: { allowNull: false } });
Rejection.belongsTo(Coordinator);

Physician.hasMany(Schedule);
Schedule.belongsTo(Physician);

Coordinator.hasMany(Schedule);
Schedule.belongsTo(Coordinator);

module.exports = {
  User,
  Coordinator,
  Physician,
  Icd,
  Hospital,
  Patient,
  Request,
  Rejection,
  Schedule,
};
