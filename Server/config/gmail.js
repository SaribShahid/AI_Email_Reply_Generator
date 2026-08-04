const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const oauth2Client = require("./outh"); // change to "./oauth" if that's your filename

function getGmailClient() {
  const tokenPath = path.join(__dirname, "../token.json");

  if (!fs.existsSync(tokenPath)) {
    throw new Error("Please connect Gmail first.");
  }

  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

  oauth2Client.setCredentials(tokens);

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}

module.exports = getGmailClient;