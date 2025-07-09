"use client";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { getUsers } from "@/redux/features/admin/users/usersThunks";
import { getStaffProfiles } from "@/redux/features/staff/staffThunks";

const useWebSocketHandler = (onError?: (error: string) => void) => {
  const socketRef = useRef<any>(null);

  const dispatch = useAppDispatch();
  const { accountData } = useAppSelector((state) => state.accountData);
  const organisationId = accountData?.organisationId._id;
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((tab: any) =>
    tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
  );

  const hasActionAccess = (action: string) => {
    return accountPermittedActions.includes(action);
  };

  const handleDataFetch = async (collectionName: string) => {
    console.log("Handling data fetch for collection:", collectionName);
    try {
      if ((hasActionAccess("View Roles") || accountData.roleId.absoluteAdmin) && collectionName === "roles") {
        console.log("Fetching roles access");
        const response = await dispatch(fetchRolesAccess()).unwrap();
        console.log("Roles access fetched:", response);
      }
      if ((hasActionAccess("View Users") || accountData.roleId.absoluteAdmin) && collectionName === "accounts") {
        console.log("Fetching users");
        const response = await dispatch(getUsers()).unwrap();
        console.log("Users fetched:", response);
      }
      if ((hasActionAccess("View Staff") || accountData.roleId.absoluteAdmin) && collectionName === "staffs") {
        console.log("Fetching staff profiles");
        const response = await dispatch(getStaffProfiles()).unwrap();
        console.log("Staff profiles fetched:", response);
      }
    } catch (error: any) {
      if (onError) onError(error || "An error occurred while fetching data");
    }
  };
  useEffect(() => {
    if (!organisationId) return;

    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("Connected to io server");
      if (!organisationId) {
        console.log("missing organisation id");
        return;
      }

      // Join the organisation room
      socketRef.current.emit("joinOrgRoom", {
        organisationId,
        accountName: accountData?.accountName
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socketRef.current.on("databaseChange", (collectionName: string) => {
      console.log("📥 Received databaseChange for:", collectionName);
      handleDataFetch(collectionName);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [organisationId]);
  return {};
};

export default useWebSocketHandler;
