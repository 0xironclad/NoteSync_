import { useMemo } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
  compact?: boolean
}

/**
 * Lightweight Markdown renderer for note content
 * Supports: headings, bold, italic, code, links, lists, blockquotes
 * No external dependencies - renders to styled HTML
 */
function MarkdownRenderer({ content, className = "", compact = false }: MarkdownRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return ""

    let html = content
      // Escape HTML to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Code blocks (```code```) - must be before inline code
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) => {
      return `<pre class="bg-black/10 dark:bg-white/10 rounded-md p-2 my-2 overflow-x-auto text-xs font-mono"><code>${code.trim()}</code></pre>`
    })

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">$1</code>')

    // Headings (# ## ###)
    if (!compact) {
      html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
      html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
      html = html.replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>')
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
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="underline underline-offset-2 hover:opacity-80">$1</a>')

    // Blockquotes (> text)
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-current/30 pl-3 my-2 italic opacity-80">$1</blockquote>')

    // Unordered lists (- item or * item)
    html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

    // Ordered lists (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-4 list-disc">[^<]+<\/li>\n?)+/g, (match) => {
      return `<ul class="my-1 space-y-0.5">${match}</ul>`
    })
    html = html.replace(/(<li class="ml-4 list-decimal">[^<]+<\/li>\n?)+/g, (match) => {
      return `<ol class="my-1 space-y-0.5">${match}</ol>`
    })

    // Horizontal rule (--- or ***)
    html = html.replace(/^(---|\*\*\*)$/gm, '<hr class="my-3 border-current/20" />')

    // Line breaks (double newline = paragraph break)
    html = html.replace(/\n\n/g, '</p><p class="mt-2">')
    html = html.replace(/\n/g, '<br />')

    // Wrap in paragraph
    html = `<p>${html}</p>`

    return html
  }, [content, compact])

  return (
    <div
      className={`prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}

export default MarkdownRenderer
