const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const checkRole = require("../middleware/checkRoleMiddleware");

router.post("/", checkRole("ADMIN"), scheduleController.create);
router.get("/", scheduleController.getByDate);

module.exports = router;
