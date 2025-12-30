import React, { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { X, Plus } from "lucide-react"
import TagAlert from "./TagAlert"
import AxiosInstance from "../../utils/AxiosInstance"

function AddNote({ fetchData }: { fetchData: () => void }) {
  const [tags, setTags] = useState<string[]>([])
  const [tag, setTag] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [showTagAlert, setShowTagAlert] = useState<boolean>(false)
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, clearErrors, reset } = useForm()

  const onSubmit = async (data: unknown) => {
    if (tags.length === 0) {
      setShowTagAlert(true)
      setTimeout(() => setShowTagAlert(false), 3000)
      return
    }
    try {
      const formData = data as { title: string; content: string; tags: string[] }
      const response = await AxiosInstance.post("/add-note", {
        title: formData.title,
        content: formData.content,
        tags: formData.tags
      })
      if (!response.data.error) {
        console.log(response.data.message)
        fetchData()
        setOpen(false)
      }
    } catch (error) {
      console.log(error)
    }
    setTags([])
    setTitle("")
    setContent("")
    setTag("")
    reset()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value)
  }

  const addTag = () => {
    if (tag.trim() !== "") {
      const newTags = [...tags, tag]
      setTags(newTags)
      setTag("")
      setValue("tags", newTags)
      clearErrors("tags")
      setShowTagAlert(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove)
    setTags(newTags)
    setValue("tags", newTags)
  }

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {showTagAlert && <TagAlert />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="lg" className="shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Note
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                Title
              </label>
              <Input
                {...register("title", { required: "Title is required" })}
                id="title"
                type="text"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="content">
                Content
              </label>
              <textarea
                {...register("content", { required: "Content is required" })}
                id="content"
                placeholder="Write your note..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message?.toString()}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a tag"
                  value={tag}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="icon" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                  >
                    #{t}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(t)}
                    />
                  </span>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full">
              Add Note
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default AddNote
