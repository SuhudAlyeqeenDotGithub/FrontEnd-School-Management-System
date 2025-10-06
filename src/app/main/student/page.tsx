"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
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
import { CgTrash } from "react-icons/cg";
import {
  DisallowedActionDialog,
  ConfirmActionByInputDialog,
  CustomFilterComponent
} from "@/lib/customComponents/general/compLibrary2";
import { MdContentCopy, MdAdd, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  defaultButtonStyle,
  ghostbuttonStyle,
  paginationButtonStyle,
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
import { StudentProfileDialogComponent } from "@/lib/customComponents/student/studentProfileDialogComp";

const StudentProfile = () => {
  const { hasActionAccess, useReusableInfiniteQuery } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/student/profile");

  // const { student, isLoading: isFetching } = useAppSelector((state) => state.studentData);
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openStudentDialog, setOpenEditStudentDialog] = useState(false);
  const [openNewStudentDialog, setOpenNewStudentDialog] = useState(false);
  const [openViewStudentDialog, setOpenViewStudentDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [openFilterDiv, setOpenFilterDiv] = useState(false);
  const [onOpenStudentProfileDialogData, setOnOpenStudentProfileDialogData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});

  const [paginationData, setPaginationData] = useState<any>({
    totalCount: 0,
    chunkCount: 0,
    hasNext: false
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimit] = useState("10");
  const [queryParams, setQueryParams] = useState({});

  const {
    data: student,
    isFetching,
    error: queryError,
    isError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "studentProfiles",
    queryParams,
    Number(limit) || 10,
    "View Student Profiles",
    "alyeqeenschoolapp/api/student/profile"
  );

  useEffect(() => {
    if (!student) return;
    setError("");
    const currentPage: any = student.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.studentProfiles);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [student, isFetching]);

  useEffect(() => {
    if (!isError) return;
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError, isError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { studentProfiles, ...rest } = foundPage;
      setLocalData(studentProfiles);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { studentProfiles, ...rest } = foundPage;
      setLocalData(studentProfiles);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };
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

  if (queryError)
    return (
      <ErrorDiv
        onClose={(close) => {
          if (close) {
            setError("");
          }
        }}
      >
        {error}
      </ErrorDiv>
    );

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
      <div className="">
        {openStudentDialog && (
          <StudentProfileDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditStudentDialog(!open);
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenEditStudentDialog(!notSave);
            }}
            data={onOpenStudentProfileDialogData}
          />
        )}
        {openNewStudentDialog && (
          <StudentProfileDialogComponent
            type="new"
            data={onOpenStudentProfileDialogData}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewStudentDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewStudentDialog(!notSave);
              return {};
            }}
          />
        )}

        {openViewStudentDialog && (
          <StudentProfileDialogComponent
            type="view"
            data={onOpenStudentProfileDialogData}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewStudentDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewStudentDialog(!notSave);
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
                  let imageDeletionDone = false;
                  if (returnObject.imageLocalDestination || returnObject.imageLocalDestination !== "") {
                    imageDeletionDone = await handledDeleteImage(returnObject.imageLocalDestination);
                  } else {
                    imageDeletionDone = true;
                  }

                  if (imageDeletionDone) {
                    await deleteMutation.mutateAsync({ studentIDToDelete: returnObject.studentIDToDelete });
                  } else {
                    return;
                  }
                } catch (err: any) {
                  console.log("error deleting student profile", err.message);
                  setError(err.message);
                }
              } else {
                setError("An error occured while deleting - Please try again");
              }
              setOpenConfirmDelete(false);
              document.body.style.overflow = "";
            }}
            warningText="Please confirm the ID of the student profile you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Student Profiles
                {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">Register and manage student</CustomHeading>
            </div>
            <button onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </button>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Student Profile")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewStudentDialog(true);
                  } else {
                    setError("You do not have Create Student Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Student Profile")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Student
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              placeholder="Search Student (Custom ID, Names, Email, Gender, Nationality, Next of Kin)"
              filters={[
                {
                  displayText: "Gender",
                  fieldName: "studentGender",
                  options: ["All", "Male", "Female", "Other"]
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
                  renderPreviousPage(prevPage, student.pages);
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
                  renderNextPage(nextPage, student.pages);
                }}
                disabled={!paginationData.hasNext}
              />
            </div>
          </div>
          {/* table body */}
          {
            <div className={tableContainerStyle}>
              {/* table header */}

              <table className="relative w-full">
                <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                  <tr className={tableHeaderStyle}>
                    <th className="text-center w-[110px] font-semibold p-2 whitespace-nowrap"></th>

                    {(["Student Custom ID", "Full Name", "Gender", "Email", "Phone Number"] as const).map((header) => (
                      <th
                        key={header}
                        onClick={() => {
                          const key_Name = {
                            "Student Custom ID": "studentCustomId",
                            "Full Name": "studentFullName",

                            "Phone Number": "studentPhone",
                            Gender: "studentGender",
                            Email: "studentEmail"
                          };
                          const sortKey = key_Name[header];
                          handleSort(sortKey);
                        }}
                        className={sortableTableHeadCellStyle}
                      >
                        {header}
                        <LuArrowUpDown className="inline-block ml-1" />
                      </th>
                    ))}
                    <th className={tableHeadCellStyle}>Actions</th>
                  </tr>
                </thead>

                {/* table data */}
                <tbody className="bg-backgroundColor rounded-b-lg">
                  {isFetching ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex items-center justify-center p-10">
                          <LoaderDiv
                            type="spinnerText"
                            text="Loading Student Profiles..."
                            textColor="foregroundColor"
                            dimension="h-10 w-10"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (localData.length < 1 && !isFetching) || !student ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    localData.map((doc: any, index: any) => {
                      const {
                        _id: profileId,
                        studentCustomId,
                        studentFullName,
                        studentGender,
                        studentEmail,
                        studentPhone
                      } = doc;

                      return (
                        <tr
                          key={profileId}
                          onClick={() => {
                            if (hasActionAccess("View Student Profile")) {
                              document.body.style.overflow = "hidden";
                              setOnOpenStudentProfileDialogData(doc);
                              setOpenViewStudentDialog(true);
                            } else {
                              setError("You do not have View Student Profile Access - Please contact your admin");
                            }
                          }}
                          className={tableRowStyle}
                        >
                          <td className="w-[110px] whitespace-nowrap text-center flex items-center justify-center h-15">
                            <span className="rounded-full bg-backgroundColor-3 p-2 text-foregroundColor w-10 h-10 flex items-center justify-center">
                              <p>{studentFullName.toUpperCase().slice(0, 2)}</p>
                            </span>
                          </td>
                          <td className="w-[200px] text-center whitespace-nowrap">
                            {studentCustomId.slice(0, 10)}
                            <MdContentCopy
                              title="copy id"
                              className="ml-2 inline-block text-[19px] text-foregroundColor-2  hover:text-foregroundColor-50 hover:cursor-pointer"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await navigator.clipboard.writeText(studentCustomId);
                              }}
                            />
                          </td>
                          <td className={tableCellStyle}>{studentFullName.slice(0, 20)}</td>
                          <td className={tableCellStyle}>{studentGender}</td>
                          <td className={tableCellStyle}>{studentEmail}</td>
                          <td className={tableCellStyle}>{studentPhone}</td>

                          <td className="text-center flex items-center justify-center h-15">
                            <ActionButtons
                              onEdit={(e) => {
                                if (hasActionAccess("Edit Student Profile")) {
                                  document.body.style.overflow = "hidden";
                                  setOnOpenStudentProfileDialogData(doc);
                                  setOpenEditStudentDialog(true);
                                } else {
                                  setError("You do not have Edit Student Profile Access - Please contact your admin");
                                }
                              }}
                              onDelete={(e) => {
                                if (hasActionAccess("Delete Student Profile")) {
                                  document.body.style.overflow = "hidden";
                                  setConfirmWithText(studentCustomId);
                                  setConfirmWithReturnObj({
                                    studentIDToDelete: studentCustomId,
                                    imageLocalDestination: doc.imageLocalDestination
                                  });
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
          }
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default StudentProfile;
