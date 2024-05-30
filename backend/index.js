const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const { htmlToText } = require("html-to-text");
const axios = require("axios");
const { OpenAI } = require("openai");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  if (!encodedStr) return "";
  encodedStr = encodedStr.replace(/-/g, "+").replace(/_/g, "/");
  while (encodedStr.length % 4) {
    encodedStr += "=";
  }
  return Buffer.from(encodedStr, "base64").toString("utf-8");
}

app.post("/fetch-emails", async (req, res) => {
  const { access_token, refresh_token, expiry_date, maxResults } = req.body;
  oauth2Client.setCredentials({ access_token, refresh_token, expiry_date });

  try {
    if (expiry_date && expiry_date < Date.now()) {
      const tokens = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(tokens.credentials);
      console.log("Access token refreshed");
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

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

        const email = {
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

        return email;
      })
    );

    res.json({ emails: fetchedEmails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

const emailQueue = [];
let processing = false;

app.post("/analyze-emails", async (req, res) => {
  const { emails } = req.body;

  emails.forEach((email) => emailQueue.push(email));

  if (!processing) {
    processEmailQueue();
  }

  res.json({ message: "Emails added to the queue for analysis." });
});

async function processEmailQueue() {
  processing = true;

  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an assessor of emails. You have a simple task. You will be shown an email, and you need to scan through it and decide into which of the following categories it fits in: "INFORMATION, ADS & SPAM, SOCIAL, IMPORTANT" If the email is any of the categories except ads and spam, record any of the important information like place, date, time, people involved, etc. 

            Additional information: You need to carefully choose which categories you place the mails in. Work related mails should fall either into INFORMATION or IMPORTANT categories.
            
            You will return all of the messages strictly in this format:
            
            CATEGORY
            [Additional info if applicable]
            
            Keep your responses short and to the point.`,
          },
          {
            role: "user",
            content: `Analyze this email: ${email.body}`,
          },
        ],
        model: "gpt-4",
      });

      const analysisResult = completion.choices[0].message.content;

      console.log(`Processed email: ${email.subject}`);
      console.log(`Analysis result: ${analysisResult}`);
      // Here you can send progress updates to the client using websockets, SSE, or any other method.
    } catch (error) {
      console.error("Error analyzing email:", error);
    }
  }

  processing = false;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
