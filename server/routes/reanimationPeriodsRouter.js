const express = require("express");
const router = express.Router();
const reanimationPeriodsController = require("../controllers/reanimationPeriodsController");

router.post("/", reanimationPeriodsController.create);
router.get("/", reanimationPeriodsController.getAll);
router.get("/:id", reanimationPeriodsController.getOne);

module.exports = router;
