const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const oauth2Client = new OAuth2(
  "603380482913-1khnop8n36rgpvft4pikieceft6d31nj.apps.googleusercontent.com",
  "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",
  "http://localhost:5000/oauth2callback"
);

app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });
  res.redirect(authUrl);
});

app.get("/oauth2callback", async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    res.json(tokens);
  } catch (error) {
    console.error("Error during OAuth2 callback:", error);
    res.status(500).json({ error: "Failed to authenticate" });
  }
});

app.post("/fetch-emails", async (req, res) => {
  const { access_token } = req.body;
  oauth2Client.setCredentials({ access_token });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({ userId: "me" });
    const messages = response.data.messages || [];

    const fetchedEmails = await Promise.all(
      messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
        const { data } = msg;
        return {
          id: data.id,
          snippet: data.snippet,
        };
      })
    );

    res.json({ emails: fetchedEmails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
