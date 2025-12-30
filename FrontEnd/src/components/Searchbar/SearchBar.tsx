import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
  onClearSearch: () => void
}

function SearchBar({ value, onChange, onSearch, onClearSearch }: SearchBarProps) {
  return (
    <div className="relative flex items-center w-full">
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search notes..."
        className="pr-16"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch()
          }
        }}
      />
      {value && (
        <button
          onClick={onClearSearch}
          className="absolute right-10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onSearch}
        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  )
}

export default SearchBar
