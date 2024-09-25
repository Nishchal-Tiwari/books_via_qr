const mongoose = require("mongoose");
const seriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
        },
    ],
});

const Series = mongoose.model("Series", seriesSchema);
module.exports = Series;
