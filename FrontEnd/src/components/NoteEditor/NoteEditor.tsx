import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Plus,
  X,
  Calendar,
  Clock,
  CheckSquare,
  Palette,
  Flag,
  Trash2
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

function NoteEditor({ open, onOpenChange, note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [color, setColor] = useState<NoteColor>("default")
  const [priority, setPriority] = useState<NotePriority>("none")
  const [dueDate, setDueDate] = useState("")
  const [reminder, setReminder] = useState("")
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [checklistInput, setChecklistInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})

  // Reset form when dialog opens/closes or note changes
  useEffect(() => {
    if (open) {
      if (note) {
        setTitle(note.title)
        setContent(note.content)
        setTags(note.tags)
        setColor(note.color)
        setPriority(note.priority)
        setDueDate(note.dueDate ? new Date(note.dueDate).toISOString().split('T')[0] : "")
        setReminder(note.reminder ? new Date(note.reminder).toISOString().split('T')[0] : "")
        setChecklist(note.checklist)
      } else {
        resetForm()
      }
    }
  }, [open, note])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTags([])
    setTagInput("")
    setColor("default")
    setPriority("none")
    setDueDate("")
    setReminder("")
    setChecklist([])
    setChecklistInput("")
    setErrors({})
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
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
    // Validation
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
    { value: "default", label: "Default", preview: "bg-slate-700" },
    { value: "red", label: "Red", preview: "bg-red-700" },
    { value: "orange", label: "Orange", preview: "bg-orange-700" },
    { value: "yellow", label: "Yellow", preview: "bg-yellow-700" },
    { value: "green", label: "Green", preview: "bg-green-700" },
    { value: "blue", label: "Blue", preview: "bg-blue-700" },
    { value: "purple", label: "Purple", preview: "bg-purple-700" },
    { value: "pink", label: "Pink", preview: "bg-pink-700" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* Color preview header */}
        <div className={`h-2 rounded-t-xl ${NOTE_COLORS[color].bg}`} />

        <DialogHeader className="px-6 pt-4 pb-2">
          <DialogTitle>{note ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Color & Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Color
              </label>
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
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5" /> Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as NotePriority)}>
                {(Object.keys(PRIORITY_CONFIG) as NotePriority[]).map(p => (
                  <SelectItem key={p} value={p}>
                    <span className={PRIORITY_CONFIG[p].color}>{PRIORITY_CONFIG[p].label}</span>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Due Date & Reminder row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Reminder
              </label>
              <Input
                type="date"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="secondary" size="icon" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-md"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> Checklist
            </label>
            <div className="flex gap-2">
              <Input
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                placeholder="Add a checklist item"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddChecklistItem()
                  }
                }}
              />
              <Button type="button" variant="secondary" size="icon" onClick={handleAddChecklistItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {checklist.length > 0 && (
              <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                        item.isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input hover:border-primary"
                      }`}
                    >
                      {item.isCompleted && <CheckSquare className="h-3 w-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.isCompleted ? "line-through opacity-50" : ""}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
