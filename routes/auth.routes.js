const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  verifyEmail,
  searchUser,
} = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
router.get("/search", searchUser);

module.exports = router;