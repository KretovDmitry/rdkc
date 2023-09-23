const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

router.post("/", patientController.create);
router.get("/", patientController.getAll);
router.get("/:id", patientController.getOne);

module.exports = router;
