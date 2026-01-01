import { useState, useEffect, useCallback } from "react"
import {
  Link2,
  ChevronRight,
  Tag,
  ListTodo,
  Flag,
  FileText,
  Lightbulb,
  CheckSquare,
  BookOpen,
} from "lucide-react"
import { Note, RelatedNotesData, RelatedNoteItem, NOTE_COLORS, NoteType } from "@/types/note"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import AxiosInstance from "@/utils/AxiosInstance"

interface RelatedNotesProps {
  noteId: string | null
  onViewNote: (note: Note) => void
}

const NoteTypeIcon = ({ type, className }: { type: NoteType; className?: string }) => {
  const icons: Record<NoteType, React.ReactNode> = {
    note: <FileText className={className} />,
    idea: <Lightbulb className={className} />,
    task: <CheckSquare className={className} />,
    reference: <BookOpen className={className} />,
  }
  return icons[type] || <FileText className={className} />
}

// Compact related note item - designed to be subtle
function RelatedNoteChip({
  item,
  onClick,
}: {
  item: RelatedNoteItem
  onClick: () => void
}) {
  const colors = NOTE_COLORS[item.note.color] || NOTE_COLORS.default
  const reason = item.primaryReason

  // Determine the relevance indicator style
  const getReasonStyle = () => {
    if (!reason) return { icon: null, label: "", color: "text-muted-foreground" }

    switch (reason.type) {
      case "sharedTags":
        return {
          icon: <Tag className="h-3 w-3" />,
          label: reason.label,
          color: "text-blue-600 dark:text-blue-400"
        }
      case "sameType":
        return {
          icon: <NoteTypeIcon type={reason.noteType || "note"} className="h-3 w-3" />,
          label: reason.label,
          color: "text-violet-600 dark:text-violet-400"
        }
      case "unfinishedTasks":
        return {
          icon: <ListTodo className="h-3 w-3" />,
          label: reason.label,
          color: "text-amber-600 dark:text-amber-400"
        }
      case "highPriority":
        return {
          icon: <Flag className="h-3 w-3" />,
          label: reason.label,
          color: "text-red-600 dark:text-red-400"
        }
      case "similarTitle":
        return {
          icon: <Link2 className="h-3 w-3" />,
          label: reason.label,
          color: "text-muted-foreground"
        }
      default:
        return { icon: null, label: "", color: "text-muted-foreground" }
    }
  }

  const reasonStyle = getReasonStyle()

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all duration-200",
        "bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/50",
        "active:scale-[0.99]"
      )}
    >
      {/* Color dot */}
      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.accent)} />

      {/* Title */}
      <span className="text-sm font-medium text-foreground truncate flex-1 text-left">
        {item.note.title}
      </span>

      {/* Relevance reason - subtle */}
      {reason && (
        <span className={cn(
          "inline-flex items-center gap-1 text-[10px] font-medium shrink-0",
          reasonStyle.color
        )}>
          {reasonStyle.icon}
          <span className="hidden sm:inline">{reasonStyle.label}</span>
        </span>
      )}

      {/* Arrow */}
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  )
}

function RelatedNotes({ noteId, onViewNote }: RelatedNotesProps) {
  const [relatedData, setRelatedData] = useState<RelatedNotesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchRelated = useCallback(async () => {
    if (!noteId) {
      setRelatedData(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await AxiosInstance.get(`/related-notes/${noteId}`)
      if (!response.data.error) {
        setRelatedData(response.data.related)
      }
    } catch (error) {
      console.log(error)
      setRelatedData(null)
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    fetchRelated()
  }, [fetchRelated])

  // Don't render if no related notes or still loading
  if (isLoading || !relatedData || relatedData.notes.length === 0) {
    return null
  }

  const { notes, withTasks } = relatedData
  const hasTasksToShow = withTasks.length > 0

  // Show first 2 items in collapsed state, rest on expand
  const previewItems = notes.slice(0, 2)
  const remainingItems = notes.slice(2)
  const hasMore = remainingItems.length > 0

  return (
    <div className="border-t pt-6 mt-6">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Related
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              ({notes.length})
            </span>
          </div>

          {hasMore && (
            <CollapsibleTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {isExpanded ? "Show less" : `+${remainingItems.length} more`}
              </button>
            </CollapsibleTrigger>
          )}
        </div>

        {/* Preview items - always visible */}
        <div className="space-y-1.5">
          {previewItems.map((item) => (
            <RelatedNoteChip
              key={item.note._id}
              item={item}
              onClick={() => onViewNote(item.note)}
            />
          ))}
        </div>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="space-y-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {remainingItems.map((item) => (
              <RelatedNoteChip
                key={item.note._id}
                item={item}
                onClick={() => onViewNote(item.note)}
              />
            ))}
          </div>

          {/* Related tasks callout - if any related notes have tasks */}
          {hasTasksToShow && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Related tasks to complete
                </span>
              </div>
              <div className="space-y-1">
                {withTasks.slice(0, 2).map((item) => {
                  const taskReason = item.reasons.find(r => r.type === "unfinishedTasks")
                  return (
                    <button
                      key={item.note._id}
                      onClick={() => onViewNote(item.note)}
                      className="flex items-center gap-2 w-full text-left text-xs text-amber-800 dark:text-amber-200 hover:underline"
                    >
                      <span className="truncate">{item.note.title}</span>
                      {taskReason && (
                        <span className="text-amber-600/70 dark:text-amber-400/70 shrink-0">
                          ({taskReason.label})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default RelatedNotes
