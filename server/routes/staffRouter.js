const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

router.post("/", staffController.create);
router.get("/", staffController.getAll);
router.get("/:id", staffController.getOne);

module.exports = router;
