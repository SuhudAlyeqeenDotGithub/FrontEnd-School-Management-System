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
  PreviousButton
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
  tableHeadCellStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd, MdContentCopy } from "react-icons/md";
import { SubjectDialogComponent } from "@/lib/customComponents/curriculum/subjectDialogComp";

const Subjects = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/curriculum/subject");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditSubjectDialog, setOpenEditSubjectDialog] = useState(false);
  const [openNewSubjectDialog, setOpenNewSubjectDialog] = useState(false);
  const [openViewSubjectDialog, setOpenViewSubjectDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenSubjectDialogData, setOnOpenSubjectDialogData] = useState<any>({});
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
    data: baseSubjects,
    isFetching: isFetchingbaseSubjects,
    error: baseSubjectsError,
    isError: isbaseSubjectsError
  } = useReusableQuery("baseSubjects", "View Base Subjects", "alyeqeenschoolapp/api/curriculum/allbaseSubjects");

  const {
    data: subjects,
    isFetching: isFetchingsubjects,
    error: subjectsError,
    isError: isSubjectsError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "subjects",
    queryParams,
    Number(limit) || 10,
    "View Subjects",
    "alyeqeenschoolapp/api/curriculum/subjects"
  );

  useEffect(() => {
    if (!courses) return;
    setError("");
  }, [courses, isFetchingcourses]);

  useEffect(() => {
    if (!iscoursesError) return;
    if (coursesError) {
      setError(coursesError.message);
    }
  }, [coursesError, iscoursesError]);

  useEffect(() => {
    if (!levels) return;
    setError("");
  }, [levels, isFetchinglevels]);

  useEffect(() => {
    if (!islevelsError) return;
    if (levelsError) {
      setError(levelsError.message);
    }
  }, [levelsError, islevelsError]);

  useEffect(() => {
    if (!baseSubjects) return;
    setError("");
  }, [baseSubjects, isFetchingbaseSubjects]);

  useEffect(() => {
    if (!isbaseSubjectsError) return;
    if (baseSubjectsError) {
      setError(baseSubjectsError.message);
    }
  }, [baseSubjectsError, isbaseSubjectsError]);

  useEffect(() => {
    if (!subjects) return;
    setError("");
    const currentPage: any = subjects.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.subjects);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [subjects, isFetchingsubjects]);

  useEffect(() => {
    if (!isSubjectsError) return;
    if (subjectsError) {
      setError(subjectsError.message);
    }
  }, [subjectsError, isSubjectsError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { subjects, ...rest } = foundPage;
      setLocalData(subjects);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { subjects, ...rest } = foundPage;
      setLocalData(subjects);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };

  if (!accountData) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Subject Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (isFetchingcourses || isFetchinglevels || isFetchingbaseSubjects) {
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
        {openEditSubjectDialog && (
          <SubjectDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditSubjectDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenEditSubjectDialog(!notSave);
              return {};
            }}
            courses={courses ? courses : []}
            levels={levels ? levels : []}
            baseSubjects={baseSubjects ? baseSubjects : []}
            data={onOpenSubjectDialogData}
          />
        )}

        {openViewSubjectDialog && (
          <SubjectDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewSubjectDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenViewSubjectDialog(!notSave);
              return {};
            }}
            courses={courses ? courses : []}
            levels={levels ? levels : []}
            baseSubjects={baseSubjects ? baseSubjects : []}
            data={onOpenSubjectDialogData}
          />
        )}
        {openNewSubjectDialog && (
          <SubjectDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewSubjectDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenNewSubjectDialog(!notSave);
              return {};
            }}
            courses={courses ? courses : []}
            levels={levels ? levels : []}
            baseSubjects={baseSubjects ? baseSubjects : []}
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
            warningText="Please confirm the ID of the subject you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Subjects
                {/* <SubjectRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5">The subject as it exists in a specific course and level</CustomHeading>
              <CustomHeading variation="head6light">
                Mathematics - Level 1, Civic Education - JSS1, Chemistry - SSS2, Physics - SSS3, Biology - Level 5 etc.
              </CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Subject")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewSubjectDialog(true);
                  } else {
                    setError("You do not have Create Subject Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Subject")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Subject
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              placeholder="Search role (Subject Name, Subject Custom ID, Subject Full Title)"
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
                  renderPreviousPage(prevPage, subjects.pages);
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
                  renderNextPage(nextPage, subjects.pages);
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
                      "Subject Custom ID",
                      "Subject",
                      "Subject Prefix",
                      "Status",
                      "Offering Start Date",
                      "Offering End Date"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          Subject: "subject",
                          "Subject Custom ID": "subjectCustomId",
                          "Subject Prefix": "subjectFullTitle",
                          Status: "status",
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
                {isFetchingsubjects ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Subjects..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingsubjects) || !subjects ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: subjectId,
                      subjectCustomId,
                      subject,
                      offeringStartDate,
                      offeringEndDate,
                      status,
                      courseFullTitle,
                      baseSubjectName,
                      subjectFullTitle
                    } = doc;

                    return (
                      <tr
                        key={subjectId}
                        onClick={() => {
                          if (hasActionAccess("View Subjects")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenSubjectDialogData(doc);
                            setOpenViewSubjectDialog(true);
                          } else {
                            setError("You do not have View Subject Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          {subjectCustomId}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(subjectCustomId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {subject}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(subject);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {`${courseFullTitle} - ${baseSubjectName}`}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(subjectFullTitle);
                            }}
                          />
                        </td>

                        <td className={tableCellStyle}>{status}</td>
                        <td className={tableCellStyle}>{formatDate(offeringStartDate)}</td>
                        <td className={tableCellStyle}>{formatDate(offeringEndDate)}</td>

                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Subject")) {
                                document.body.style.overflow = "hidden";
                                setOnOpenSubjectDialogData(doc);
                                setOpenEditSubjectDialog(true);
                              } else {
                                setError("You do not have Edit Subject Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Subject")) {
                                document.body.style.overflow = "hidden";
                                setOpenConfirmDelete(true);
                                setConfirmWithText(subjectCustomId);
                                setConfirmWithReturnObj({
                                  subjectCustomId
                                });
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Subject Access - Please contact your admin"
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

export default Subjects;
