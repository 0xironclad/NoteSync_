const Activity = require("../models/activity.model");
const Note = require("../models/note.model");

/**
 * Track when user views a note
 * Called when opening a note in the viewer
 */
const trackNoteView = async (req, res) => {
  const { user } = req.user;
  const { noteId } = req.params;
  const { scrollPosition = 0, timeSpent = 0 } = req.body;

  try {
    // Find or create activity record for user
    let activity = await Activity.findOne({ userId: user._id });

    if (!activity) {
      activity = new Activity({ userId: user._id });
    }

    // Update session tracking
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // If last active was more than 30 min ago, this is a new session
    if (activity.lastActiveAt && activity.lastActiveAt < thirtyMinutesAgo) {
      activity.previousSessionEnd = activity.lastActiveAt;
    }

    // Add viewed note
    activity.addViewedNote(noteId, scrollPosition, timeSpent);

    await activity.save();

    return res.status(200).json({
      error: false,
      message: "Activity tracked successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

/**
 * Track when user edits a note
 */
const trackNoteEdit = async (req, res) => {
  const { user } = req.user;
  const { noteId } = req.params;

  try {
    let activity = await Activity.findOne({ userId: user._id });

    if (!activity) {
      activity = new Activity({ userId: user._id });
    }

    activity.lastEditedNoteId = noteId;
    activity.lastEditedAt = new Date();
    activity.lastActiveAt = new Date();

    await activity.save();

    return res.status(200).json({
      error: false,
      message: "Edit activity tracked successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

/**
 * Get resume suggestions based on user activity
 * Returns personalized "continue where you left off" suggestions
 */
const getResumeSuggestions = async (req, res) => {
  const { user } = req.user;

  try {
    const activity = await Activity.findOne({ userId: user._id });

    if (!activity) {
      return res.status(200).json({
        error: false,
        resume: null,
        message: "No activity found",
      });
    }

    const now = new Date();
    const suggestions = {
      // Primary suggestion - most relevant thing to resume
      primary: null,
      // Context about the suggestion
      context: null,
      // Is this a returning user after a break?
      isReturning: false,
      // Time since last active
      timeSinceActive: null,
    };

    // Calculate time since last active
    if (activity.lastActiveAt) {
      const diffMs = now - activity.lastActiveAt;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        suggestions.timeSinceActive = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        suggestions.isReturning = true;
      } else if (diffHours > 0) {
        suggestions.timeSinceActive = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        suggestions.isReturning = diffHours >= 2;
      } else if (diffMins > 5) {
        suggestions.timeSinceActive = `${diffMins} minutes ago`;
      }
    }

    // Priority 1: Last edited note with incomplete tasks
    if (activity.lastEditedNoteId) {
      const lastEdited = await Note.findOne({
        _id: activity.lastEditedNoteId,
        userId: user._id,
        isArchived: false,
      });

      if (lastEdited) {
        const hasIncompleteTasks = lastEdited.checklist.length > 0 &&
          lastEdited.checklist.some(item => !item.isCompleted);

        if (hasIncompleteTasks) {
          const completedCount = lastEdited.checklist.filter(i => i.isCompleted).length;
          const totalCount = lastEdited.checklist.length;

          suggestions.primary = {
            type: "incomplete_tasks",
            note: lastEdited,
            reason: "You were working on this",
            detail: `${completedCount}/${totalCount} tasks complete`,
            progress: (completedCount / totalCount) * 100,
          };
        }
      }
    }

    // Priority 2: Last viewed note (if not already suggested and was recent)
    if (!suggestions.primary && activity.lastViewedNoteId) {
      const lastViewed = await Note.findOne({
        _id: activity.lastViewedNoteId,
        userId: user._id,
        isArchived: false,
      });

      if (lastViewed) {
        // Check if it was a meaningful view (spent time or scrolled)
        const recentView = activity.recentlyViewed.find(
          v => v.noteId.toString() === activity.lastViewedNoteId.toString()
        );

        const wasPartiallyRead = recentView &&
          (recentView.scrollPosition > 20 && recentView.scrollPosition < 90);
        const spentTime = recentView && recentView.timeSpent > 10;

        if (wasPartiallyRead || spentTime || lastViewed.content.length > 500) {
          suggestions.primary = {
            type: "last_viewed",
            note: lastViewed,
            reason: suggestions.isReturning ? "Pick up where you left off" : "Continue reading",
            detail: wasPartiallyRead ? "You were partway through" : null,
            scrollPosition: recentView?.scrollPosition || 0,
          };
        }
      }
    }

    // Priority 3: Any note with high priority and incomplete tasks
    if (!suggestions.primary) {
      const urgentNote = await Note.findOne({
        userId: user._id,
        isArchived: false,
        priority: "high",
        "checklist.isCompleted": false,
      }).sort({ updatedAt: -1 });

      if (urgentNote) {
        const completedCount = urgentNote.checklist.filter(i => i.isCompleted).length;
        const totalCount = urgentNote.checklist.length;

        suggestions.primary = {
          type: "urgent_task",
          note: urgentNote,
          reason: "High priority task waiting",
          detail: `${totalCount - completedCount} task${totalCount - completedCount > 1 ? 's' : ''} remaining`,
          progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        };
      }
    }

    // Build context message
    if (suggestions.primary) {
      if (suggestions.isReturning && suggestions.timeSinceActive) {
        suggestions.context = `Welcome back! You were last here ${suggestions.timeSinceActive}.`;
      }
    }

    // Get recently viewed notes for secondary suggestions (exclude primary)
    const recentNoteIds = activity.recentlyViewed
      .filter(v => !suggestions.primary || v.noteId.toString() !== suggestions.primary.note._id.toString())
      .slice(0, 3)
      .map(v => v.noteId);

    const recentNotes = await Note.find({
      _id: { $in: recentNoteIds },
      userId: user._id,
      isArchived: false,
    });

    suggestions.recentlyViewed = recentNotes.map(note => {
      const viewData = activity.recentlyViewed.find(
        v => v.noteId.toString() === note._id.toString()
      );
      return {
        note,
        viewedAt: viewData?.viewedAt,
        scrollPosition: viewData?.scrollPosition || 0,
      };
    });

    return res.status(200).json({
      error: false,
      resume: suggestions,
      message: "Resume suggestions retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

/**
 * Update scroll position for current note
 * Called periodically while viewing a note
 */
const updateViewProgress = async (req, res) => {
  const { user } = req.user;
  const { noteId } = req.params;
  const { scrollPosition, timeSpent } = req.body;

  try {
    const activity = await Activity.findOne({ userId: user._id });

    if (activity) {
      const viewIndex = activity.recentlyViewed.findIndex(
        v => v.noteId.toString() === noteId
      );

      if (viewIndex !== -1) {
        if (scrollPosition !== undefined) {
          activity.recentlyViewed[viewIndex].scrollPosition = scrollPosition;
        }
        if (timeSpent !== undefined) {
          activity.recentlyViewed[viewIndex].timeSpent = timeSpent;
        }
        activity.lastActiveAt = new Date();
        await activity.save();
      }
    }

    return res.status(200).json({
      error: false,
      message: "View progress updated!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  trackNoteView,
  trackNoteEdit,
  getResumeSuggestions,
  updateViewProgress,
};
