const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../utilities");
const {
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  updatePin,
  searchNote,
  toggleChecklistItem,
  getAllTags,
  getNotesByTag
} = require("../controllers/note.controller");

router.post("/add-note", authenticateToken, addNote);
router.put("/edit-note/:noteId", authenticateToken, editNote);
router.get("/all-notes", authenticateToken, getAllNotes);
router.delete("/delete-note/:noteId", authenticateToken, deleteNote);
router.put("/update-pin/:noteId", authenticateToken, updatePin);
router.get("/search-note", authenticateToken, searchNote);
router.put("/toggle-checklist/:noteId/:itemId", authenticateToken, toggleChecklistItem);
router.get("/tags", authenticateToken, getAllTags);
router.get("/notes-by-tag/:tag", authenticateToken, getNotesByTag);

module.exports = router;
