import React from "react";
import { FaCog, FaUser } from "react-icons/fa";

export const Sidebar = ({
  activeSection,
  setActiveSection,
}: {
  activeSection: string;
  setActiveSection: (state: string) => void;
}) => {
  return (
    <div className="hidden md:flex flex-col h-full w-64 bg-white shadow-lg">
      <nav className="flex-1">
        <ul className="pt-0">
          <li>
            <button
              className={`flex items-center px-4 py-3 w-full text-left ${
                activeSection === "Profile"
                  ? "bg-gray-200 text-[#19303d] font-bold"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveSection("Profile")}
            >
              <FaUser className="mr-3" />
              <span>Profile</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center px-4 py-3 w-full text-left ${
                activeSection === "Settings"
                  ? "bg-gray-200 text-[#19303d] font-bold"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveSection("Settings")}
            >
              <FaCog className="mr-3" />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
