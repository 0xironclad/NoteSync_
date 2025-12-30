import Navbar from "./Navbar"
import NoteCard from "./NoteCard/NoteCard"
import AddNote from "./AddNote/AddNote"
import AxiosInstance from "../utils/AxiosInstance"

type Note = {
  _id: string,
  title: string,
  date: string,
  content: string,
  tags: string[],
  isPinned: boolean
}

function Dashboard({ notes, fetchData }: { notes: Note[], fetchData: () => void }) {

  const onEdelete = async (id: string) => {
    const response = await AxiosInstance.delete(`/delete-note/${id}`)
    if (!response.data.error) {
      fetchData()
      console.log("Note Deleted successfully!")
    }
    else {
      console.log("Error deleting note")
    }
  }

  const onPin = async (id: string) => {
    const response = await AxiosInstance.put(`/update-pin/${id}`)
    if (!response.data.error) {
      fetchData()
      console.log("Note Pinned successfully!")
    }
    else {
      console.log("Error pinning note")
    }
  }
  return (
    <div className="relative w-full min-h-screen overflow-y-auto bg-background">
      <Navbar />
      <AddNote fetchData={fetchData} />

      <div className="container mx-auto px-4 pt-6 pb-24">
        <div className="flex flex-wrap gap-4">
          {notes.map((note: Note) => {
            return <NoteCard
              key={note._id}
              title={note.title}
              date={note.date}
              content={note.content}
              tags={note.tags.map((tag: string) => `#${tag}`)}
              isPinned={note.isPinned}
              onEdit={() => console.log("Edit")}
              onDelete={() => onEdelete(note._id)}
              onPin={() => onPin(note._id)}
            />
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
