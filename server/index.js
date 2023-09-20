require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const models = require("./models/models");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "OK" });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to DB");
    await sequelize.sync({ force: true });
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log("Failed connecting to DB", e);
  }
};

start();
