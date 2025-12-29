import { MdOutlinePushPin } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import './NoteCard.css'

interface NoteCardProps {
    title: string
    date: string
    content: string
    tags: string[]
    isPinned: boolean
    onEdit: () => void
    onDelete: () => void
    onPin: () => void
}

function NoteCard({ title, date, content, tags, isPinned, onEdit, onDelete, onPin }: NoteCardProps) {
    return (
        <div className="card">
            <div className="cardHeader">
                <div className="title-date">
                    <h3>{title}</h3>
                    <p>{date}</p>
                </div>
                <MdOutlinePushPin className="pin" onClick={onPin} style={{ color: isPinned ? "orange" : "" }} />
            </div>
            <div className="c-body">
                <p>{content}</p>
            </div>
            <div className="c-footer">
                <div className="tags ">
                    {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
                <div className="actions">
                    <FiEdit2 onClick={onEdit} />
                    <AiOutlineDelete onClick={onDelete} />
                </div>
            </div>

        </div>
    )
}

export default NoteCard