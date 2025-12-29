import "./Profile.css"
import Navbar from "../Navbar";
import AxiosInstance from "../../utils/AxiosInstance";
import { useEffect, useState } from "react";
import prof from "../../assets/IroncladDev.jpg"
import { IoIosClose } from "react-icons/io";
import { Link } from "react-router-dom";

type UserDetails = {
  username: string,
  email: string,
  createdOn: string
}

function Profile() {

  const [userDetails, setUserDetails] = useState<UserDetails>({
    username: "",
    email: "",
    createdOn: ""
  });
  const getUserDetails = async () => {
    const email = localStorage.getItem("email");
    console.log(email);
    try {
      const response = await AxiosInstance.get(`/userEmail/${email}`);
      if (!response.data.error) {
        setUserDetails(response.data.user);
        console.log(response.data.user);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUserDetails();
  }, [])

  return (
    <div className="profileContainer">
      <Navbar />
      <div className="container profileContent ">
        <span className="closeBtn">
          <Link className={"link"} to="/dashboard">
            <IoIosClose />
          </Link>
        </span>
        <h1 className="header">Your Details</h1>
        <div className="profileImageContainer" style={{
          backgroundImage: `url(${prof})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
        </div>
        <div className="profileDetails">
          <p><span className="header">Username: </span> {userDetails.username}</p>
          <p><span className="header">Email: </span> {userDetails.email}</p>
          <p><span className="header">Date joined: </span> {
            new Date(userDetails.createdOn).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })
          }</p>
        </div>
      </div>
    </div>
  )
}

export default Profile