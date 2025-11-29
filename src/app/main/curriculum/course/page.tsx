"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
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
import { CourseDialogComponent } from "@/lib/customComponents/curriculum/courseDialogComp";

import {
  dataRowCellStyle,
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
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd, MdContentCopy } from "react-icons/md";

const Courses = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/curriculum/course");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditCourseDialog, setOpenEditCourseDialog] = useState(false);
  const [openNewCourseDialog, setOpenNewCourseDialog] = useState(false);
  const [openViewCourseDialog, setOpenViewCourseDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenCourseDialogData, setOnOpenCourseDialogData] = useState<any>({});
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
    data: programmes,
    isFetching: isFetchingprogrammes,
    error: programmesError,
    isError: isprogrammesError
  } = useReusableQuery("programmes", "View Programmes", "alyeqeenschoolapp/api/curriculum/allprogrammes");

  const {
    data: courses,
    isFetching: isFetchingcourses,
    error: coursesError,
    isError: isCoursesError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "courses",
    queryParams,
    Number(limit) || 10,
    "View Courses",
    "alyeqeenschoolapp/api/curriculum/courses"
  );

  useEffect(() => {
    if (!programmes) return;
  }, [programmes, isFetchingprogrammes]);

  useEffect(() => {
    if (!isprogrammesError) return;
    if (programmesError) {
      setError(programmesError.message);
    }
  }, [programmesError, isprogrammesError]);

  useEffect(() => {
    if (!courses) return;
    const currentPage: any = courses.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.courses);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [courses, isFetchingcourses]);

  useEffect(() => {
    if (!isCoursesError) return;
    if (coursesError) {
      setError(coursesError.message);
    }
  }, [coursesError, isCoursesError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { courses, ...rest } = foundPage;
      setLocalData(courses);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { courses, ...rest } = foundPage;
      setLocalData(courses);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };
  if (!hasActionAccess("View Courses")) {
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
          text="Loading Course Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (isFetchingprogrammes) {
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
    // console.log("localData", localData);
    // console.log("sortKey", sortKey);
    // console.log("first item", [...localData][0][sortKey]);
    // console.log("keyType", keyType);
    // console.log("sortOrder", sortOrder);
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
        {openEditCourseDialog && (
          <CourseDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditCourseDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenEditCourseDialog(!notSave);
              return {};
            }}
            programmes={programmes ? programmes : []}
            data={onOpenCourseDialogData}
          />
        )}

        {openViewCourseDialog && (
          <CourseDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewCourseDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenViewCourseDialog(!notSave);
              return {};
            }}
            programmes={programmes ? programmes : []}
            data={onOpenCourseDialogData}
          />
        )}
        {openNewCourseDialog && (
          <CourseDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewCourseDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenNewCourseDialog(!notSave);
              return {};
            }}
            programmes={programmes ? programmes : []}
          />
        )}
        {openDisallowedDeleteDialog && (
          <DisallowedActionDialog
            warningText="This delete action is disallowed as it relates to the default Admin / organisation account"
            onOk={() => {
              document.body.style.overflow = "";
              setOpenDisallowedDeleteDialog(false);
              setError("");
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
                  await deleteMutation.mutateAsync(returnObject);
                } catch (err: any) {
                  setError(err.message);
                }
              } else {
                setError("An error occured while deleting - Please try again");
              }
              setOpenConfirmDelete(false);
              document.body.style.overflow = "";
            }}
            warningText="Please confirm the ID of the course/account you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Courses
                {/* <CourseRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5">
                Stream or Department - Defines the path within the programme
              </CustomHeading>
              <CustomHeading variation="head6light">
                JSE (Junior Secondary Education), Computer Science, Art, Commercial, Science, Software Engineering
              </CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Course")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewCourseDialog(true);
                  } else {
                    setError("You do not have Create Course Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Course")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Course
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search role (Course Name, Course Custom ID, Course Full Title)"
              filters={[
                {
                  displayText: "Status",
                  fieldName: "status",
                  options: ["All", "Active", "Inactive"]
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
                  renderPreviousPage(prevPage, courses.pages);
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
                  renderNextPage(nextPage, courses.pages);
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
                  {(
                    [
                      "Course Custom ID",
                      "Course Name",
                      "Course Full Title",
                      "Status",
                      "Duration",
                      "Offering Start Date",
                      "Offering End Date"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Course Name": "courseName",
                          "Course Custom ID": "courseCustomId",
                          "Course Full Title": "courseFullTitle",
                          Status: "status",
                          Duration: "courseDuration",
                          "Offering Start Date": "offeringStartDate",
                          "Offering End Date": "offeringEndDate"
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

              {/* table data */}
              <tbody className="mt-3 bg-backgroundColor">
                {isFetchingcourses ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Courses..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingcourses) || !courses ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: courseId,
                      courseCustomId,
                      courseName,
                      offeringStartDate,
                      offeringEndDate,
                      status,
                      courseFullTitle,
                      courseDuration
                    } = doc;

                    return (
                      <tr
                        key={courseId}
                        onClick={() => {
                          if (hasActionAccess("View Courses")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenCourseDialogData(doc);
                            setOpenViewCourseDialog(true);
                          } else {
                            setError("You do not have View Course Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          {courseCustomId}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(courseCustomId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {courseName}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(courseName);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {courseFullTitle.slice(0, 40)}...
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(courseFullTitle);
                            }}
                          />
                        </td>

                        <td className={tableCellStyle}>
                          <StatusFormatter text={status} />
                        </td>
                        <td className={tableCellStyle}>{courseDuration}</td>

                        <td className={tableCellStyle}>{formatDate(offeringStartDate)}</td>
                        <td className={tableCellStyle}>{formatDate(offeringEndDate)}</td>

                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Course")) {
                                document.body.style.overflow = "hidden";
                                setOnOpenCourseDialogData(doc);
                                setOpenEditCourseDialog(true);
                              } else {
                                setError("You do not have Edit Course Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Course")) {
                                document.body.style.overflow = "hidden";
                                setOpenConfirmDelete(true);
                                setConfirmWithText(courseCustomId);
                                setConfirmWithReturnObj({
                                  courseCustomId
                                });
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Course Access - Please contact your admin"
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
    </div>
  );
};

export default Courses;
