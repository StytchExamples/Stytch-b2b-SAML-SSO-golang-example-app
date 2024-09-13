import React, { useState } from "react";

import { Sidebar, Profile, Settings } from "../components";

export const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("Profile");

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="flex justify-center w-full flex-grow p-6">
        {activeSection === "Profile" && <Profile />}
        {activeSection === "Settings" && <Settings />}
      </div>
    </div>
  );
};