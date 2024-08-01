import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";

export const Profile = () => {
  const member = useSelector((state: RootState) => state.memberReducer.member);

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="flex flex-col w-fill md:w-1/2 gap-5 bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4"> User Details </h2>
        <div className="w-20 h-20 rounded-full bg-gray-100">
          <img
            alt="Stytch_Logo.png"
            className="w-50 h-50"
            src="Stytch_Logo.png"
          />
        </div>
        <p className="flex gap-8 ">
          <strong>Name</strong> {member?.name}
        </p>
        <p className="flex gap-8">
          <strong>Email</strong> {member?.email}
        </p>
        <p className="flex gap-8">
          <strong>Role</strong> {member?.roles.map((role) => role)}
        </p>
      </div>
    </div>
  );
};
