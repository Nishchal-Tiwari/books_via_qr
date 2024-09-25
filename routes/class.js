const express = require("express");
const Class = require("../schema/class");
const Series = require("../schema/series");
const Book = require('../schema/book')
const router = express.Router();
const fs = require('fs')
const path= require('path')

router.get('/:series',async (req,res)=>{
    const {series} = req.params
    const existingSeries = await Series.findById(series);
    if (!existingSeries) {
        return res.status(404).send({ error: "Series not found" });
    } 
    const classInstances = await Class.find({ series: req.params.id })

    res.send(classInstances)
})
// Create a new class (only if series ID is provided)
router.post("/", async (req, res) => {
    const { name, series } = req.body;
    try {
        const existingSeries = await Series.findById(series);
        if (!existingSeries) {
            return res.status(404).send({ error: "Series not found" });
        }
        const classInstance = new Class({ name, series });
        await classInstance.save();

        // Add the class to the series
        existingSeries.classes.push(classInstance._id);
        await existingSeries.save();

        res.status(201).send(classInstance);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update an existing class
router.patch("/:id", async (req, res) => {
    try {
        const classInstance = await Class.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );
        if (!classInstance) {
            return res.status(404).send();
        }
        res.send(classInstance);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a class

// Delete a class
router.delete("/:id", async (req, res) => {
    try {
        // Find and delete the class instance
        const classInstance = await Class.findById(req.params.id);
        if (!classInstance) {
            return res.status(404).send('Class not found');
        }

        // Find the associated book
        const book = await Book.findOne({ class: classInstance._id });
        if (book) {
            // Delete the book’s image and PDF files
            if (book.image_url) {
                fs.unlinkSync(path.join(__dirname, '..', 'public/'+book.image_url));
            }
            if (book.pdf_url) {
                fs.unlinkSync(path.join(__dirname, '..', 'public/'+book.pdf_url));
            }

            // Delete the book from the database
            await Book.findByIdAndDelete(book._id);
        }

        // Remove the class from the series
        await Series.findByIdAndUpdate(classInstance.series, {
            $pull: { classes: classInstance._id },
        });

        // Delete the class
        await Class.findByIdAndDelete(req.params.id);

        res.send('Class and associated book deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
