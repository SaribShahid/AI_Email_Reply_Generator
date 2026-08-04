require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const resolvedPath = require.resolve("./routes/authRoutes.js");
const authRoutes = require(resolvedPath);
const app = express();
const session = require("express-session");
const getGmailClient = require("./config/gmail");
const { htmlToText } = require("html-to-text");
app.use(cors());
app.use(express.json());


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAIReply(from, subject, body, tone, length) {
  
  let lengthInstruction = "";


  if (length === "Short") {
    lengthInstruction = `
Keep the reply very short.
Maximum 40 words.
Usually 2-4 sentences.
`;
  } 
  else if (length === "Medium") {
    lengthInstruction = `
Keep the reply moderate in length.
Around 60-100 words.
Usually 4-7 sentences.
`;
  } 
  else if (length === "Long") {
    lengthInstruction = `
Write a detailed reply.
Around 120-180 words.
Include enough detail to properly address the email.
`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: `
You are an AI Email Assistant.

Write ONE email reply.

TONE:
${tone}

LENGTH REQUIREMENT:
${lengthInstruction}

IMPORTANT:
- The length requirement is mandatory.
- Follow the requested word count closely.
- Do not make a Short reply longer than 40 words.
- Do not make a Medium reply shorter than 60 words.
- Do not make a Long reply shorter than 120 words.
- Generate only the email reply.
- Do not explain anything.
- Do not provide multiple options.
- Do not mention that you are an AI.
- Do not include a subject line.
- Keep the reply natural and relevant to the original email.

FROM:
${from}

SUBJECT:
${subject}

ORIGINAL EMAIL:
${body}
`,
  });
  return response.text.trim();
 
}

 function getBody(payload) {
  let html = "";

  if (payload.mimeType === "text/html" && payload.body?.data) {
    html = Buffer.from(payload.body.data, "base64")
      .toString("utf8");
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        html = Buffer.from(part.body.data, "base64")
          .toString("utf8");
        break;
      }
    }
  }

  if (!html) return "";

  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  });
}

app.get("/gmail/profile", async (req, res) => {
  try {
    const gmail = getGmailClient();

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    res.json(profile.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});
app.get("/gmail/unread", async (req, res) => {
  try {
    const gmail = getGmailClient();

    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 5,
    });

    if (!response.data.messages) {
      return res.json({
        message: "No unread emails.",
      });
    }

    const emails = [];

    for (const msg of response.data.messages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });
     

      const headers = email.data.payload.headers;

      const subject =
        headers.find((h) => h.name === "Subject")?.value || "";

      const from =
        headers.find((h) => h.name === "From")?.value || "";

     const body = getBody(email.data.payload)
  .replace(/\r?\n/g, " ")     
  .replace(/\s+/g, " ")        
  .trim();

emails.push({
  id: msg.id,
  from,
  subject,
  body,
});
    }

    res.json(emails);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/gmail/generate-reply/:id", async (req, res) => {
  try {
    const gmail = getGmailClient();

    const id = req.params.id.trim();

    const { tone, length } = req.body;

    const email = await gmail.users.messages.get({
      userId: "me",
      id: id,
    });

    const headers = email.data.payload.headers;

    const subject =
      headers.find((h) => h.name === "Subject")?.value || "";

    const from =
      headers.find((h) => h.name === "From")?.value || "";

    const body = getBody(email.data.payload)
      .replace(/\r?\n+/g, "\n")
      .trim();

    const reply = await generateAIReply(
      from,
      subject,
      body,
      tone,
      length
    );

    res.json({
      emailId: id,
      from,
      subject,
      originalEmail: body,
      tone,
      length,
      reply,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.post("/gmail/draft/:id", async (req, res) => {
  try {
    const gmail = getGmailClient();

    const id = req.params.id.trim();

    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        error: "Reply is required",
      });
    }

    const email = await gmail.users.messages.get({
      userId: "me",
      id: id,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });

    const headers = email.data.payload.headers;

    const subject =
      headers.find((h) => h.name === "Subject")?.value || "";

    const from =
      headers.find((h) => h.name === "From")?.value || "";

    const message = [
      `To: ${from}`,
      `Subject: Re: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      reply,
    ].join("\r\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const draft = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          threadId: id,
          raw: encodedMessage,
        },
      },
    });

    res.json({
      success: true,
      message: "Reply saved as Gmail draft!",
      draftId: draft.data.id,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.post("/gmail/send/:id", async (req, res) => {
  try {
    const gmail = getGmailClient();

    const id = req.params.id.trim();

    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        error: "Reply cannot be empty.",
      });
    }

    const email = await gmail.users.messages.get({
      userId: "me",
      id: id,
    });

    const headers = email.data.payload.headers;

    const subject =
      headers.find((h) => h.name === "Subject")?.value || "";

    const from =
      headers.find((h) => h.name === "From")?.value || "";

    const rawMessage = [
      `To: ${from}`,
      `Subject: Re: ${subject}`,
      `In-Reply-To: <${id}>`,
      `Content-Type: text/plain; charset="UTF-8"`,
      "",
      reply.trim(),
    ].join("\r\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const sent = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        threadId: email.data.threadId,
        raw: encodedMessage,
      },
    });

    res.json({
      success: true,
      message: "Reply sent successfully!",
      messageId: sent.data.id,
      emailId: id,
    });

  } catch (error) {
    
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});