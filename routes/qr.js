const express = require("express");
const router = express.Router();
const { generateQRCodePDF, generateQRCode } = require("../utils.js"); // Import the functions

// Route to generate a QR code as a PDF
router.post('/pdf', async (req, res) => {
  const { url } = req.body; // Corrected to extract 'pdf_url' from req.body
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const pdfData = await generateQRCodePDF(url);
    res.contentType("application/pdf");
    res.send(pdfData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to generate a QR code as an image
router.post('/image', async (req, res) => {
  const { url } = req.body; // Corrected to extract 'image_url' from req.body
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const imageData = await generateQRCode(url);
    res.contentType("image/png");
    res.send(imageData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
