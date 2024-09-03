import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authClient from "../services/authService";
import userImg from "../assets/z-user.svg";
import { LogOutIcon } from "../assets/icons";

function DropdownProfile() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseLeave={() => setDropdownOpen(false)}
    >
      {dropdownOpen && (
        <div className="cursor-pointer hover:scale-110 mb-2">
          <Link
            to="/login"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              authClient.get(
                "auth/logout",
                sessionStorage.getItem("authToken")
              );
              sessionStorage.removeItem("authToken");
              sessionStorage.removeItem("userData");
              sessionStorage.removeItem("appData");
              navigate("/login", { replace: true });
            }}
          >
            <LogOutIcon />
          </Link>
        </div>
      )}
      <button
        className="inline-flex justify-center items-center group cursor-pointer hover:scale-110 "
        aria-haspopup="true"
        onMouseEnter={() => setDropdownOpen(true)}
        aria-expanded={dropdownOpen}
      >
        <img
          src={userImg}
          alt="User"
          style={{
            width: "40px",
            height: "40px",
          }}
        />
        <div className="flex items-center truncate"></div>
      </button>
    </div>
  );
}

export default DropdownProfile;
