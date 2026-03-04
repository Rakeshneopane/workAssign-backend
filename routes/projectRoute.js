const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { postProject, updateProject, getProjects,getProjectById, deleteProject } = require("../controller/projectsController");

router.post("/", authMiddleware, postProject);
router.put("/:id", authMiddleware, updateProject);
router.get("/:id", authMiddleware, getProjectById);
router.get("/", authMiddleware, getProjects);
router.delete("/:id", authMiddleware, deleteProject)

module.exports = router;
