import { useState, useEffect, useRef, useCallback } from "react"
import { X, Tag as TagIcon, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import AxiosInstance from "@/utils/AxiosInstance"
import { cn } from "@/lib/utils"

interface TagSuggestion {
  name: string
  count: number
}

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  suggestedTags?: string[]
}

/**
 * Enhanced Tag Input with Suggestions
 *
 * Features:
 * - Autocomplete suggestions from existing tags
 * - Shows tag usage count for discoverability
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click to add suggestions
 * - Backspace to remove last tag
 * - Comma or Enter to add new tag
 */
function TagInput({ tags, onChange, placeholder = "Add tags...", className, suggestedTags = [] }: TagInputProps) {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [allTags, setAllTags] = useState<TagSuggestion[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch all tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await AxiosInstance.get("/tags")
        if (!response.data.error) {
          setAllTags(response.data.tags)
        }
      } catch (error) {
        console.log("Error fetching tags:", error)
      }
    }
    fetchTags()
  }, [])

  // Filter suggestions based on input
  useEffect(() => {
    if (input.trim()) {
      const lowerInput = input.toLowerCase()
      const filtered = allTags
        .filter(t =>
          t.name.toLowerCase().includes(lowerInput) &&
          !tags.includes(t.name)
        )
        .slice(0, 8)

      // Add "create new" option if input doesn't exactly match any tag
      const exactMatch = allTags.some(t => t.name.toLowerCase() === lowerInput)
      if (!exactMatch && !tags.includes(input.toLowerCase())) {
        filtered.push({ name: input.toLowerCase(), count: 0 })
      }

      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      // Show suggested tags first (from note type), then popular tags
      const typeTagSuggestions: TagSuggestion[] = suggestedTags
        .filter(t => !tags.includes(t))
        .map(t => {
          const existing = allTags.find(at => at.name === t)
          return { name: t, count: existing?.count || 0 }
        })

      const popular = allTags
        .filter(t => !tags.includes(t.name) && !suggestedTags.includes(t.name))
        .slice(0, 6 - typeTagSuggestions.length)

      setSuggestions([...typeTagSuggestions, ...popular])
    }
  }, [input, allTags, tags, suggestedTags])

  const normalizeTag = (tag: string) => {
    return tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  }

  const addTag = useCallback((tagName: string) => {
    const normalized = normalizeTag(tagName)
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized])
      setInput("")
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }, [tags, onChange])

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex].name)
      } else if (input.trim()) {
        addTag(input)
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const handleFocus = () => {
    if (suggestions.length > 0 || allTags.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <TagIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-h-[36px] py-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full group animate-in fade-in-0 zoom-in-95"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="opacity-60 hover:opacity-100 hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] h-7 text-sm border-0 focus-visible:ring-0 px-1 bg-transparent"
          />
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-top-2">
          <div className="p-1">
            {input.trim() === "" && suggestedTags.length > 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                Suggested tags
              </div>
            )}
            {input.trim() === "" && suggestedTags.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                Popular tags
              </div>
            )}
            {suggestions.map((suggestion, index) => {
              const isNew = suggestion.count === 0
              const isSelected = index === selectedIndex

              return (
                <button
                  key={suggestion.name}
                  type="button"
                  onClick={() => addTag(suggestion.name)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                    isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  {isNew ? (
                    <>
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Create "{suggestion.name}"</span>
                    </>
                  ) : (
                    <>
                      <span className="text-primary">#{suggestion.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {suggestion.count} {suggestion.count === 1 ? "note" : "notes"}
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to add,{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> to navigate
          </div>
        </div>
      )}
    </div>
  )
}

export default TagInput
