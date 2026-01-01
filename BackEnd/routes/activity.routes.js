const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../utilities");
const {
  trackNoteView,
  trackNoteEdit,
  getResumeSuggestions,
  updateViewProgress,
} = require("../controllers/activity.controller");

// Track note view
router.post("/track-view/:noteId", authenticateToken, trackNoteView);

// Track note edit
router.post("/track-edit/:noteId", authenticateToken, trackNoteEdit);

// Get resume suggestions
router.get("/resume", authenticateToken, getResumeSuggestions);

// Update view progress (scroll position, time spent)
router.put("/view-progress/:noteId", authenticateToken, updateViewProgress);

module.exports = router;
