const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const checkRole = require("../middleware/checkRoleMiddleware");

router.post("/", checkRole("ADMIN"), staffController.create);
router.get("/", staffController.getAll);
router.get("/:id", staffController.getOne);

module.exports = router;
