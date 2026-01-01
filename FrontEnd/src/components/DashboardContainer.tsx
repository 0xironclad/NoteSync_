import { useEffect, useState, useCallback } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import Dashboard from "./Dashboard";
import { Note, NoteColor, NotePriority, NoteType, ChecklistItem, SmartViewType, SmartViewCounts, DailyFocusData, ResumeSuggestionsData, SmartPriorityData, SnoozeDuration } from "@/types/note";
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
    const [dailyFocus, setDailyFocus] = useState<DailyFocusData | null>(null);
    const [focusLoading, setFocusLoading] = useState(true);
    const [focusDismissed, setFocusDismissed] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeSuggestionsData | null>(null);
    const [resumeLoading, setResumeLoading] = useState(true);
    const [resumeDismissed, setResumeDismissed] = useState(false);
    const [smartPriority, setSmartPriority] = useState<SmartPriorityData | null>(null);
    const [priorityLoading, setPriorityLoading] = useState(true);
    const [priorityDismissed, setPriorityDismissed] = useState(false);

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

    const fetchDailyFocus = useCallback(async () => {
        if (focusDismissed) return;
        setFocusLoading(true);
        try {
            const response = await AxiosInstance.get("/daily-focus");
            if (!response.data.error) {
                setDailyFocus(response.data.focus);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setFocusLoading(false);
        }
    }, [focusDismissed]);

    const fetchResumeSuggestions = useCallback(async () => {
        if (resumeDismissed) return;
        setResumeLoading(true);
        try {
            const response = await AxiosInstance.get("/activity/resume");
            if (!response.data.error) {
                setResumeData(response.data.resume);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setResumeLoading(false);
        }
    }, [resumeDismissed]);

    const fetchSmartPriority = useCallback(async () => {
        if (priorityDismissed) return;
        setPriorityLoading(true);
        try {
            const response = await AxiosInstance.get("/smart-priority");
            if (!response.data.error) {
                setSmartPriority(response.data.priority);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPriorityLoading(false);
        }
    }, [priorityDismissed]);

    // Track note view when opening a note
    const trackNoteView = useCallback(async (noteId: string) => {
        try {
            await AxiosInstance.post(`/activity/track-view/${noteId}`);
        } catch (error) {
            // Silent fail - tracking is non-critical
        }
    }, []);

    // Track note edit when editing
    const trackNoteEdit = useCallback(async (noteId: string) => {
        try {
            await AxiosInstance.post(`/activity/track-edit/${noteId}`);
        } catch (error) {
            // Silent fail - tracking is non-critical
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
        fetchDailyFocus();
        fetchResumeSuggestions();
        fetchSmartPriority();
    }, [fetchData, fetchTags, fetchViewCounts, fetchDailyFocus, fetchResumeSuggestions, fetchSmartPriority]);

    const onDismissFocus = useCallback(() => {
        setFocusDismissed(true);
        setDailyFocus(null);
    }, []);

    const onDismissResume = useCallback(() => {
        setResumeDismissed(true);
        setResumeData(null);
    }, []);

    const onDismissPriority = useCallback(() => {
        setPriorityDismissed(true);
        setSmartPriority(null);
    }, []);

    // Smart Priority Controls
    const onSnoozeNote = useCallback(async (noteId: string, duration: SnoozeDuration) => {
        try {
            const response = await AxiosInstance.put(`/snooze/${noteId}`, { duration });
            if (!response.data.error) {
                toast.success(`Note snoozed`);
                fetchSmartPriority();
            } else {
                toast.error(response.data.message || "Failed to snooze note");
            }
        } catch (error) {
            toast.error("Failed to snooze note");
        }
    }, [fetchSmartPriority]);

    const onDismissNoteFromFocus = useCallback(async (noteId: string) => {
        try {
            const response = await AxiosInstance.put(`/dismiss-focus/${noteId}`);
            if (!response.data.error) {
                toast.success("Note dismissed from suggestions");
                fetchSmartPriority();
            } else {
                toast.error(response.data.message || "Failed to dismiss note");
            }
        } catch (error) {
            toast.error("Failed to dismiss note");
        }
    }, [fetchSmartPriority]);

    const onToggleFocusPin = useCallback(async (noteId: string) => {
        try {
            const response = await AxiosInstance.put(`/toggle-focus-pin/${noteId}`);
            if (!response.data.error) {
                toast.success(response.data.message);
                fetchSmartPriority();
            } else {
                toast.error(response.data.message || "Failed to update focus pin");
            }
        } catch (error) {
            toast.error("Failed to update focus pin");
        }
    }, [fetchSmartPriority]);

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

    useEffect(() => {
        fetchDailyFocus();
    }, [fetchDailyFocus]);

    useEffect(() => {
        fetchResumeSuggestions();
    }, [fetchResumeSuggestions]);

    useEffect(() => {
        fetchSmartPriority();
    }, [fetchSmartPriority]);

    return (
        <Dashboard
            notes={notes}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            allTags={allTags}
            activeView={activeView}
            viewCounts={viewCounts}
            dailyFocus={dailyFocus}
            focusLoading={focusLoading}
            focusDismissed={focusDismissed}
            resumeData={resumeData}
            resumeLoading={resumeLoading}
            resumeDismissed={resumeDismissed}
            onSearch={onSearchNote}
            onSelectTag={onSelectTag}
            onSelectView={onSelectView}
            onCreateNote={onCreateNote}
            onEditNote={onEditNote}
            onDeleteNote={onDeleteNote}
            onPinNote={onPinNote}
            onArchiveNote={onArchiveNote}
            onToggleChecklistItem={onToggleChecklistItem}
            onDismissFocus={onDismissFocus}
            onDismissResume={onDismissResume}
            onTrackNoteView={trackNoteView}
            onTrackNoteEdit={trackNoteEdit}
            smartPriority={smartPriority}
            priorityLoading={priorityLoading}
            priorityDismissed={priorityDismissed}
            onDismissPriority={onDismissPriority}
            onSnoozeNote={onSnoozeNote}
            onDismissNoteFromFocus={onDismissNoteFromFocus}
            onToggleFocusPin={onToggleFocusPin}
        />
    );
}

export default DashboardContainer