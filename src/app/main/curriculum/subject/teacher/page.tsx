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
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
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
import { SubjectTeacherDialogComponent } from "@/lib/customComponents/curriculum/subjectTeacherDialogComp";

const SubjectTeacher = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/curriculum/subject/teacher");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditSubjectTeacherDialog, setOpenEditSubjectTeacherDialog] = useState(false);
  const [openNewSubjectTeacherDialog, setOpenNewSubjectTeacherDialog] = useState(false);
  const [openViewSubjectTeacherDialog, setOpenViewSubjectTeacherDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenSubjectTeacherDialogData, setOnOpenSubjectTeacherDialogData] = useState<any>({});
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
    data: staffContracts,
    isFetching: isFetchingStaffContracts,
    error: staffContractsError,
    isError: isStaffContractsError
  } = useReusableQuery("staffContracts", "View Staff Contracts", "alyeqeenschoolapp/api/staff/allcontract");

  const {
    data: subjects,
    isFetching: isFetchingsubjects,
    error: subjectsError,
    isError: issubjectsError
  } = useReusableQuery("subjects", "View Subjects", "alyeqeenschoolapp/api/curriculum/allsubjects");

  const {
    data: subjectTeachers,
    isFetching: isFetchingsubjectTeachers,
    error: subjectTeachersError,
    isError: isSubjectTeachersError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "subjectteachers",
    queryParams,
    Number(limit) || 10,
    "View Subject Teachers",
    "alyeqeenschoolapp/api/curriculum/subject/teachers"
  );

  useEffect(() => {
    if (!staffContracts) return;
  }, [staffContracts, isFetchingStaffContracts]);

  useEffect(() => {
    if (!isStaffContractsError) return;
    if (staffContractsError) {
      setError(staffContractsError.message);
    }
  }, [staffContractsError, isStaffContractsError]);

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
    if (!subjectTeachers) return;
    const currentPage: any = subjectTeachers.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.subjectTeachers);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [subjectTeachers, isFetchingsubjectTeachers]);

  useEffect(() => {
    if (!isSubjectTeachersError) return;
    if (subjectTeachersError) {
      setError(subjectTeachersError.message);
    }
  }, [subjectTeachersError, isSubjectTeachersError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { subjectTeachers, ...rest } = foundPage;
      setLocalData(subjectTeachers);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { subjectTeachers, ...rest } = foundPage;
      setLocalData(subjectTeachers);
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
          text="Loading Subject Teacher Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (isFetchingsubjects) {
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

  console.log("error", error);

  return (
    <div className="px-4 py-6 w-full">
      {/* data table section */}
      <>
        {openEditSubjectTeacherDialog && (
          <SubjectTeacherDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditSubjectTeacherDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenEditSubjectTeacherDialog(!notSave);
              return {};
            }}
            data={onOpenSubjectTeacherDialogData}
            subjects={subjects ? subjects : []}
            staffContracts={staffContracts ? staffContracts : []}
          />
        )}

        {openViewSubjectTeacherDialog && (
          <SubjectTeacherDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewSubjectTeacherDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenViewSubjectTeacherDialog(!notSave);
              return {};
            }}
            data={onOpenSubjectTeacherDialogData}
            subjects={subjects ? subjects : []}
            staffContracts={staffContracts ? staffContracts : []}
          />
        )}
        {openNewSubjectTeacherDialog && (
          <SubjectTeacherDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewSubjectTeacherDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenNewSubjectTeacherDialog(!notSave);
              return {};
            }}
            subjects={subjects ? subjects : []}
            staffContracts={staffContracts ? staffContracts : []}
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
            warningText="Please confirm the ID of the subject Teacher you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Subject Teacher
                {/* <SubjectTeacherRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">
                Manage and assign subject teachers to specific subjects
              </CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Subject Teacher")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewSubjectTeacherDialog(true);
                  } else {
                    setError("You do not have Create Subject Teacher Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Subject Teacher")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Subject Teacher
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search role (Subject Teacher Name, Subject Teacher Custom ID)"
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
                  renderPreviousPage(prevPage, subjectTeachers.pages);
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
                  renderNextPage(nextPage, subjectTeachers.pages);
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
                      "Subject Teacher ID",
                      "Teacher Name",
                      "Subject Full Title",
                      "Management Type",
                      "Management Status",

                      "Managed From",
                      "Managed Until"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Subject Teacher ID": "_id",
                          "Teacher Name": "subjectTeacherFullName",
                          "Subject Full Title": "subjectFullTitle",
                          "Management Type": "staffType",
                          "Management Status": "status",
                          "Managed From": "managedFrom",
                          "Managed Until": "managedUntil"
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
                {isFetchingsubjectTeachers ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Subject Teachers..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingsubjectTeachers) || !subjectTeachers ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: subjectTeacherId,
                      subjectFullTitle,
                      subjectTeacherFullName,
                      managedFrom,
                      managedUntil,
                      status,
                      staffType
                    } = doc;

                    return (
                      <tr
                        key={subjectTeacherId}
                        onClick={() => {
                          if (hasActionAccess("View Subject Teachers")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenSubjectTeacherDialogData(doc);
                            setOpenViewSubjectTeacherDialog(true);
                          } else {
                            setError("You do not have View Subject Teacher Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          {subjectTeacherId.slice(15)}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(subjectTeacherId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {subjectTeacherFullName}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(subjectTeacherFullName);
                            }}
                          />
                        </td>{" "}
                        <td className={tableCellStyle}>
                          {subjectFullTitle}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(subjectFullTitle);
                            }}
                          />
                        </td>{" "}
                        <td className={tableCellStyle}>{staffType}</td>
                        <td className={tableCellStyle}>
                          <StatusFormatter text={status} />
                        </td>
                        <td className={tableCellStyle}>{formatDate(managedFrom)}</td>
                        <td className={tableCellStyle}>{formatDate(managedUntil)}</td>
                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Subject Teacher")) {
                                document.body.style.overflow = "hidden";
                                setOnOpenSubjectTeacherDialogData(doc);
                                setOpenEditSubjectTeacherDialog(true);
                              } else {
                                setError("You do not have Edit Subject Teacher Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Subject Teacher")) {
                                document.body.style.overflow = "hidden";
                                setOpenConfirmDelete(true);
                                setConfirmWithText(subjectTeacherId);
                                setConfirmWithReturnObj({
                                  subjectTeacherId
                                });
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Subject Teacher Access - Please contact your admin"
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

export default SubjectTeacher;
