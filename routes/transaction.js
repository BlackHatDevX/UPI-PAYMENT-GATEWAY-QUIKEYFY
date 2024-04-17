require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const transactionSchema = mongoose.Schema({
  userId: String,
  trId: Number,
  email: String,
  status: String,
  username: String,
  PType: String,
  amount: String,
  time: String,
  date: String,
  proof: String,
  proofdate: String,
  prooftime: String,
});

module.exports = mongoose.model("transaction", transactionSchema);
