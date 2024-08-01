import React, { useCallback, useEffect } from "react";

import { useStytchMember, useStytchMemberSession } from "@stytch/react/b2b";
import { Sidebar, Profile, Settings } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../utils";
import { RootState } from "../store/reducers";
import { useNavigate } from "react-router-dom";
import { RoleSource } from "./interfaces";

export const Dashboard: React.FC = () => {
  const { member } = useStytchMember();
  const { session } = useStytchMemberSession();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const reduxMember = useSelector(
    (state: RootState) => state.memberReducer.member
  );

  const activeSection = useSelector(
    (state: RootState) => state.dashboardReducer.activeSection
  );

  const getProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/profile/${member?.member_id}`);

      dispatch({
        type: "SET_MEMBER",
        payload: {
          ...response.data.data.member,
          roles: member?.roles.map(
            (role: { role_id: string; sources: RoleSource[] }) => role.role_id
          ),
        },
      });

      dispatch({
        type: "SET_TENANT",
        payload: response.data.data.member.tenant,
      });
    } catch (error) {
      console.error({ error });
    }
  }, [dispatch, member]);

  const checkSession = useCallback(() => {
    if (!session) {
      navigate("/"); // Redirect to the home page
    }
  }, [session, navigate]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!reduxMember) {
      getProfile();
    }
  }, [getProfile]);

  const setActiveSection = (section: string) => {
    dispatch({
      type: "SET_DASHBOARD_INTERFACE",
      payload: { activeSection: section },
    });
  };

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
