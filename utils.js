const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

// Function to generate QR code and return it as a PDF
const generateQRCodePDF = async (url) => {
  try {
    // Generate QR code as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(url);

    // Create a new PDF document
    const doc = new PDFDocument();

    // Create a buffer to store the PDF data
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      return pdfData;
    });

    // Add the QR code image to the PDF
    doc.image(qrCodeBuffer, {
      fit: [250, 250],
      align: "center",
      valign: "center",
    });

    // Finalize the PDF and end the stream
    doc.end();

    // Wait for the PDF generation to finish
    return new Promise((resolve, reject) => {
      doc.on("finish", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", reject);
    });
  } catch (err) {
    throw new Error("Failed to generate QR Code PDF");
  }
};
const generateQRCode = async (url) => {
  try {
    return await QRCode.toBuffer(url);
  } catch (err) {
    throw new Error("Failed to generate QR Code");
  }
};

module.exports = {
  generateQRCodePDF,
  generateQRCode
}