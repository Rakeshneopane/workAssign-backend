const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { postTags, updateTags, getTags, deleteTags } = require("../controller/tagsController");

router.post("/", authMiddleware, postTags);
router.put("/:id", authMiddleware, updateTags);
router.get("/", authMiddleware, getTags);
router.delete("/:id", authMiddleware, deleteTags)

module.exports = router;
