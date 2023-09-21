const express = require("express");
const router = express.Router();
const coordinatorController = require("../controllers/coordinatorController");

router.post("/", coordinatorController.create);
router.get("/", coordinatorController.getAll);
router.get("/:id", coordinatorController.getOne);

module.exports = router;
