import { Input } from "../../components/ui/input"
import { CiSearch } from "react-icons/ci";
import "../../styles/Navbar.css"
import { IoIosClose } from "react-icons/io";

function SearchBar({ value, onChange, onSearch, onClearSearch }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSearch: () => void, onClearSearch: () => void }) {
    return (
        <div className="search-bar">
            <Input
                value={value}
                onChange={onChange}
                placeholder="Search notes"
            />
            {value && <IoIosClose className="clear-icon" onClick={onClearSearch} />}
            <CiSearch className="search-icon" onClick={onSearch} />
        </div>
    )
}

export default SearchBar