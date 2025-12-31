import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
  compact?: boolean
  mode?: "compact" | "reading"
}

/**
 * Lightweight Markdown renderer for note content
 * Supports: headings, bold, italic, code, links, lists, blockquotes
 * No external dependencies - renders to styled HTML
 *
 * Modes:
 * - compact: For card previews, smaller text, truncated headings
 * - reading: For full note view, larger text, generous spacing
 */
function MarkdownRenderer({
  content,
  className = "",
  compact = false,
  mode,
}: MarkdownRendererProps) {
  // Determine effective mode
  const isCompact = mode === "compact" || (compact && mode !== "reading")
  const isReading = mode === "reading"

  const rendered = useMemo(() => {
    if (!content) return ""

    let html = content
      // Escape HTML to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Code blocks (```code```) - must be before inline code
    const codeBlockClasses = isReading
      ? "bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto text-sm font-mono leading-relaxed"
      : "bg-black/10 dark:bg-white/10 rounded-md p-2 my-2 overflow-x-auto text-xs font-mono"

    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) => {
      return `<pre class="${codeBlockClasses}"><code>${code.trim()}</code></pre>`
    })

    // Inline code (`code`)
    const inlineCodeClasses = isReading
      ? "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200"
      : "bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono"

    html = html.replace(/`([^`]+)`/g, `<code class="${inlineCodeClasses}">$1</code>`)

    // Headings (# ## ###)
    if (!isCompact) {
      if (isReading) {
        html = html.replace(
          /^### (.+)$/gm,
          '<h3 class="text-lg font-semibold mt-6 mb-3 text-foreground">$1</h3>'
        )
        html = html.replace(
          /^## (.+)$/gm,
          '<h2 class="text-xl font-semibold mt-8 mb-4 text-foreground">$1</h2>'
        )
        html = html.replace(
          /^# (.+)$/gm,
          '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>'
        )
      } else {
        html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
        html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
        html = html.replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>')
      }
    }

    // Bold (**text** or __text__)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    html = html.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>')

    // Italic (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    html = html.replace(/_([^_]+)_/g, '<em class="italic">$1</em>')

    // Strikethrough (~~text~~)
    html = html.replace(/~~([^~]+)~~/g, '<del class="line-through opacity-60">$1</del>')

    // Links [text](url)
    const linkClasses = isReading
      ? "text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      : "underline underline-offset-2 hover:opacity-80"

    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `<a href="$2" target="_blank" rel="noopener" class="${linkClasses}">$1</a>`
    )

    // Blockquotes (> text)
    const blockquoteClasses = isReading
      ? "border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-muted-foreground"
      : "border-l-2 border-current/30 pl-3 my-2 italic opacity-80"

    html = html.replace(/^&gt; (.+)$/gm, `<blockquote class="${blockquoteClasses}">$1</blockquote>`)

    // Unordered lists (- item or * item)
    const listItemClasses = isReading ? "ml-6 list-disc" : "ml-4 list-disc"
    html = html.replace(/^[\-\*] (.+)$/gm, `<li class="${listItemClasses}">$1</li>`)

    // Ordered lists (1. item)
    const orderedListItemClasses = isReading ? "ml-6 list-decimal" : "ml-4 list-decimal"
    html = html.replace(/^\d+\. (.+)$/gm, `<li class="${orderedListItemClasses}">$1</li>`)

    // Wrap consecutive list items
    const ulClasses = isReading ? "my-4 space-y-2" : "my-1 space-y-0.5"
    const olClasses = isReading ? "my-4 space-y-2" : "my-1 space-y-0.5"

    html = html.replace(
      new RegExp(`(<li class="${listItemClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">[^<]+</li>\\n?)+`, 'g'),
      (match) => `<ul class="${ulClasses}">${match}</ul>`
    )
    html = html.replace(
      new RegExp(`(<li class="${orderedListItemClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">[^<]+</li>\\n?)+`, 'g'),
      (match) => `<ol class="${olClasses}">${match}</ol>`
    )

    // Horizontal rule (--- or ***)
    const hrClasses = isReading ? "my-8 border-current/20" : "my-3 border-current/20"
    html = html.replace(/^(---|\*\*\*)$/gm, `<hr class="${hrClasses}" />`)

    // Line breaks (double newline = paragraph break)
    const paragraphClasses = isReading ? "mt-4" : "mt-2"
    html = html.replace(/\n\n/g, `</p><p class="${paragraphClasses}">`)
    html = html.replace(/\n/g, "<br />")

    // Wrap in paragraph
    html = `<p>${html}</p>`

    return html
  }, [content, isCompact, isReading])

  return (
    <div
      className={cn(
        "max-w-none",
        isReading
          ? "prose prose-slate dark:prose-invert text-base leading-relaxed"
          : "prose-sm",
        className
      )}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}

export default MarkdownRenderer
