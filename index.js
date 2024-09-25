const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Class = require("./routes/class");
const Book = require("./routes/book");
const Series = require("./routes/series");
const Qr = require('./routes/qr')
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(
    // "mongodb+srv://messenger:messenger@cluster0.10fn5ry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    "mongodb://127.0.0.1:27017/puneetStore"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/class", Class);
app.use("/book", Book);
app.use("/series", Series);
app.use('/qr',Qr);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
