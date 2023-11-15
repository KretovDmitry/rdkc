const express = require("express");
const router = express.Router();
const patientsRouter = require("./patientsRouter");
const reanimationPeriodsRouter = require("./reanimationPeriodsRouter");
const requestsRouter = require("./requestsRouter");
const scheduleRouter = require("./sheduleRouter");
const staffRouter = require("./staffRouter");
const userRouter = require("../routes/userRouter");

router.use("/patients", patientsRouter);
router.use("/reanimation", reanimationPeriodsRouter);
router.use("/requests", requestsRouter);
router.use("/schedule", scheduleRouter);
router.use("/staff", staffRouter);
router.use("/user", userRouter);

module.exports = router;
