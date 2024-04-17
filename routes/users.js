require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

module.exports = mongoose.model("user", userSchema);
