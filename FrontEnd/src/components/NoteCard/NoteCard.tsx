import { Pin, Trash2, Edit2, Archive, Calendar, Clock, Check, Flag } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Note, NOTE_COLORS, PRIORITY_CONFIG } from "@/types/note"
import MarkdownRenderer from "@/components/MarkdownRenderer"

interface NoteCardProps {
    note: Note
    onEdit: () => void
    onDelete: () => void
    onPin: () => void
    onArchive: () => void
    onToggleChecklistItem: (itemId: string) => void
}

function NoteCard({ note, onEdit, onDelete, onPin, onArchive, onToggleChecklistItem }: NoteCardProps) {
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
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    return (
        <Card
            className={`group relative w-full overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${colors.card} ${colors.border}`}
            onClick={onEdit}
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
                        <p className={`text-xs mt-1 ${colors.muted}`}>
                            {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
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

                {/* Checklist preview */}
                {totalItems > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {note.checklist.slice(0, 3).map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2 text-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => onToggleChecklistItem(item.id)}
                                    className={`shrink-0 w-4 h-4 rounded-sm border-2 transition-all flex items-center justify-center ${
                                        item.isCompleted
                                            ? colors.checkboxChecked
                                            : colors.checkbox
                                    }`}
                                >
                                    {item.isCompleted && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                </button>
                                <span className={`truncate text-sm ${colors.text} ${item.isCompleted ? 'line-through opacity-50' : ''}`}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                        {totalItems > 3 && (
                            <p className={`text-xs pl-6 ${colors.muted}`}>+{totalItems - 3} more</p>
                        )}
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mt-2 pt-1">
                            <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colors.accent} transition-all duration-300`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className={`text-xs font-medium ${colors.muted}`}>
                                {completedItems}/{totalItems}
                            </span>
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
