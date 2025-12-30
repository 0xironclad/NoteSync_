import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { FileText, User, LogOut } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import SearchBar from "./Searchbar/SearchBar"
import AxiosInstance from "../utils/AxiosInstance"

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem("email")
      if (email) {
        try {
          const response = await AxiosInstance.get(`/userEmail/${email}`)
          if (!response.data.error) {
            setUsername(response.data.user.username)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    fetchUser()
  }, [])

  const onClearSearch = () => {
    setSearchQuery("")
  }

  const onSearch = () => {}

  const onLogout = async () => {
    try {
      const response = await AxiosInstance.get("/logout")
      if (response.status === 200) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("email")
        window.location.href = "/login"
      } else {
        throw new Error("Error logging out")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">NoteSync</span>
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <SearchBar
              value={searchQuery}
              onChange={({ target }) => {
                setSearchQuery(target.value)
              }}
              onClearSearch={onClearSearch}
              onSearch={onSearch}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {username ? getInitials(username) : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <p className="text-sm font-medium">{username || "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {localStorage.getItem("email")}
                </p>
              </div>
              <div className="mt-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
