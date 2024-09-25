const mongoose = require("mongoose");
const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
        required: true,
    },
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
