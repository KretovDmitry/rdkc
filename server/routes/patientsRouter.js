const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");

router.post("/", patientsController.create);
router.get("/", patientsController.getAll);
router.get("/:id", patientsController.getOne);

module.exports = router;
