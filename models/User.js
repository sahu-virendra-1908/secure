const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  username: String,
  email: String,
  password: String,
//   publicKey: String,
  isVerified: Boolean,
  emailToken: String
},
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);