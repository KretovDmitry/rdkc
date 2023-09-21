const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.post("/", scheduleController.create);
router.get("/:startDate.:endDate", scheduleController.getBetween);
router.get("/:date", scheduleController.getExact);

module.exports = router;
