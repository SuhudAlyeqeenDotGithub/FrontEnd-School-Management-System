"use client";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getUsers } from "@/redux/features/admin/users/usersThunks";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "../shortFunctions";
import axios from "axios";
import StaffProfile from "@/app/main/staff/page";

const useWebSocketHandler = (onError?: (error: string) => void) => {
  const socketRef = useRef<any>(null);

  const dispatch = useAppDispatch();
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const organisationId = accountData?.organisationId._id;
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((group: any) =>
    group.tabs.map((tab: any) =>
      tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
    )
  );

  const queryClient = useQueryClient();
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

  const hasActionAccess = (action: string) => {
    return accountPermittedActions.includes(action);
  };

  const handleDataFetch = async (change: { collection: string; fullDocument: any; changeOperation: string }) => {
    const { collection, fullDocument, changeOperation } = change;
    const userIsAbsoluteAdmin = accountData.roleId.absoluteAdmin;
    try {
      if ((hasActionAccess("View Roles") || userIsAbsoluteAdmin) && collection === "roles") {
        const changedRecordId = fullDocument._id;
        const userRoleId = accountData.roleId._id;
        if (!userIsAbsoluteAdmin && changedRecordId === userRoleId) return;
        if (!queryClient.getQueryData(["roles"])) return;
        if (changeOperation === "insert") {
          queryClient.setQueryData(["roles"], (oldData: any) => {
            return [fullDocument, ...oldData];
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          queryClient.setQueryData(["roles"], (oldData: any) => {
            return oldData.map((role: any) => (role._id === fullDocument._id ? fullDocument : role));
          });
        }
        if (changeOperation === "delete") {
          queryClient.setQueryData(["roles"], (oldData: any) => {
            return oldData.filter((role: any) => role._id !== fullDocument._id);
          });
        }
      }

      // handle users changes
      if ((hasActionAccess("View Users") || userIsAbsoluteAdmin) && collection === "accounts") {
        const changedRecordId = fullDocument.staffId;
        const userStaffId = accountData.staffId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["users"] });

        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (user: any) => {
                return [fullDocument, ...user];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { users: firstPageUsers } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const rolesInCache: any[] | undefined = queryClient.getQueryData(["roles"]);

                    let roleObj;
                    if (rolesInCache && rolesInCache.length > 0) {
                      roleObj = rolesInCache.find((role: any) => role._id === fullDocument.roleId);
                    } else {
                      roleObj = {
                        _id: fullDocument.roleId,
                        roleName: "Please refresh",
                        tabAccess: []
                      };
                    }
                    const staffProfilesInCache: any[] | undefined = queryClient.getQueryData(["staffProfiles"]);
                    let staffProfileObj;
                    if (staffProfilesInCache && staffProfilesInCache.length > 0) {
                      staffProfileObj = staffProfilesInCache.find(
                        (staffProfile: any) => staffProfile._id === fullDocument.staffId
                      );
                    } else {
                      staffProfileObj = {
                        _id: fullDocument.staffId,
                        staffCustomId: "Please refresh",
                        staffName: "Please refresh"
                      };
                    }
                    const returnArray = {
                      ...queryData,
                      pages: [
                        {
                          ...firstPage,
                          users: [{ ...fullDocument, roleId: roleObj, staffId: staffProfileObj }, ...firstPageUsers]
                        },
                        ...queryPages.slice(1)
                      ]
                    };

                    return returnArray;
                  });
                }
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (users: any) => {
                return users.map((user: any) => (user._id === fullDocument._id ? fullDocument : user));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const rolesInCache: any[] | undefined = queryClient.getQueryData(["roles"]);
                let roleObj;
                if (rolesInCache && rolesInCache.length > 0) {
                  roleObj = rolesInCache.find((role: any) => role._id === fullDocument.roleId);
                } else {
                  roleObj = {
                    _id: fullDocument.roleId,
                    roleName: "Please refresh",
                    tabAccess: []
                  };
                }
                const staffProfilesInCache: any[] | undefined = queryClient.getQueryData(["staffProfiles"]);
                let staffProfileObj;
                if (staffProfilesInCache && staffProfilesInCache.length > 0) {
                  staffProfileObj = staffProfilesInCache.find(
                    (staffProfile: any) => staffProfile._id === fullDocument.staffId
                  );
                } else {
                  staffProfileObj = {
                    _id: fullDocument.staffId,
                    staffCustomId: "Please refresh",
                    staffName: "Please refresh"
                  };
                }
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    users: page.users.map((user: any) =>
                      user._id === fullDocument._id
                        ? { ...fullDocument, roleId: roleObj, staffId: staffProfileObj }
                        : user
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
        if (changeOperation === "delete") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (users: any) => {
                return users.filter((user: any) => user._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    users: page.users.filter((user: any) => user._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle staff contract changes
      if ((hasActionAccess("View Staff Contracts") || userIsAbsoluteAdmin) && collection === "staffcontracts") {
        const changedRecordId = fullDocument._id;
        const userStaffId = accountData.staffId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["staffContracts"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (contract: any) => {
                return [fullDocument, ...contract];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { staffContracts: firstPageStaffContracts } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, staffContracts: [fullDocument, ...firstPageStaffContracts] },
                        ...queryPages.slice(1)
                      ]
                    };

                    return returnArray;
                  });
                }
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (contracts: any) => {
                return contracts.map((contract: any) => (contract._id === fullDocument._id ? fullDocument : contract));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    staffContracts: page.staffContracts.map((contract: any) =>
                      contract._id === fullDocument._id ? fullDocument : contract
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
        if (changeOperation === "delete") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (contracts: any) => {
                return contracts.filter((contract: any) => contract._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    staffContracts: page.staffContracts.filter((contract: any) => contract._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle academic year change stream
      if ((hasActionAccess("View Academic Years") || userIsAbsoluteAdmin) && collection === "academicyears") {
        if (!queryClient.getQueryData(["academicYears"])) return;
        console.log("fullDocument", fullDocument);
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
      if ((hasActionAccess("View Academic Years") || userIsAbsoluteAdmin) && collection === "periods") {
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
      // handle staffs profile changes
      if ((hasActionAccess("View Staff Profiles") || userIsAbsoluteAdmin) && collection === "staffs") {
        const changedRecordId = fullDocument._id;
        const userStaffId = accountData.staffId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["staffProfiles"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (profiles: any) => {
                return [fullDocument, ...profiles];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { staffProfiles: firstPageStaffProfiles } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, staffProfiles: [fullDocument, ...firstPageStaffProfiles] },
                        ...queryPages.slice(1)
                      ]
                    };

                    return returnArray;
                  });
                }
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (profiles: any) => {
                return profiles.map((profile: any) => (profile._id === fullDocument._id ? fullDocument : profile));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    staffProfiles: page.staffProfiles.map((profile: any) =>
                      profile._id === fullDocument._id ? fullDocument : profile
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
        if (changeOperation === "delete") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (profiles: any) => {
                return profiles.filter((profile: any) => profile._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    staffProfiles: page.staffProfiles.filter((profile: any) => profile._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }
      if ((hasActionAccess("View Staff Contracts") || userIsAbsoluteAdmin) && collection === "staffcontracts") {
        queryClient.invalidateQueries({ queryKey: ["staffContracts"] });
      }

      // handle students profile changes
      if ((hasActionAccess("View Student Profiles") || userIsAbsoluteAdmin) && collection === "students") {
        const changedRecordId = fullDocument._id;
        const userStudentId = accountData.studentId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStudentId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["studentProfiles"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (profiles: any) => {
                return [fullDocument, ...profiles];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { studentProfiles: firstPageStudentProfiles } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, studentProfiles: [fullDocument, ...firstPageStudentProfiles] },
                        ...queryPages.slice(1)
                      ]
                    };

                    return returnArray;
                  });
                }
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (profiles: any) => {
                return profiles.map((profile: any) => (profile._id === fullDocument._id ? fullDocument : profile));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    studentProfiles: page.studentProfiles.map((profile: any) =>
                      profile._id === fullDocument._id ? fullDocument : profile
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
        if (changeOperation === "delete") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (profiles: any) => {
                return profiles.filter((profile: any) => profile._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    studentProfiles: page.studentProfiles.filter((profile: any) => profile._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle programmes changes
      if ((hasActionAccess("View Programme") || userIsAbsoluteAdmin) && collection === "programmes") {
        const changedRecordId = fullDocument._id;
        const userStudentId = accountData.programmeId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStudentId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["programmes"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (programmes: any) => {
                return [fullDocument, ...programmes];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { programmes: firstPageProgrammes } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, programmes: [fullDocument, ...firstPageProgrammes] },
                        ...queryPages.slice(1)
                      ]
                    };

                    return returnArray;
                  });
                }
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (programmes: any) => {
                return programmes.map((programme: any) =>
                  programme._id === fullDocument._id ? fullDocument : programme
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    programmes: page.programmes.map((programme: any) =>
                      programme._id === fullDocument._id ? fullDocument : programme
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
        if (changeOperation === "delete") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (programmes: any) => {
                return programmes.filter((programme: any) => programme._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    programmes: page.programmes.filter((programme: any) => programme._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }
    } catch (error: any) {
      if (onError) onError(error || "An error occurred while fetching data");
    }
  };

  return {};
};

export default useWebSocketHandler;
