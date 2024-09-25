const express = require("express");
const multer = require("multer");
const path = require("path");
const Book = require("../schema/book");
const Class = require("../schema/class");
const { v4: uuidv4 } = require("uuid"); // Import uuid
const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, "public/uploads/pdfs");
        } else if (file.mimetype.startsWith("image")) {
            cb(null, "public/uploads/images");
        } else {
            cb(null, "public/uploads/misc");
        }
    },
    filename: function (req, file, cb) {
        // Generate a unique name for the file using UUID
        cb(null, uuidv4() + path.extname(file.originalname));
    },
});

// Multer setup with file size limit of 100 MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB in bytes
});

// Error handling middleware for file size limit exceeded
const handleError = (err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            error: "File is too large. Maximum size allowed is 100 MB.",
        });
    }
    next(err);
};

// Get all books
router.get("/", async (req, res) => {
    try {
        const books = await Book.find({}).populate('series').populate('class');
        res.send(books);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

// Upload a new book
router.post(
    "/",
    upload.fields([
        { name: "pdf_url", maxCount: 1 },
        { name: "image_url", maxCount: 1 },
    ]),
    async (req, res) => {
        const { name, unique_id, series, class: classId } = req.body;
        try {
            // Validate that the class belongs to the series
            const classInstance = await Class.findById(classId);
            if (!classInstance || classInstance.series.toString() !== series) {
                return res.status(400).send({
                    error: "Class does not belong to the specified series",
                });
            }
            
            // Construct file paths using unique_id
            const pdfPath = req.files.pdf_url
                ? req.files.pdf_url[0].path.replace('public\\','')
                : undefined;
            const imagePath = req.files.image_url
                ? req.files.image_url[0].path.replace('public\\','')
                : undefined;

            // Create the book entry
            const book = new Book({
                name,
                unique_id,
                series,
                class: classId,
                pdf_url: pdfPath,
                image_url: imagePath,
            });

            await book.save();
            res.status(201).send(book);
        } catch (error) {
            res.status(400).send(error);
        }
    },
);

// Update an existing book
router.patch(
    "/:id",
    upload.fields([
        { name: "pdf_url", maxCount: 1 },
        { name: "image_url", maxCount: 1 },
    ]),
    async (req, res) => {
        const { name, unique_id, series, class: classId } = req.body;
        try {
            // Validate that the class belongs to the series
            const classInstance = await Class.findById(classId);
            if (!classInstance || classInstance.series.toString() !== series) {
                return res.status(400).send({
                    error: "Class does not belong to the specified series",
                });
            }

            // Construct file paths using unique_id
            const pdfPath = req.files.pdf_url
                ? path.join(
                      "uploads/pdfs",
                      `${unique_id}${path.extname(req.files.pdf_url[0].originalname)}`,
                  )
                : undefined;
            const imagePath = req.files.image_url
                ? path.join(
                      "uploads/images",
                      `${unique_id}${path.extname(req.files.image_url[0].originalname)}`,
                  )
                : undefined;

            // Update the book entry
            const book = await Book.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    unique_id,
                    series,
                    class: classId,
                    pdf_url: pdfPath || undefined, // Only update if a new file is uploaded
                    image_url: imagePath || undefined, // Only update if a new file is uploaded
                },
                { new: true, runValidators: true },
            );

            if (!book) {
                return res.status(404).send({ error: "Book not found" });
            }

            res.send(book);
        } catch (error) {
            res.status(400).send(error);
        }
    },
);

// Delete an existing book
router.delete("/:id", async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).send({ error: "Book not found" });
        }

        // Optionally, you can also delete the associated files from the file system here

        res.send(book);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
