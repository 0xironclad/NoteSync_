import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Tag, Search, Pin, ArrowRight } from "lucide-react"
import MainNavbar from "./MainNavbar"

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Capture Your Thoughts,{" "}
              <span className="text-primary">Anywhere</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Organize your ideas effortlessly with a simple, intuitive note-taking
              experience. Write, tag, and find your notes in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Overlapping Cards Preview */}
          <div className="relative mt-20 max-w-4xl mx-auto">
            <div className="relative">
              {/* Background Card */}
              <Card className="absolute -left-4 top-8 w-72 rotate-[-6deg] opacity-60 hidden md:block">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Pinned</span>
                  </div>
                  <h3 className="font-semibold mb-2">Meeting Notes</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    Discussed Q4 goals and roadmap priorities with the team...
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-secondary px-2 py-1 rounded">work</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">important</span>
                  </div>
                </CardContent>
              </Card>

              {/* Middle Card */}
              <Card className="relative z-10 mx-auto w-80 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                  <h3 className="font-semibold mb-2">Project Ideas</h3>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    Build a note-taking app with tagging support, search functionality,
                    and the ability to pin important notes for quick access.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">ideas</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">project</span>
                  </div>
                </CardContent>
              </Card>

              {/* Right Card */}
              <Card className="absolute -right-4 top-12 w-72 rotate-[6deg] opacity-60 hidden md:block">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">2 tags</span>
                  </div>
                  <h3 className="font-semibold mb-2">Shopping List</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    Groceries for the week: milk, eggs, bread, vegetables...
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-secondary px-2 py-1 rounded">personal</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">todo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple yet powerful features to help you stay organized and productive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Quick Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Create and edit notes instantly with a clean, distraction-free interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Smart Tagging</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your notes with custom tags for easy categorization.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant Search</h3>
                <p className="text-sm text-muted-foreground">
                  Find any note in seconds with powerful full-text search.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-0 bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="mb-8 opacity-90">
                Join thousands of users who organize their thoughts with NoteSync.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/register">
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 NoteSync. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
