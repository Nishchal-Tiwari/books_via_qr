const express = require("express");
const Series = require("../schema/series");
const Class = require("../schema/class")
const router = express.Router();
// Get all series
router.get("/", async (req, res) => {
    try {
        const series = await Series.find({});
        res.status(201).send(series);
    } catch (error) {
        res.status(400).send(error);
    }
});
//Get all series with class
router.get("/withClass", async (req, res) => {
    try {
        const series = await Series.find({}).populate('classes').exec()
        res.status(201).send(series);
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
});
// Create a new series
router.post("/", async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).send({ error: 'Request body must contain a name' });
        }
        const series = new Series(req.body);
        await series.save();
        res.status(201).send(series);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update an existing series
router.patch("/:id", async (req, res) => {
    try {
        const series = await Series.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!series) {
            return res.status(404).send();
        }
        res.send(series);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a series
router.delete("/:id", async (req, res) => {
    try {
        let series = await Series.findById(req.params.id);
        if(series.classes.length!=0)
            return res.status(400).send({ error: 'Series must be deleted from all classes first' })
        if (!series) {
            return res.status(404).send();
        }
        series = await Series.findByIdAndDelete(req.params.id);
        res.send(series);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
