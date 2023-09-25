const express = require("express");
const router = express.Router();
const hospitalRouter = require("../routes/hospitalRouter");
const icdRouter = require("../routes/icdRouter");
const patientRouter = require("../routes/patientRouter");
const requestRouter = require("../routes/requestRouter");
const scheduleRouter = require("./sheduleRouter");
const staffRouter = require("./staffRouter");
const userRouter = require("../routes/userRouter");

router.use("/hospital", hospitalRouter);
router.use("/icd", icdRouter);
router.use("/patient", patientRouter);
router.use("/request", requestRouter);
router.use("/schedule", scheduleRouter);
router.use("/staff", staffRouter);
router.use("/user", userRouter);

module.exports = router;
