import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import MarkdownEditor from "@/components/MarkdownEditor"
import TagInput from "@/components/TagInput"
import {
  Plus,
  Calendar,
  Clock,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Settings2,
  GripVertical,
} from "lucide-react"
import { Note, NoteColor, NotePriority, ChecklistItem, NOTE_COLORS, PRIORITY_CONFIG } from "@/types/note"
import { cn } from "@/lib/utils"

interface NoteEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: Note | null
  onSave: (data: NoteFormData) => Promise<void>
}

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

const generateId = () => Math.random().toString(36).substring(2, 9)

/**
 * Note Editor with Markdown Support
 *
 * Content Editing Strategy: Markdown
 *
 * Why Markdown over Rich Text:
 * - Fast: No mouse required, keyboard-driven formatting
 * - Predictable: What you type is what you get - no hidden formatting
 * - Portable: Content is plain text, works everywhere
 * - Focused: Encourages writing over formatting
 *
 * Supported Markdown:
 * - Headings: # ## ###
 * - Emphasis: **bold**, _italic_, ~~strikethrough~~
 * - Lists: - bullets, 1. numbered
 * - Code: `inline` and ```blocks```
 * - Links: [text](url)
 * - Quotes: > blockquote
 * - Dividers: ---
 */
function NoteEditor({ open, onOpenChange, note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("")
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
  const [showOptions, setShowOptions] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)

  useEffect(() => {
    if (open) {
      if (note) {
        setTitle(note.title)
        setContent(note.content)
        setTags(note.tags)
        setColor(note.color)
        setPriority(note.priority)
        setDueDate(note.dueDate ? new Date(note.dueDate).toISOString().split('T')[0] : null)
        setReminder(note.reminder ? new Date(note.reminder).toISOString().split('T')[0] : null)
        setChecklist(note.checklist)
        setShowChecklist(note.checklist.length > 0)
        setShowOptions(note.color !== "default" || note.priority !== "none" || !!note.dueDate || !!note.reminder)
      } else {
        resetForm()
      }
    }
  }, [open, note])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTags([])
    setColor("default")
    setPriority("none")
    setDueDate(null)
    setReminder(null)
    setChecklist([])
    setChecklistInput("")
    setErrors({})
    setShowOptions(false)
    setShowChecklist(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* Color accent bar */}
        <div className={`h-1.5 rounded-t-xl ${colors.accent}`} />

        <DialogHeader className="px-6 pt-4 pb-2">
          <DialogTitle className="text-xl">
            {note ? "Edit Note" : "New Note"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title - Large, prominent input */}
          <div>
            <Input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({}) }}
              placeholder="Note title"
              className={`text-lg font-medium h-12 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Content - Markdown Editor */}
          <div>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing... (Markdown supported)"
              minHeight="180px"
            />
          </div>

          {/* Tags - Enhanced with suggestions */}
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Add tags..."
          />

          {/* Checklist Section - Enhanced Design */}
          <div className="border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className={cn(
                "w-full flex items-center justify-between p-3.5 transition-colors",
                showChecklist ? "bg-muted/30" : "hover:bg-muted/30"
              )}
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  checklist.length > 0
                    ? checklist.every(i => i.isCompleted)
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  <ListTodo className="h-4 w-4" />
                </div>
                <span>Tasks</span>
                {checklist.length > 0 && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    checklist.every(i => i.isCompleted)
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  )}>
                    {checklist.filter(i => i.isCompleted).length}/{checklist.length}
                  </span>
                )}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                showChecklist && "rotate-180"
              )} />
            </button>

            {showChecklist && (
              <div className="border-t">
                {/* Add new task input */}
                <div className="p-3 bg-muted/20">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={checklistInput}
                        onChange={(e) => setChecklistInput(e.target.value)}
                        placeholder="Add a task..."
                        className="h-10 pl-10 pr-4 bg-background"
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
                      size="default"
                      onClick={handleAddChecklistItem}
                      disabled={!checklistInput.trim()}
                      className="px-4"
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to add quickly. Great for to-dos, meeting notes, and daily planning.
                  </p>
                </div>

                {/* Task list */}
                {checklist.length > 0 && (
                  <div className="divide-y">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 group transition-colors",
                          item.isCompleted ? "bg-muted/20" : "hover:bg-muted/30"
                        )}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                        <button
                          type="button"
                          onClick={() => handleToggleChecklistItem(item.id)}
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
                        <span className={cn(
                          "flex-1 text-sm transition-all duration-200",
                          item.isCompleted && "line-through text-muted-foreground"
                        )}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress summary */}
                {checklist.length > 0 && (
                  <div className="px-3 py-3 bg-muted/20 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {checklist.filter(i => i.isCompleted).length} of {checklist.length} completed
                      </span>
                      {checklist.every(i => i.isCompleted) && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> All done!
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-out",
                          checklist.every(i => i.isCompleted) ? "bg-emerald-500" : "bg-amber-500"
                        )}
                        style={{ width: `${(checklist.filter(i => i.isCompleted).length / checklist.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {checklist.length === 0 && (
                  <div className="px-3 py-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <ListTodo className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No tasks yet. Add your first task above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options Section - Collapsible */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Settings2 className="h-4 w-4" />
                Options
                {(color !== "default" || priority !== "none" || dueDate || reminder) && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </span>
              {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showOptions && (
              <div className="px-3 pb-3 space-y-4">
                {/* Color & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Color</label>
                    <Select value={color} onValueChange={(v) => setColor(v as NoteColor)}>
                      {colorOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${opt.preview}`} />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as NotePriority)}>
                      {(Object.keys(PRIORITY_CONFIG) as NotePriority[]).map(p => (
                        <SelectItem key={p} value={p}>
                          <span className={PRIORITY_CONFIG[p].color}>{PRIORITY_CONFIG[p].label}</span>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Due Date & Reminder */}
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : note ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NoteEditor
