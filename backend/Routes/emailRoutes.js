const express = require("express");
const { fetchEmails } = require("../Controllers/emailController");
const router = express.Router();

router.post("/fetch-emails", fetchEmails);

module.exports = router;
