const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { htmlToText } = require("html-to-text");

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

    res.redirect(
      `http://localhost:3000?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}&expiry_date=${tokens.expiry_date}`
    );
  } catch (error) {
    console.error("Error during OAuth2 callback:", error);
    res.status(500).json({ error: "Failed to authenticate" });
  }
});

function decodeBase64Url(encodedStr) {
  if (!encodedStr) return ""; // Return an empty string if the input is undefined or null
  encodedStr = encodedStr.replace(/-/g, "+").replace(/_/g, "/");
  while (encodedStr.length % 4) {
    encodedStr += "=";
  }
  return Buffer.from(encodedStr, "base64").toString("utf-8");
}

app.post("/fetch-emails", async (req, res) => {
  const { access_token, refresh_token, expiry_date, maxResults } = req.body;
  oauth2Client.setCredentials({ access_token, refresh_token, expiry_date });

  if (expiry_date && expiry_date < Date.now()) {
    try {
      const tokens = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(tokens.credentials);
      res.json({ newAccessToken: tokens.credentials.access_token });
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return res.status(401).json({ error: "Failed to refresh access token" });
    }
  }

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    let allMessages = [];
    let nextPageToken = null;

    while (allMessages.length < maxResults) {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: Math.min(maxResults - allMessages.length, 250),
        pageToken: nextPageToken,
      });

      const messages = response.data.messages || [];
      allMessages = allMessages.concat(messages);
      nextPageToken = response.data.nextPageToken;

      if (!nextPageToken) {
        break;
      }
    }

    const fetchedEmails = await Promise.all(
      allMessages.slice(0, maxResults).map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
        const { data } = msg;

        let emailBody = "";
        if (data.payload && data.payload.parts) {
          const part = data.payload.parts.find(
            (part) =>
              part.mimeType === "text/html" || part.mimeType === "text/plain"
          );
          if (part) {
            emailBody = decodeBase64Url(part.body.data);
            emailBody = htmlToText(emailBody, {
              wordwrap: 130,
              ignoreImage: true,
              ignoreHref: true,
              tags: { a: { format: "inline" }, img: { format: "skip" } },
            });
          }
        } else {
          emailBody = decodeBase64Url(data.payload.body.data);
          emailBody = htmlToText(emailBody, {
            wordwrap: 130,
            ignoreImage: true,
            ignoreHref: true,
            tags: { a: { format: "inline" }, img: { format: "skip" } },
          });
        }

        return {
          id: data.id,
          snippet: data.snippet,
          subject:
            data.payload.headers.find((header) => header.name === "Subject")
              ?.value || "",
          from:
            data.payload.headers.find((header) => header.name === "From")
              ?.value || "",
          date:
            data.payload.headers.find((header) => header.name === "Date")
              ?.value || "",
          body: emailBody,
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
