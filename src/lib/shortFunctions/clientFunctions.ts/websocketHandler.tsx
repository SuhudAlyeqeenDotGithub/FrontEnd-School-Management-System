"use client";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { getUsers } from "@/redux/features/admin/users/usersThunks";
import { getStaffProfiles } from "@/redux/features/staff/staffThunks";
import { getAcademicYears } from "@/redux/features/general/academicYear/academicYearThunk";
import { getStaffContracts } from "@/redux/features/staff/contractThunk";

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
        const response = await dispatch(fetchRolesAccess()).unwrap();
      }
      if ((hasActionAccess("View Users") || accountData.roleId.absoluteAdmin) && collectionName === "accounts") {
        const response = await dispatch(getUsers()).unwrap();
      }
      if ((hasActionAccess("View Staff") || accountData.roleId.absoluteAdmin) && collectionName === "staffs") {
        const response = await dispatch(getStaffProfiles()).unwrap();
      }
      if (
        (hasActionAccess("View Academic Years") || accountData.roleId.absoluteAdmin) &&
        collectionName === "academicyears"
      ) {
        const response = await dispatch(getAcademicYears()).unwrap();
      }
      if (
        (hasActionAccess("View Staff Contracts") || accountData.roleId.absoluteAdmin) &&
        collectionName === "staffcontracts"
      ) {
        const response = await dispatch(getStaffContracts()).unwrap();
      }
    } catch (error: any) {
      if (onError) onError(error || "An error occurred while fetching data");
    }
  };
  useEffect(() => {
    if (!organisationId) return;

    socketRef.current = io("BASE_API_URL");

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
      handleDataFetch(collectionName);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [organisationId]);
  return {};
};

export default useWebSocketHandler;
