const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

router.post("/", requestController.create);
router.get("/", requestController.getAll);
router.get("/#:status", requestController.getOne);

module.exports = router;
