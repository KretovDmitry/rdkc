const express = require("express");
const router = express.Router();
const hospitalController = require("../controllers/hospitalController");

router.post("/", hospitalController.create);
router.get("/", hospitalController.getAll);
router.get("/:id", hospitalController.getOne);

module.exports = router;
