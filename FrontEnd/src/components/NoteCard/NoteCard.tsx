import { Pin, Trash2, Edit2, Archive, Calendar, Clock, Check, Flag, ListTodo, FileText, Lightbulb, CheckSquare, BookOpen } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Note, NOTE_COLORS, PRIORITY_CONFIG, NoteType } from "@/types/note"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { cn } from "@/lib/utils"

// Subtle note type indicator
const NoteTypeIndicator = ({ type }: { type: NoteType }) => {
    const config: Record<NoteType, { icon: React.ReactNode; label: string; color: string }> = {
        note: { icon: <FileText className="h-3 w-3" />, label: "Note", color: "text-slate-400" },
        idea: { icon: <Lightbulb className="h-3 w-3" />, label: "Idea", color: "text-amber-500" },
        task: { icon: <CheckSquare className="h-3 w-3" />, label: "Task", color: "text-emerald-500" },
        reference: { icon: <BookOpen className="h-3 w-3" />, label: "Reference", color: "text-blue-500" },
    }

    const { icon, label, color } = config[type] || config.note

    // Don't show indicator for regular notes (most common type)
    if (type === "note") return null

    return (
        <span className={cn("inline-flex items-center gap-1 text-xs", color)}>
            {icon}
            <span className="font-medium">{label}</span>
        </span>
    )
}

interface NoteCardProps {
    note: Note
    onView: () => void
    onEdit: () => void
    onDelete: () => void
    onPin: () => void
    onArchive: () => void
    onToggleChecklistItem: (itemId: string) => void
}

function NoteCard({ note, onView, onEdit, onDelete, onPin, onArchive, onToggleChecklistItem }: NoteCardProps) {
    const colors = NOTE_COLORS[note.color] || NOTE_COLORS.default
    const priority = PRIORITY_CONFIG[note.priority]

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const isOverdue = note.dueDate && new Date(note.dueDate) < new Date()
    const completedItems = note.checklist.filter(item => item.isCompleted).length
    const totalItems = note.checklist.length
    const incompleteItems = totalItems - completedItems
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    const hasChecklist = totalItems > 0

    return (
        <Card
            className={`group relative w-full overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${colors.card} ${colors.border}`}
            onClick={onView}
        >
            {/* Color accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent}`} />

            {/* Priority indicator */}
            {note.priority !== "none" && (
                <div className={`absolute top-1 right-0 w-1 h-8 rounded-l ${priority.bgColor}`} />
            )}

            <CardHeader className="p-4 pb-2 pt-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-base leading-snug line-clamp-2 ${colors.text}`}>
                            {note.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`text-xs ${colors.muted}`}>
                                {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                            <NoteTypeIndicator type={note.noteType || "note"} />
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPin(); }}
                        className={`p-1.5 rounded-full transition-all ${
                            note.isPinned
                                ? 'text-amber-500 bg-amber-500/15 rotate-45'
                                : `${colors.muted} opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10`
                        }`}
                    >
                        <Pin className="h-4 w-4" />
                    </button>
                </div>
            </CardHeader>

            <CardContent className="px-4 py-2">
                {/* Content with Markdown */}
                {note.content && (
                    <div className={`text-sm line-clamp-4 ${colors.text} opacity-80`}>
                        <MarkdownRenderer content={note.content} compact />
                    </div>
                )}

                {/* Checklist section - Enhanced visual design */}
                {hasChecklist && (
                    <div className="mt-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 overflow-hidden">
                        {/* Checklist header */}
                        <div className={cn(
                            "flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/5",
                            incompleteItems > 0 ? "bg-amber-500/5" : "bg-emerald-500/5"
                        )}>
                            <div className="flex items-center gap-2">
                                <ListTodo className={cn(
                                    "h-3.5 w-3.5",
                                    incompleteItems > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                                )} />
                                <span className={cn(
                                    "text-xs font-medium",
                                    incompleteItems > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"
                                )}>
                                    {incompleteItems > 0 ? `${incompleteItems} task${incompleteItems > 1 ? 's' : ''} remaining` : 'All done!'}
                                </span>
                            </div>
                            <span className={cn(
                                "text-xs font-semibold tabular-nums",
                                colors.muted
                            )}>
                                {completedItems}/{totalItems}
                            </span>
                        </div>

                        {/* Task items */}
                        <div className="px-2 py-1.5 space-y-0.5">
                            {note.checklist.slice(0, 4).map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "flex items-center gap-2.5 py-1.5 px-1.5 rounded-md transition-colors",
                                        "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => onToggleChecklistItem(item.id)}
                                        className={cn(
                                            "shrink-0 w-[18px] h-[18px] rounded-[5px] border-2 transition-all duration-200 flex items-center justify-center",
                                            "hover:scale-110 active:scale-95",
                                            item.isCompleted
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500"
                                        )}
                                    >
                                        {item.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                                    </button>
                                    <span className={cn(
                                        "flex-1 text-sm truncate transition-all duration-200",
                                        colors.text,
                                        item.isCompleted && "line-through text-muted-foreground"
                                    )}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                            {totalItems > 4 && (
                                <p className={cn("text-xs py-1 pl-8", colors.muted)}>
                                    +{totalItems - 4} more task{totalItems - 4 > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="px-3 pb-2.5 pt-1">
                            <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
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
                )}

                {/* Metadata badges */}
                {(note.dueDate || note.reminder || note.priority !== "none") && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {note.priority !== "none" && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priority.color} bg-current/10`}>
                                <Flag className="h-3 w-3" />
                                {priority.label}
                            </span>
                        )}
                        {note.dueDate && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                isOverdue
                                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium'
                                    : `bg-black/5 dark:bg-white/10 ${colors.muted}`
                            }`}>
                                <Calendar className="h-3 w-3" />
                                {formatDate(note.dueDate)}
                            </span>
                        )}
                        {note.reminder && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 ${colors.muted}`}>
                                <Clock className="h-3 w-3" />
                                {formatDate(note.reminder)}
                            </span>
                        )}
                    </div>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.slice(0, 4).map(tag => (
                            <span
                                key={tag}
                                className={`text-xs px-2 py-0.5 rounded-full ${colors.tag}`}
                            >
                                #{tag}
                            </span>
                        ))}
                        {note.tags.length > 4 && (
                            <span className={`text-xs ${colors.muted}`}>+{note.tags.length - 4}</span>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-2 pt-0">
                {/* Actions - visible on hover */}
                <div className={`flex items-center justify-end gap-0.5 w-full opacity-0 group-hover:opacity-100 transition-opacity border-t ${colors.border} pt-2 mt-1`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className={`p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${colors.muted}`}
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onArchive(); }}
                        className={`p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${colors.muted}`}
                        title={note.isArchived ? "Unarchive" : "Archive"}
                    >
                        <Archive className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default NoteCard
