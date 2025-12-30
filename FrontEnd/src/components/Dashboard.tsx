import { useState } from "react"
import Navbar from "./Navbar"
import NoteCard from "./NoteCard/NoteCard"
import NoteEditor from "./NoteEditor/NoteEditor"
import { Button } from "@/components/ui/button"
import { Plus, Archive, Inbox, FileText, Tag, X } from "lucide-react"
import { Note, NoteColor, NotePriority, ChecklistItem } from "@/types/note"
import { cn } from "@/lib/utils"

interface NoteFormData {
  title: string
  content: string
  tags: string[]
  color: NoteColor
  priority: NotePriority
  dueDate: string | null
  reminder: string | null
  checklist: ChecklistItem[]
}

interface TagInfo {
  name: string
  count: number
}

interface DashboardProps {
  notes: Note[]
  showArchived: boolean
  searchQuery: string
  selectedTag: string | null
  allTags: TagInfo[]
  onToggleArchived: () => void
  onSearch: (query: string) => void
  onSelectTag: (tag: string | null) => void
  onCreateNote: (data: NoteFormData) => Promise<void>
  onEditNote: (noteId: string, data: NoteFormData) => Promise<void>
  onDeleteNote: (noteId: string) => Promise<void>
  onPinNote: (noteId: string, isPinned: boolean) => Promise<void>
  onArchiveNote: (noteId: string, isArchived: boolean) => Promise<void>
  onToggleChecklistItem: (noteId: string, itemId: string) => Promise<void>
}

function Dashboard({
  notes,
  showArchived,
  searchQuery,
  selectedTag,
  allTags,
  onToggleArchived,
  onSearch,
  onSelectTag,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onPinNote,
  onArchiveNote,
  onToggleChecklistItem,
}: DashboardProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleOpenCreate = () => {
    setEditingNote(null)
    setEditorOpen(true)
  }

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }

  const handleSaveNote = async (data: NoteFormData) => {
    if (editingNote) {
      await onEditNote(editingNote._id, data)
    } else {
      await onCreateNote(data)
    }
  }

  const pinnedNotes = notes.filter(note => note.isPinned)
  const unpinnedNotes = notes.filter(note => !note.isPinned)

  return (
    <div className="relative w-full min-h-screen overflow-y-auto bg-background">
      <Navbar onSearch={onSearch} searchQuery={searchQuery} />

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button size="lg" onClick={handleOpenCreate} className="shadow-lg gap-2">
          <Plus className="h-5 w-5" />
          New Note
        </Button>
      </div>

      {/* Note Editor Dialog */}
      <NoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        onSave={handleSaveNote}
      />

      <div className="container mx-auto px-4 pt-6 pb-24">
        {/* Header with archive toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {showArchived ? (
              <Archive className="h-6 w-6 text-muted-foreground" />
            ) : selectedTag ? (
              <Tag className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Inbox className="h-6 w-6 text-muted-foreground" />
            )}
            <h1 className="text-2xl font-semibold">
              {showArchived
                ? "Archived Notes"
                : selectedTag
                ? `#${selectedTag}`
                : "My Notes"}
            </h1>
            {notes.length > 0 && (
              <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {notes.length}
              </span>
            )}
            {selectedTag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectTag(null)}
                className="h-7 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleArchived}
            className="gap-2"
          >
            {showArchived ? (
              <>
                <Inbox className="h-4 w-4" /> View Active
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" /> View Archived
              </>
            )}
          </Button>
        </div>

        {/* Tags Filter Bar */}
        {allTags.length > 0 && !showArchived && (
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => onSelectTag(null)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  !selectedTag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All Notes
              </button>
              {allTags.slice(0, 12).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => onSelectTag(tag.name)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedTag === tag.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  #{tag.name}
                  <span className="ml-1.5 text-xs opacity-60">{tag.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">
              {searchQuery
                ? "No notes found"
                : showArchived
                ? "No archived notes"
                : "No notes yet"}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              {searchQuery
                ? `No notes match "${searchQuery}". Try a different search term.`
                : showArchived
                ? "Notes you archive will appear here."
                : "Create your first note to get started. Click the button below!"}
            </p>
            {!showArchived && !searchQuery && (
              <Button onClick={handleOpenCreate} className="mt-6 gap-2">
                <Plus className="h-4 w-4" /> Create Note
              </Button>
            )}
          </div>
        )}

        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Pinned
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={() => handleOpenEdit(note)}
                  onDelete={() => onDeleteNote(note._id)}
                  onPin={() => onPinNote(note._id, note.isPinned)}
                  onArchive={() => onArchiveNote(note._id, note.isArchived)}
                  onToggleChecklistItem={(itemId) => onToggleChecklistItem(note._id, itemId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Notes Section */}
        {unpinnedNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Others
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={() => handleOpenEdit(note)}
                  onDelete={() => onDeleteNote(note._id)}
                  onPin={() => onPinNote(note._id, note.isPinned)}
                  onArchive={() => onArchiveNote(note._id, note.isArchived)}
                  onToggleChecklistItem={(itemId) => onToggleChecklistItem(note._id, itemId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
