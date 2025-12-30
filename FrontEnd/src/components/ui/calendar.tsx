import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: (date: Date) => boolean
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function Calendar({ selected, onSelect, className, disabled }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState(selected || new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      day === selected.getDate() &&
      month === selected.getMonth() &&
      year === selected.getFullYear()
    )
  }

  const handleSelect = (day: number) => {
    const date = new Date(year, month, day)
    if (disabled?.(date)) return
    onSelect?.(date)
  }

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day)
    return disabled?.(date) ?? false
  }

  // Build calendar grid
  const days: (number | null)[] = []

  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push(null) // We'll show these as empty/muted
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className={cn("p-3 bg-popover rounded-lg border shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-sm">
          {MONTHS[month]} {year}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8 w-8" />
          }

          const dayIsDisabled = isDisabled(day)
          const dayIsSelected = isSelected(day)
          const dayIsToday = isToday(day)

          return (
            <button
              key={day}
              type="button"
              disabled={dayIsDisabled}
              onClick={() => handleSelect(day)}
              className={cn(
                "h-8 w-8 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                dayIsSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                dayIsToday && !dayIsSelected && "bg-accent text-accent-foreground",
                dayIsDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 mt-3 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={() => {
            onSelect?.(new Date())
          }}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-xs"
          onClick={() => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            onSelect?.(tomorrow)
          }}
        >
          Tomorrow
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-7 text-xs text-muted-foreground"
          onClick={() => onSelect?.(undefined)}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}

export { Calendar }
