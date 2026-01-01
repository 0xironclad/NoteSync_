import { useState } from "react"
import {
  AlertTriangle,
  Clock,
  Calendar,
  Flag,
  ArrowRight,
  Edit3,
  Pin,
  RotateCcw,
  ChevronDown,
  X,
  Info,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  BellOff,
  Star,
  MoreHorizontal,
} from "lucide-react"
import {
  Note,
  NOTE_COLORS,
  SmartPriorityData,
  PrioritizedNote,
  PrioritySignal,
  PriorityInsight,
  SnoozeDuration,
  SNOOZE_OPTIONS,
} from "@/types/note"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SmartPriorityProps {
  data: SmartPriorityData | null
  onViewNote: (note: Note) => void
  onDismiss: () => void
  onSnoozeNote: (noteId: string, duration: SnoozeDuration) => void
  onDismissNote: (noteId: string) => void
  onToggleFocusPin: (noteId: string) => void
  isLoading?: boolean
}

// Icon mapping for signals
const SIGNAL_ICONS: Record<PrioritySignal, React.ReactNode> = {
  overdue: <AlertTriangle className="h-3.5 w-3.5" />,
  due_today: <Clock className="h-3.5 w-3.5" />,
  due_soon: <Calendar className="h-3.5 w-3.5" />,
  high_priority: <Flag className="h-3.5 w-3.5" />,
  in_progress: <ArrowRight className="h-3.5 w-3.5" />,
  recently_active: <Edit3 className="h-3.5 w-3.5" />,
  pinned: <Pin className="h-3.5 w-3.5" />,
  returning: <RotateCcw className="h-3.5 w-3.5" />,
}

// Color mapping for signals
const SIGNAL_COLORS: Record<
  PrioritySignal,
  { bg: string; text: string; border: string }
> = {
  overdue: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
  due_today: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  due_soon: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  high_priority: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  in_progress: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  recently_active: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  pinned: {
    bg: "bg-violet-100 dark:bg-violet-900/40",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
  returning: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
}

// Signal badge component
function SignalBadge({
  signal,
  showLabel = true,
}: {
  signal: PrioritySignal
  showLabel?: boolean
}) {
  const colors = SIGNAL_COLORS[signal]
  const icon = SIGNAL_ICONS[signal]

  const labels: Record<PrioritySignal, string> = {
    overdue: "Overdue",
    due_today: "Today",
    due_soon: "Soon",
    high_priority: "Priority",
    in_progress: "Active",
    recently_active: "Recent",
    pinned: "Pinned",
    returning: "Resume",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
        colors.bg,
        colors.text
      )}
    >
      {icon}
      {showLabel && <span>{labels[signal]}</span>}
    </span>
  )
}

// Priority item card with subtle controls
function PriorityCard({
  item,
  onClick,
  onSnooze,
  onDismiss,
  onToggleFocusPin,
}: {
  item: PrioritizedNote
  onClick: () => void
  onSnooze: (duration: SnoozeDuration) => void
  onDismiss: () => void
  onToggleFocusPin: () => void
}) {
  const colors = NOTE_COLORS[item.note.color] || NOTE_COLORS.default
  const signalColors = SIGNAL_COLORS[item.primarySignal]
  const isFocusPinned = item.isFocusPinned || item.note.focusPinned

  return (
    <div
      className={cn(
        "relative group w-full rounded-lg border transition-all duration-200",
        signalColors.border,
        "bg-card hover:bg-muted/30 hover:shadow-md"
      )}
    >
      {/* Main clickable area */}
      <button
        onClick={onClick}
        className="w-full text-left p-3"
      >
        <div className="flex items-start gap-3">
          {/* Rank indicator */}
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
              signalColors.bg,
              signalColors.text
            )}
          >
            {item.rank}
          </div>

          <div className="flex-1 min-w-0 pr-8">
            {/* Signal + explanation */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <SignalBadge signal={item.primarySignal} />
              <span className="text-xs text-muted-foreground">
                {item.explanation}
              </span>
              {isFocusPinned && (
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              )}
            </div>

            {/* Title */}
            <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {item.note.title}
            </h4>

            {/* Additional signals */}
            {item.signals.length > 1 && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">
                  Also:
                </span>
                {item.signals
                  .filter((s) => s !== item.primarySignal)
                  .slice(0, 2)
                  .map((signal) => (
                    <SignalBadge key={signal} signal={signal} showLabel={false} />
                  ))}
              </div>
            )}
          </div>

          {/* Color indicator */}
          <div
            className={cn("w-2 h-2 rounded-full shrink-0 mt-1", colors.accent)}
          />
        </div>
      </button>

      {/* Subtle action menu - appears on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-1.5 rounded-md transition-colors",
                "hover:bg-black/5 dark:hover:bg-white/10",
                "text-muted-foreground hover:text-foreground"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {/* Focus Pin */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onToggleFocusPin()
              }}
              className="gap-2"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  isFocusPinned && "fill-amber-500 text-amber-500"
                )}
              />
              {isFocusPinned ? "Unpin from focus" : "Pin to focus"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Snooze options */}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Snooze for...
              </p>
            </div>
            {SNOOZE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation()
                  onSnooze(option.value)
                }}
                className="gap-2 pl-4"
              >
                <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                {option.label}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Dismiss */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDismiss()
              }}
              className="gap-2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Dismiss suggestion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Insight card
function InsightCard({ insight }: { insight: PriorityInsight }) {
  const config = {
    info: {
      icon: <Info className="h-4 w-4" />,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
    },
    tip: {
      icon: <Lightbulb className="h-4 w-4" />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
    },
    success: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
    },
  }

  const style = config[insight.type]

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        style.bg,
        style.border
      )}
    >
      <span className={style.text}>{style.icon}</span>
      <span className={cn("text-xs", style.text)}>{insight.message}</span>
    </div>
  )
}

// How it works explainer
function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>How does this work?</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Simple Prioritization Rules
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your notes are ranked using three simple factors that you can
            understand and predict:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                <Clock className="h-3 w-3 text-red-600 dark:text-red-400" />
              </span>
              <div>
                <span className="text-xs font-medium text-foreground">
                  Urgency
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Time-sensitive items (overdue, due today/soon) always appear
                  first
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <ArrowRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </span>
              <div>
                <span className="text-xs font-medium text-foreground">
                  Recency
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Notes you've edited recently or have active tasks stay visible
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                <Flag className="h-3 w-3 text-violet-600 dark:text-violet-400" />
              </span>
              <div>
                <span className="text-xs font-medium text-foreground">
                  Your Intent
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Pinned and high-priority items are given prominence
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-[11px] text-muted-foreground">
              <strong>You're in control:</strong> Snooze notes to hide them
              temporarily, dismiss suggestions you don't need, or pin notes to
              always keep them visible here.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function SmartPriority({
  data,
  onViewNote,
  onDismiss,
  onSnoozeNote,
  onDismissNote,
  onToggleFocusPin,
  isLoading,
}: SmartPriorityProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Don't render if no data or all sections empty
  const hasContent =
    data &&
    (data.urgent.length > 0 ||
      data.active.length > 0 ||
      data.suggested.length > 0 ||
      data.focusPinned.length > 0)

  if (isLoading) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            <div className="h-2 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!hasContent) {
    return null
  }

  const { urgent, active, suggested, focusPinned, insights, snoozedCount } = data!
  const totalItems =
    urgent.length + active.length + suggested.length + focusPinned.length

  return (
    <div className="mb-6 rounded-xl border border-border bg-card/50 overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">
                  Smart Priority
                </h2>
                <p className="text-xs text-muted-foreground">
                  {totalItems} note{totalItems > 1 ? "s" : ""} ranked by urgency,
                  recency & intent
                  {snoozedCount > 0 && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      · {snoozedCount} snoozed
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <CollapsibleContent>
          <div className="p-4 space-y-5">
            {/* Insights */}
            {insights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </div>
            )}

            {/* Focus Pinned section - User's explicit pins */}
            {focusPinned.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <Star className="h-3 w-3 fill-current" />
                  Your Focus
                </h3>
                <div className="grid gap-2">
                  {focusPinned.map((item) => (
                    <PriorityCard
                      key={item.note._id}
                      item={item}
                      onClick={() => onViewNote(item.note)}
                      onSnooze={(d) => onSnoozeNote(item.note._id, d)}
                      onDismiss={() => onDismissNote(item.note._id)}
                      onToggleFocusPin={() => onToggleFocusPin(item.note._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Urgent section */}
            {urgent.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Needs Attention
                </h3>
                <div className="grid gap-2">
                  {urgent.map((item) => (
                    <PriorityCard
                      key={item.note._id}
                      item={item}
                      onClick={() => onViewNote(item.note)}
                      onSnooze={(d) => onSnoozeNote(item.note._id, d)}
                      onDismiss={() => onDismissNote(item.note._id)}
                      onToggleFocusPin={() => onToggleFocusPin(item.note._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active section */}
            {active.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Currently Active
                </h3>
                <div className="grid gap-2">
                  {active.map((item) => (
                    <PriorityCard
                      key={item.note._id}
                      item={item}
                      onClick={() => onViewNote(item.note)}
                      onSnooze={(d) => onSnoozeNote(item.note._id, d)}
                      onDismiss={() => onDismissNote(item.note._id)}
                      onToggleFocusPin={() => onToggleFocusPin(item.note._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested section */}
            {suggested.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2 flex items-center gap-2">
                  <Pin className="h-3 w-3" />
                  Quick Access
                </h3>
                <div className="grid gap-2">
                  {suggested.map((item) => (
                    <PriorityCard
                      key={item.note._id}
                      item={item}
                      onClick={() => onViewNote(item.note)}
                      onSnooze={(d) => onSnoozeNote(item.note._id, d)}
                      onDismiss={() => onDismissNote(item.note._id)}
                      onToggleFocusPin={() => onToggleFocusPin(item.note._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="pt-3 border-t border-border/50">
              <HowItWorks />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default SmartPriority
