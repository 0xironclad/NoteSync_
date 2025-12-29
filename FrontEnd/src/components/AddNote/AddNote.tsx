import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import "./AddNote.css";
import { useForm } from "react-hook-form";
import TagAlert from "./TagAlert";
import { IoIosClose } from "react-icons/io";
import AxiosInstance from "../../utils/AxiosInstance";

function AddNote({ fetchData }: { fetchData: () => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [showTagAlert, setShowTagAlert] = useState<boolean>(false);

  // !Validation using react-hook-form
  const { register, handleSubmit, formState: { errors }, setValue, clearErrors, reset } = useForm();

  const onSubmit = async (data: any) => {
    if (tags.length === 0) {
      setShowTagAlert(true);
      return
    }
    console.log(data);
    try {
      const response = await AxiosInstance.post("/add-note", {
        title: data.title,
        content: data.content,
        tags: data.tags
      });
      if (!response.data.error) {
        console.log(response.data.message);
        fetchData();
      }
    } catch (error) {
      console.log(error);

    }
    setTags([]);
    setTitle("");
    setContent("");
    setTag("");
    reset();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value);
  };

  const addTag = () => {
    if (tag.trim() !== "") {
      const newTags = [...tags, tag];
      setTags(newTags);
      setTag("");

      // Update the form state and clear errors
      setValue("tags", newTags);
      clearErrors("tags");
      setShowTagAlert(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
  }

  const btnStyle = { background: "orangered", padding: "8px", color: "white", borderRadius: "5px", fontSize: "0.9em", width: "100%" };


  return (
    <div className="add-Note">
      {showTagAlert && <TagAlert />}
      <Popover>
        <PopoverTrigger>
          <button type="button" style={btnStyle}>Add note</button>
        </PopoverTrigger>
        <PopoverContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <br />
              <input
                {...register("title", { required: "Title is required" })}
                type="text"
                placeholder="Title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <br />
              {errors.title && <p className="error">{errors.title.message?.toString()}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <br />
              <textarea
                {...register("content", { required: "Description is required" })}
                placeholder="Content"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <br />
              {errors.content && <p className="error">{errors.content.message?.toString()}</p>}
            </div>
            <div className="form-group tags">
              <input
                type="text"
                placeholder="Enter tag e.g, work"
                value={tag}
                onChange={handleChange}
              />
              <button type="button" onClick={addTag}>
                +
              </button>
            </div>
            {tags.length > 0 && <div className="form-group">
              <ul className="added-tags">
                {tags.map((t, index) => (
                  <li className="one-tag" key={index}>#{t} <IoIosClose className="close-icon"
                    onClick={() => handleRemoveTag(t)}
                  /></li>
                ))}
              </ul>
            </div>}
            <button type="submit" style={btnStyle}>Add</button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default AddNote;