require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGODB_URI);

const planAmount = mongoose.Schema({
  amount: Number,
});

module.exports = mongoose.model("plan", planAmount);
