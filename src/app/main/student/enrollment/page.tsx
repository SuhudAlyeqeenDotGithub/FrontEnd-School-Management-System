"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
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
import { ConfirmActionByInputDialog, CustomFilterComponent } from "@/lib/customComponents/general/compLibrary2";
import { MdContentCopy, MdAdd, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import {
  defaultButtonStyle,
  ghostbuttonStyle,
  paginationContainerStyle,
  sortableTableHeadCellStyle,
  tableCellStyle,
  tableContainerStyle,
  tableHeadCellStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import StudentEnrollmentDialog from "@/lib/customComponents/student/studentEnrollmentDialogComp";

const StudentEnrollments = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/student/enrollment");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditStudentEnrollmentDialog, setOpenEditStudentEnrollmentDialog] = useState(false);
  const [openNewStudentEnrollmentDialog, setOpenNewStudentEnrollmentDialog] = useState(false);
  const [openViewStudentEnrollmentDialog, setOpenViewStudentEnrollmentDialog] = useState(false);
  const [onOpenStudentEnrollmentData, setOnOpenEditStudentEnrollmentData] = useState<any>({});
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
    data: studentProfiles,
    isFetching: isFetchingStudentProfiles,
    error: queryError,
    isError: isStudentProfilesError
  } = useReusableQuery("studentProfiles", "View Student Profiles", "alyeqeenschoolapp/api/student/allprofile");

  const {
    data: academicYears,
    isFetching: academicYearsIsFetching,
    error: academicYearsError,
    isError: isAcademicYearsError,
    refetch: refetchAcademicYears
  } = useReusableQuery("academicYears", "View Academic Years", `alyeqeenschoolapp/api/academicsession/academicYear`);

  const {
    data: courses,
    isFetching: isFetchingcourses,
    error: coursesError,
    isError: iscoursesError
  } = useReusableQuery("courses", "View Courses", "alyeqeenschoolapp/api/curriculum/allcourses");

  const {
    data: levels,
    isFetching: isFetchinglevels,
    error: levelsError,
    isError: islevelsError
  } = useReusableQuery("levels", "View Levels", "alyeqeenschoolapp/api/curriculum/alllevels");
  const {
    data: studentEnrollments,
    isFetching: isFetchingStudentEnrollments,
    error: studentEnrollmentsQueryError,
    isError: isStudentEnrollmentsError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "studentenrollments",
    queryParams,
    Number(limit) || 10,
    "View Student Enrollments",
    "alyeqeenschoolapp/api/student/enrollment"
  );

  useEffect(() => {
    if (!courses) return;
  }, [courses, isFetchingcourses]);

  useEffect(() => {
    if (!iscoursesError) return;
    if (coursesError) {
      setError(coursesError.message);
    }
  }, [coursesError, iscoursesError]);

  useEffect(() => {
    if (!levels) return;
  }, [levels, isFetchinglevels]);

  useEffect(() => {
    if (!islevelsError) return;
    if (levelsError) {
      setError(levelsError.message);
    }
  }, [levelsError, islevelsError]);

  useEffect(() => {
    if (!studentProfiles) return;
  }, [studentProfiles, isFetchingStudentProfiles]);

  useEffect(() => {
    if (!isStudentProfilesError) return;
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError, isStudentProfilesError]);

  useEffect(() => {
    if (!academicYears) return;
  }, [academicYears, academicYearsIsFetching]);

  useEffect(() => {
    if (!isAcademicYearsError) return;
    if (academicYearsError) {
      setError(academicYearsError.message);
    }
  }, [academicYearsError, isAcademicYearsError]);

  useEffect(() => {
    if (!studentEnrollments) return;
    const currentPage: any = studentEnrollments.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.studentEnrollments);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [studentEnrollments, isFetchingStudentEnrollments]);

  useEffect(() => {
    if (!isStudentEnrollmentsError) return;
    if (studentEnrollmentsQueryError) {
      setError(studentEnrollmentsQueryError.message);
    }
  }, [studentEnrollmentsQueryError, isStudentEnrollmentsError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { studentEnrollments, ...rest } = foundPage;
      setLocalData(studentEnrollments);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { studentEnrollments, ...rest } = foundPage;
      setLocalData(studentEnrollments);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };

  if (!hasActionAccess("View Student Enrollments")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <div className=" flex flex-col items-center mb-5">
          <div className="h-10 w-22">
            <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
          </div>
          <p className="text-[18px] text-[#0097a7]  font-medium">School Management System</p>
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
          text="Loading User Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (
    academicYearsIsFetching ||
    isFetchingStudentProfiles ||
    isFetchingStudentEnrollments ||
    isFetchingcourses ||
    isFetchinglevels
  ) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Required Data..."
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

      {/* data table section */}
      <>
        {openEditStudentEnrollmentDialog && (
          <StudentEnrollmentDialog
            type="edit"
            data={onOpenStudentEnrollmentData}
            academicYears={academicYears}
            students={studentProfiles}
            courses={courses}
            levels={levels}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditStudentEnrollmentDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenEditStudentEnrollmentDialog(!notSave);
              return {};
            }}
          />
        )}

        {openViewStudentEnrollmentDialog && (
          <StudentEnrollmentDialog
            type="view"
            data={onOpenStudentEnrollmentData}
            academicYears={academicYears}
            students={studentProfiles}
            courses={courses}
            levels={levels}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewStudentEnrollmentDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewStudentEnrollmentDialog(!notSave);
              return {};
            }}
          />
        )}

        {openNewStudentEnrollmentDialog && (
          <StudentEnrollmentDialog
            type="new"
            academicYears={academicYears}
            students={studentProfiles}
            courses={courses}
            levels={levels}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewStudentEnrollmentDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewStudentEnrollmentDialog(!notSave);
              return {};
            }}
          />
        )}

        {openConfirmDelete && (
          <ConfirmActionByInputDialog
            returnObject={confirmWithReturnObj}
            confirmWithText={confirmWithText}
            onCancel={() => {
              document.body.style.overflow = "";
              setOpenConfirmDelete(false);
              setError("");
            }}
            onConfirm={async (confirmed, returnObject) => {
              setError("");
              if (confirmed) {
                try {
                  await deleteMutation.mutateAsync({
                    studentEnrollmentIDToDelete: returnObject.enrollmentId
                  });
                } catch (err: any) {
                  setError(err.message);
                }
                setOpenConfirmDelete(false);
                document.body.style.overflow = "";
              }
            }}
            warningText="Please confirm the ID of the student enrollment you want to delete"
          />
        )}
        {/* data table div */}

        <div className="flex flex-col">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Student Enrollment
                {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">Create and manage student enrollments</CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Student Enrollment")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewStudentEnrollmentDialog(true);
                  } else {
                    setError("You do not have Create Student Enrollment Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Student Enrollment")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Student Enrollment
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search Student Custom ID, Student Names, Enrollment Dates, Job Title, Enrollment Type/Status"
              filters={[
                {
                  displayText: "Academic Year",
                  fieldName: "academicYear",
                  options: [
                    "All",
                    ...(Array.isArray(academicYears) ? academicYears.map(({ academicYear }: any) => academicYear) : [])
                  ]
                },
                {
                  displayText: "Enrollment Type",
                  fieldName: "enrollmentType",
                  options: ["All", "New", "Re-enrolled", "Transfer", "Returned"]
                },
                {
                  displayText: "Enrollment Status",
                  fieldName: "enrollmentStatus",
                  options: ["All", "Active", "Completed", "Withdrawn"]
                }
              ]}
              onQuery={(query: any) => {
                setQueryParams(query);
              }}
            />
          </div>
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
                  renderPreviousPage(prevPage, studentEnrollments.pages);
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
                  renderNextPage(nextPage, studentEnrollments.pages);
                }}
                disabled={!paginationData.hasNext}
              />
            </div>
          </div>

          <div className={tableContainerStyle}>
            <table className="relative w-full">
              <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                <tr className={tableHeaderStyle}>
                  {(
                    [
                      "Enrollment Custom ID",
                      "Student",
                      "Academic Year",
                      "Enrolled On",
                      "Enrollment Details",
                      "Dates"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Enrollment Custom ID": "enrollmentCustomId",
                          Student: "studentFullName",
                          "Academic Year": "academicYear",
                          "Enrolled On": "courseFullTitle",
                          "Enrollment Details": "enrollmentType",
                          Dates: "enrollmentDate"
                        };
                        const sortKey = key_Name[header];
                        handleSort(sortKey);
                      }}
                      className={sortableTableHeadCellStyle}
                    >
                      {header} <LuArrowUpDown className="inline-block ml-1" />
                    </th>
                  ))}
                  <th className={tableHeadCellStyle}>Actions</th>
                </tr>
              </thead>

              <tbody className="mt-3 bg-backgroundColor">
                {isFetchingStudentEnrollments ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Student Enrollments..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingStudentEnrollments) || !studentEnrollments ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      academicYear,
                      studentCustomId,
                      enrollmentCustomId,
                      studentFullName,
                      courseFullTitle,
                      level,
                      enrollmentStatus,
                      enrollmentDate,
                      enrollmentExpiresOn,
                      enrollmentType
                    } = doc;

                    return (
                      <tr
                        key={enrollmentCustomId}
                        onClick={() => {
                          if (hasActionAccess("View Student Enrollment")) {
                            document.body.style.overflow = "hidden";
                            setOpenViewStudentEnrollmentDialog(true);
                            setOnOpenEditStudentEnrollmentData(doc);
                          } else {
                            setError("You do not have Edit User Access - Please contact your admin");
                          }
                        }}
                        className="hover:bg-backgroundColor-2 hover:cursor-pointer border-y border-borderColor-2 h-18"
                      >
                        <td className="w-[200px] text-center whitespace-nowrap h-18 font-medium">
                          {enrollmentCustomId}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(enrollmentCustomId);
                            }}
                          />
                        </td>
                        <td className="w-[200px] text-center whitespace-nowrap h-18">
                          <div className="flex flex-col justify-items-start">
                            {" "}
                            <span className="font-medium">{studentFullName.slice(0, 20)}</span>
                            <span className="text-[14px] text-foregroundColor-2">{studentCustomId.slice(0, 10)}</span>
                          </div>
                        </td>{" "}
                        <td className="w-[200px] text-center whitespace-nowrap h-18 font-medium">
                          {academicYear.slice(14)}
                        </td>{" "}
                        <td className="w-[200px] text-center whitespace-nowrap h-18">
                          <div className="flex flex-col justify-items-start">
                            <span className="font-medium"> {courseFullTitle}</span>
                            <span className="text-[14px] text-foregroundColor-2">{level.slice(0, 10)}</span>
                          </div>
                        </td>
                        <td className="w-[200px] text-center whitespace-nowrap h-18">
                          <div className="flex flex-col justify-items-start">
                            <div>
                              <span className="text-[14px] font-medium">Type: </span>
                              <span className="text-[14px] text-foregroundColor-2">{enrollmentType}</span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Status: </span>
                              <span className="text-[14px] text-foregroundColor-2">{enrollmentStatus}</span>
                            </div>
                          </div>
                        </td>
                        <td className="w-[200px] text-center whitespace-nowrap h-18">
                          <div className="flex flex-col justify-items-start">
                            <div>
                              <span className="text-[14px] font-medium">Enrolled On: </span>
                              <span className="text-[14px] text-foregroundColor-2">{formatDate(enrollmentDate)}</span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Expires On: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {formatDate(enrollmentExpiresOn)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Student Enrollment")) {
                                document.body.style.overflow = "hidden";
                                setOpenEditStudentEnrollmentDialog(true);
                                setOnOpenEditStudentEnrollmentData(doc);
                              } else {
                                setError("You do not have Edit User Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Student Enrollment")) {
                                document.body.style.overflow = "hidden";
                                setConfirmWithText(enrollmentCustomId);
                                setConfirmWithReturnObj({ enrollmentId: doc._id });
                                setOpenConfirmDelete(true);
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Student Access - Please contact your admin"
                                );
                              }
                            }}
                          />
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
      {/* end of data table */}
    </div>
  );
};

export default StudentEnrollments;
