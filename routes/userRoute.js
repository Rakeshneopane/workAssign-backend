const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { userLogin, userSignup, getMe, getAll } = require("../controller/authController");
const { isAdmin } = require("../middleware/adminMiddleware");

router.post("/login", userLogin);
router.post("/signup", userSignup);
router.get("/me", authMiddleware, getMe);
router.get("/all", authMiddleware, isAdmin, getAll)

module.exports = router;
