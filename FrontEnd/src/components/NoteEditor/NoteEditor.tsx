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
} from "lucide-react"
import { Note, NoteColor, NotePriority, ChecklistItem, NOTE_COLORS, PRIORITY_CONFIG } from "@/types/note"

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

          {/* Checklist Section - Collapsible */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ListTodo className="h-4 w-4" />
                Checklist
                {checklist.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({checklist.filter(i => i.isCompleted).length}/{checklist.length})
                  </span>
                )}
              </span>
              {showChecklist ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showChecklist && (
              <div className="px-3 pb-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    placeholder="Add item..."
                    className="h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddChecklistItem()
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddChecklistItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {checklist.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className={`shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            item.isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30 hover:border-primary"
                          }`}
                        >
                          {item.isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>
                        <span className={`flex-1 text-sm ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
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
