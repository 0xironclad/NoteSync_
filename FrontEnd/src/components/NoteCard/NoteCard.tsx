import { Pin, Trash2, Edit2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
        <Card className="flex-1 min-w-[200px] max-w-[250px] h-[300px] bg-gradient-to-br from-slate-900 to-primary border-0">
            <CardContent className="p-4 h-full flex flex-col justify-between text-white">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start">
                            <h3 className="font-semibold text-base">{title}</h3>
                            <p className="text-xs text-white/70">{date}</p>
                        </div>
                        <Pin
                            className={`h-5 w-5 cursor-pointer transition-colors ${isPinned ? 'text-orange-400' : 'text-white/50 hover:text-white/80'}`}
                            onClick={onPin}
                        />
                    </div>
                    <div className="text-sm text-white/90 line-clamp-6">
                        <p>{content}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <div className="flex flex-wrap gap-1 text-xs text-white/70">
                        {tags.map(tag => <span key={tag}>{tag}</span>)}
                    </div>
                    <div className="flex gap-2 items-center">
                        <Edit2
                            className="h-4 w-4 cursor-pointer text-white/50 hover:text-white/80 transition-colors"
                            onClick={onEdit}
                        />
                        <Trash2
                            className="h-4 w-4 cursor-pointer text-white/50 hover:text-red-400 transition-colors"
                            onClick={onDelete}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default NoteCard
