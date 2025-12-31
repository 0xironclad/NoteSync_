import { useState, useEffect, useCallback } from "react"
import Navbar from "./Navbar"
import NoteCard from "./NoteCard/NoteCard"
import NoteEditor from "./NoteEditor/NoteEditor"
import NoteViewer from "./NoteViewer/NoteViewer"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Inbox,
  FileText,
  Tag,
  X,
  Clock,
  Pin,
  CheckSquare,
  AlertCircle,
  Calendar,
  Archive,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react"
import { Note, NoteColor, NotePriority, NoteType, ChecklistItem, SmartViewType, SmartViewCounts, SMART_VIEWS } from "@/types/note"
import { cn } from "@/lib/utils"

interface NoteFormData {
  title: string
  noteType: NoteType
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
  searchQuery: string
  selectedTag: string | null
  allTags: TagInfo[]
  activeView: SmartViewType
  viewCounts: SmartViewCounts
  onSearch: (query: string) => void
  onSelectTag: (tag: string | null) => void
  onSelectView: (view: SmartViewType) => void
  onCreateNote: (data: NoteFormData) => Promise<void>
  onEditNote: (noteId: string, data: NoteFormData) => Promise<void>
  onDeleteNote: (noteId: string) => Promise<void>
  onPinNote: (noteId: string, isPinned: boolean) => Promise<void>
  onArchiveNote: (noteId: string, isArchived: boolean) => Promise<void>
  onToggleChecklistItem: (noteId: string, itemId: string) => Promise<void>
}

// Icon mapping for smart views
const ViewIcon = ({ icon, className }: { icon: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Inbox: <Inbox className={className} />,
    Clock: <Clock className={className} />,
    Pin: <Pin className={className} />,
    CheckSquare: <CheckSquare className={className} />,
    TagOff: <Tag className={cn(className, "opacity-50")} />,
    AlertCircle: <AlertCircle className={className} />,
    Calendar: <Calendar className={className} />,
    Archive: <Archive className={className} />,
  }
  return icons[icon] || <FileText className={className} />
}

function Dashboard({
  notes,
  searchQuery,
  selectedTag,
  allTags,
  activeView,
  viewCounts,
  onSearch,
  onSelectTag,
  onSelectView,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onPinNote,
  onArchiveNote,
  onToggleChecklistItem,
}: DashboardProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Progressive disclosure: collapse advanced sections by default
  const [showOrganize, setShowOrganize] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [showTags, setShowTags] = useState(false)

  // Auto-expand sections that have relevant content
  const hasOrganizeContent = viewCounts.withTasks > 0 || viewCounts.untagged > 0
  const hasTagsContent = allTags.length > 0

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Keep viewing note in sync with notes array (for updates like checklist toggles)
  useEffect(() => {
    if (viewingNote) {
      const updatedNote = notes.find((n) => n._id === viewingNote._id)
      if (updatedNote) {
        setViewingNote(updatedNote)
      }
    }
  }, [notes, viewingNote?._id])

  const handleOpenCreate = () => {
    setEditingNote(null)
    setEditorOpen(true)
  }

  // Open note in reading mode (viewer)
  const handleOpenView = (note: Note) => {
    setViewingNote(note)
    setViewerOpen(true)
  }

  // Open note in edit mode (editor)
  const handleOpenEdit = (note: Note) => {
    setViewerOpen(false)
    setViewingNote(null)
    setEditingNote(note)
    setEditorOpen(true)
  }

  // Transition from viewer to editor
  const handleEditFromViewer = () => {
    if (viewingNote) {
      setViewerOpen(false)
      setEditingNote(viewingNote)
      setEditorOpen(true)
    }
  }

  const handleSaveNote = async (data: NoteFormData) => {
    if (editingNote) {
      await onEditNote(editingNote._id, data)
    } else {
      await onCreateNote(data)
    }
  }

  // Navigation between notes in viewer
  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (!viewingNote) return

      const currentIndex = notes.findIndex((n) => n._id === viewingNote._id)
      if (currentIndex === -1) return

      const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1
      if (newIndex >= 0 && newIndex < notes.length) {
        setViewingNote(notes[newIndex])
      }
    },
    [viewingNote, notes]
  )

  // Calculate navigation state
  const viewingNoteIndex = viewingNote
    ? notes.findIndex((n) => n._id === viewingNote._id)
    : -1
  const canNavigatePrev = viewingNoteIndex > 0
  const canNavigateNext = viewingNoteIndex < notes.length - 1 && viewingNoteIndex !== -1

  const pinnedNotes = notes.filter(note => note.isPinned)
  const unpinnedNotes = notes.filter(note => !note.isPinned)

  // Get current view config
  const currentView = SMART_VIEWS.find(v => v.id === activeView) || SMART_VIEWS[0]

  // Get view title
  const getViewTitle = () => {
    if (selectedTag) return `#${selectedTag}`
    return currentView.label
  }

  // Get view icon
  const getViewIcon = () => {
    if (selectedTag) return <Tag className="h-6 w-6 text-muted-foreground" />
    return <ViewIcon icon={currentView.icon} className="h-6 w-6 text-muted-foreground" />
  }

  // Group views by section
  const mainViews = SMART_VIEWS.filter(v => v.section === "main")
  const organizeViews = SMART_VIEWS.filter(v => v.section === "organize")
  const statusViews = SMART_VIEWS.filter(v => v.section === "status")

  return (
    <div className="relative w-full min-h-screen bg-background">
      <Navbar onSearch={onSearch} searchQuery={searchQuery} />

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          size="lg"
          onClick={handleOpenCreate}
          className="shadow-lg gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          New Note
        </Button>
      </div>

      {/* Note Viewer Dialog (Reading Mode) */}
      <NoteViewer
        note={viewingNote}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onEdit={handleEditFromViewer}
        onPin={() => viewingNote && onPinNote(viewingNote._id, viewingNote.isPinned)}
        onArchive={() => viewingNote && onArchiveNote(viewingNote._id, viewingNote.isArchived)}
        onDelete={() => {
          if (viewingNote) {
            onDeleteNote(viewingNote._id)
            setViewerOpen(false)
          }
        }}
        onToggleChecklistItem={(itemId) =>
          viewingNote && onToggleChecklistItem(viewingNote._id, itemId)
        }
        onNavigate={handleNavigate}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
      />

      {/* Note Editor Dialog (Editing Mode) */}
      <NoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        onSave={handleSaveNote}
      />

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position, overlays content */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-64px)] w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "transform transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col py-4 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="px-4 pb-4 border-b mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Views</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-3 space-y-1">
            {/* Main Views - Always visible, essential navigation */}
            <div className="space-y-0.5">
              {mainViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    onSelectView(view.id)
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    activeView === view.id && !selectedTag
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ViewIcon icon={view.icon} className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{view.label}</span>
                  {viewCounts[view.id] > 0 && (
                    <span className={cn(
                      "text-xs tabular-nums px-1.5 py-0.5 rounded-md",
                      activeView === view.id && !selectedTag
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {viewCounts[view.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Organize Section - Collapsible, shown when relevant */}
            <div className="pt-2">
              <button
                onClick={() => setShowOrganize(!showOrganize)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  hasOrganizeContent && !showOrganize && "text-foreground"
                )}
              >
                <ChevronRight className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  showOrganize && "rotate-90"
                )} />
                <span className="flex-1 text-left">Organize</span>
                {hasOrganizeContent && !showOrganize && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
              {showOrganize && (
                <div className="space-y-0.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {organizeViews.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => {
                        onSelectView(view.id)
                        if (window.innerWidth < 768) setSidebarOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2",
                        activeView === view.id && !selectedTag
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <ViewIcon icon={view.icon} className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{view.label}</span>
                      {viewCounts[view.id] > 0 && (
                        <span className={cn(
                          "text-xs tabular-nums px-1.5 py-0.5 rounded-md",
                          activeView === view.id && !selectedTag
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {viewCounts[view.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Section - Collapsible, highlights when attention needed */}
            <div>
              <button
                onClick={() => setShowStatus(!showStatus)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  (viewCounts.highPriority > 0 || viewCounts.dueSoon > 0) && !showStatus && "text-amber-600 dark:text-amber-400"
                )}
              >
                <ChevronRight className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  showStatus && "rotate-90"
                )} />
                <span className="flex-1 text-left">Status</span>
                {(viewCounts.highPriority > 0 || viewCounts.dueSoon > 0) && !showStatus && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    viewCounts.highPriority > 0 ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  )}>
                    {viewCounts.highPriority + viewCounts.dueSoon}
                  </span>
                )}
              </button>
              {showStatus && (
                <div className="space-y-0.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {statusViews.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => {
                        onSelectView(view.id)
                        if (window.innerWidth < 768) setSidebarOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2",
                        activeView === view.id && !selectedTag
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        view.id === "highPriority" && viewCounts.highPriority > 0 && activeView !== view.id && "text-red-500",
                        view.id === "dueSoon" && viewCounts.dueSoon > 0 && activeView !== view.id && "text-amber-500"
                      )}
                    >
                      <ViewIcon icon={view.icon} className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{view.label}</span>
                      {viewCounts[view.id] > 0 && (
                        <span className={cn(
                          "text-xs tabular-nums px-1.5 py-0.5 rounded-md",
                          activeView === view.id && !selectedTag
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : view.id === "highPriority" ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                            : view.id === "dueSoon" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {viewCounts[view.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Section - Collapsible, only shown when tags exist */}
            {hasTagsContent && (
              <div>
                <button
                  onClick={() => setShowTags(!showTags)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    showTags && "rotate-90"
                  )} />
                  <span className="flex-1 text-left">Tags</span>
                  {!showTags && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {allTags.length}
                    </span>
                  )}
                </button>
                {showTags && (
                  <div className="space-y-0.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {allTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          onSelectTag(tag.name)
                          if (window.innerWidth < 768) setSidebarOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2",
                          selectedTag === tag.name
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Tag className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 text-left truncate text-sm">#{tag.name}</span>
                        <span className={cn(
                          "text-xs tabular-nums",
                          selectedTag === tag.name ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {tag.count}
                        </span>
                      </button>
                    ))}
                    {allTags.length > 8 && (
                      <p className="text-xs text-muted-foreground px-3 py-1 ml-2">
                        +{allTags.length - 8} more tags
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - Uses container to match navbar alignment */}
      <main className="min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="container mx-auto px-4 pt-6 pb-24">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9 p-0 shrink-0 transition-colors"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
            {getViewIcon()}
            <h1 className="text-2xl font-semibold">{getViewTitle()}</h1>
            {notes.length > 0 && (
              <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
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

          {/* View description */}
          {!selectedTag && (
            <p className="text-sm text-muted-foreground mb-8 ml-12">
              {currentView.description}
            </p>
          )}
          {selectedTag && <div className="mb-6" />}

          {/* Empty state */}
          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                <ViewIcon icon={currentView.icon} className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery
                  ? "No notes found"
                  : `No ${currentView.label.toLowerCase()}`}
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchQuery
                  ? `No notes match "${searchQuery}". Try a different search term.`
                  : activeView === "archived"
                  ? "Notes you archive will appear here."
                  : activeView === "all"
                  ? "Create your first note to get started!"
                  : `No notes match this filter.`}
              </p>
              {activeView === "all" && !searchQuery && (
                <Button onClick={handleOpenCreate} className="gap-2">
                  <Plus className="h-4 w-4" /> Create Note
                </Button>
              )}
            </div>
          )}

          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && activeView !== "pinned" && (
            <div className="mb-10">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Pin className="h-3.5 w-3.5" />
                Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onView={() => handleOpenView(note)}
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

          {/* Notes Grid - show all notes for pinned view, unpinned for others */}
          {(activeView === "pinned" ? notes.length > 0 : unpinnedNotes.length > 0) && (
            <div>
              {pinnedNotes.length > 0 && activeView !== "pinned" && (
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Others
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(activeView === "pinned" ? notes : unpinnedNotes).map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onView={() => handleOpenView(note)}
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
      </main>
    </div>
  )
}

export default Dashboard
