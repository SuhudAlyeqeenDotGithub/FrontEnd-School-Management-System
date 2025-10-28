"use client";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector } from "@/redux/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "../shortFunctions";
import axios from "axios";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { handleApiRequest } from "@/axios/axiosClient";

const useWebSocketHandler = (onError?: (error: string) => void) => {
  const socketRef = useRef<any>(null);
  const { hasActionAccess } = reusableQueries();

  const { accountData } = useAppSelector((state: any) => state.accountData);
  const organisationId = accountData?.organisationId._id;
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

  const handleDataFetch = async (change: { collection: string; fullDocument: any; changeOperation: string }) => {
    const { collection, fullDocument, changeOperation } = change;
    console.log("Received change:", change);

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

      // handle activity log
      if ((hasActionAccess("View Activity Logs") || userIsAbsoluteAdmin) && collection === "activitylogs") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["activitylogs"] });
        if (queriesData.length === 0) return;
        try {
          const response = await handleApiRequest("get", "alyeqeenschoolapp/api/admin/lastactivitylog");
          if (response?.data) {
            queriesData.forEach(([queryKey, data]: [any, any]) => {
              const pages = data.pages;
              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { activityLogs: firstPageActivityLogs } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, activityLogs: [response?.data, ...firstPageActivityLogs] },
                        ...queryPages.slice(1)
                      ]
                    };

                    return returnArray;
                  });
                }
              }
            });
          }
        } catch (error: any) {
          throw new Error(error.response?.data.message || error.message || "Error fetching activity logs");
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

      // handle staff contract changes
      if ((hasActionAccess("View Student Enrollments") || userIsAbsoluteAdmin) && collection === "studentenrollments") {
        const changedRecordId = fullDocument._id;
        const userStudentId = accountData.studentId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStudentId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["studentenrollments"] });
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
                  const { studentEnrollments: firstPageStudentEnrollments } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, studentEnrollments: [fullDocument, ...firstPageStudentEnrollments] },
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
                    studentEnrollments: page.studentEnrollments.map((contract: any) =>
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
                    studentEnrollments: page.studentEnrollments.filter(
                      (contract: any) => contract._id !== fullDocument._id
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle programmes changes
      if ((hasActionAccess("View Programmes") || userIsAbsoluteAdmin) && collection === "programmes") {
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

      // handle programme managers changes
      if ((hasActionAccess("View Programme Managers") || userIsAbsoluteAdmin) && collection === "programmemanagers") {
        const changedRecordId = fullDocument.programmeManagerStaffId;
        const userStaffId = accountData.staffId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["programmeManagers"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (programmeManagers: any) => {
                0;
                return [fullDocument, ...programmeManagers];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { programmeManagers: firstPageProgrammeManagers } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, programmeManagers: [fullDocument, ...firstPageProgrammeManagers] },
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
              queryClient.setQueryData(queryKey, (programmeManagers: any) => {
                return programmeManagers.map((programmeManager: any) =>
                  programmeManager._id === fullDocument._id ? fullDocument : programmeManager
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    programmeManagers: page.programmeManagers.map((programmeManager: any) =>
                      programmeManager._id === fullDocument._id ? fullDocument : programmeManager
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
              queryClient.setQueryData(queryKey, (programmeManagers: any) => {
                return programmeManagers.filter((programmeManager: any) => programmeManager._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    programmeManagers: page.programmeManagers.filter(
                      (programmeManager: any) => programmeManager._id !== fullDocument._id
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle courses changes
      if ((hasActionAccess("View Courses") || userIsAbsoluteAdmin) && collection === "courses") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["courses"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (courses: any) => {
                return [fullDocument, ...courses];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { courses: firstPageCourses } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [{ ...firstPage, courses: [fullDocument, ...firstPageCourses] }, ...queryPages.slice(1)]
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
              queryClient.setQueryData(queryKey, (courses: any) => {
                return courses.map((course: any) => (course._id === fullDocument._id ? fullDocument : course));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    courses: page.courses.map((course: any) =>
                      course._id === fullDocument._id ? fullDocument : course
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
              queryClient.setQueryData(queryKey, (courses: any) => {
                return courses.filter((course: any) => course._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    courses: page.courses.filter((course: any) => course._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle course managers changes
      if ((hasActionAccess("View Course Managers") || userIsAbsoluteAdmin) && collection === "coursemanagers") {
        const changedRecordId = fullDocument.courseManagerStaffId;
        const userStaffId = accountData.staffId?._id;

        const queriesData = queryClient.getQueriesData({ queryKey: ["courseManagers"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (courseManagers: any) => {
                0;
                return [fullDocument, ...courseManagers];
              });
            } else {
              if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
              const pages = data.pages;
              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { courseManagers: firstPageCourseManagers } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, courseManagers: [fullDocument, ...firstPageCourseManagers] },
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
              queryClient.setQueryData(queryKey, (courseManagers: any) => {
                return courseManagers.map((courseManager: any) =>
                  courseManager._id === fullDocument._id ? fullDocument : courseManager
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    courseManagers: page.courseManagers.map((courseManager: any) =>
                      courseManager._id === fullDocument._id ? fullDocument : courseManager
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
              queryClient.setQueryData(queryKey, (courseManagers: any) => {
                return courseManagers.filter((courseManager: any) => courseManager._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    courseManagers: page.courseManagers.filter(
                      (courseManager: any) => courseManager._id !== fullDocument._id
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle levels changes
      if ((hasActionAccess("View Levels") || userIsAbsoluteAdmin) && collection === "levels") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["levels"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (levels: any) => {
                return [fullDocument, ...levels];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { levels: firstPageLevels } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [{ ...firstPage, levels: [fullDocument, ...firstPageLevels] }, ...queryPages.slice(1)]
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
              queryClient.setQueryData(queryKey, (levels: any) => {
                return levels.map((level: any) => (level._id === fullDocument._id ? fullDocument : level));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    levels: page.levels.map((level: any) => (level._id === fullDocument._id ? fullDocument : level))
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
              queryClient.setQueryData(queryKey, (levels: any) => {
                return levels.filter((level: any) => level._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    levels: page.levels.filter((level: any) => level._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle level managers changes
      if ((hasActionAccess("View Level Managers") || userIsAbsoluteAdmin) && collection === "levelmanagers") {
        const changedRecordId = fullDocument.levelManagerStaffId;
        const userStaffId = accountData.staffId?._id;

        const queriesData = queryClient.getQueriesData({ queryKey: ["levelmanagers"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (levelManagers: any) => {
                0;
                return [fullDocument, ...levelManagers];
              });
            } else {
              if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;

              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { levelManagers: firstPageLevelsManagers } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, levelManagers: [fullDocument, ...firstPageLevelsManagers] },
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
              queryClient.setQueryData(queryKey, (levelManagers: any) => {
                return levelManagers.map((levelManager: any) =>
                  levelManager._id === fullDocument._id ? fullDocument : levelManager
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    levelManagers: page.levelManagers.map((levelManager: any) =>
                      levelManager._id === fullDocument._id ? fullDocument : levelManager
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
              queryClient.setQueryData(queryKey, (levelManagers: any) => {
                return levelManagers.filter((levelManager: any) => levelManager._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    levelManagers: page.levelManagers.filter(
                      (levelManager: any) => levelManager._id !== fullDocument._id
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle base Subjects changes
      if ((hasActionAccess("View Base Subjects") || userIsAbsoluteAdmin) && collection === "basesubjects") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["basesubjects"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (baseSubjects: any) => {
                return [fullDocument, ...baseSubjects];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { baseSubjects: firstPageBaseSubjects } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, baseSubjects: [fullDocument, ...firstPageBaseSubjects] },
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
              queryClient.setQueryData(queryKey, (baseSubjects: any) => {
                return baseSubjects.map((baseSubject: any) =>
                  baseSubject._id === fullDocument._id ? fullDocument : baseSubject
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    baseSubjects: page.baseSubjects.map((baseSubject: any) =>
                      baseSubject._id === fullDocument._id ? fullDocument : baseSubject
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
              queryClient.setQueryData(queryKey, (baseSubjects: any) => {
                return baseSubjects.filter((baseSubject: any) => baseSubject._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    baseSubjects: page.baseSubjects.filter((baseSubject: any) => baseSubject._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle base subject managers changes
      if (
        (hasActionAccess("View Base Subject Managers") || userIsAbsoluteAdmin) &&
        collection === "basesubjectmanagers"
      ) {
        const changedRecordId = fullDocument.baseSubjectManagerStaffId;
        const userStaffId = accountData.staffId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["basesubjectmanagers"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (baseSubjectManagers: any) => {
                0;
                return [fullDocument, ...baseSubjectManagers];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { baseSubjectManagers: firstPageBaseSubjectManagers } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, baseSubjectManagers: [fullDocument, ...firstPageBaseSubjectManagers] },
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
              queryClient.setQueryData(queryKey, (baseSubjectManagers: any) => {
                return baseSubjectManagers.map((baseSubjectManager: any) =>
                  baseSubjectManager._id === fullDocument._id ? fullDocument : baseSubjectManager
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    baseSubjectManagers: page.baseSubjectManagers.map((baseSubjectManager: any) =>
                      baseSubjectManager._id === fullDocument._id ? fullDocument : baseSubjectManager
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
              queryClient.setQueryData(queryKey, (baseSubjectManagers: any) => {
                return baseSubjectManagers.filter(
                  (baseSubjectManager: any) => baseSubjectManager._id !== fullDocument._id
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    baseSubjectManagers: page.baseSubjectManagers.filter(
                      (baseSubjectManager: any) => baseSubjectManager._id !== fullDocument._id
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle subjects changes
      if ((hasActionAccess("View Subjects") || userIsAbsoluteAdmin) && collection === "subjects") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["subjects"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (subjects: any) => {
                return [fullDocument, ...subjects];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { subjects: firstPageSubjects } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [{ ...firstPage, subjects: [fullDocument, ...firstPageSubjects] }, ...queryPages.slice(1)]
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
              queryClient.setQueryData(queryKey, (subjects: any) => {
                return subjects.map((subject: any) => (subject._id === fullDocument._id ? fullDocument : subject));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    subjects: page.subjects.map((subject: any) =>
                      subject._id === fullDocument._id ? fullDocument : subject
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
              queryClient.setQueryData(queryKey, (subjects: any) => {
                return subjects.filter((subject: any) => subject._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    subjects: page.subjects.filter((subject: any) => subject._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle subject teachers changes
      if ((hasActionAccess("View Subject Teachers") || userIsAbsoluteAdmin) && collection === "subjectteachers") {
        const changedRecordId = fullDocument.subjectTeacherStaffId;
        const userStaffId = accountData.staffId?._id;

        if (!userIsAbsoluteAdmin && changedRecordId === userStaffId) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["subjectteachers"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (subjectTeachers: any) => {
                0;
                return [fullDocument, ...subjectTeachers];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { subjectTeachers: firstPageSubjectTeachers } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, subjectTeachers: [fullDocument, ...firstPageSubjectTeachers] },
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
              queryClient.setQueryData(queryKey, (subjectTeachers: any) => {
                return subjectTeachers.map((subjectTeacher: any) =>
                  subjectTeacher._id === fullDocument._id ? fullDocument : subjectTeacher
                );
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    subjectTeachers: page.subjectTeachers.map((subjectTeacher: any) =>
                      subjectTeacher._id === fullDocument._id ? fullDocument : subjectTeacher
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
              queryClient.setQueryData(queryKey, (subjectTeachers: any) => {
                return subjectTeachers.filter((subjectTeacher: any) => subjectTeacher._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    subjectTeachers: page.subjectTeachers.filter(
                      (subjectTeacher: any) => subjectTeacher._id !== fullDocument._id
                    )
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }
      // handle topics changes
      if ((hasActionAccess("View Topics") || userIsAbsoluteAdmin) && collection === "topics") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["topics"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (topics: any) => {
                return [fullDocument, ...topics];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { topics: firstPageTopics } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [{ ...firstPage, topics: [fullDocument, ...firstPageTopics] }, ...queryPages.slice(1)]
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
              queryClient.setQueryData(queryKey, (topics: any) => {
                return topics.map((topic: any) => (topic._id === fullDocument._id ? fullDocument : topic));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    topics: page.topics.map((topic: any) => (topic._id === fullDocument._id ? fullDocument : topic))
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
              queryClient.setQueryData(queryKey, (topics: any) => {
                return topics.filter((topic: any) => topic._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    topics: page.topics.filter((topic: any) => topic._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle syllabuses changes
      if ((hasActionAccess("View Syllabuses") || userIsAbsoluteAdmin) && collection === "syllabuses") {
        const queriesData = queryClient.getQueriesData({ queryKey: ["syllabuses"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            if (queryKey.length === 1) {
              queryClient.setQueryData(queryKey, (syllabuses: any) => {
                return [fullDocument, ...syllabuses];
              });
            } else {
              const pages = data.pages;

              if (pages.length > 0) {
                const firstPage = pages[0];
                if (firstPage !== undefined) {
                  const { syllabuses: firstPageSyllabuses } = firstPage;
                  queryClient.setQueryData(queryKey, (queryData: any) => {
                    const { pages: queryPages } = queryData;
                    const returnArray = {
                      ...queryData,
                      pages: [
                        { ...firstPage, syllabuses: [fullDocument, ...firstPageSyllabuses] },
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
              queryClient.setQueryData(queryKey, (syllabuses: any) => {
                return syllabuses.map((syllabus: any) => (syllabus._id === fullDocument._id ? fullDocument : syllabus));
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    syllabuses: page.syllabuses.map((syllabus: any) =>
                      syllabus._id === fullDocument._id ? fullDocument : syllabus
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
              queryClient.setQueryData(queryKey, (syllabuses: any) => {
                return syllabuses.filter((syllabus: any) => syllabus._id !== fullDocument._id);
              });
            } else {
              queryClient.setQueryData(queryKey, (queryData: any) => {
                const { pages: queryPages } = queryData;
                const returnArray = {
                  ...queryData,
                  pages: queryPages.map((page: any) => ({
                    ...page,
                    syllabuses: page.syllabuses.filter((syllabus: any) => syllabus._id !== fullDocument._id)
                  }))
                };

                return returnArray;
              });
            }
          });
        }
      }

      // handle student day attendance
      if (
        (hasActionAccess("Edit Student Day Attendance (Admin Access)") ||
          hasActionAccess("Edit Student Day Attendance (For Level | Course Managers)") ||
          userIsAbsoluteAdmin) &&
        collection === "studentdayattendancetemplates"
      ) {
        const courseManagerInCache = queryClient.getQueryData(["coursemanagers"]) as any[] | undefined;
        const levelManagerInCache = queryClient.getQueryData(["levelmanagers"]) as any[] | undefined;
        if (!courseManagerInCache || !levelManagerInCache) return;

        const isCourseManager = courseManagerInCache.filter(
          (cm: any) => cm.courseManagerStaffId === accountData?.staffId?._id
        );

        const isLevelManager = levelManagerInCache.filter(
          (lm: any) => lm.levelManagerStaffId === accountData?.staffId?._id
        );
        const coursesManaged = isCourseManager.map((cm: any) => cm.courseId);
        const levelsManaged = isLevelManager.map((lm: any) => lm.levelId);
        const canView =
          userIsAbsoluteAdmin ||
          hasActionAccess("View Student Day Attendances (Admin Access)") ||
          coursesManaged.includes(fullDocument.courseId) ||
          levelsManaged.includes(fullDocument.levelId);
        if (!canView) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["studentdayattendances"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          let studentAttendances: any[] = [];
          try {
            const response = await handleApiRequest(
              "post",
              "alyeqeenschoolapp/api/student/attendance/dayattendancestore",
              {
                attendanceId: fullDocument._id
              }
            );

            if (response?.data) {
              studentAttendances = response?.data;
            }
          } catch (err: any) {
            return;
          }

          queriesData.forEach(([queryKey, data]: [any, any]) => {
            const pages = data.pages;

            if (pages.length > 0) {
              const firstPage = pages[0];
              if (firstPage !== undefined) {
                const { studentDayAttendances: firstPageStudentdayattendances } = firstPage;
                queryClient.setQueryData(queryKey, (queryData: any) => {
                  const { pages: queryPages } = queryData;
                  const returnArray = {
                    ...queryData,
                    pages: [
                      {
                        ...firstPage,
                        studentDayAttendances: [
                          { ...fullDocument, studentDayAttendances: studentAttendances },
                          ...firstPageStudentdayattendances
                        ]
                      },
                      ...queryPages.slice(1)
                    ]
                  };

                  return returnArray;
                });
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          let studentAttendances: any[] = [];
          try {
            const response = await handleApiRequest(
              "post",
              "alyeqeenschoolapp/api/student/attendance/dayattendancestore",
              {
                attendanceId: fullDocument._id
              }
            );

            if (response?.data) {
              studentAttendances = response?.data;
            }
          } catch (err: any) {
            return;
          }

          queriesData.forEach(([queryKey, data]: [any, any]) => {
            queryClient.setQueryData(queryKey, (queryData: any) => {
              const { pages: queryPages } = queryData;
              const returnArray = {
                ...queryData,
                pages: queryPages.map((page: any) => ({
                  ...page,
                  studentDayAttendances: page.studentDayAttendances.map((studentdayattendance: any) =>
                    studentdayattendance._id === fullDocument._id
                      ? { ...fullDocument, studentDayAttendances: studentAttendances }
                      : studentdayattendance
                  )
                }))
              };

              return returnArray;
            });
          });
        }
        if (changeOperation === "delete") {
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            queryClient.setQueryData(queryKey, (queryData: any) => {
              const { pages: queryPages } = queryData;
              const returnArray = {
                ...queryData,
                pages: queryPages.map((page: any) => ({
                  ...page,
                  studentDayAttendances: page.studentDayAttendances.filter(
                    (studentdayattendance: any) => studentdayattendance._id !== fullDocument._id
                  )
                }))
              };

              return returnArray;
            });
          });
        }
      }

      // handle student subject attendance
      if (
        (hasActionAccess("Edit Student Subject Attendance (Admin Access)") ||
          hasActionAccess("Edit Student Subject Attendance (For Level | Course Managers | Subject Teachers)") ||
          userIsAbsoluteAdmin) &&
        collection === "studentsubjectattendancetemplates"
      ) {
        const courseManagerInCache = queryClient.getQueryData(["coursemanagers"]) as any[] | undefined;
        const levelManagerInCache = queryClient.getQueryData(["levelmanagers"]) as any[] | undefined;
        const subjectTeacherInCache = queryClient.getQueryData(["subjectteachers"]) as any[] | undefined;
        if (!courseManagerInCache || !levelManagerInCache || !subjectTeacherInCache) return;

        const isCourseManager = courseManagerInCache.filter(
          (cm: any) => cm.courseManagerStaffId === accountData?.staffId?._id
        );

        const isLevelManager = levelManagerInCache.filter(
          (lm: any) => lm.levelManagerStaffId === accountData?.staffId?._id
        );

        const isSubjectTeacher = subjectTeacherInCache.filter(
          (st: any) => st.subjectTeacherStaffId === accountData?.staffId?._id
        );
        const coursesManaged = isCourseManager.map((cm: any) => cm.courseId);
        const levelsManaged = isLevelManager.map((lm: any) => lm.levelId);
        const subjectsManaged = isSubjectTeacher.map((st: any) => st.subjectId);

        const canView =
          userIsAbsoluteAdmin ||
          hasActionAccess("View Student Subject Attendances (Admin Access)") ||
          coursesManaged.includes(fullDocument.courseId) ||
          levelsManaged.includes(fullDocument.levelId) ||
          subjectsManaged.includes(fullDocument.subjectId);

        if (!canView) return;
        const queriesData = queryClient.getQueriesData({ queryKey: ["studentsubjectattendances"] });
        if (queriesData.length === 0) return;

        if (changeOperation === "insert") {
          let studentAttendances: any[] = [];
          try {
            const response = await handleApiRequest(
              "post",
              "alyeqeenschoolapp/api/student/attendance/subjectattendancestore",
              {
                attendanceId: fullDocument._id
              }
            );

            if (response?.data) {
              studentAttendances = response?.data;
            }
          } catch (err: any) {
            return;
          }

          queriesData.forEach(([queryKey, data]: [any, any]) => {
            const pages = data.pages;

            if (pages.length > 0) {
              const firstPage = pages[0];
              if (firstPage !== undefined) {
                const { studentSubjectAttendances: firstPageStudentsubjectattendances } = firstPage;
                queryClient.setQueryData(queryKey, (queryData: any) => {
                  const { pages: queryPages } = queryData;
                  const returnArray = {
                    ...queryData,
                    pages: [
                      {
                        ...firstPage,
                        studentSubjectAttendances: [
                          { ...fullDocument, studentSubjectAttendances: studentAttendances },
                          ...firstPageStudentsubjectattendances
                        ]
                      },
                      ...queryPages.slice(1)
                    ]
                  };

                  return returnArray;
                });
              }
            }
          });
        }
        if (changeOperation === "update" || changeOperation === "replace") {
          let studentAttendances: any[] = [];
          try {
            const response = await handleApiRequest(
              "post",
              "alyeqeenschoolapp/api/student/attendance/subjectattendancestore",
              {
                attendanceId: fullDocument._id
              }
            );

            if (response?.data) {
              studentAttendances = response?.data;
            }
          } catch (err: any) {
            return;
          }

          queriesData.forEach(([queryKey, data]: [any, any]) => {
            queryClient.setQueryData(queryKey, (queryData: any) => {
              const { pages: queryPages } = queryData;
              const returnArray = {
                ...queryData,
                pages: queryPages.map((page: any) => ({
                  ...page,
                  studentSubjectAttendances: page.studentSubjectAttendances.map((studentsubjectattendance: any) =>
                    studentsubjectattendance._id === fullDocument._id
                      ? { ...fullDocument, studentSubjectAttendances: studentAttendances }
                      : studentsubjectattendance
                  )
                }))
              };

              return returnArray;
            });
          });
        }
        if (changeOperation === "delete") {
          console.log("deleting");
          queriesData.forEach(([queryKey, data]: [any, any]) => {
            queryClient.setQueryData(queryKey, (queryData: any) => {
              const { pages: queryPages } = queryData;
              const returnArray = {
                ...queryData,
                pages: queryPages.map((page: any) => ({
                  ...page,
                  studentSubjectAttendances: page.studentSubjectAttendances.filter(
                    (studentsubjectattendance: any) => studentsubjectattendance._id !== fullDocument._id
                  )
                }))
              };

              return returnArray;
            });
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
