import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import MarkdownEditor from "@/components/MarkdownEditor"
import TagInput from "@/components/TagInput"
import {
  Plus,
  Calendar,
  Clock,
  Check,
  Trash2,
  ListTodo,
  GripVertical,
  FileText,
  Lightbulb,
  CheckSquare,
  BookOpen,
  Edit2,
  Tag,
  Palette,
  Flag,
} from "lucide-react"
import { Note, NoteColor, NotePriority, NoteType, ChecklistItem, NOTE_COLORS, PRIORITY_CONFIG, NOTE_TYPES } from "@/types/note"
import { cn } from "@/lib/utils"

interface NoteEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: Note | null
  onSave: (data: NoteFormData) => Promise<void>
}

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

// Icon mapping for note types
const NoteTypeIcon = ({ type, className }: { type: NoteType; className?: string }) => {
  const icons: Record<NoteType, React.ReactNode> = {
    note: <FileText className={className} />,
    idea: <Lightbulb className={className} />,
    task: <CheckSquare className={className} />,
    reference: <BookOpen className={className} />,
  }
  return icons[type]
}

const generateId = () => Math.random().toString(36).substring(2, 9)

/**
 * Note Editor with Progressive Disclosure
 *
 * Design Philosophy:
 * - New users see a simple editor: title + content
 * - Advanced features are revealed contextually or on-demand
 * - Power users can quickly access all features via the toolbar
 *
 * Progressive Disclosure Levels:
 * 1. Essential: Title, Content (always visible)
 * 2. Contextual: Tags (appears when typing #), Note type (subtle selector)
 * 3. On-Demand: Tasks, Color, Priority, Dates (via "More options" or toolbar)
 */
function NoteEditor({ open, onOpenChange, note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [noteType, setNoteType] = useState<NoteType>("note")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [color, setColor] = useState<NoteColor>("default")
  const [priority, setPriority] = useState<NotePriority>("none")
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [reminder, setReminder] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [checklistInput, setChecklistInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})

  // Progressive disclosure state
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get current type configuration
  const currentTypeConfig = NOTE_TYPES.find(t => t.id === noteType) || NOTE_TYPES[0]

  // Determine if note has any advanced features set
  const hasAdvancedFeatures = color !== "default" || priority !== "none" || !!dueDate || !!reminder

  useEffect(() => {
    if (open) {
      if (note) {
        // Editing existing note - show features that are already in use
        setTitle(note.title)
        setNoteType(note.noteType || "note")
        setContent(note.content)
        setTags(note.tags)
        setColor(note.color)
        setPriority(note.priority)
        setDueDate(note.dueDate ? new Date(note.dueDate).toISOString().split('T')[0] : null)
        setReminder(note.reminder ? new Date(note.reminder).toISOString().split('T')[0] : null)
        setChecklist(note.checklist)

        // Progressive disclosure: show sections that have content
        setShowTypeSelector(note.noteType !== "note")
        setShowTags(note.tags.length > 0)
        setShowChecklist(note.checklist.length > 0)
        setShowAdvanced(note.color !== "default" || note.priority !== "none" || !!note.dueDate || !!note.reminder)
      } else {
        resetForm()
      }
    }
  }, [open, note])

  // Apply smart defaults when note type changes (only for new notes)
  const handleNoteTypeChange = (newType: NoteType) => {
    setNoteType(newType)

    // Only apply defaults for new notes (not editing)
    if (!note) {
      const typeConfig = NOTE_TYPES.find(t => t.id === newType)
      if (typeConfig) {
        // Apply suggested color if current is default
        if (color === "default" && typeConfig.defaults.suggestColor !== "default") {
          setColor(typeConfig.defaults.suggestColor)
          setShowAdvanced(true)
        }
        // Apply suggested priority if current is none
        if (priority === "none" && typeConfig.defaults.suggestPriority !== "none") {
          setPriority(typeConfig.defaults.suggestPriority)
          setShowAdvanced(true)
        }
        // Expand checklist section for task type
        if (typeConfig.defaults.expandChecklist) {
          setShowChecklist(true)
        }
      }
    }
  }

  const resetForm = () => {
    setTitle("")
    setNoteType("note")
    setContent("")
    setTags([])
    setColor("default")
    setPriority("none")
    setDueDate(null)
    setReminder(null)
    setChecklist([])
    setChecklistInput("")
    setErrors({})
    // Reset progressive disclosure for new notes
    setShowTypeSelector(false)
    setShowTags(false)
    setShowChecklist(false)
    setShowAdvanced(false)
  }

  const handleAddChecklistItem = () => {
    const trimmed = checklistInput.trim()
    if (trimmed) {
      setChecklist([...checklist, { id: generateId(), text: trimmed, isCompleted: false }])
      setChecklistInput("")
    }
  }

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id))
  }

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrors({ title: "Title is required" })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await onSave({
        title: title.trim(),
        noteType,
        content,
        tags,
        color,
        priority,
        dueDate: dueDate || null,
        reminder: reminder || null,
        checklist,
      })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const colorOptions: { value: NoteColor; label: string; preview: string }[] = [
    { value: "default", label: "Default", preview: "bg-slate-500" },
    { value: "red", label: "Red", preview: "bg-red-500" },
    { value: "orange", label: "Orange", preview: "bg-orange-500" },
    { value: "yellow", label: "Yellow", preview: "bg-amber-500" },
    { value: "green", label: "Green", preview: "bg-emerald-500" },
    { value: "blue", label: "Blue", preview: "bg-blue-500" },
    { value: "purple", label: "Purple", preview: "bg-violet-500" },
    { value: "pink", label: "Pink", preview: "bg-pink-500" },
  ]

  const colors = NOTE_COLORS[color]

  // Count active features for the toolbar indicator
  const activeFeatureCount = [
    showTags || tags.length > 0,
    showChecklist || checklist.length > 0,
    hasAdvancedFeatures,
  ].filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* Color accent bar - subtle unless color is set */}
        <div className={cn(
          "h-1 rounded-t-xl transition-all duration-300",
          color === "default" ? "bg-border" : colors.accent
        )} />

        <DialogHeader className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {note ? (
                <>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Edit Note
                </>
              ) : (
                "New Note"
              )}
            </DialogTitle>

            {/* Quick feature toggle toolbar - minimal, icon-only */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showTypeSelector || noteType !== "note"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title="Change note type"
              >
                <NoteTypeIcon type={noteType} className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowTags(!showTags)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showTags || tags.length > 0
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title="Add tags"
              >
                <Tag className="h-4 w-4" />
                {tags.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {tags.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowChecklist(!showChecklist)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showChecklist || checklist.length > 0
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title="Add tasks"
              >
                <ListTodo className="h-4 w-4" />
                {checklist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {checklist.filter(i => !i.isCompleted).length || <Check className="h-2.5 w-2.5" />}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showAdvanced || hasAdvancedFeatures
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title="More options (color, priority, dates)"
              >
                <Palette className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Note Type Selector - Hidden by default, toggle via toolbar */}
          {showTypeSelector && (
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg w-fit animate-in fade-in slide-in-from-top-2 duration-200">
              {NOTE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleNoteTypeChange(type.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    noteType === type.id
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <NoteTypeIcon type={type.id} className="h-3.5 w-3.5" />
                  {type.label}
                </button>
              ))}
            </div>
          )}

          {/* Title - Always visible, clean and prominent */}
          <div>
            <Input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({}) }}
              placeholder="Note title"
              className={cn(
                "text-xl font-medium h-12 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent",
                errors.title && "border-red-500"
              )}
              autoFocus
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Content - Always visible, minimal chrome */}
          <div>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder={currentTypeConfig.placeholder}
              minHeight="150px"
            />
          </div>

          {/* Tags - Revealed via toolbar or when note has tags */}
          {(showTags || tags.length > 0) && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="Add tags (press Enter or comma)"
                suggestedTags={currentTypeConfig.suggestedTags}
              />
            </div>
          )}

          {/* Checklist Section - Revealed via toolbar */}
          {(showChecklist || checklist.length > 0) && (
            <div className="border rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Checklist header */}
              <div className={cn(
                "flex items-center justify-between px-4 py-3",
                checklist.length > 0
                  ? checklist.every(i => i.isCompleted)
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-amber-50 dark:bg-amber-950/30"
                  : "bg-muted/30"
              )}>
                <div className="flex items-center gap-2">
                  <ListTodo className={cn(
                    "h-4 w-4",
                    checklist.length > 0
                      ? checklist.every(i => i.isCompleted)
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">Tasks</span>
                  {checklist.length > 0 && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      checklist.every(i => i.isCompleted)
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    )}>
                      {checklist.filter(i => i.isCompleted).length}/{checklist.length}
                    </span>
                  )}
                </div>
                {checklist.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowChecklist(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Hide
                  </button>
                )}
              </div>

              {/* Add task input */}
              <div className="p-3 border-t bg-background/50">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={checklistInput}
                      onChange={(e) => setChecklistInput(e.target.value)}
                      placeholder="Add a task..."
                      className="h-9 pl-9 pr-3 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddChecklistItem()
                        }
                      }}
                    />
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddChecklistItem}
                    disabled={!checklistInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Task list */}
              {checklist.length > 0 && (
                <div className="divide-y border-t">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 group transition-colors",
                        item.isCompleted ? "bg-muted/20" : "hover:bg-muted/30"
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        type="button"
                        onClick={() => handleToggleChecklistItem(item.id)}
                        className={cn(
                          "shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                          "hover:scale-110 active:scale-95",
                          item.isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"
                        )}
                      >
                        {item.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>
                      <span className={cn(
                        "flex-1 text-sm transition-all duration-200",
                        item.isCompleted && "line-through text-muted-foreground"
                      )}>
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {checklist.length > 0 && (
                <div className="px-3 py-2 bg-muted/20 border-t">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        checklist.every(i => i.isCompleted) ? "bg-emerald-500" : "bg-amber-500"
                      )}
                      style={{ width: `${(checklist.filter(i => i.isCompleted).length / checklist.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Options - Revealed via toolbar */}
          {(showAdvanced || hasAdvancedFeatures) && (
            <div className="space-y-3 p-4 rounded-xl bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Options</span>
                {!hasAdvancedFeatures && (
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Hide
                  </button>
                )}
              </div>

              {/* Color picker - inline visual */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Palette className="h-3 w-3" /> Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className={cn(
                        "w-7 h-7 rounded-full transition-all duration-200",
                        opt.preview,
                        color === opt.value
                          ? "ring-2 ring-offset-2 ring-primary scale-110"
                          : "hover:scale-110 opacity-70 hover:opacity-100"
                      )}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              {/* Priority - inline visual */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Flag className="h-3 w-3" /> Priority
                </label>
                <div className="flex gap-2">
                  {(Object.keys(PRIORITY_CONFIG) as NotePriority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                        priority === p
                          ? "ring-2 ring-offset-1 ring-primary"
                          : "hover:bg-muted",
                        PRIORITY_CONFIG[p].color,
                        p === "none" && "bg-muted/50",
                        p === "low" && (priority === p ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-blue-50 dark:hover:bg-blue-900/20"),
                        p === "medium" && (priority === p ? "bg-amber-100 dark:bg-amber-900/30" : "hover:bg-amber-50 dark:hover:bg-amber-900/20"),
                        p === "high" && (priority === p ? "bg-red-100 dark:bg-red-900/30" : "hover:bg-red-50 dark:hover:bg-red-900/20")
                      )}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates - compact grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Due Date
                  </label>
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    placeholder="Set due date"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Reminder
                  </label>
                  <DatePicker
                    value={reminder}
                    onChange={setReminder}
                    placeholder="Set reminder"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions - Clean, minimal footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            {/* Hint for new users - only show when no features are active */}
            {!note && activeFeatureCount === 0 && (
              <p className="text-xs text-muted-foreground">
                Use toolbar icons to add tags, tasks, or customize
              </p>
            )}
            {(note || activeFeatureCount > 0) && <div />}

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : note ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NoteEditor
