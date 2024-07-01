const { google } = require("googleapis");
const fetch = require("node-fetch");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PROJECT_ID = process.env.PROJECT_ID;
const ZONE_NAME = process.env.ZONE_NAME;
const RECORD_NAME = process.env.RECORD_NAME;
const TTL = parseInt(process.env.TTL) || 300;
const INTERVAL = process.env.INTERVAL || "*/5 * * * *";
const LOG_DIR = path.join(__dirname, "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, "update-dns.log");
const IP_FILE = path.join(LOG_DIR, "ips.log");

const serviceAccount = {
  type: process.env.GCP_TYPE,
  project_id: process.env.GCP_PROJECT_ID,
  private_key_id: process.env.GCP_PRIVATE_KEY_ID,
  private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.GCP_CLIENT_EMAIL,
  client_id: process.env.GCP_CLIENT_ID,
  auth_uri: process.env.GCP_AUTH_URI,
  token_uri: process.env.GCP_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GCP_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GCP_CLIENT_CERT_URL,
};

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const dns = google.dns({
  version: "v1",
  auth,
});

async function getPublicIP() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  return data.ip;
}

async function updateDNSRecord(ipAddress) {
  const request = dns.resourceRecordSets.list({
    project: PROJECT_ID,
    managedZone: ZONE_NAME,
  });

  const response = await request;

  const record = response.data.rrsets.find(
    (record) => record.name === RECORD_NAME && record.type === "A"
  );

  if (record) {
    const change = {
      kind: "dns#change",
      deletions: [record],
      additions: [
        {
          kind: "dns#resourceRecordSet",
          name: RECORD_NAME,
          type: "A",
          ttl: TTL,
          rrdatas: [ipAddress],
        },
      ],
    };

    const changeRequest = dns.changes.create({
      project: PROJECT_ID,
      managedZone: ZONE_NAME,
      requestBody: change,
    });

    const changeResponse = await changeRequest;
    logUpdate(`Record updated to ${ipAddress}`, changeResponse);
    return changeResponse;
  }
}

function logUpdate(message, response) {
  const logMessage = `${new Date().toISOString()} - ${message} - ${JSON.stringify(
    response
  )}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
}

function logIP(ipAddress) {
  const ipMessage = `${new Date().toISOString()} - ${ipAddress}\n`;
  fs.appendFileSync(IP_FILE, ipMessage);
}

async function run() {
  const ipAddress = await getPublicIP();
  logIP(ipAddress);
  await updateDNSRecord(ipAddress);
}

cron.schedule(INTERVAL, () => {
  console.log("Running DNS update...");
  run().catch(console.error);
});

run().catch(console.error);
