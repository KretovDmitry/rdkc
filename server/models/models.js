const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "USER", allowNull: false },
});

const Coordinator = sequelize.define(
  "coordinators",
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
        return `${this.lastName} ${this.firstName[0]}.${this.middleName[0]}`;
      },
    },
    cellPhoneNumber: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
  },
  { timestamps: false },
);

const Physician = sequelize.define(
  "physicians",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    specialty: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING },
    middleName: { type: DataTypes.STRING },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.firstName} ${this.middleName}`;
      },
    },
    shortName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.lastName} ${this.firstName[0]}.${this.middleName[0]}`;
      },
    },
    email: { type: DataTypes.STRING, unique: true },
    cellPhoneNumber: { type: DataTypes.INTEGER, unique: true },
    emiasLogin: { type: DataTypes.STRING, unique: true },
    emiasPassword: { type: DataTypes.STRING },
    departmentHead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false },
);

const Patient = sequelize.define("patients", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasId: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  emiasServerId: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  ident: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastName: { type: DataTypes.STRING },
  firstName: { type: DataTypes.STRING },
  middleName: { type: DataTypes.STRING },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.lastName} ${this.firstName} ${this.middleName}`;
    },
  },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.STRING },
  snils: { type: DataTypes.INTEGER, unique: true },
  omsNumber: { type: DataTypes.INTEGER, unique: true },
  omsCompany: { type: DataTypes.STRING },
  isRejected: { type: DataTypes.BOOLEAN, defaultValue: false },
  isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
  deadDate: { type: DataTypes.DATEONLY, defaultValue: null },
  deadTime: { type: DataTypes.TIME, defaultValue: null },
  reanimationStory: { type: DataTypes.JSON },
});

const Icd = sequelize.define(
  "icd_codes",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    icdCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false },
);

const Hospital = sequelize.define(
  "hospitals",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hospital: { type: DataTypes.STRING, allowNull: false },
    emiasHospital: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false },
);

const Specialty = sequelize.define(
  "specialties",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    specialty: { type: DataTypes.STRING, allowNull: false },
    emiasSpecialty: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false },
);

const Schedule = sequelize.define("schedules", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  day: { type: DataTypes.DATEONLY },
  shift: { type: DataTypes.INTEGER },
});

const Rejection = sequelize.define("rejections", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  isRean: { type: DataTypes.BOOLEAN, defaultValue: true },
  isAdultAtRequestDate: { type: DataTypes.BOOLEAN, defaultValue: true },
  requestDate: { type: DataTypes.DATEONLY, allowNull: false },
  icdCode: { type: DataTypes.INTEGER, allowNull: false },
  specialtyId: { type: DataTypes.INTEGER },
  rejectionCause: { type: DataTypes.STRING },
  comment: { type: DataTypes.STRING },
  correctRetry: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Request = sequelize.define("requests", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasRequestNumber: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
    field: "emias_request_number",
  },
  internalSerial: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: "internal_serial",
  },
  requestDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "request_date",
  },
  isAdultAtRequestDate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: "is_adult_at_request_date",
  },
  isRean: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: "is_rean",
  },
  icdCode: { type: DataTypes.INTEGER, field: "icd_code", allowNull: false },
  IsIcdCodeValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: "is_icd_code_valid",
  },
  responseArrivalTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: "response_arrival_timestamp",
  },
  serviceCode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "A13.29.009.2",
    field: "service_code",
  },
  responseUploadTimestamp: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: "response_upload_timestamp",
  },
  answerPath: {
    type: DataTypes.STRING,
    field: "answer_path",
  },
  answerSentToAFL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "answer_sent_to_AFL",
  },
});

Hospital.hasMany(Request);
Request.belongsTo(Hospital);

Patient.hasMany(Request);
Request.belongsTo(Patient);

Specialty.hasMany(Request);
Request.belongsTo(Specialty);

Physician.hasMany(Request);
Request.belongsTo(Physician);

Coordinator.hasMany(Request);
Request.belongsTo(Coordinator);

Hospital.hasMany(Rejection);
Rejection.belongsTo(Hospital);

Patient.hasMany(Rejection);
Rejection.belongsTo(Patient);

Coordinator.hasMany(Rejection);
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
  Specialty,
  Patient,
  Request,
  Rejection,
  Schedule,
};
