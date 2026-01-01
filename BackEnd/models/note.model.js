const mongoose = require("mongoose");

/**
 * Enhanced Note Schema for NoteSync
 *
 * Design Philosophy:
 * - Minimal but intentional: every field serves a clear purpose
 * - Flexible: optional fields allow simple or rich notes
 * - Scalable: structured for future features without breaking changes
 */
const NoteSchema = new mongoose.Schema({
  // Core Identity
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },

  // Note Type: Lightweight categorization that influences defaults
  // Justification: Note types provide subtle UX hints without rigid rules.
  // Each type can suggest different defaults (e.g., tasks auto-expand checklist)
  // but users can always customize. This is about intent, not enforcement.
  noteType: {
    type: String,
    enum: ["note", "idea", "task", "reference"],
    default: "note",
  },

  // Content: Plain text content for the note body
  // Justification: Simple text allows flexibility - users can structure content as they wish
  content: {
    type: String,
    default: "",
  },

  // Organization & Discovery
  tags: {
    type: [String],
    default: [],
    // Justification: Tags enable quick filtering and grouping of related notes
  },

  color: {
    type: String,
    enum: ["default", "red", "orange", "yellow", "green", "blue", "purple", "pink"],
    default: "default",
    // Justification: Visual color coding helps users quickly identify and categorize notes
    // at a glance without reading content. Limited palette keeps UI clean.
  },

  // Priority & Status
  isPinned: {
    type: Boolean,
    default: false,
    // Justification: Pinned notes surface important items without manual sorting
  },

  priority: {
    type: String,
    enum: ["none", "low", "medium", "high"],
    default: "none",
    // Justification: Priority levels help users triage and focus on what matters most.
    // Distinct from pinning - priority is about importance, pinning is about visibility.
  },

  isArchived: {
    type: Boolean,
    default: false,
    // Justification: Archiving keeps notes accessible without cluttering active view.
    // Better than deletion for notes that may be needed later.
  },

  // Time Management
  dueDate: {
    type: Date,
    default: null,
    // Justification: Optional due dates transform notes into actionable items.
    // Enables reminder features and "due soon" filtering.
  },

  reminder: {
    type: Date,
    default: null,
    // Justification: Separate from dueDate - reminder is when to be notified,
    // dueDate is when something is actually due. A note might remind 1 day before due.
  },

  // Smart Priority Controls
  snoozedUntil: {
    type: Date,
    default: null,
    // Justification: Allows users to temporarily hide notes from smart priority
    // without archiving. Note reappears automatically after snooze expires.
  },

  dismissedFromFocus: {
    type: Boolean,
    default: false,
    // Justification: User explicitly dismissed this note from smart suggestions.
    // Resets when note is edited or after a period of time.
  },

  focusPinned: {
    type: Boolean,
    default: false,
    // Justification: User explicitly wants this note to always appear in focus.
    // Separate from regular pinning - this is for the smart priority section.
  },

  // Checklist Support
  checklist: {
    type: [{
      id: { type: String, required: true },
      text: { type: String, required: true },
      isCompleted: { type: Boolean, default: false },
    }],
    default: [],
    // Justification: Checklists are essential for task-oriented notes (shopping lists,
    // todos, steps). Embedded array keeps it simple vs. separate collection.
  },

  // Ownership & Timestamps
  userId: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    // Justification: Immutable creation timestamp for sorting and reference
  },

  updatedAt: {
    type: Date,
    default: Date.now,
    // Justification: Track when note was last modified - helps users find recent work
  },
});

// Update the updatedAt timestamp before each save
NoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
NoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, isArchived: 1 });
NoteSchema.index({ userId: 1, tags: 1 });

const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
