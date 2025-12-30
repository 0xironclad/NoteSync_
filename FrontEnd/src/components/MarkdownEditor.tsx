import { useRef, useState, useCallback } from "react"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link,
  Eye,
  EyeOff,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "./MarkdownRenderer"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  prefix: string
  suffix: string
  block?: boolean
}

/**
 * Markdown Editor with Toolbar and Live Preview
 *
 * Design Philosophy:
 * - Fast & focused: keyboard shortcuts for power users
 * - Predictable: standard Markdown syntax
 * - Non-overwhelming: essential formatting tools only
 * - Live preview: optional split view to see rendered output
 */
function MarkdownEditor({ value, onChange, placeholder = "Write your note...", minHeight = "200px" }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(false)

  const toolbarActions: ToolbarAction[] = [
    { icon: <Heading1 className="h-4 w-4" />, label: "Heading 1", prefix: "# ", suffix: "", block: true },
    { icon: <Heading2 className="h-4 w-4" />, label: "Heading 2", prefix: "## ", suffix: "", block: true },
    { icon: <Bold className="h-4 w-4" />, label: "Bold (Ctrl+B)", prefix: "**", suffix: "**" },
    { icon: <Italic className="h-4 w-4" />, label: "Italic (Ctrl+I)", prefix: "_", suffix: "_" },
    { icon: <Strikethrough className="h-4 w-4" />, label: "Strikethrough", prefix: "~~", suffix: "~~" },
    { icon: <Code className="h-4 w-4" />, label: "Code", prefix: "`", suffix: "`" },
    { icon: <Link className="h-4 w-4" />, label: "Link", prefix: "[", suffix: "](url)" },
    { icon: <Quote className="h-4 w-4" />, label: "Quote", prefix: "> ", suffix: "", block: true },
    { icon: <List className="h-4 w-4" />, label: "Bullet List", prefix: "- ", suffix: "", block: true },
    { icon: <ListOrdered className="h-4 w-4" />, label: "Numbered List", prefix: "1. ", suffix: "", block: true },
    { icon: <Minus className="h-4 w-4" />, label: "Divider", prefix: "\n---\n", suffix: "", block: true },
  ]

  const insertFormatting = useCallback((prefix: string, suffix: string, block?: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    let newText: string
    let newCursorPos: number

    if (block && start > 0 && !beforeText.endsWith('\n')) {
      // For block elements, ensure we're on a new line
      newText = beforeText + '\n' + prefix + selectedText + suffix + afterText
      newCursorPos = start + 1 + prefix.length + selectedText.length
    } else if (selectedText) {
      // Wrap selected text
      newText = beforeText + prefix + selectedText + suffix + afterText
      newCursorPos = start + prefix.length + selectedText.length + suffix.length
    } else {
      // Insert at cursor
      newText = beforeText + prefix + suffix + afterText
      newCursorPos = start + prefix.length
    }

    onChange(newText)

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          insertFormatting('**', '**')
          break
        case 'i':
          e.preventDefault()
          insertFormatting('_', '_')
          break
        case 'k':
          e.preventDefault()
          insertFormatting('[', '](url)')
          break
      }
    }

    // Tab handling for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newText)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 2, start + 2)
      }, 0)
    }
  }, [insertFormatting, value, onChange])

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/30 flex-wrap">
        {toolbarActions.map((action, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => insertFormatting(action.prefix, action.suffix, action.block)}
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}

        <div className="flex-1" />

        {/* Preview toggle */}
        <Button
          type="button"
          variant={showPreview ? "secondary" : "ghost"}
          size="sm"
          className="h-8 px-2 gap-1.5"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="text-xs">Preview</span>
        </Button>
      </div>

      {/* Editor / Preview */}
      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Textarea */}
        <div className={showPreview ? 'border-r border-border' : ''}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm bg-transparent resize-none focus:outline-none font-mono leading-relaxed"
            style={{ minHeight }}
          />
        </div>

        {/* Preview pane */}
        {showPreview && (
          <div
            className="px-3 py-2 overflow-auto bg-muted/20"
            style={{ minHeight }}
          >
            {value ? (
              <MarkdownRenderer content={value} className="text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="px-3 py-1.5 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Markdown supported. <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl+B</kbd> bold,{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl+I</kbd> italic,{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Ctrl+K</kbd> link
        </p>
      </div>
    </div>
  )
}

export default MarkdownEditor
