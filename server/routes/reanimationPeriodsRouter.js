const express = require("express");
const router = express.Router();
const reanimationPeriodsController = require("../controllers/reanimationPeriodsController");

router.post("/", reanimationPeriodsController.create);
router.post("/test", reanimationPeriodsController.testCRP);
router.post("/test2", reanimationPeriodsController.testRP);
router.get("/", reanimationPeriodsController.getAll);

module.exports = router;
