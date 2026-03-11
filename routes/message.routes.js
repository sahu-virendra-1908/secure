const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message.controller");
// const authMiddleware = require("../middleware/auth.middleware");

router.post("/send" ,messageController.sendMessage);
router.get("/",  messageController.getMessages);

module.exports = router;