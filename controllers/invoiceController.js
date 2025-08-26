const { google } = require("googleapis");
const Invoice = require("../models/Invoice");
const oAuth2Client = require("../config/googleAuth");

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Fetch invoices from Gmail
exports.fetchInvoices = async (req, res) => {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "subject:(invoice OR receipt)",
      maxResults: 10,
    });

    const messages = response.data.messages || [];

    for (let msg of messages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const snippet = email.data.snippet; // Small preview text
      const headers = email.data.payload.headers;

      let vendor = headers.find(h => h.name === "From")?.value || "Unknown";
      let date = headers.find(h => h.name === "Date")?.value || new Date();

      // Fake amount extraction for now (improve later with regex/PDF parsing)
      let amount = /\d+/.exec(snippet) ? parseFloat(/\d+/.exec(snippet)[0]) : 0;

      let invoice = new Invoice({
        vendor,
        amount,
        date,
        category: categorizeInvoice(vendor),
        emailId: msg.id,
      });

      await invoice.save();
    }

    res.json({ message: "Invoices fetched and saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Simple categorization
function categorizeInvoice(vendor) {
  vendor = vendor.toLowerCase();
  if (vendor.includes("uber") || vendor.includes("ola")) return "Travel";
  if (vendor.includes("zomato") || vendor.includes("swiggy")) return "Food";
  if (vendor.includes("amazon") || vendor.includes("flipkart")) return "Shopping";
  return "Other";
}
