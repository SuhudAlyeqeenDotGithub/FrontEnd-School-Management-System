"use client";
import { checkDataType, safeText } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { use, useEffect, useState } from "react";
import {
  ActionButtons,
  CustomHeading,
  ErrorDiv,
  InputComponent,
  LoaderDiv,
  NextButton,
  PreviousButton,
  StatusFormatter
} from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";

import {
  DisallowedActionDialog,
  ConfirmActionByInputDialog,
  CustomFilterComponent
} from "@/lib/customComponents/general/compLibrary2";

import {
  dataRowCellStyle,
  defaultButtonStyle,
  ghostbuttonStyle,
  paginationContainerStyle,
  sortableTableHeadCellStyle,
  tableCellStyle,
  tableContainerStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd, MdContentCopy } from "react-icons/md";
import { ActivityLogDialogComponent } from "@/lib/customComponents/admin/activityLogDialogComp";

const ActivityLog = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/admin/activityLogs");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openViewActivityLogDialog, setOpenViewActivityLogDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenActivityLogDialogData, setOnOpenActivityLogDialogData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const [openFilterDiv, setOpenFilterDiv] = useState(false);
  const [paginationData, setPaginationData] = useState<any>({
    totalCount: 0,
    chunkCount: 0,
    hasNext: false
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimit] = useState("10");
  const [queryParams, setQueryParams] = useState({});

  const {
    data: activityLogs,
    isFetching: isFetchingactivityLogs,
    error: activityLogsError,
    isError: isActivityLogsError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "activitylogs",
    queryParams,
    Number(limit) || 10,
    "View Activity Logs",
    "alyeqeenschoolapp/api/admin/activityLogs"
  );

  useEffect(() => {
    if (!activityLogs) return;
    const currentPage: any = activityLogs.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.activityLogs);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [activityLogs, isFetchingactivityLogs]);

  useEffect(() => {
    if (!isActivityLogsError) return;
    if (activityLogsError) {
      setError(activityLogsError.message);
    }
  }, [activityLogsError, isActivityLogsError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { activityLogs, ...rest } = foundPage;
      setLocalData(activityLogs);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { activityLogs, ...rest } = foundPage;
      setLocalData(activityLogs);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };

  if (!hasActionAccess("View Activity Logs")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <div className=" flex flex-col items-center mb-5">
          <div className="h-20 w-45">
            <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
          </div>
          <p className="text-[18px] text-[#0097a7]  font-medium">Management System</p>
        </div>
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="mb-6">Oops! You do not have access to this page - Contact your admin if you need access</p>
        <a href="/main" className="text-[#0097a7]  underline">
          Go back home
        </a>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Activity Log Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  // function to handle sorting
  const handleSort = (sortKey: any) => {
    const keyType = checkDataType([...localData][0][sortKey]);

    let sortOrder = sortOrderTracker[sortKey];

    // console.log("sortOrder", sortOrder);

    let nextOrder: string;

    if (sortOrder === "dsc") {
      nextOrder = "asc";
    } else {
      nextOrder = "dsc";
    }
    const sortedData = [...localData].sort((a, b) => {
      if (keyType === "number") {
        return sortOrder === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      } else if (keyType === "date") {
        return sortOrder === "asc"
          ? new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()
          : new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime();
      } else if (keyType === "array") {
        return sortOrder === "asc"
          ? a[sortKey][0].tab.localeCompare(b[sortKey][0].tab)
          : b[sortKey][0].tab.localeCompare(a[sortKey][0].tab);
      } else {
        return sortOrder === "asc" ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      }
    });

    setLocalData(sortedData);
    setSortOrderTracker((prev: any) => ({ ...prev, [sortKey]: nextOrder }));
  };

  return (
    <div className="px-4 py-6 w-full">
      {/* data table section */}
      <>
        {openViewActivityLogDialog && (
          <ActivityLogDialogComponent
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewActivityLogDialog(!open);
              return {};
            }}
            data={onOpenActivityLogDialogData}
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Activity Logs
                {/* <ActivityLogRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">Montitor user activities across the system</CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              includeDate={true}
              currentQuery={queryParams}
              placeholder="Search role (ActivityLog Name, Email, Status)"
              filters={[
                {
                  displayText: "Account Status",
                  fieldName: "accountStatus",
                  options: ["All", "Active", "Locked"]
                },
                {
                  displayText: "Tab",
                  fieldName: "recordModel",
                  options: [
                    "All",
                    "Course",
                    "Student",
                    "StudentEnrollment",
                    "Staff",
                    "Programme",
                    "Subject",
                    "Account",
                    "Role",
                    "Staff",
                    "Level",
                    "Enrollment",
                    "Attendance",
                    "AcademicYear",
                    "StaffContract",
                    "ProgrammeManager",
                    "CourseManager",
                    "LevelManager",
                    "SubjectTeacher",
                    "BaseSubject",
                    "BaseSubjectManager",
                    "StudentDayAttendanceTemplate",
                    "StudentSubjectAttendanceTemplate",
                    "StudentEventAttendanceTemplate",
                    "Topic",
                    "Syllabus",
                    "None"
                  ]
                }
              ]}
              onQuery={(query: any) => {
                setQueryParams(query);
              }}
            />
          </div>
          {error && (
            <ErrorDiv
              onClose={(close) => {
                if (close) {
                  setError("");
                }
              }}
            >
              {error}
            </ErrorDiv>
          )}

          {/* pagination div */}
          <div className={paginationContainerStyle}>
            <div>
              Showing {paginationData.chunkCount} of {paginationData.totalCount} records
            </div>

            <div className="flex gap-3 items-center">
              <p>Limit</p>
              <div className="w-20">
                <InputComponent
                  type="text"
                  name="limit"
                  placeholder="5"
                  value={limit}
                  onChange={(e) => {
                    setLimit(e.target.value);
                  }}
                />
              </div>

              <button
                className={defaultButtonStyle}
                onClick={() => {
                  setQueryParams((prev) => ({ ...prev, limit: limit }));
                }}
              >
                Apply
              </button>
            </div>
            <div className="flex items-center gap-2">
              <PreviousButton
                onClick={() => {
                  const prevPage = pageIndex - 1;
                  setPageIndex(prevPage);
                  renderPreviousPage(prevPage, activityLogs.pages);
                }}
                disabled={pageIndex === 0}
              />

              <span className=" px-2">
                Page {pageIndex + 1} of {Math.ceil(paginationData.totalCount / Number(limit))}
              </span>
              <NextButton
                onClick={() => {
                  const nextPage = pageIndex + 1;
                  setPageIndex(nextPage);
                  renderNextPage(nextPage, activityLogs.pages);
                }}
                disabled={!paginationData.hasNext}
              />
            </div>
          </div>

          {/* table body */}
          <div className={tableContainerStyle}>
            {/* table header */}
            <table className="relative w-full">
              <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                <tr className={tableHeaderStyle}>
                  {(["Activity", "Created At"] as const).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          Activity: "logAction",
                          "Created At": "createdAt"
                        };
                        const sortKey = key_Name[header];
                        handleSort(sortKey);
                      }}
                      className={sortableTableHeadCellStyle}
                    >
                      {header} <LuArrowUpDown className="inline-block ml-1" />
                    </th>
                  ))}

                  <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                    Created By
                  </th>
                  <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                    Created At
                  </th>
                  <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                    Record Highlight
                  </th>
                </tr>
              </thead>

              {/* table data */}
              <tbody className="mt-3 bg-backgroundColor">
                {isFetchingactivityLogs ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Activity Logs..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingactivityLogs) || !activityLogs ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: activityLogId,
                      accountId,
                      createdAt,
                      recordChange,
                      recordName,
                      recordId,
                      recordModel,
                      logAction
                    } = doc || {};

                    const { accountName, accountEmail, accountStatus, roleId, staffId } = accountId || {};
                    const staffCustomId = staffId ? staffId.staffCustomId : "Not a staff";
                    const roleName = roleId ? roleId.roleName : "";
                    const recordObjId = recordId ? recordId._id : "";
                    return (
                      <tr
                        key={activityLogId}
                        onClick={() => {
                          if (hasActionAccess("View Activity Logs")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenActivityLogDialogData(doc);
                            setOpenViewActivityLogDialog(true);
                          } else {
                            setError("You do not have View Activity Log Access - Please contact your admin");
                          }
                        }}
                        className="hover:bg-backgroundColor-2 hover:cursor-pointer border-y border-borderColor-2 h-28 p-7"
                      >
                        <td className="w-[270px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 justify-center items-center">
                            <StatusFormatter text={logAction} />

                            <div>
                              <span className="font-medium text-[14px] text-foregroundColor-2">Tab: </span>
                              <span className="text-[14px] text-foregroundColor-2">{safeText(recordModel, 30)}</span>
                            </div>

                            <div>
                              <span className="font-medium text-[14px] text-foregroundColor-2">Log Id: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {safeText(activityLogId, 15)}
                                <MdContentCopy
                                  title="copy id"
                                  className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (activityLogId) await navigator.clipboard.writeText(activityLogId);
                                  }}
                                />
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="w-[150px] text-center px-3 whitespace-nowrap font-medium">
                          <div className="flex flex-col justify-center items-center">
                            {createdAt ? formatDate(createdAt) : ""}
                            <span className="text-foregroundColor-2 text-[14px]">
                              {createdAt ? new Date(createdAt).toLocaleTimeString() : ""}
                            </span>
                          </div>
                        </td>

                        <td className="w-[270px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <span className="font-medium">{safeText(accountName, 50)}</span>

                            <span className="text-foregroundColor-2 text-[14px]">
                              {safeText(staffCustomId, 15)}
                              <MdContentCopy
                                title="copy id"
                                className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (staffCustomId) await navigator.clipboard.writeText(staffCustomId);
                                }}
                              />
                            </span>

                            <span className="text-foregroundColor-2 text-[14px]">{safeText(roleName, 30)}</span>
                          </div>
                        </td>

                        <td className="w-[150px] text-center px-3 whitespace-nowrap font-medium">
                          <div className="flex flex-col gap-2 justify-center items-center">
                            <span className="font-medium">{safeText(accountEmail, 30)}</span>
                            <span className="text-foregroundColor-2 text-[14px] font-medium">
                              <StatusFormatter text={accountStatus} />
                            </span>
                          </div>
                        </td>

                        <td className="w-[270px] text-center px-3 whitespace-nowrap">
                          <span className="text-[14px] font-medium">
                            {Array.isArray(recordChange) && recordChange.length > 0 ? "Change Available" : "No Change"}
                          </span>

                          <div className="flex flex-col justify-center items-center">
                            <span className="text-foregroundColor-2 text-[14px] font-medium">
                              {safeText(recordName, 30)}
                            </span>
                            <span className="text-foregroundColor-2 text-[14px] font-medium">
                              {safeText(recordObjId, 15)}...{" "}
                              <MdContentCopy
                                title="copy id"
                                className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (recordObjId) await navigator.clipboard.writeText(recordObjId);
                                }}
                              />
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    </div>
  );
};

export default ActivityLog;
