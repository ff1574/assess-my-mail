const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const emailQueue = [];
let processing = false;
const clients = [];

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

async function processEmailQueue() {
  processing = true;

  let processedCount = 0;
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
        model: "gpt-4o",
      });

      const analysisResult = completion.choices[0].message.content;

      // Extract category from the analysis result
      const category = analysisResult.split("\n")[0];

      const analyzedEmail = {
        ...email,
        analysis: analysisResult,
        category,
      };

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
