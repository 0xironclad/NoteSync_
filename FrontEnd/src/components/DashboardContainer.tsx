import { useEffect, useState } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import Dashboard from "./Dashboard";

function DashboardContainer() {
    const [notes, setNotes] = useState([]);
    const [isSearchNote, setIsSearchNote] = useState(false);

    const onSearchNote = async (searchText: string) => {
        // search param is used as the query parameter in the backend
        const searchParam = searchText.trim(); // remove leading and trailing whitespaces
        if (searchParam === "") {
            setIsSearchNote(false);
            fetchData();
            return;
        }
        const token = localStorage.getItem("accessToken");
        try {
            const response = await AxiosInstance.get(`/search-note?query=${searchParam}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.data.error) {
                setNotes(response.data.notes);
                setIsSearchNote(true);
            } else {
                console.log("Error: ", response.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const fetchData = async () => {
        const token = localStorage.getItem("accessToken");
        // console.log(token);
        try {
            const response = await AxiosInstance.get("/all-notes", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.data.error) {
                setNotes(response.data.notes);
            } else {
                console.log("Error: ", response.data.message);
            }
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        fetchData();
    }, [])
  return (
    <>
        <Dashboard notes={notes} fetchData = {fetchData}
        />
    </>
  )
}

export default DashboardContainer