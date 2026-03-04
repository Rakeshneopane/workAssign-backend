const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { postTask, getTasks, updateTask, getTask, deleteTask } = require("../controller/taskController");

router.post("/", authMiddleware, postTask);
router.get("/", authMiddleware, getTasks);
router.put("/:id", authMiddleware, updateTask);
router.get("/:id", authMiddleware, getTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;