const express = require("express");
const router = express.Router();
const icdController = require("../controllers/icdController");

router.post("/", icdController.create);
router.get("/", icdController.getAll);

module.exports = router;
