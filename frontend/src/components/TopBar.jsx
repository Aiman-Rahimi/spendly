import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";

const TopBar = () => {
  const [dropdown, setDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [userName, setUserName] = useState("User");
  const [avatar, setAvatar] = useState("");

  const navigate = useNavigate();

  // ✅ Load user data (Firebase / localStorage)
  useEffect(() => {
    const name = localStorage.getItem("name");
    const photo = localStorage.getItem("photo");

    if (name) setUserName(name);

    if (photo) {
      setAvatar(photo);
    } else {
      // fallback avatar (professional, not image file)
      const initial = (name || "U").charAt(0).toUpperCase();
      setAvatar(
        `https://ui-avatars.com/api/?name=${initial}&background=6366f1&color=fff&bold=true`
      );
    }
  }, []);

  const toggleDropdown = () => {
    setDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <>
      <div className="ml-64 h-16 px-6 flex items-center justify-between border-b bg-white z-10">
        
        {/* Search */}
        <input
          className="bg-gray-100 p-2 rounded w-1/3 outline-none"
          type="text"
          placeholder="Search"
        />

        {/* Right section */}
        <div className="flex items-center space-x-6">
          
          <BellIcon className="h-5 w-5 text-gray-600" />

          {/* Profile */}
          <div className="relative">

            <button
              className="flex items-center space-x-2"
              onClick={toggleDropdown}
            >
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={avatar}
                alt="Profile"
              />

              <span className="text-sm font-medium text-gray-700">
                {userName}
              </span>

              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-md z-10">

                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Your profile
                </button>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                >
                  Sign out
                </button>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default TopBar;