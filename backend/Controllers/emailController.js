const { google } = require("googleapis");
const decodeBase64Url = require("../Helpers/decodeBase64Url");
const { htmlToText } = require("html-to-text");
const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.fetchEmails = async (req, res) => {
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
};

// Helper function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to mute senders by marking their messages as spam
exports.muteSender = async (req, res) => {
  const { access_token, refresh_token, expiry_date, sender } = req.body;

  oauth2Client.setCredentials({ access_token, refresh_token, expiry_date });

  try {
    if (expiry_date && expiry_date < Date.now()) {
      const tokens = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(tokens.credentials);
      console.log("Access token refreshed");
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch all messages from the sender
    const response = await gmail.users.messages.list({
      userId: "me",
      q: `from:${sender}`,
    });

    const messages = response.data.messages || [];

    // Mark each message as spam with a delay
    for (const message of messages) {
      await gmail.users.messages.modify({
        userId: "me",
        id: message.id,
        requestBody: {
          addLabelIds: ["SPAM"],
          removeLabelIds: ["INBOX"],
        },
      });
      await delay(50); // Add a 50ms delay between each request
    }

    res.json({
      success: true,
      message: `Marked ${messages.length} messages as spam.`,
    });
  } catch (error) {
    console.error("Error muting sender:", error);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
    res
      .status(500)
      .json({ error: "Failed to mute sender", details: error.message });
  }
};
