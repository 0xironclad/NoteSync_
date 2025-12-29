import Navbar from "./Navbar"
import NoteCard from "./NoteCard/NoteCard"
import './Dashboard.css'
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
    <div className="dashboard">
      <Navbar />
      <AddNote fetchData={fetchData} />

      <div className="notes container ">
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
  )
}

export default Dashboard