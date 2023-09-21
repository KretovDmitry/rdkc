const express = require("express");
const router = express.Router();
const physicianController = require("../controllers/physicianController");

router.post("/", physicianController.create);
router.get("/", physicianController.getAll);
router.get("/:id", physicianController.getOne);

module.exports = router;
