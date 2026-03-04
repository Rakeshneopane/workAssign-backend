const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { postTeam, updateTeam, getTeamById, getTeams, deleteTeam } = require("../controller/teamController");

router.post("/", authMiddleware, postTeam);
router.put("/:id", authMiddleware, updateTeam);
router.get("/:id", authMiddleware, getTeamById);
router.get("/", authMiddleware, getTeams);
router.delete("/:id", authMiddleware, deleteTeam)

module.exports = router;
