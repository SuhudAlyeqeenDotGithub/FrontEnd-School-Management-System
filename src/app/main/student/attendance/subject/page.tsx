"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionButtons,
  CustomHeading,
  ErrorDiv,
  IconFormatter,
  InputComponent,
  LoaderDiv,
  NextButton,
  PreviousButton,
  StatusFormatter
} from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { ConfirmActionByInputDialog, CustomFilterComponent } from "@/lib/customComponents/general/compLibrary2";
import { MdContentCopy, MdAdd } from "react-icons/md";
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
import StudentSubjectAttendanceDialog from "@/lib/customComponents/student/studentSubjectAttendanceDialogComp";

const StudentSubjectAttendances = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess, orgFeaturesInString } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const router = useRouter();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/student/attendance/subjectattendance");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditStudentSubjectAttendanceDialog, setOpenEditStudentSubjectAttendanceDialog] = useState(false);
  const [openNewStudentSubjectAttendanceDialog, setOpenNewStudentSubjectAttendanceDialog] = useState(false);
  const [openViewStudentSubjectAttendanceDialog, setOpenViewStudentSubjectAttendanceDialog] = useState(false);
  const [onOpenStudentSubjectAttendanceData, setOnOpenEditStudentSubjectAttendanceData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const [hasViewAccess, setHasViewAccess] = useState(false);
  const [hasCreateAccess, setHasCreateAccess] = useState(false);
  const [hasDeleteAccess, setHasDeleteAccess] = useState(false);
  const [hasEditAccess, setHasEditAccess] = useState(false);
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
    data: courseManagers,
    isFetching: isFetchingCourseManagers,
    error: courseManagerQueryError,
    isError: isCourseManagersError
  } = useReusableQuery("coursemanagers", "View Course Managers", "alyeqeenschoolapp/api/curriculum/course/allmanagers");

  const {
    data: levelManagers,
    isFetching: isFetchingLevelManagers,
    error: levelManagerQueryError,
    isError: isLevelManagersError
  } = useReusableQuery("levelmanagers", "View Level Managers", "alyeqeenschoolapp/api/curriculum/level/allmanagers");

  const {
    data: subjectTeachers,
    isFetching: isFetchingSubjectTeachers,
    error: subjectTeacherQueryError,
    isError: isSubjectTeachersError
  } = useReusableQuery(
    "subjectteachers",
    "View Subject Teachers",
    "alyeqeenschoolapp/api/curriculum/subject/allteachers"
  );

  const {
    data: academicYears,
    isFetching: academicYearsIsFetching,
    error: academicYearsError,
    isError: isAcademicYearsError
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
    data: subjects,
    isFetching: isFetchingsubjects,
    error: subjectsError,
    isError: issubjectsError
  } = useReusableQuery("subjects", "View Levels", "alyeqeenschoolapp/api/curriculum/allsubjects");

  const {
    data: studentSubjectAttendances,
    isFetching: isFetchingStudentSubjectAttendances,
    error: studentSubjectAttendancesQueryError,
    isError: isStudentSubjectAttendancesError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "studentsubjectattendances",
    queryParams,
    Number(limit) || 10,
    "",
    "alyeqeenschoolapp/api/student/attendance/subjectattendance"
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
    if (!subjects) return;
  }, [subjects, isFetchingsubjects]);

  useEffect(() => {
    if (!issubjectsError) return;
    if (subjectsError) {
      setError(subjectsError.message);
    }
  }, [subjectsError, issubjectsError]);

  useEffect(() => {
    if (!courseManagers) return;
  }, [courseManagers, isFetchingCourseManagers]);

  useEffect(() => {
    if (!isCourseManagersError) return;
    if (courseManagerQueryError) {
      setError(courseManagerQueryError.message);
    }
  }, [levelManagerQueryError, isLevelManagersError]);

  useEffect(() => {
    if (!levelManagers) return;
  }, [levelManagers, isFetchingLevelManagers]);

  useEffect(() => {
    if (!isLevelManagersError) return;
    if (levelManagerQueryError) {
      setError(levelManagerQueryError.message);
    }
  }, [levelManagerQueryError, isLevelManagersError]);

  useEffect(() => {
    if (!subjectTeachers) return;
  }, [subjectTeachers, isFetchingSubjectTeachers]);

  useEffect(() => {
    if (!isSubjectTeachersError) return;
    if (subjectTeacherQueryError) {
      setError(subjectTeacherQueryError.message);
    }
  }, [subjectTeacherQueryError, isSubjectTeachersError]);

  useEffect(() => {
    if (!courseManagers || !levelManagers || !subjectTeachers) return;

    const isAbsoluteAdmin = accountData?.roleId?.absoluteAdmin === true;

    const isCourseManager = courseManagers.find((cm: any) => cm.courseManagerStaffId === accountData?.staffId?._id);
    const isLevelManager = levelManagers.find((lm: any) => lm.levelManagerStaffId === accountData?.staffId?._id);
    const isSubjectTeacher = subjectTeachers.find((st: any) => st.subjectTeacherStaffId === accountData?.staffId?._id);

    const hasManagerAccess = !!isCourseManager || !!isLevelManager || !!isSubjectTeacher;

    const canCreate =
      isAbsoluteAdmin ||
      hasActionAccess("Create Student Subject Attendance (Admin Access)") ||
      hasActionAccess("Create Student Subject Attendance (For Level | Course Managers | Subject Teachers)") ||
      hasManagerAccess;

    const canView =
      isAbsoluteAdmin ||
      hasActionAccess("View Student Subject Attendances (Admin Access)") ||
      hasActionAccess("View Student Subject Attendance (For Level | Course Managers | Subject Teachers)") ||
      hasManagerAccess;

    const canEdit =
      isAbsoluteAdmin ||
      hasActionAccess("Edit Student Subject Attendance (Admin Access)") ||
      hasActionAccess("Edit Student Subject Attendance (For Level | Course Managers | Subject Teachers)") ||
      hasManagerAccess;

    const canDelete =
      isAbsoluteAdmin ||
      hasActionAccess("Delete Student Subject Attendance (Admin Access)") ||
      hasActionAccess("Delete Student Subject Attendance (For Level | Course Managers | Subject Teachers)") ||
      hasManagerAccess;

    setHasCreateAccess(canCreate);
    setHasViewAccess(canView);
    setHasEditAccess(canEdit);
    setHasDeleteAccess(canDelete);
  }, [
    courseManagers,
    levelManagers,
    subjectTeachers,
    isFetchingCourseManagers,
    isFetchingLevelManagers,
    isFetchingSubjectTeachers,
    accountData
  ]);

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
    if (!studentSubjectAttendances) return;
    const currentPage: any = studentSubjectAttendances.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.studentSubjectAttendances);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [studentSubjectAttendances, isFetchingStudentSubjectAttendances]);

  useEffect(() => {
    if (!isStudentSubjectAttendancesError) return;
    if (studentSubjectAttendancesQueryError) {
      setError(studentSubjectAttendancesQueryError.message);
    }
  }, [studentSubjectAttendancesQueryError, isStudentSubjectAttendancesError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { studentSubjectAttendances, ...rest } = foundPage;
      setLocalData(studentSubjectAttendances);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { studentSubjectAttendances, ...rest } = foundPage;
      setLocalData(studentSubjectAttendances);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };

  if (!hasViewAccess) {
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

  if (!orgFeaturesInString.includes("Student Attendance")) {
    router.push("/nofeatureaccess");
    return;
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
    isFetchingCourseManagers ||
    isFetchingLevelManagers ||
    isFetchingStudentSubjectAttendances ||
    isFetchingcourses ||
    isFetchinglevels ||
    isFetchingSubjectTeachers
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
        {openEditStudentSubjectAttendanceDialog && (
          <StudentSubjectAttendanceDialog
            canCreate={hasCreateAccess}
            canEdit={hasEditAccess}
            type="edit"
            data={onOpenStudentSubjectAttendanceData}
            academicYears={academicYears ? academicYears : []}
            courses={courses ? courses : []}
            levels={levels ? levels : []}
            subjects={subjects ? subjects : []}
            levelManagers={levelManagers ? levelManagers : []}
            courseManagers={courseManagers ? courseManagers : []}
            subjectTeachers={subjectTeachers ? subjectTeachers : []}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditStudentSubjectAttendanceDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenEditStudentSubjectAttendanceDialog(!notSave);
              return {};
            }}
          />
        )}

        {openViewStudentSubjectAttendanceDialog && (
          <StudentSubjectAttendanceDialog
            canCreate={hasCreateAccess}
            canEdit={hasEditAccess}
            type="view"
            data={onOpenStudentSubjectAttendanceData}
            academicYears={academicYears ? academicYears : []}
            courses={courses ? courses : []}
            levels={levels ? levels : []}
            subjects={subjects ? subjects : []}
            levelManagers={levelManagers ? levelManagers : []}
            courseManagers={courseManagers ? courseManagers : []}
            subjectTeachers={subjectTeachers ? subjectTeachers : []}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewStudentSubjectAttendanceDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewStudentSubjectAttendanceDialog(!notSave);
              return {};
            }}
          />
        )}

        {openNewStudentSubjectAttendanceDialog && (
          <StudentSubjectAttendanceDialog
            canCreate={hasCreateAccess}
            canEdit={hasEditAccess}
            type="new"
            academicYears={academicYears ? academicYears : []}
            courses={courses ? courses : []}
            levels={levels ? levels : []}
            subjects={subjects ? subjects : []}
            levelManagers={levelManagers ? levelManagers : []}
            courseManagers={courseManagers ? courseManagers : []}
            subjectTeachers={subjectTeachers ? subjectTeachers : []}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewStudentSubjectAttendanceDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewStudentSubjectAttendanceDialog(!notSave);
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
                    studentSubjectAttendanceIDToDelete: returnObject.attendanceId
                  });
                } catch (err: any) {
                  setError(err.message);
                }
                setOpenConfirmDelete(false);
                document.body.style.overflow = "";
              }
            }}
            warningText="Please confirm the ID of the student attendance you want to delete"
          />
        )}
        {/* data table div */}

        <div className="flex flex-col">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Student Subject Attendance
                {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5">Create and manage student subject attendances</CustomHeading>
              <CustomHeading variation="head6light">Taken once per subject</CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasCreateAccess) {
                    document.body.style.overflow = "hidden";
                    setOpenNewStudentSubjectAttendanceDialog(true);
                  } else {
                    setError("You do not have Create Student Attendance Access - Please contact your admin");
                  }
                }}
                disabled={!hasCreateAccess}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Student Attendance
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search Student Custom ID, Student Names, Attendance Dates, Job Title, Attendance Type/Status"
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
                  displayText: "Subject",
                  fieldName: "subjectFullTitle",
                  options: [
                    "All",
                    ...(Array.isArray(subjects) ? subjects.map(({ subjectFullTitle }: any) => subjectFullTitle) : [])
                  ]
                },
                {
                  displayText: "Level",
                  fieldName: "level",
                  options: ["All", ...(Array.isArray(levels) ? levels.map(({ level }: any) => level) : [])]
                },
                {
                  displayText: "Course",
                  fieldName: "courseFullTitle",
                  options: [
                    "All",
                    ...(Array.isArray(courses) ? courses.map(({ courseFullTitle }: any) => courseFullTitle) : [])
                  ]
                },

                {
                  displayText: "Attendance Status",
                  fieldName: "attendanceStatus",
                  options: ["All", "Completed", "In Progress", "Cancelled"]
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
                  renderPreviousPage(prevPage, studentSubjectAttendances.pages);
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
                  renderNextPage(nextPage, studentSubjectAttendances.pages);
                }}
                disabled={!paginationData.hasNext}
              />
            </div>
          </div>

          <div className={tableContainerStyle}>
            <table className="relative w-full">
              <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                <tr className={tableHeaderStyle}>
                  {(["Attendance", "Dates", "Course & Level", "Staff Managers"] as const).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          Attendance: "attendanceStatus",
                          Dates: "attendanceDate",
                          "Course & Level": "courseFullTitle",
                          "Staff Managers": "levelManagerFullName"
                        };
                        const sortKey = key_Name[header];
                        handleSort(sortKey);
                      }}
                      className={sortableTableHeadCellStyle}
                    >
                      {header} <LuArrowUpDown className="inline-block ml-1" />
                    </th>
                  ))}

                  <th className="text-center font-semibold whitespace-nowrap text-foregroundColor p-2 w-[100px]">
                    <div className="flex gap-2 items-center justify-center">
                      <span>Stats</span>
                      <div className="rounded-full h-3 w-3 bg-foregroundColor-2"></div>
                    </div>
                  </th>

                  <th className="text-center font-semibold whitespace-nowrap text-foregroundColor p-2 w-[100px]">
                    <div className="flex gap-2 items-center justify-center">
                      <span>Presence</span>
                      <div className="rounded-full h-3 w-3 bg-green-600"></div>
                    </div>
                  </th>

                  <th className="text-center font-semibold whitespace-nowrap text-foregroundColor p-2 w-[100px]">
                    <div className="flex gap-2 items-center justify-center">
                      <span>Lateness</span>
                      <div className="rounded-full h-3 w-3 bg-yellow-400"></div>
                    </div>
                  </th>

                  <th className="text-center font-semibold whitespace-nowrap text-foregroundColor p-2 w-[100px]">
                    <div className="flex gap-2 items-center justify-center">
                      <span>Absence</span>
                      <div className="rounded-full h-3 w-3 bg-red-600"></div>
                    </div>
                  </th>

                  <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="mt-3 bg-backgroundColor">
                {isFetchingStudentSubjectAttendances ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Student Attendances..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingStudentSubjectAttendances) || !hasViewAccess ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      attendanceCustomId,
                      attendanceDate,
                      attendanceStatus,
                      academicYear,
                      courseFullTitle,
                      courseManagerFullName,
                      levelManagerFullName,
                      level,
                      subjectFullTitle,
                      subjectTeacherFullName,
                      studentSubjectAttendances
                    } = doc;
                    return (
                      <tr
                        key={attendanceCustomId}
                        onClick={() => {
                          if (hasEditAccess) {
                            document.body.style.overflow = "hidden";
                            setOpenViewStudentSubjectAttendanceDialog(true);
                            setOnOpenEditStudentSubjectAttendanceData(doc);
                          } else {
                            setError(
                              "You do not have Edit Student Subject Attendance Access - Please contact your admin"
                            );
                          }
                        }}
                        className="hover:bg-backgroundColor-2 hover:cursor-pointer border-y border-borderColor-2 h-20 gap-5"
                      >
                        <td className="w-[270px] text-center px-3 whitespace-nowrap font-medium">
                          <div className="flex flex-col justify-center items-center gap-2">
                            <span className="text-foregroundColor font-medium">
                              {attendanceCustomId.slice(0, 15)}...
                              <MdContentCopy
                                title="copy id"
                                className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await navigator.clipboard.writeText(attendanceCustomId);
                                }}
                              />
                            </span>
                            <StatusFormatter text={attendanceStatus} />
                          </div>
                        </td>

                        <td className="w-[270px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <div className="font-medium">
                              <span>Taken on - </span>
                              <span className="text-foregroundColor">{formatDate(attendanceDate)}</span>
                            </div>
                            <span className="text-[14px] text-foregroundColor-2">{academicYear}</span>
                          </div>
                        </td>

                        <td className="w-[270px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <span className="font-medium">{courseFullTitle}</span>
                            <span className="text-[14px] text-foregroundColor-2">{level.slice(0, 20)}</span>
                            <span className="text-[14px] text-foregroundColor-2">
                              {subjectFullTitle.split(" - ").slice(-2).join(" - ").slice(0, 50)}
                            </span>
                          </div>
                        </td>

                        <td className="w-[270px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <div>
                              <span className="text-[14px] font-medium">Subject: </span>
                              <span className="text-[14px] text-foregroundColor-2">{subjectTeacherFullName}</span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Level: </span>
                              <span className="text-[14px] text-foregroundColor-2">{levelManagerFullName}</span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Course: </span>
                              <span className="text-[14px] text-foregroundColor-2">{courseManagerFullName}</span>
                            </div>
                          </div>
                        </td>

                        <td className="w-[100px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <div>
                              <span className="text-[14px] font-medium">Students: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {studentSubjectAttendances.length}
                              </span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Marked: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {
                                  studentSubjectAttendances.filter(
                                    (studentSubjectAttendance: any) => studentSubjectAttendance.attendance !== ""
                                  ).length
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Unmarked: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {
                                  studentSubjectAttendances.filter(
                                    (studentSubjectAttendance: any) => studentSubjectAttendance.attendance === ""
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="w-[100px] text-center px-3 whitespace-nowrap font-medium">
                          {
                            studentSubjectAttendances.filter(
                              (studentSubjectAttendance: any) => studentSubjectAttendance.attendance === "Present"
                            ).length
                          }
                        </td>

                        <td className="w-[100px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <div>
                              <span className="text-[14px] font-medium">Excused: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {
                                  studentSubjectAttendances.filter(
                                    (studentSubjectAttendance: any) =>
                                      studentSubjectAttendance.attendance === "Late (Excused)"
                                  ).length
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Unexcused: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {
                                  studentSubjectAttendances.filter(
                                    (studentSubjectAttendance: any) =>
                                      studentSubjectAttendance.attendance === "Late (Unexcused)"
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="w-[100px] text-center px-3 whitespace-nowrap">
                          <div className="flex flex-col justify-center items-center">
                            <div>
                              <span className="text-[14px] font-medium">Excused: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {
                                  studentSubjectAttendances.filter(
                                    (studentSubjectAttendance: any) =>
                                      studentSubjectAttendance.attendance === "Absent (Excused)"
                                  ).length
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-[14px] font-medium">Unexcused: </span>
                              <span className="text-[14px] text-foregroundColor-2">
                                {
                                  studentSubjectAttendances.filter(
                                    (studentSubjectAttendance: any) =>
                                      studentSubjectAttendance.attendance === "Absent (Unexcused)"
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="text-center flex items-center justify-center h-20">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasEditAccess) {
                                document.body.style.overflow = "hidden";
                                setOpenEditStudentSubjectAttendanceDialog(true);
                                setOnOpenEditStudentSubjectAttendanceData(doc);
                              } else {
                                setError(
                                  "You do not have Edit Student Subject Attendance Access - Please contact your admin"
                                );
                              }
                            }}
                            onDelete={(e) => {
                              if (hasDeleteAccess) {
                                document.body.style.overflow = "hidden";
                                setConfirmWithText(attendanceCustomId);
                                setConfirmWithReturnObj({ attendanceId: doc._id });
                                setOpenConfirmDelete(true);
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Student Subject Attendance Access - Please contact your admin"
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

export default StudentSubjectAttendances;
