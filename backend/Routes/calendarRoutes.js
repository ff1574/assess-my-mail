const express = require("express");
const { addEventToCalendar } = require("../Controllers/calendarController");
const router = express.Router();

router.post("/add-event", addEventToCalendar);

module.exports = router;
