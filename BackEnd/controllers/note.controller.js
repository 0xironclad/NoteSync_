const Note = require("../models/note.model");

// !ADD NOTE
const addNote = async (req, res) => {
  const {
    title,
    noteType,
    content,
    tags,
    color,
    priority,
    dueDate,
    reminder,
    checklist
  } = req.body;
  const { user } = req.user;

  try {
    if (!title) {
      return res.status(400).json({
        error: true,
        message: "Title is required!",
      });
    }
    const note = new Note({
      title,
      noteType: noteType || "note",
      content: content || "",
      tags: tags || [],
      color: color || "default",
      priority: priority || "none",
      dueDate: dueDate || null,
      reminder: reminder || null,
      checklist: checklist || [],
      userId: user._id,
    });
    await note.save();
    res.status(201).json({
      error: false,
      message: "Note added successfully!",
      note,
    });
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: "Error adding note!",
    });
  }
};

// !EDIT NOTE
const editNote = async (req, res) => {
  const { noteId } = req.params;
  const {
    title,
    noteType,
    content,
    tags,
    color,
    isPinned,
    priority,
    isArchived,
    dueDate,
    reminder,
    checklist
  } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found!",
      });
    }

    // Update fields if provided (allowing empty strings and false values)
    if (title !== undefined) note.title = title;
    if (noteType !== undefined) note.noteType = noteType;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (priority !== undefined) note.priority = priority;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (dueDate !== undefined) note.dueDate = dueDate;
    if (reminder !== undefined) note.reminder = reminder;
    if (checklist !== undefined) note.checklist = checklist;

    await note.save();
    return res.status(200).json({
      error: false,
      message: "Note edited successfully!",
      note,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

// !GET ALL THE NOTES
const getAllNotes = async (req, res) => {
  const { user } = req.user;
  const { archived } = req.query;

  try {
    // Filter by archived status (default: show non-archived)
    const isArchived = archived === 'true';
    const notes = await Note.find({
      userId: user._id,
      isArchived: isArchived
    }).sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      error: false,
      notes,
      message: "All notes retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !DELETE NOTE
const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    const deleted = await Note.findByIdAndDelete(noteId);
    console.log(`Deleted the following note\n: ${deleted}`);
    res.status(200).json({
      error: false,
      message: "Deleted note succesfully!",
      deleted,
    });
  } catch (err) {
    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
};

// !Pin Note
const updatePin = async (req, res) => {
  const { user } = req.user;
  const { noteId } = req.params;
  const { isPinned } = req.body;
  if (!user)
    return res.status(401).json({
      error: true,
      message: "Unauthorised!",
    });

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note)
      return res.status(404).json({
        error: true,
        message: "Note not found!",
      });

    if (isPinned === note.isPinned) {
      return res.status(400).json({
        error: true,
        message: "No changes made!",
      });
    }
    note.isPinned = isPinned;
    await note.save();
    console.log(`Note pinned status updated successfully`);
    return res.status(200).json({
      error: false,
      message: "Note pinned status updated successfully!",
      note,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !SEARCH NOTES
const searchNote = async (req, res) => {
  const { user } = req.user;
  const { query, archived } = req.query;

  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Query is required!",
    });
  }

  try {
    const isArchived = archived === 'true';
    const notes = await Note.find({
      userId: user._id,
      isArchived: isArchived,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
        { tags: { $regex: new RegExp(query, "i") } },
        { "checklist.text": { $regex: new RegExp(query, "i") } },
      ],
    }).sort({ isPinned: -1, updatedAt: -1 });

    if (notes.length === 0) {
      return res.status(404).json({
        error: true,
        message: "No notes found!",
      });
    }
    return res.status(200).json({
      error: false,
      notes,
      message: "Notes retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !TOGGLE CHECKLIST ITEM
const toggleChecklistItem = async (req, res) => {
  const { noteId, itemId } = req.params;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found!",
      });
    }

    const item = note.checklist.find(item => item.id === itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Checklist item not found!",
      });
    }

    item.isCompleted = !item.isCompleted;
    await note.save();

    return res.status(200).json({
      error: false,
      message: "Checklist item toggled successfully!",
      note,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !GET ALL TAGS (for suggestions)
const getAllTags = async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  try {
    // Aggregate all unique tags from user's notes
    const result = await Note.aggregate([
      { $match: { userId: user._id } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    let tags = result.map(r => ({ name: r._id, count: r.count }));

    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase();
      tags = tags.filter(t => t.name.toLowerCase().includes(lowerQuery));
    }

    return res.status(200).json({
      error: false,
      tags,
      message: "Tags retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !GET NOTES BY TAG
const getNotesByTag = async (req, res) => {
  const { user } = req.user;
  const { tag } = req.params;
  const { archived } = req.query;

  try {
    const isArchived = archived === 'true';
    const notes = await Note.find({
      userId: user._id,
      isArchived: isArchived,
      tags: tag
    }).sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      error: false,
      notes,
      message: `Notes with tag "${tag}" retrieved successfully!`,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !GET SMART VIEW COUNTS
const getSmartViewCounts = async (req, res) => {
  const { user } = req.user;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Run all counts in parallel for efficiency
    const [
      allCount,
      pinnedCount,
      recentCount,
      withTasksCount,
      untaggedCount,
      highPriorityCount,
      dueSoonCount,
      archivedCount
    ] = await Promise.all([
      // All active notes
      Note.countDocuments({ userId: user._id, isArchived: false }),
      // Pinned notes
      Note.countDocuments({ userId: user._id, isArchived: false, isPinned: true }),
      // Recent (updated in last 7 days)
      Note.countDocuments({ userId: user._id, isArchived: false, updatedAt: { $gte: sevenDaysAgo } }),
      // Notes with incomplete tasks
      Note.countDocuments({
        userId: user._id,
        isArchived: false,
        "checklist.0": { $exists: true },
        "checklist.isCompleted": false
      }),
      // Untagged notes
      Note.countDocuments({ userId: user._id, isArchived: false, tags: { $size: 0 } }),
      // High priority notes
      Note.countDocuments({ userId: user._id, isArchived: false, priority: "high" }),
      // Due soon (within 7 days)
      Note.countDocuments({
        userId: user._id,
        isArchived: false,
        dueDate: { $ne: null, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
      }),
      // Archived notes
      Note.countDocuments({ userId: user._id, isArchived: true })
    ]);

    return res.status(200).json({
      error: false,
      counts: {
        all: allCount,
        pinned: pinnedCount,
        recent: recentCount,
        withTasks: withTasksCount,
        untagged: untaggedCount,
        highPriority: highPriorityCount,
        dueSoon: dueSoonCount,
        archived: archivedCount
      },
      message: "Smart view counts retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !GET DAILY FOCUS (Smart Retrieval)
// Surfaces the most relevant notes based on multiple signals
const getDailyFocus = async (req, res) => {
  const { user } = req.user;

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch all active notes for the user
    const allNotes = await Note.find({
      userId: user._id,
      isArchived: false
    });

    // Calculate focus scores and categorize notes
    const focusItems = [];
    const recentlyEdited = [];
    const continueWorking = [];

    for (const note of allNotes) {
      // 1. OVERDUE OR DUE TODAY - Highest priority
      if (note.dueDate) {
        const dueDate = new Date(note.dueDate);
        if (dueDate < startOfToday) {
          focusItems.push({
            note,
            reason: "overdue",
            label: "Overdue",
            urgency: "critical",
            daysOverdue: Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24))
          });
          continue;
        }
        if (dueDate >= startOfToday && dueDate < endOfToday) {
          focusItems.push({
            note,
            reason: "dueToday",
            label: "Due today",
            urgency: "high"
          });
          continue;
        }
        // Due within 3 days
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        if (dueDate <= threeDaysFromNow) {
          focusItems.push({
            note,
            reason: "dueSoon",
            label: `Due ${dueDate.toLocaleDateString('en-US', { weekday: 'short' })}`,
            urgency: "medium"
          });
          continue;
        }
      }

      // 2. HIGH PRIORITY with incomplete tasks
      const hasIncompleteTasks = note.checklist.length > 0 &&
        note.checklist.some(item => !item.isCompleted);

      if (note.priority === "high") {
        focusItems.push({
          note,
          reason: "highPriority",
          label: "High priority",
          urgency: hasIncompleteTasks ? "high" : "medium"
        });
        continue;
      }

      // 3. PINNED notes with incomplete tasks
      if (note.isPinned && hasIncompleteTasks) {
        const completedCount = note.checklist.filter(i => i.isCompleted).length;
        const totalCount = note.checklist.length;
        continueWorking.push({
          note,
          reason: "pinnedWithTasks",
          label: `${completedCount}/${totalCount} done`,
          progress: (completedCount / totalCount) * 100
        });
        continue;
      }

      // 4. RECENTLY EDITED (within 24 hours) - for "pick up where you left off"
      const updatedAt = new Date(note.updatedAt);
      if (updatedAt >= twentyFourHoursAgo) {
        // Notes with incomplete tasks are more actionable
        if (hasIncompleteTasks) {
          const completedCount = note.checklist.filter(i => i.isCompleted).length;
          const totalCount = note.checklist.length;
          continueWorking.push({
            note,
            reason: "recentWithTasks",
            label: `${completedCount}/${totalCount} done`,
            progress: (completedCount / totalCount) * 100
          });
        } else {
          recentlyEdited.push({
            note,
            reason: "recentEdit",
            label: formatTimeAgo(updatedAt, now)
          });
        }
      }
    }

    // Sort focus items by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    focusItems.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // Sort continue working by progress (lower progress = more to do)
    continueWorking.sort((a, b) => a.progress - b.progress);

    // Sort recently edited by recency
    recentlyEdited.sort((a, b) =>
      new Date(b.note.updatedAt) - new Date(a.note.updatedAt)
    );

    // Limit results to avoid overwhelming users
    const result = {
      // Needs attention: overdue, due today/soon, high priority
      needsAttention: focusItems.slice(0, 5),
      // Continue working: pinned with tasks, recently edited with tasks
      continueWorking: continueWorking.slice(0, 4),
      // Pick up where you left off: recently edited
      recentlyEdited: recentlyEdited.slice(0, 3),
      // Summary counts for the header
      summary: {
        overdueCount: focusItems.filter(i => i.reason === "overdue").length,
        dueTodayCount: focusItems.filter(i => i.reason === "dueToday").length,
        highPriorityCount: focusItems.filter(i => i.reason === "highPriority").length,
        inProgressCount: continueWorking.length
      }
    };

    return res.status(200).json({
      error: false,
      focus: result,
      message: "Daily focus retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// !GET RELATED NOTES (Context-Aware Suggestions)
// Surfaces notes related to the currently viewed/edited note
const getRelatedNotes = async (req, res) => {
  const { user } = req.user;
  const { noteId } = req.params;

  try {
    // Get the current note
    const currentNote = await Note.findOne({ _id: noteId, userId: user._id });
    if (!currentNote) {
      return res.status(404).json({
        error: true,
        message: "Note not found!",
      });
    }

    // Get all other active notes
    const otherNotes = await Note.find({
      userId: user._id,
      _id: { $ne: noteId },
      isArchived: false
    });

    // Calculate relevance scores for each note
    const scoredNotes = otherNotes.map(note => {
      let score = 0;
      const reasons = [];

      // 1. SHARED TAGS (strongest signal) - 3 points per shared tag
      const sharedTags = currentNote.tags.filter(tag => note.tags.includes(tag));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 3;
        reasons.push({
          type: "sharedTags",
          tags: sharedTags,
          label: sharedTags.length === 1 ? `#${sharedTags[0]}` : `${sharedTags.length} shared tags`
        });
      }

      // 2. SAME NOTE TYPE (moderate signal) - 2 points
      if (note.noteType === currentNote.noteType && currentNote.noteType !== "note") {
        score += 2;
        reasons.push({
          type: "sameType",
          noteType: note.noteType,
          label: `Also a ${note.noteType}`
        });
      }

      // 3. UNFINISHED TASKS in same category - 2 points
      const hasIncompleteTasks = note.checklist.length > 0 &&
        note.checklist.some(item => !item.isCompleted);
      if (hasIncompleteTasks && sharedTags.length > 0) {
        score += 2;
        const completedCount = note.checklist.filter(i => i.isCompleted).length;
        const totalCount = note.checklist.length;
        reasons.push({
          type: "unfinishedTasks",
          progress: (completedCount / totalCount) * 100,
          label: `${totalCount - completedCount} task${totalCount - completedCount > 1 ? 's' : ''} remaining`
        });
      }

      // 4. RECENTLY EDITED (weak signal for recency) - 1 point if within 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (new Date(note.updatedAt) > sevenDaysAgo) {
        score += 1;
      }

      // 5. HIGH PRIORITY in same category - 1.5 points
      if (note.priority === "high" && sharedTags.length > 0) {
        score += 1.5;
        reasons.push({
          type: "highPriority",
          label: "High priority"
        });
      }

      // 6. CONTENT SIMILARITY - Check for shared words in title (basic)
      // Only if no other strong signals
      if (score === 0) {
        const currentWords = currentNote.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const noteWords = note.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const sharedWords = currentWords.filter(word => noteWords.includes(word));
        if (sharedWords.length > 0) {
          score += sharedWords.length * 0.5;
          reasons.push({
            type: "similarTitle",
            label: "Similar topic"
          });
        }
      }

      return {
        note,
        score,
        reasons,
        // Pick the most relevant reason for display
        primaryReason: reasons[0] || null
      };
    });

    // Filter notes with score > 0 and sort by score
    const relatedNotes = scoredNotes
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Limit to 5 related notes

    // Also get notes with incomplete tasks that share context
    const relatedWithTasks = relatedNotes
      .filter(item => item.reasons.some(r => r.type === "unfinishedTasks"))
      .slice(0, 3);

    return res.status(200).json({
      error: false,
      related: {
        notes: relatedNotes,
        withTasks: relatedWithTasks,
        currentNoteTags: currentNote.tags,
        currentNoteType: currentNote.noteType
      },
      message: "Related notes retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// Helper function to format relative time
function formatTimeAgo(date, now) {
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return "Yesterday";
}

// !GET NOTES BY SMART VIEW
const getNotesBySmartView = async (req, res) => {
  const { user } = req.user;
  const { view } = req.params;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let query = { userId: user._id };
    let sort = { isPinned: -1, updatedAt: -1 };

    switch (view) {
      case "all":
        query.isArchived = false;
        break;
      case "pinned":
        query.isArchived = false;
        query.isPinned = true;
        break;
      case "recent":
        query.isArchived = false;
        query.updatedAt = { $gte: sevenDaysAgo };
        sort = { updatedAt: -1 };
        break;
      case "withTasks":
        query.isArchived = false;
        query["checklist.0"] = { $exists: true };
        query["checklist.isCompleted"] = false;
        break;
      case "untagged":
        query.isArchived = false;
        query.tags = { $size: 0 };
        break;
      case "highPriority":
        query.isArchived = false;
        query.priority = "high";
        break;
      case "dueSoon":
        query.isArchived = false;
        query.dueDate = { $ne: null, $lte: sevenDaysFromNow };
        sort = { dueDate: 1, isPinned: -1 };
        break;
      case "archived":
        query.isArchived = true;
        break;
      default:
        return res.status(400).json({
          error: true,
          message: "Invalid smart view!",
        });
    }

    const notes = await Note.find(query).sort(sort);

    return res.status(200).json({
      error: false,
      notes,
      message: `Notes for "${view}" view retrieved successfully!`,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  updatePin,
  searchNote,
  toggleChecklistItem,
  getAllTags,
  getNotesByTag,
  getSmartViewCounts,
  getNotesBySmartView,
  getDailyFocus,
  getRelatedNotes,
};
