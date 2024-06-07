const express = require("express");
const {
  getAuthUrl,
  oauth2Callback,
  revokeToken,
} = require("../Controllers/authController");
const router = express.Router();

router.get("/auth", getAuthUrl);
router.get("/oauth2callback", oauth2Callback);
router.post("/revoke-token", revokeToken);

module.exports = router;
