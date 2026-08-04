const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const oauth2Client = require("../config/outh.js");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
];

router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  res.redirect(url);
});


router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const tokenPath = path.resolve(__dirname, "../token.json");

console.log("Saving to:", tokenPath);

fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

console.log("File exists:", fs.existsSync(tokenPath));

    console.log("Token saved!");
    console.log(tokens);

    res.send("Gmail connected successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;