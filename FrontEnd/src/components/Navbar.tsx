import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Ironclad from "../assets/IroncladDev.jpg";
import "../styles/Navbar.css";
import SearchBar from "./Searchbar/SearchBar";
import { useState } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import NoteSyncLogo from "../assets/NoteSyncLogo.png";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const onClearSearch = () => {
    setSearchQuery("");
  };

  const onSearch = () => { };

  const onLogout = async () => {
    try {
      const response = await AxiosInstance.get("/logout");
      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        window.history.pushState(null, "", "/login");
        console.log("Logged out successfully");
      } else {
        throw new Error("Error logging out");
      }

    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary p-2 border-2">
        <div className="container-fluid">
          <Link to="/dashboard" className="navbar-brand">
            <img src={NoteSyncLogo} alt="NoteSync Logo" width={150} />
          </Link>
        </div>
        <div className="serachbar">
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => {
              setSearchQuery(target.value);
            }}
            onClearSearch={onClearSearch}
            onSearch={onSearch}
          />
        </div>
        <Popover>
          <PopoverTrigger>
            <Avatar>
              <AvatarImage src={Ironclad} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent>
            <ul>
              <li>
                <Link className="link" to="/profile">
                  Profile
                </Link>
              </li>
              <li>
                {/* logout */}
                <button className="link" onClick={onLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </nav>
    </div>
  );
}

export default Navbar;
