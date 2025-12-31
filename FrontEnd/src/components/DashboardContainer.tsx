import { useEffect, useState, useCallback } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import Dashboard from "./Dashboard";
import { Note, NoteColor, NotePriority, NoteType, ChecklistItem, SmartViewType, SmartViewCounts } from "@/types/note";
import { toast } from "sonner";

interface NoteFormData {
  title: string;
  noteType: NoteType;
  content: string;
  tags: string[];
  color: NoteColor;
  priority: NotePriority;
  dueDate: string | null;
  reminder: string | null;
  checklist: ChecklistItem[];
}

interface TagInfo {
  name: string;
  count: number;
}

function DashboardContainer() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<TagInfo[]>([]);
    const [activeView, setActiveView] = useState<SmartViewType>("all");
    const [viewCounts, setViewCounts] = useState<SmartViewCounts>({
        all: 0,
        pinned: 0,
        recent: 0,
        withTasks: 0,
        untagged: 0,
        highPriority: 0,
        dueSoon: 0,
        archived: 0
    });

    const fetchTags = useCallback(async () => {
        try {
            const response = await AxiosInstance.get("/tags");
            if (!response.data.error) {
                setAllTags(response.data.tags);
            }
        } catch (error) {
            console.log(error);
        }
    }, []);

    const fetchViewCounts = useCallback(async () => {
        try {
            const response = await AxiosInstance.get("/smart-views/counts");
            if (!response.data.error) {
                setViewCounts(response.data.counts);
            }
        } catch (error) {
            console.log(error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            let response;
            if (selectedTag) {
                // Fetch notes by tag
                const isArchived = activeView === "archived";
                response = await AxiosInstance.get(
                    `/notes-by-tag/${encodeURIComponent(selectedTag)}?archived=${isArchived}`
                );
            } else {
                // Fetch notes by smart view
                response = await AxiosInstance.get(`/smart-views/${activeView}`);
            }
            if (!response.data.error) {
                setNotes(response.data.notes);
            } else {
                console.log("Error: ", response.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }, [activeView, selectedTag]);

    const onSearchNote = async (searchText: string) => {
        setSearchQuery(searchText);
        setSelectedTag(null); // Clear tag filter when searching
        const searchParam = searchText.trim();
        if (searchParam === "") {
            fetchData();
            return;
        }
        try {
            const isArchived = activeView === "archived";
            const response = await AxiosInstance.get(
                `/search-note?query=${encodeURIComponent(searchParam)}&archived=${isArchived}`
            );
            if (!response.data.error) {
                setNotes(response.data.notes);
            } else {
                setNotes([]);
            }
        } catch (error) {
            console.log(error);
            setNotes([]);
        }
    };

    const onSelectTag = (tag: string | null) => {
        setSelectedTag(tag);
        setSearchQuery(""); // Clear search when selecting tag
    };

    const onSelectView = (view: SmartViewType) => {
        setActiveView(view);
        setSelectedTag(null);
        setSearchQuery("");
    };

    const refreshAll = useCallback(() => {
        fetchData();
        fetchTags();
        fetchViewCounts();
    }, [fetchData, fetchTags, fetchViewCounts]);

    const onCreateNote = async (data: NoteFormData) => {
        const response = await AxiosInstance.post("/add-note", data);
        if (!response.data.error) {
            refreshAll();
            toast.success("Note created successfully");
        } else {
            toast.error(response.data.message || "Failed to create note");
            throw new Error(response.data.message);
        }
    };

    const onEditNote = async (noteId: string, data: NoteFormData) => {
        const response = await AxiosInstance.put(`/edit-note/${noteId}`, data);
        if (!response.data.error) {
            refreshAll();
            toast.success("Note updated successfully");
        } else {
            toast.error(response.data.message || "Failed to update note");
            throw new Error(response.data.message);
        }
    };

    const onDeleteNote = async (noteId: string) => {
        const response = await AxiosInstance.delete(`/delete-note/${noteId}`);
        if (!response.data.error) {
            refreshAll();
            toast.success("Note deleted successfully");
        } else {
            toast.error(response.data.message || "Failed to delete note");
        }
    };

    const onPinNote = async (noteId: string, isPinned: boolean) => {
        const response = await AxiosInstance.put(`/update-pin/${noteId}`, { isPinned: !isPinned });
        if (!response.data.error) {
            refreshAll();
            toast.success(isPinned ? "Note unpinned" : "Note pinned");
        } else {
            toast.error(response.data.message || "Failed to update pin status");
        }
    };

    const onArchiveNote = async (noteId: string, isArchived: boolean) => {
        const response = await AxiosInstance.put(`/edit-note/${noteId}`, { isArchived: !isArchived });
        if (!response.data.error) {
            refreshAll();
            toast.success(isArchived ? "Note restored" : "Note archived");
        } else {
            toast.error(response.data.message || "Failed to update archive status");
        }
    };

    const onToggleChecklistItem = async (noteId: string, itemId: string) => {
        const response = await AxiosInstance.put(`/toggle-checklist/${noteId}/${itemId}`);
        if (!response.data.error) {
            refreshAll();
        } else {
            toast.error(response.data.message || "Failed to update checklist item");
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        fetchViewCounts();
    }, [fetchViewCounts]);

    return (
        <Dashboard
            notes={notes}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            allTags={allTags}
            activeView={activeView}
            viewCounts={viewCounts}
            onSearch={onSearchNote}
            onSelectTag={onSelectTag}
            onSelectView={onSelectView}
            onCreateNote={onCreateNote}
            onEditNote={onEditNote}
            onDeleteNote={onDeleteNote}
            onPinNote={onPinNote}
            onArchiveNote={onArchiveNote}
            onToggleChecklistItem={onToggleChecklistItem}
        />
    );
}

export default DashboardContainer