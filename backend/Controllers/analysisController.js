const { OpenAI } = require("openai");
const getFormattedDate = require("../Util/getFormattedDate");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const emailQueue = [];
let processing = false;
const clients = [];

const validCategories = ["INFORMATION", "ADS & SPAM", "SOCIAL", "IMPORTANT"];

exports.analyzeEmails = (req, res) => {
  const { emails } = req.body;

  emails.forEach((email) => emailQueue.push(email));

  if (!processing) {
    processEmailQueue();
  }

  res.json({ message: "Emails added to the queue for analysis." });
};

exports.events = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
  });
};

function sendProgressUpdate(email, progress) {
  const data = JSON.stringify({ email, progress });
  clients.forEach((client) => client.write(`data: ${data}\n\n`));
}

async function analyzeEmailWithRetry(email, retries = 5) {
  while (retries > 0) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an email assessor with the task of categorizing emails into one of the following categories: INFORMATION, ADS & SPAM, SOCIAL, IMPORTANT. Your responsibilities are:

            - Carefully determine the category of each email. Work-related emails should be categorized as INFORMATION or IMPORTANT. Emails should be marked as IMPORTANT only if they require immediate or near-immediate attention, such as meeting reminders or deadlines. Social emails are non-work-related emails, such as personal messages or newsletters. Ads & Spam emails are unsolicited emails or promotional content.

            - DATE and TIME fields should be in the format "YYYY-MM-DD" and "HH:MM" (24-hour format), only include the time if it is the time of the event, not when the email was received.

            - If the email is not in English, translate it to English before proceeding with the analysis.

            - If the corresponding fields are not present in the email, mark them as "N/A".

            Strict response format:

            CATEGORY:
            SUBJECT:
            TASK:
            DATE:
            TIME:
            PLACE:
            PEOPLE:

            Example response when missing TASK and PEOPLE fields:

            CATEGORY: INFORMATION
            SUBJECT: Meeting Reminder
            TASK: N/A
            DATE: 2022-01-10
            TIME: 10:00 AM
            PLACE: Conference Room
            PEOPLE: N/A
        
            
            Keep your responses concise and relevant.`,
          },
          {
            role: "user",
            content: `Analyze this email: \nSender: ${email.from}\nToday's date: ${getFormattedDate()}\nDate of receival: ${email.date}\nBody: ${email.body}`,
          },
        ],
        model: "gpt-4o",
      });

      const analysisResult = completion.choices[0].message.content.split("\n");
      const category =
        analysisResult
          .find((line) => line.startsWith("CATEGORY"))
          ?.split(": ")[1] || "";

      if (validCategories.includes(category)) {
        const parsedResult = {
          category,
          subject:
            analysisResult
              .find((line) => line.startsWith("SUBJECT"))
              ?.split(": ")[1] || "",
          task:
            analysisResult
              .find((line) => line.startsWith("TASK"))
              ?.split(": ")[1] || "",
          date:
            analysisResult
              .find((line) => line.startsWith("DATE"))
              ?.split(": ")[1] || "",
          time:
            analysisResult
              .find((line) => line.startsWith("TIME"))
              ?.split(": ")[1] || "",
          place:
            analysisResult
              .find((line) => line.startsWith("PLACE"))
              ?.split(": ")[1] || "",
          people:
            analysisResult
              .find((line) => line.startsWith("PEOPLE"))
              ?.split(": ")[1] || "",
        };

        console.log("\n\nParsed result:", parsedResult, "\n\n");

        return {
          ...email,
          analysis: parsedResult,
          category,
        };
      }
    } catch (error) {
      console.error("Error analyzing email:", error);
    }

    retries--;
    console.log("Failed analysis, email content:", email.body);
  }

  throw new Error("Failed to analyze email correctly after multiple attempts.");
}

async function processEmailQueue() {
  processing = true;

  let processedCount = 0;
  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    try {
      const analyzedEmail = await analyzeEmailWithRetry(email);

      processedCount++;
      sendProgressUpdate(
        analyzedEmail,
        (processedCount / (processedCount + emailQueue.length)) * 100
      );
    } catch (error) {
      console.error("Error analyzing email:", error);
    }
  }

  sendProgressUpdate(null, 100); // Indicate completion
  processing = false;
}
