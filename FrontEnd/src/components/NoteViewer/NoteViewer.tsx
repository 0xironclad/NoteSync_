import { useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import {
  X,
  Edit2,
  Pin,
  Archive,
  Trash2,
  Calendar,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  ListTodo,
  FileText,
  Lightbulb,
  CheckSquare,
  BookOpen,
} from "lucide-react"
import { Note, NOTE_COLORS, PRIORITY_CONFIG, NoteType } from "@/types/note"
import { cn } from "@/lib/utils"

interface NoteViewerProps {
  note: Note | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onPin: () => void
  onArchive: () => void
  onDelete: () => void
  onToggleChecklistItem: (itemId: string) => void
  onNavigate?: (direction: "prev" | "next") => void
  canNavigatePrev?: boolean
  canNavigateNext?: boolean
}

const NoteTypeIcon = ({ type, className }: { type: NoteType; className?: string }) => {
  const icons: Record<NoteType, React.ReactNode> = {
    note: <FileText className={className} />,
    idea: <Lightbulb className={className} />,
    task: <CheckSquare className={className} />,
    reference: <BookOpen className={className} />,
  }
  return icons[type]
}

const NoteTypeLabel: Record<NoteType, string> = {
  note: "Note",
  idea: "Idea",
  task: "Task",
  reference: "Reference",
}

function NoteViewer({
  note,
  open,
  onOpenChange,
  onEdit,
  onPin,
  onArchive,
  onDelete,
  onToggleChecklistItem,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
}: NoteViewerProps) {
  const colors = note ? NOTE_COLORS[note.color] || NOTE_COLORS.default : NOTE_COLORS.default
  const priority = note ? PRIORITY_CONFIG[note.priority] : PRIORITY_CONFIG.none

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const isOverdue = note?.dueDate && new Date(note.dueDate) < new Date()
  const completedItems = note?.checklist.filter((item) => item.isCompleted).length || 0
  const totalItems = note?.checklist.length || 0
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
  const hasChecklist = totalItems > 0

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || !note) return

      switch (e.key) {
        case "Escape":
          onOpenChange(false)
          break
        case "e":
        case "E":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            onEdit()
          }
          break
        case "ArrowLeft":
          if (onNavigate && canNavigatePrev) {
            e.preventDefault()
            onNavigate("prev")
          }
          break
        case "ArrowRight":
          if (onNavigate && canNavigateNext) {
            e.preventDefault()
            onNavigate("next")
          }
          break
      }
    },
    [open, note, onOpenChange, onEdit, onNavigate, canNavigatePrev, canNavigateNext]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!note) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Color accent bar */}
        <div className={cn("h-1.5 shrink-0", colors.accent)} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation arrows */}
            {onNavigate && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("prev")}
                  disabled={!canNavigatePrev}
                  className="h-8 w-8 p-0"
                  title="Previous note (←)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("next")}
                  disabled={!canNavigateNext}
                  className="h-8 w-8 p-0"
                  title="Next note (→)"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5 px-3"
              title="Edit note (E)"
            >
              <Edit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPin}
              className={cn(
                "h-8 w-8 p-0",
                note.isPinned && "text-amber-500 bg-amber-500/10"
              )}
              title={note.isPinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn("h-4 w-4", note.isPinned && "rotate-45")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onArchive}
              className="h-8 w-8 p-0"
              title={note.isArchived ? "Unarchive" : "Archive"}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content area - scrollable */}
        <div className={cn("flex-1 overflow-y-auto", colors.card)}>
          <div className="max-w-2xl mx-auto px-6 py-8">
            {/* Note type and date header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full",
                    note.noteType === "idea" && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                    note.noteType === "task" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                    note.noteType === "reference" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                    note.noteType === "note" && "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <NoteTypeIcon type={note.noteType || "note"} className="h-3.5 w-3.5" />
                  {NoteTypeLabel[note.noteType || "note"]}
                </span>
              </div>
              <span className={cn("text-sm", colors.muted)}>
                Updated {formatDate(note.updatedAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className={cn("text-3xl font-bold leading-tight mb-6", colors.text)}>
              {note.title}
            </h1>

            {/* Metadata badges */}
            {(note.dueDate || note.reminder || note.priority !== "none") && (
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-current/10">
                {note.priority !== "none" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium",
                      priority.color,
                      "bg-current/10"
                    )}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {priority.label} Priority
                  </span>
                )}
                {note.dueDate && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full",
                      isOverdue
                        ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium"
                        : "bg-black/5 dark:bg-white/10 text-muted-foreground"
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Due {formatShortDate(note.dueDate)}
                    {isOverdue && " (Overdue)"}
                  </span>
                )}
                {note.reminder && (
                  <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Reminder {formatShortDate(note.reminder)}
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            {note.content && (
              <div className="mb-8">
                <MarkdownRenderer content={note.content} mode="reading" />
              </div>
            )}

            {/* Checklist section */}
            {hasChecklist && (
              <div className="mb-8">
                <div className="border rounded-xl overflow-hidden bg-background/50">
                  {/* Checklist header */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-4 py-3 border-b",
                      progress === 100
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "bg-amber-50 dark:bg-amber-950/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <ListTodo
                        className={cn(
                          "h-4 w-4",
                          progress === 100
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          progress === 100
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-amber-700 dark:text-amber-300"
                        )}
                      >
                        {progress === 100
                          ? "All tasks completed!"
                          : `${totalItems - completedItems} task${totalItems - completedItems !== 1 ? "s" : ""} remaining`}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                      {completedItems}/{totalItems}
                    </span>
                  </div>

                  {/* Task items */}
                  <div className="divide-y">
                    {note.checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer",
                          "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
                          item.isCompleted && "bg-muted/30"
                        )}
                        onClick={() => onToggleChecklistItem(item.id)}
                      >
                        <button
                          className={cn(
                            "shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                            "hover:scale-110 active:scale-95",
                            item.isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500"
                          )}
                        >
                          {item.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-base transition-all duration-200",
                            item.isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 py-3 bg-muted/20 border-t">
                    <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-out",
                          progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="pt-6 border-t border-current/10">
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn("text-sm px-3 py-1.5 rounded-full", colors.tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer metadata */}
            <div className="mt-8 pt-4 border-t border-current/10 flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {formatDate(note.createdAt)}</span>
              <span className="flex items-center gap-4">
                <span>Press E to edit</span>
                {onNavigate && <span>Use arrows to navigate</span>}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NoteViewer
