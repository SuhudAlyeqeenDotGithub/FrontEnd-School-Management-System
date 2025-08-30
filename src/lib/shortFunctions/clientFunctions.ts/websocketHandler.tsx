"use client";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { getUsers } from "@/redux/features/admin/users/usersThunks";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "../shortFunctions";
import axios from "axios";
import NewAcademicYearComponent from "@/lib/customComponents/academicYear/newAcademicYearComp";

const useWebSocketHandler = (onError?: (error: string) => void) => {
  const socketRef = useRef<any>(null);

  const dispatch = useAppDispatch();
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const organisationId = accountData?.organisationId._id;
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((tab: any) =>
    tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
  );
  const queryClient = useQueryClient();

  const hasActionAccess = (action: string) => {
    return accountPermittedActions.includes(action);
  };

  const handleDataFetch = async (change: { collection: string; fullDocument: any; changeOperation: string }) => {
    const { collection, fullDocument, changeOperation } = change;
    console.log("WebSocket change received:", change);
    console.log("fullDocument:", fullDocument);
    try {
      if ((hasActionAccess("View Roles") || accountData.roleId.absoluteAdmin) && collection === "roles") {
        const response = await dispatch(fetchRolesAccess()).unwrap();
      }
      if ((hasActionAccess("View Users") || accountData.roleId.absoluteAdmin) && collection === "accounts") {
        const response = await dispatch(getUsers()).unwrap();
      }
      if ((hasActionAccess("View Staff") || accountData.roleId.absoluteAdmin) && collection === "staffs") {
        queryClient.invalidateQueries({ queryKey: ["staffProfiles"] });
      }

      // handle academic year change stream
      if (
        (hasActionAccess("View Academic Years") || accountData.roleId.absoluteAdmin) &&
        collection === "academicyears"
      ) {
        if (!queryClient.getQueryData(["academicYears"])) return;
        if (changeOperation === "insert") {
          queryClient.setQueryData(["academicYears"], (oldData: any) => {
            return [fullDocument, ...oldData];
          });
        }

        if (changeOperation === "update" || changeOperation === "replace") {
          queryClient.setQueryData(["academicYears"], (oldData: any) => {
            const oldPeriods = oldData.find((academicYear: any) => academicYear._id === fullDocument._id)?.periods;
            const updatedAcademicYear = {
              ...fullDocument,
              periods: [...oldPeriods]
            };
            return oldData.map((academicYear: any) =>
              academicYear._id === fullDocument._id ? updatedAcademicYear : academicYear
            );
          });
        }
        if (changeOperation === "delete") {
          queryClient.setQueryData(["academicYears"], (oldData: any) => {
            const newData = oldData.filter((academicYear: any) => academicYear._id !== fullDocument._id);
            return newData;
          });
          if (queryClient.getQueryData(["periods"])) {
            queryClient.setQueryData(["periods"], (oldData: any) => {
              return oldData.filter((period: any) => period.academicYearId !== fullDocument._id);
            });
          }
        }
      }

      // handle period change stream
      if ((hasActionAccess("View Academic Years") || accountData.roleId.absoluteAdmin) && collection === "periods") {
        const newPeriod = fullDocument;
        // update periods cache
        if (queryClient.getQueryData(["periods"])) {
          if (changeOperation === "insert") {
            queryClient.setQueryData(["periods"], (oldData: any) => {
              return [newPeriod, ...oldData];
            });
          }
          if (changeOperation === "update" || changeOperation === "replace") {
            queryClient.setQueryData(["periods"], (oldData: any) => {
              return oldData.map((period: any) =>
                period._id === newPeriod._id ? { ...period, ...newPeriod } : period
              );
            });
          }
          if (changeOperation === "delete") {
            queryClient.setQueryData(["periods"], (oldData: any) => {
              return oldData.filter((period: any) => period._id !== newPeriod._id);
            });
          }
        }

        // update period in any related academic year
        if (queryClient.getQueryData(["academicYears"])) {
          if (changeOperation === "insert") {
            queryClient.setQueryData(["academicYears"], (oldData: any) => {
              const updatedAcademicYear = oldData.map((academicYear: any) =>
                academicYear._id === newPeriod.academicYearId && academicYear.academicYear === newPeriod.academicYear
                  ? { ...academicYear, periods: [...(academicYear.periods || []), newPeriod] }
                  : academicYear
              );

              return updatedAcademicYear;
            });
          }

          if (changeOperation === "update" || changeOperation === "replace") {
            queryClient.setQueryData(["academicYears"], (oldData: any) => {
              const updatedAcademicYears = oldData.map((academicYear: any) =>
                academicYear._id === newPeriod.academicYearId && academicYear.academicYear === newPeriod.academicYear
                  ? {
                      ...academicYear,
                      periods: academicYear.periods.map((period: any) =>
                        period._id === newPeriod._id ? newPeriod : period
                      )
                    }
                  : academicYear
              );
              return updatedAcademicYears;
            });
          }

          if (changeOperation === "delete") {
            queryClient.setQueryData(["academicYears"], (oldData: any) => {
              const updatedAcademicYears = oldData.map((academicYear: any) =>
                academicYear._id === newPeriod.academicYearId && academicYear.academicYear === newPeriod.academicYear
                  ? {
                      ...academicYear,
                      periods: academicYear.periods.filter((period: any) => period._id !== newPeriod._id)
                    }
                  : academicYear
              );
              return updatedAcademicYears;
            });
          }
        }
      }

      if (
        (hasActionAccess("View Staff Contracts") || accountData.roleId.absoluteAdmin) &&
        collection === "staffcontracts"
      ) {
        queryClient.invalidateQueries({ queryKey: ["staffContracts"] });
      }
    } catch (error: any) {
      if (onError) onError(error || "An error occurred while fetching data");
    }
  };
  useEffect(() => {
    if (!organisationId) return;

    socketRef.current = io(BASE_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: false
    });

    socketRef.current.on("connect", () => {
      if (!organisationId) {
        return;
      }

      // Join the organisation room
      socketRef.current.emit("joinOrgRoom", {
        organisationId,
        accountName: accountData?.accountName
      });
    });

    socketRef.current.on("disconnect", () => {});

    socketRef.current.on("reconnect_attempt", (attemptNumber: number) => {});

    socketRef.current.on("connect_error", async (error: any) => {
      if (error.message == "Invalid token" || error.message == "No Cookies" || error.message == "No Access Token") {
        try {
          const refreshResponse = await axios.post(
            `${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/refreshaccesstoken`,
            {},
            {
              withCredentials: true
            }
          );
          if (refreshResponse.data) {
            socketRef.current.connect();
          }
        } catch (refreshErr: any) {
          const status = refreshErr.response?.status;
          const unAuthorisedRefresh = status === 401 || status === 403;
          try {
            const response = await axios.get(`${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/signout`, {
              withCredentials: true
            });
            if (response) {
              if (unAuthorisedRefresh) window.location.href = "/signin";
              throw refreshErr;
            }
          } catch (error: any) {
            throw refreshErr;
          }
        }
      }
    });

    socketRef.current.on(
      "databaseChange",
      (change: { collection: string; fullDocument: any; changeOperation: string }) => {
        handleDataFetch(change);
      }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [organisationId]);
  return {};
};

export default useWebSocketHandler;
