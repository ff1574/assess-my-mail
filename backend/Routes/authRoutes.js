const express = require("express");
const { getAuthUrl, oauth2Callback } = require("../Controllers/authController");
const router = express.Router();

router.get("/auth", getAuthUrl);
router.get("/oauth2callback", oauth2Callback);

module.exports = router;
