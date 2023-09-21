const express = require("express");
const router = express.Router();
const coordinatorRouter = require("../routes/coorginatorRouter");
const hospitalRouter = require("../routes/hospitalRouter");
const patientRouter = require("../routes/patientRouter");
const physicianRouter = require("../routes/physicianRouter");
const rejectRouter = require("../routes/rejectRouter");
const requestRouter = require("../routes/requestRouter");
const specialtyRouter = require("../routes/specialtyRouter");
const userRouter = require("../routes/userRouter");

router.use("/coordinator", coordinatorRouter);
router.use("/hospital", hospitalRouter);
router.use("/patient", patientRouter);
router.use("/physician", physicianRouter);
router.use("/reject", rejectRouter);
router.use("/request", requestRouter);
router.use("/specialty", specialtyRouter);
router.use("/user", userRouter);

module.exports = router;
