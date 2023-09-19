const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

const Coordinator = sequelize.define("coordinators", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lastName: { type: DataTypes.STRING, columnName: "last_name" },
  firstName: { type: DataTypes.STRING, columnName: "first_name" },
  middleName: { type: DataTypes.STRING, columnName: "middle_name" },
  cellPhoneNumber: {
    type: DataTypes.INTEGER,
    unique: true,
    columnName: "cell_phone_number",
  },
  workDays: { type: DataTypes.ARRAY, unique: true, columnName: "work_days" },
  shift: { type: DataTypes.SMALLINT },
});

const Physician = sequelize.define("physicians", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialty: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING, columnName: "last_name" },
  firstName: { type: DataTypes.STRING, columnName: "first_name" },
  middleName: { type: DataTypes.STRING, columnName: "middle_name" },
  email: { type: DataTypes.STRING, unique: true },
  cellPhoneNumber: {
    type: DataTypes.INTEGER,
    unique: true,
    columnName: "cell_phone_number",
  },
  emiasLogin: {
    type: DataTypes.STRING,
    unique: true,
    columnName: "emias_login",
  },
  emiasPassword: { type: DataTypes.STRING, columnName: "emias_password" },
  departmentHead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    columnName: "department_head",
  },
});

const Patient = sequelize.define("patients", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  emiasId: { type: DataTypes.INTEGER, columnName: "emias_id" },
  emiasServerId: { type: DataTypes.INTEGER, columnName: "emias_server_id" },
  ident: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastName: { type: DataTypes.STRING, columnName: "last_name" },
  firstName: { type: DataTypes.STRING, columnName: "first_name" },
  middleName: { type: DataTypes.STRING, columnName: "middle_name" },
  dateOfBirth: { type: DataTypes.DATEONLY, columnName: "date_of_birth" },
  gender: { type: DataTypes.STRING },
});
