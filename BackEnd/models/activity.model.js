const mongoose = require("mongoose");

/**
 * User Activity Schema for NoteSync
 *
 * Tracks user interactions for continuity features:
 * - Last viewed notes for "pick up where you left off"
 * - Session context for resumption suggestions
 * - Reading progress indicators
 */
const ActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },

  // Last viewed note - for "continue where you left off"
  lastViewedNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    default: null,
  },

  lastViewedAt: {
    type: Date,
    default: null,
  },

  // Recently viewed notes (last 5) for context
  recentlyViewed: [{
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    // Approximate scroll position (0-100%)
    scrollPosition: {
      type: Number,
      default: 0,
    },
    // Time spent viewing (seconds)
    timeSpent: {
      type: Number,
      default: 0,
    },
  }],

  // Last editing session - for draft continuity
  lastEditedNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    default: null,
  },

  lastEditedAt: {
    type: Date,
    default: null,
  },

  // Session tracking
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },

  // Previous session end time (to detect "returning after break")
  previousSessionEnd: {
    type: Date,
    default: null,
  },
});

// Keep recentlyViewed list to max 10 items
ActivitySchema.methods.addViewedNote = function(noteId, scrollPosition = 0, timeSpent = 0) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(
    item => item.noteId.toString() !== noteId.toString()
  );

  // Add to front
  this.recentlyViewed.unshift({
    noteId,
    viewedAt: new Date(),
    scrollPosition,
    timeSpent,
  });

  // Keep only last 10
  if (this.recentlyViewed.length > 10) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 10);
  }

  // Update last viewed
  this.lastViewedNoteId = noteId;
  this.lastViewedAt = new Date();
  this.lastActiveAt = new Date();
};

// Index for efficient lookups
ActivitySchema.index({ userId: 1 }, { unique: true });

const Activity = mongoose.model("Activity", ActivitySchema);
module.exports = Activity;
