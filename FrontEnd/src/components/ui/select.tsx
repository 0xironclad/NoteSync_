import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

const Select = ({ value, onValueChange, children, placeholder }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const items = React.Children.toArray(children) as React.ReactElement<SelectItemProps>[]
  const selectedItem = items.find(item => item.props.value === value)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input",
            "bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
            "focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className={!selectedItem ? "text-muted-foreground" : ""}>
            {selectedItem ? selectedItem.props.children : placeholder || "Select..."}
          </span>
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  )
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={() => {
        context.onValueChange(value)
        context.setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent",
        className
      )}
    >
      <span className="flex-1 text-left">{children}</span>
      {isSelected && <Check className="h-4 w-4" />}
    </button>
  )
}

export { Select, SelectItem }
