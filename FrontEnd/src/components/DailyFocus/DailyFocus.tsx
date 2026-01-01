import { useState } from "react"
import {
  AlertTriangle,
  Clock,
  Flag,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Note, DailyFocusData, FocusItem, NOTE_COLORS } from "@/types/note"
import { cn } from "@/lib/utils"

interface DailyFocusProps {
  focusData: DailyFocusData | null
  onViewNote: (note: Note) => void
  onDismiss: () => void
  isLoading?: boolean
}

// Compact note card for focus items
function FocusNoteCard({
  item,
  onClick,
  variant = "default",
}: {
  item: FocusItem
  onClick: () => void
  variant?: "critical" | "attention" | "progress" | "default"
}) {
  const colors = NOTE_COLORS[item.note.color] || NOTE_COLORS.default

  const variantStyles = {
    critical: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30",
    attention: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30",
    progress: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30",
    default: "border-border bg-card hover:bg-muted/50",
  }

  const labelStyles = {
    critical: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    attention: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    progress: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    default: "bg-muted text-muted-foreground",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator */}
        <div className={cn("w-1 h-full min-h-[40px] rounded-full shrink-0", colors.accent)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
              labelStyles[variant]
            )}>
              {item.label}
            </span>
            {item.progress !== undefined && (
              <span className="text-xs text-muted-foreground">
                {Math.round(item.progress)}%
              </span>
            )}
          </div>
          <h4 className="font-medium text-sm text-foreground line-clamp-1">
            {item.note.title}
          </h4>
          {item.note.content && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {item.note.content.substring(0, 60)}
              {item.note.content.length > 60 ? "..." : ""}
            </p>
          )}

          {/* Progress bar for items with progress */}
          {item.progress !== undefined && (
            <div className="mt-2 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  item.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  )
}

// Section header with optional action
function FocusSectionHeader({
  icon,
  title,
  count,
  color = "default",
}: {
  icon: React.ReactNode
  title: string
  count?: number
  color?: "red" | "amber" | "emerald" | "default"
}) {
  const colorStyles = {
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    default: "text-foreground",
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={cn("", colorStyles[color])}>
        {icon}
      </span>
      <h3 className={cn("text-sm font-semibold", colorStyles[color])}>
        {title}
      </h3>
      {count !== undefined && count > 0 && (
        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  )
}

function DailyFocus({ focusData, onViewNote, onDismiss, isLoading }: DailyFocusProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Don't render if no focus data or all sections are empty
  const hasContent = focusData && (
    focusData.needsAttention.length > 0 ||
    focusData.continueWorking.length > 0 ||
    focusData.recentlyEdited.length > 0
  )

  if (isLoading) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!hasContent) {
    return null
  }

  const { needsAttention, continueWorking, recentlyEdited, summary } = focusData!

  // Determine the urgency level for the header
  const hasUrgent = summary.overdueCount > 0 || summary.dueTodayCount > 0
  const hasAttention = needsAttention.length > 0

  return (
    <div className={cn(
      "mb-8 rounded-2xl border overflow-hidden transition-all duration-300",
      hasUrgent
        ? "border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/20 dark:to-background"
        : hasAttention
        ? "border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/20 dark:to-background"
        : "border-border bg-gradient-to-br from-background to-muted/30"
    )}>
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              hasUrgent
                ? "bg-red-100 dark:bg-red-900/50"
                : hasAttention
                ? "bg-amber-100 dark:bg-amber-900/50"
                : "bg-primary/10"
            )}>
              {hasUrgent ? (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : hasAttention ? (
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {hasUrgent
                  ? "Needs your attention"
                  : hasAttention
                  ? "Today's Focus"
                  : "Pick up where you left off"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {hasUrgent
                  ? `${summary.overdueCount + summary.dueTodayCount} urgent item${summary.overdueCount + summary.dueTodayCount > 1 ? "s" : ""}`
                  : hasAttention
                  ? `${needsAttention.length} item${needsAttention.length > 1 ? "s" : ""} to focus on`
                  : `${continueWorking.length + recentlyEdited.length} recent note${continueWorking.length + recentlyEdited.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-90"
              )} />
            </button>
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
              title="Dismiss for today"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Needs Attention Section */}
          {needsAttention.length > 0 && (
            <div>
              <FocusSectionHeader
                icon={<Flag className="h-4 w-4" />}
                title="Needs Attention"
                count={needsAttention.length}
                color={hasUrgent ? "red" : "amber"}
              />
              <div className="space-y-2">
                {needsAttention.map((item) => (
                  <FocusNoteCard
                    key={item.note._id}
                    item={item}
                    onClick={() => onViewNote(item.note)}
                    variant={
                      item.urgency === "critical"
                        ? "critical"
                        : item.urgency === "high"
                        ? "attention"
                        : "default"
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Continue Working Section */}
          {continueWorking.length > 0 && (
            <div>
              <FocusSectionHeader
                icon={<ArrowRight className="h-4 w-4" />}
                title="Continue Working"
                count={continueWorking.length}
                color="emerald"
              />
              <div className="space-y-2">
                {continueWorking.map((item) => (
                  <FocusNoteCard
                    key={item.note._id}
                    item={item}
                    onClick={() => onViewNote(item.note)}
                    variant="progress"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recently Edited Section */}
          {recentlyEdited.length > 0 && (
            <div>
              <FocusSectionHeader
                icon={<Clock className="h-4 w-4" />}
                title="Recently Edited"
                count={recentlyEdited.length}
              />
              <div className="space-y-2">
                {recentlyEdited.map((item) => (
                  <FocusNoteCard
                    key={item.note._id}
                    item={item}
                    onClick={() => onViewNote(item.note)}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DailyFocus
