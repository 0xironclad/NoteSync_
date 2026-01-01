import { useState } from "react"
import {
  ArrowRight,
  X,
  Clock,
  ListTodo,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { Note, ResumeSuggestionsData, NOTE_COLORS } from "@/types/note"
import { cn } from "@/lib/utils"

interface ResumePromptProps {
  resumeData: ResumeSuggestionsData | null
  onViewNote: (note: Note) => void
  onDismiss: () => void
  isLoading?: boolean
}

function ResumePrompt({ resumeData, onViewNote, onDismiss, isLoading }: ResumePromptProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  // Don't render if no resume data or no primary suggestion
  if (isLoading || !resumeData || !resumeData.primary) {
    return null
  }

  const { primary, context, isReturning, recentlyViewed } = resumeData
  const colors = NOTE_COLORS[primary.note.color] || NOTE_COLORS.default

  const handleDismiss = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss()
    }, 200)
  }

  const handleView = () => {
    onViewNote(primary.note)
  }

  if (!isVisible) return null

  // Get the appropriate icon based on suggestion type
  const getIcon = () => {
    switch (primary.type) {
      case "incomplete_tasks":
        return <ListTodo className="h-4 w-4" />
      case "last_viewed":
        return <BookOpen className="h-4 w-4" />
      case "urgent_task":
        return <Sparkles className="h-4 w-4" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }

  return (
    <div
      className={cn(
        "mb-4 transition-all duration-200",
        isAnimatingOut && "opacity-0 translate-y-[-8px]"
      )}
    >
      {/* Returning user greeting - subtle and warm */}
      {isReturning && context && (
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          {context}
        </p>
      )}

      {/* Main resume card - designed to feel like a gentle nudge */}
      <div
        className={cn(
          "group relative rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden",
          "transition-all duration-200 hover:shadow-md hover:bg-card",
          "cursor-pointer"
        )}
        onClick={handleView}
      >
        {/* Subtle color accent */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", colors.accent)} />

        <div className="flex items-center gap-4 p-4 pl-5">
          {/* Icon */}
          <div className={cn(
            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            "bg-primary/5 text-primary"
          )}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">
              {primary.reason}
            </p>
            <h3 className="font-medium text-sm text-foreground truncate">
              {primary.note.title}
            </h3>
            {primary.detail && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {primary.detail}
              </p>
            )}

            {/* Progress indicator for tasks */}
            {primary.progress !== undefined && primary.progress > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[120px]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      primary.progress === 100 ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{ width: `${primary.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {Math.round(primary.progress)}%
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Continue button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleView()
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              Continue
            </button>

            {/* Dismiss */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recently viewed - very subtle, secondary */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Also recently:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {recentlyViewed.slice(0, 2).map((item) => (
              <button
                key={item.note._id}
                onClick={() => onViewNote(item.note)}
                className="px-2 py-1 rounded-md bg-muted/50 hover:bg-muted truncate max-w-[140px] transition-colors"
              >
                {item.note.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumePrompt
