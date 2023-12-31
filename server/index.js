require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const cors = require("cors");
const router = require("./routes/index");
const errorHandler = require("./middleware/ErrorHandlingMiddleware");
const { main, emiasAPI } = require("./emias/emiasAPI");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

// Обработка ошибок, обязательно последний Middleware
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to DB");
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    setImmediate(main);
    emiasAPI();
  } catch (e) {
    console.log("Failed connecting to DB", e);
  }
};

start();
