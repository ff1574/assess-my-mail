const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Function to revoke tokens
exports.revokeToken = async (req, res) => {
  const { access_token, refresh_token } = req.body;

  let accessTokenRevoked = false;
  let refreshTokenRevoked = false;

  if (access_token) {
    try {
      await oauth2Client.revokeToken(access_token);
      accessTokenRevoked = true;
      console.log("Access token revoked successfully.");
    } catch (error) {
      console.error("Error revoking access token:", error.message);
    }
  }

  if (refresh_token) {
    try {
      await oauth2Client.revokeToken(refresh_token);
      refreshTokenRevoked = true;
      console.log("Refresh token revoked successfully.");
    } catch (error) {
      console.error("Error revoking refresh token:", error.message);
    }
  }

  if (accessTokenRevoked || refreshTokenRevoked) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to revoke tokens" });
  }
};

// Function to get auth URL
exports.getAuthUrl = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
      "https://www.googleapis.com/auth/gmail.settings.basic",
    ],
  });
  res.redirect(authUrl);
};

// OAuth2 callback
exports.oauth2Callback = async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);

    res.redirect(
      `http://localhost:3000?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}&expiry_date=${tokens.expiry_date}`
    );
  } catch (error) {
    console.error("Error during OAuth2 callback:", error);
    res.status(500).json({ error: "Failed to authenticate" });
  }
};
