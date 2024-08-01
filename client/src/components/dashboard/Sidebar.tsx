// src/components/Sidebar.js

import React, { useState } from "react";
import { FaCog, FaUser, FaBars } from "react-icons/fa";

export const Sidebar = ({
  activeSection,
  setActiveSection,
}: {
  activeSection: string;
  setActiveSection: (state: string) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  return (
    <div
      className={`hidden md:flex flex-col h-full ${
        isCollapsed ? "w-16" : "w-64"
      } bg-white shadow-lg ab`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && <h2 className="text-2xl font-semibold">Dashboard</h2>}
        <button onClick={toggleSidebar} className="focus:outline-none">
          <FaBars size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1">
        <ul>
          <li>
            <button
              className={`flex items-center px-4 py-3 w-full text-left ${
                activeSection === "Profile"
                  ? "bg-[#19303d] text-white font-bold"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveSection("Profile")}
            >
              <FaUser className="mr-3" />
              {!isCollapsed && <span>Profile</span>}
            </button>
          </li>
          <li>
            <button
              className={`flex items-center px-4 py-3 w-full text-left ${
                activeSection === "Settings"
                  ? "bg-[#19303d] text-white font-bold"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveSection("Settings")}
            >
              <FaCog className="mr-3" />
              {!isCollapsed && <span>Settings</span>}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
