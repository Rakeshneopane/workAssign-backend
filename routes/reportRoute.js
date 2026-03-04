const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { lastWeekReport, pendingReport, closedReports } = require("../controller/reportController");

router.get("/last-week", authMiddleware, lastWeekReport);
router.get("/pending", authMiddleware, pendingReport);
router.get("/closed-tasks", authMiddleware, closedReports);

module.exports = router;
