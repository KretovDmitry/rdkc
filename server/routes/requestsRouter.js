const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");

router.post("/", requestsController.create);
router.get("/", requestsController.getAll);
router.get("/:id", requestsController.getOne);

module.exports = router;
