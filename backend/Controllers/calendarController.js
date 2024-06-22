const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.addEventToCalendar = async (req, res) => {
  const { access_token, refresh_token, expiry_date, event } = req.body;
  oauth2Client.setCredentials({ access_token, refresh_token, expiry_date });

  try {
    if (expiry_date && expiry_date < Date.now()) {
      const tokens = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(tokens.credentials);
      console.log("Access token refreshed");
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.json({ success: true, event: response.data });
  } catch (error) {
    console.error("Error adding event to calendar:", error);
    if (error.response) {
      console.error("Error details:", error.response.data);
      res
        .status(500)
        .json({
          error: "Failed to add event to calendar",
          details: error.response.data,
        });
    } else {
      res
        .status(500)
        .json({
          error: "Failed to add event to calendar",
          message: error.message,
        });
    }
  }
};
