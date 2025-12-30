import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { X, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Navbar from "../Navbar"
import AxiosInstance from "../../utils/AxiosInstance"

type UserDetails = {
  username: string
  email: string
  createdOn: string
}

function Profile() {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    username: "",
    email: "",
    createdOn: ""
  })

  const getUserDetails = async () => {
    const email = localStorage.getItem("email")
    try {
      const response = await AxiosInstance.get(`/userEmail/${email}`)
      if (!response.data.error) {
        setUserDetails(response.data.user)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUserDetails()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              asChild
            >
              <Link to="/dashboard">
                <X className="h-5 w-5" />
              </Link>
            </Button>
            <CardTitle className="text-center">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {userDetails.username ? getInitials(userDetails.username) : <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>

            <div className="w-full space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Username</span>
                <span className="font-medium">{userDetails.username}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <span className="font-medium">{userDetails.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {userDetails.createdOn
                    ? new Date(userDetails.createdOn).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile
