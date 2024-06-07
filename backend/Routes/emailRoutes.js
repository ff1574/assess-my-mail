const express = require("express");
const { fetchEmails, muteSender } = require("../Controllers/emailController");
const router = express.Router();

router.post("/fetch-emails", fetchEmails);
router.post("/mute-sender", muteSender);

module.exports = router;
