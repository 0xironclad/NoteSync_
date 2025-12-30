import { Pin, Trash2, Edit2, Archive, Calendar, Clock, CheckSquare, Flag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Note, NOTE_COLORS, PRIORITY_CONFIG } from "@/types/note"

interface NoteCardProps {
    note: Note
    onEdit: () => void
    onDelete: () => void
    onPin: () => void
    onArchive: () => void
    onToggleChecklistItem: (itemId: string) => void
}

function NoteCard({ note, onEdit, onDelete, onPin, onArchive, onToggleChecklistItem }: NoteCardProps) {
    const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.default
    const priorityConfig = PRIORITY_CONFIG[note.priority]

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const isOverdue = note.dueDate && new Date(note.dueDate) < new Date()
    const completedItems = note.checklist.filter(item => item.isCompleted).length
    const totalItems = note.checklist.length

    return (
        <Card className={`group relative w-full min-w-[280px] max-w-[320px] ${colorConfig.bg} border ${colorConfig.border} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5`}>
            {/* Priority indicator bar */}
            {note.priority !== "none" && (
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                    note.priority === "high" ? "bg-red-500" :
                    note.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                }`} />
            )}

            <CardContent className={`p-4 ${colorConfig.text}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight truncate">{note.title}</h3>
                        <p className="text-xs opacity-60 mt-0.5">
                            {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {note.priority !== "none" && (
                            <span className={`text-xs font-medium ${priorityConfig.color}`}>
                                <Flag className="h-3.5 w-3.5" />
                            </span>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onPin(); }}
                            className={`p-1 rounded transition-colors ${
                                note.isPinned
                                    ? 'text-amber-400 bg-amber-400/10'
                                    : 'opacity-40 hover:opacity-100 hover:bg-white/5'
                            }`}
                        >
                            <Pin className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {note.content && (
                    <p className="text-sm opacity-80 line-clamp-3 mb-3 whitespace-pre-wrap">
                        {note.content}
                    </p>
                )}

                {/* Checklist preview */}
                {totalItems > 0 && (
                    <div className="mb-3 space-y-1.5">
                        {note.checklist.slice(0, 3).map((item) => (
                            <label
                                key={item.id}
                                className="flex items-center gap-2 text-sm cursor-pointer group/item"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => onToggleChecklistItem(item.id)}
                                    className={`shrink-0 w-4 h-4 rounded border transition-colors ${
                                        item.isCompleted
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'border-current opacity-40 hover:opacity-70'
                                    } flex items-center justify-center`}
                                >
                                    {item.isCompleted && <CheckSquare className="h-3 w-3" />}
                                </button>
                                <span className={`truncate ${item.isCompleted ? 'line-through opacity-50' : 'opacity-80'}`}>
                                    {item.text}
                                </span>
                            </label>
                        ))}
                        {totalItems > 3 && (
                            <p className="text-xs opacity-50 pl-6">+{totalItems - 3} more items</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${(completedItems / totalItems) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs opacity-60">{completedItems}/{totalItems}</span>
                        </div>
                    </div>
                )}

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {note.dueDate && (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            isOverdue
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-white/10 opacity-70'
                        }`}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(note.dueDate)}
                        </span>
                    )}
                    {note.reminder && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 opacity-70">
                            <Clock className="h-3 w-3" />
                            {formatDate(note.reminder)}
                        </span>
                    )}
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {note.tags.slice(0, 4).map(tag => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-white/10 opacity-70"
                            >
                                #{tag}
                            </span>
                        ))}
                        {note.tags.length > 4 && (
                            <span className="text-xs opacity-50">+{note.tags.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4 opacity-70" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onArchive(); }}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                        title={note.isArchived ? "Unarchive" : "Archive"}
                    >
                        <Archive className="h-4 w-4 opacity-70" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4 opacity-70" />
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}

export default NoteCard
