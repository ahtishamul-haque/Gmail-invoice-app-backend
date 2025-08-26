const express = require("express");
const { fetchInvoices, getInvoices } = require("../controllers/invoiceController");

const router = express.Router();

router.get("/fetch", fetchInvoices);
router.get("/", getInvoices);

module.exports = router;
