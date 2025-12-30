const Note = require("../models/note.model");

// !ADD NOTE
const addNote = async (req, res) => {
  const {
    title,
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
};
