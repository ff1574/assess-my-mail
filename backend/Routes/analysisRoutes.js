const express = require("express");
const { analyzeEmails, events } = require("../Controllers/analysisController");
const router = express.Router();

router.post("/analyze-emails", analyzeEmails);
router.get("/events", events);

module.exports = router;
