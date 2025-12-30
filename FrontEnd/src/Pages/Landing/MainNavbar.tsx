import NoteSyncLogo from "@/assets/NoteSyncLogo.png"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

function MainNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={NoteSyncLogo} alt="NoteSync Logo" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              to="/features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MainNavbar
