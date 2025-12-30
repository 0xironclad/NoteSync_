import { useEffect, useState, useCallback } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import Dashboard from "./Dashboard";
import { Note, NoteColor, NotePriority, ChecklistItem } from "@/types/note";

interface NoteFormData {
  title: string;
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
    const [showArchived, setShowArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<TagInfo[]>([]);

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

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        try {
            let response;
            if (selectedTag) {
                // Fetch notes by tag
                response = await AxiosInstance.get(
                    `/notes-by-tag/${encodeURIComponent(selectedTag)}?archived=${showArchived}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Fetch all notes
                response = await AxiosInstance.get(`/all-notes?archived=${showArchived}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            if (!response.data.error) {
                setNotes(response.data.notes);
            } else {
                console.log("Error: ", response.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }, [showArchived, selectedTag]);

    const onSearchNote = async (searchText: string) => {
        setSearchQuery(searchText);
        setSelectedTag(null); // Clear tag filter when searching
        const searchParam = searchText.trim();
        if (searchParam === "") {
            fetchData();
            return;
        }
        const token = localStorage.getItem("accessToken");
        try {
            const response = await AxiosInstance.get(
                `/search-note?query=${encodeURIComponent(searchParam)}&archived=${showArchived}`,
                { headers: { Authorization: `Bearer ${token}` } }
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

    const onCreateNote = async (data: NoteFormData) => {
        const response = await AxiosInstance.post("/add-note", data);
        if (!response.data.error) {
            fetchData();
            fetchTags(); // Refresh tags after creating note
        } else {
            throw new Error(response.data.message);
        }
    };

    const onEditNote = async (noteId: string, data: NoteFormData) => {
        const response = await AxiosInstance.put(`/edit-note/${noteId}`, data);
        if (!response.data.error) {
            fetchData();
            fetchTags(); // Refresh tags after editing note
        } else {
            throw new Error(response.data.message);
        }
    };

    const onDeleteNote = async (noteId: string) => {
        const response = await AxiosInstance.delete(`/delete-note/${noteId}`);
        if (!response.data.error) {
            fetchData();
            fetchTags(); // Refresh tags after deleting note
        }
    };

    const onPinNote = async (noteId: string, isPinned: boolean) => {
        const response = await AxiosInstance.put(`/update-pin/${noteId}`, { isPinned: !isPinned });
        if (!response.data.error) {
            fetchData();
        }
    };

    const onArchiveNote = async (noteId: string, isArchived: boolean) => {
        const response = await AxiosInstance.put(`/edit-note/${noteId}`, { isArchived: !isArchived });
        if (!response.data.error) {
            fetchData();
        }
    };

    const onToggleChecklistItem = async (noteId: string, itemId: string) => {
        const response = await AxiosInstance.put(`/toggle-checklist/${noteId}/${itemId}`);
        if (!response.data.error) {
            fetchData();
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return (
        <Dashboard
            notes={notes}
            showArchived={showArchived}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            allTags={allTags}
            onToggleArchived={() => setShowArchived(!showArchived)}
            onSearch={onSearchNote}
            onSelectTag={onSelectTag}
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