const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Import uuid

const app = express();

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the upload folder based on file type
        if (file.mimetype === "application/pdf") {
            cb(null, "uploads/pdfs/");
        } else if (file.mimetype.startsWith("image/")) {
            cb(null, "uploads/images/");
        } else {
            cb(null, "uploads/misc/");
        }
    },
    filename: function (req, file, cb) {
        // Generate a unique name for the file using UUID
        cb(null, uuidv4() + path.extname(file.originalname));
    },
});

// Initialize Multer with storage engine
const upload = multer({ storage: storage });

// Middleware to serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route to upload a single image
app.post("/upload/image", upload.single("image"), (req, res) => {
    try {
        res.send({
            message: "Image uploaded successfully!",
            file: req.file,
        });
    } catch (err) {
        res.status(400).send({
            error: err.message,
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
