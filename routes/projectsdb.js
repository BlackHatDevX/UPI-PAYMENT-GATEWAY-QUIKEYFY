require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGODB_URI);

const projectsSchema = mongoose.Schema({
  email: String,
  trId: String,
  charge: String,
  type: String,
  notes: String,
  file: String,
  date: String,
  time: String,
});

module.exports = mongoose.model("projects", projectsSchema);
