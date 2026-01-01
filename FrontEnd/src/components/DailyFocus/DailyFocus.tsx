import { useState } from "react"
import {
  AlertTriangle,
  Clock,
  Flag,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  MoreHorizontal,
} from "lucide-react"
import { Note, DailyFocusData, FocusItem, NOTE_COLORS } from "@/types/note"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface DailyFocusProps {
  focusData: DailyFocusData | null
  onViewNote: (note: Note) => void
  onDismiss: () => void
  isLoading?: boolean
}

// Minimal, inline focus item - designed for scannability
function FocusChip({
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
    critical: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50",
    attention: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50",
    progress: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
    default: "bg-muted/50 border-border hover:bg-muted",
  }

  const labelStyles = {
    critical: "text-red-600 dark:text-red-400",
    attention: "text-amber-600 dark:text-amber-400",
    progress: "text-emerald-600 dark:text-emerald-400",
    default: "text-muted-foreground",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
        "hover:shadow-sm active:scale-[0.98]",
        variantStyles[variant]
      )}
    >
      {/* Color dot */}
      <div className={cn("w-2 h-2 rounded-full shrink-0", colors.accent)} />

      {/* Title */}
      <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
        {item.note.title}
      </span>

      {/* Label badge */}
      <span className={cn(
        "text-[10px] font-semibold uppercase tracking-wide shrink-0",
        labelStyles[variant]
      )}>
        {item.label}
      </span>
    </button>
  )
}

// Compact card for expanded view
function FocusCard({
  item,
  onClick,
  variant = "default",
}: {
  item: FocusItem
  onClick: () => void
  variant?: "critical" | "attention" | "progress" | "default"
}) {
  const variantBorder = {
    critical: "border-l-red-500",
    attention: "border-l-amber-500",
    progress: "border-l-emerald-500",
    default: "border-l-slate-400",
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
        "w-full text-left p-3 rounded-lg border border-l-4 bg-card transition-all duration-200",
        "hover:shadow-md hover:bg-muted/30 active:scale-[0.99]",
        variantBorder[variant]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
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
              {item.note.content.substring(0, 80)}
            </p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Progress bar for items with progress */}
      {item.progress !== undefined && (
        <div className="mt-2 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              item.progress === 100 ? "bg-emerald-500" : "bg-emerald-400"
            )}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </button>
  )
}

// Summary pill for collapsed state
function SummaryPill({
  icon,
  count,
  label,
  color
}: {
  icon: React.ReactNode
  count: number
  label: string
  color: "red" | "amber" | "emerald" | "slate"
}) {
  if (count === 0) return null

  const colorStyles = {
    red: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      colorStyles[color]
    )}>
      {icon}
      <span>{count}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}

function DailyFocus({ focusData, onViewNote, onDismiss, isLoading }: DailyFocusProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't render if no focus data or all sections are empty
  const hasContent = focusData && (
    focusData.needsAttention.length > 0 ||
    focusData.continueWorking.length > 0 ||
    focusData.recentlyEdited.length > 0
  )

  if (isLoading) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-2 w-40 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!hasContent) {
    return null
  }

  const { needsAttention, continueWorking, recentlyEdited, summary } = focusData!

  // Determine urgency level
  const hasUrgent = summary.overdueCount > 0 || summary.dueTodayCount > 0
  const hasAttention = needsAttention.length > 0

  // Items to show in collapsed "quick glance" view
  // Show max 3 most important items inline
  const quickGlanceItems = [
    ...needsAttention.slice(0, 2),
    ...continueWorking.slice(0, 1),
  ].slice(0, 3)

  const totalItems = needsAttention.length + continueWorking.length + recentlyEdited.length
  const hiddenCount = totalItems - quickGlanceItems.length

  return (
    <div className={cn(
      "mb-6 rounded-xl border overflow-hidden transition-all duration-300",
      hasUrgent
        ? "border-red-200 dark:border-red-900/50 bg-gradient-to-r from-red-50/50 via-background to-background dark:from-red-950/20"
        : hasAttention
        ? "border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50/50 via-background to-background dark:from-amber-950/20"
        : "border-border bg-card/50"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Header - Always visible, acts as summary */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                hasUrgent
                  ? "bg-red-100 dark:bg-red-900/50"
                  : hasAttention
                  ? "bg-amber-100 dark:bg-amber-900/50"
                  : "bg-primary/10"
              )}>
                {hasUrgent ? (
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : hasAttention ? (
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">
                  Daily Focus
                </h2>
                <p className="text-xs text-muted-foreground">
                  {hasUrgent
                    ? `${summary.overdueCount + summary.dueTodayCount} item${summary.overdueCount + summary.dueTodayCount > 1 ? "s" : ""} need attention`
                    : `${totalItems} item${totalItems > 1 ? "s" : ""} to review`}
                </p>
              </div>
            </div>

            {/* Right: Summary pills + Actions */}
            <div className="flex items-center gap-2">
              {/* Summary pills - only on larger screens when collapsed */}
              {!isExpanded && (
                <div className="hidden md:flex items-center gap-1.5">
                  <SummaryPill
                    icon={<AlertTriangle className="h-3 w-3" />}
                    count={summary.overdueCount}
                    label="overdue"
                    color="red"
                  />
                  <SummaryPill
                    icon={<Flag className="h-3 w-3" />}
                    count={summary.dueTodayCount + summary.highPriorityCount}
                    label="urgent"
                    color="amber"
                  />
                  <SummaryPill
                    icon={<ArrowRight className="h-3 w-3" />}
                    count={summary.inProgressCount}
                    label="in progress"
                    color="emerald"
                  />
                </div>
              )}

              {/* Expand/Collapse */}
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} />
                </button>
              </CollapsibleTrigger>

              {/* Dismiss */}
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                title="Dismiss for today"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Glance - Inline chips when collapsed */}
          {!isExpanded && quickGlanceItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
              {quickGlanceItems.map((item) => (
                <FocusChip
                  key={item.note._id}
                  item={item}
                  onClick={() => onViewNote(item.note)}
                  variant={
                    item.urgency === "critical"
                      ? "critical"
                      : item.urgency === "high"
                      ? "attention"
                      : item.progress !== undefined
                      ? "progress"
                      : "default"
                  }
                />
              ))}
              {hiddenCount > 0 && (
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span>+{hiddenCount} more</span>
                  </button>
                </CollapsibleTrigger>
              )}
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Needs Attention - Max 5 items */}
            {needsAttention.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <Flag className="h-3 w-3" />
                  Needs Attention
                  <span className="text-[10px] font-normal">({needsAttention.length})</span>
                </h3>
                <div className="grid gap-2">
                  {needsAttention.slice(0, 5).map((item) => (
                    <FocusCard
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
                  {needsAttention.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      +{needsAttention.length - 5} more items in High Priority view
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Continue Working - Max 4 items */}
            {continueWorking.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Continue Working
                  <span className="text-[10px] font-normal">({continueWorking.length})</span>
                </h3>
                <div className="grid gap-2">
                  {continueWorking.slice(0, 4).map((item) => (
                    <FocusCard
                      key={item.note._id}
                      item={item}
                      onClick={() => onViewNote(item.note)}
                      variant="progress"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recently Edited - Max 3 items */}
            {recentlyEdited.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recently Edited
                  <span className="text-[10px] font-normal">({recentlyEdited.length})</span>
                </h3>
                <div className="grid gap-2">
                  {recentlyEdited.slice(0, 3).map((item) => (
                    <FocusCard
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default DailyFocus
