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

/**
 * Note Viewer - Optimized Reading Experience
 *
 * Design Philosophy:
 * - Content-first: Title and body dominate the view
 * - Progressive metadata: Essential info shown, details at bottom
 * - Minimal chrome: Clean header, focus on reading
 * - Quick actions: Edit prominently accessible
 */
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
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
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
  const hasMetadata = note?.dueDate || note?.reminder || (note?.priority !== "none")
  const hasTags = (note?.tags.length || 0) > 0

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
      <DialogContent className="p-0 max-w-3xl max-h-[90vh] overflow-hidden flex flex-col gap-0">
        {/* Minimal color accent */}
        <div className={cn(
          "h-1 shrink-0 transition-colors",
          note.color === "default" ? "bg-border" : colors.accent
        )} />

        {/* Streamlined Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation - compact */}
            {onNavigate && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("prev")}
                  disabled={!canNavigatePrev}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("next")}
                  disabled={!canNavigateNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Primary action: Edit */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5 px-3"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>

            {/* Secondary actions - grouped */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPin}
                className={cn(
                  "h-8 w-8 p-0",
                  note.isPinned && "text-amber-500"
                )}
              >
                <Pin className={cn("h-4 w-4", note.isPinned && "rotate-45 fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onArchive}
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content area - clean, reading-focused */}
        <div className={cn("flex-1 overflow-y-auto", note.color !== "default" && colors.card)}>
          <div className="max-w-2xl mx-auto px-6 py-8 sm:px-8">
            {/* Compact header info - only show if note type is not default */}
            {note.noteType !== "note" && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
                    note.noteType === "idea" && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                    note.noteType === "task" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                    note.noteType === "reference" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  )}
                >
                  <NoteTypeIcon type={note.noteType} className="h-3 w-3" />
                  {NoteTypeLabel[note.noteType]}
                </span>
              </div>
            )}

            {/* Title - prominent */}
            <h1 className={cn(
              "text-2xl sm:text-3xl font-bold leading-tight tracking-tight",
              note.color === "default" ? "text-foreground" : colors.text
            )}>
              {note.title}
            </h1>

            {/* Subtle timestamp */}
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              {formatDate(note.updatedAt)}
            </p>

            {/* Priority/Due date badges - only if urgent */}
            {(isOverdue || note.priority === "high") && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {note.priority === "high" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    <Flag className="h-3 w-3" />
                    High Priority
                  </span>
                )}
                {isOverdue && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    <Calendar className="h-3 w-3" />
                    Overdue
                  </span>
                )}
              </div>
            )}

            {/* Content - main reading area */}
            {note.content && (
              <div className="mb-8">
                <MarkdownRenderer content={note.content} mode="reading" />
              </div>
            )}

            {/* Checklist section - interactive */}
            {hasChecklist && (
              <div className="mb-8">
                <div className="border rounded-xl overflow-hidden bg-background/50">
                  {/* Checklist header - compact */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5",
                      progress === 100
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <ListTodo
                        className={cn(
                          "h-4 w-4",
                          progress === 100
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm font-medium">
                        {progress === 100 ? "Complete" : "Tasks"}
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium tabular-nums px-2 py-0.5 rounded-full",
                      progress === 100
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {completedItems}/{totalItems}
                    </span>
                  </div>

                  {/* Task items */}
                  <div className="divide-y">
                    {note.checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer",
                          "hover:bg-muted/30",
                          item.isCompleted && "bg-muted/20"
                        )}
                        onClick={() => onToggleChecklistItem(item.id)}
                      >
                        <button
                          className={cn(
                            "shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                            "hover:scale-105",
                            item.isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600"
                          )}
                        >
                          {item.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-sm transition-all",
                            item.isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar - subtle */}
                  {progress > 0 && progress < 100 && (
                    <div className="px-4 py-2 bg-muted/10">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer section - metadata that's nice to have but not essential */}
            {(hasTags || hasMetadata) && (
              <div className="pt-6 mt-6 border-t space-y-4">
                {/* Non-urgent metadata */}
                {hasMetadata && !isOverdue && note.priority !== "high" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {note.priority !== "none" && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full",
                          "bg-muted text-muted-foreground"
                        )}
                      >
                        <Flag className="h-3 w-3" />
                        {priority.label}
                      </span>
                    )}
                    {note.dueDate && (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due {formatShortDate(note.dueDate)}
                      </span>
                    )}
                    {note.reminder && (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Reminder {formatShortDate(note.reminder)}
                      </span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {hasTags && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full",
                          note.color === "default"
                            ? "bg-muted text-muted-foreground"
                            : colors.tag
                        )}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Keyboard hints - very subtle */}
            <div className="mt-8 pt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/60">
              <span>E to edit</span>
              {onNavigate && <span>Arrows to navigate</span>}
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NoteViewer
