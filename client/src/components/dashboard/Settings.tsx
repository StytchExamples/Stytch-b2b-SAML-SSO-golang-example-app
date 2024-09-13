import React from "react";
import { AdminPortalSSO } from "@stytch/react/b2b/adminPortal";

export const Settings = () => {
  return (
    <div className="flex  flex-col w-full ">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <AdminPortalSSO />
    </div>
  );
};