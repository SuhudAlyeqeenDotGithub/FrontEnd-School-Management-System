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
import { ProgrammeManagerDialogComponent } from "@/lib/customComponents/curriculum/programmeManagerDialogComp";

const ProgrammeManager = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/curriculum/programme/manager");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditProgrammeManagerDialog, setOpenEditProgrammeManagerDialog] = useState(false);
  const [openNewProgrammeManagerDialog, setOpenNewProgrammeManagerDialog] = useState(false);
  const [openViewProgrammeManagerDialog, setOpenViewProgrammeManagerDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenProgrammeManagerDialogData, setOnOpenProgrammeManagerDialogData] = useState<any>({});
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
    data: programmes,
    isFetching: isFetchingprogrammes,
    error: programmesError,
    isError: isprogrammesError
  } = useReusableQuery("programmes", "View Programmes", "alyeqeenschoolapp/api/curriculum/allprogrammes");

  const {
    data: programmeManagers,
    isFetching: isFetchingprogrammeManagers,
    error: programmeManagersError,
    isError: isProgrammeManagersError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "programmeManagers",
    queryParams,
    Number(limit) || 10,
    "View Programme Managers",
    "alyeqeenschoolapp/api/curriculum/programme/managers"
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
    if (!programmes) return;
  }, [programmes, isFetchingprogrammes]);

  useEffect(() => {
    if (!isprogrammesError) return;
    if (programmesError) {
      setError(programmesError.message);
    }
  }, [programmesError, isprogrammesError]);

  useEffect(() => {
    if (!programmeManagers) return;
    const currentPage: any = programmeManagers.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.programmeManagers);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [programmeManagers, isFetchingprogrammeManagers]);

  useEffect(() => {
    if (!isProgrammeManagersError) return;
    if (programmeManagersError) {
      setError(programmeManagersError.message);
    }
  }, [programmeManagersError, isProgrammeManagersError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { programmeManagers, ...rest } = foundPage;
      setLocalData(programmeManagers);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { programmeManagers, ...rest } = foundPage;
      setLocalData(programmeManagers);
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
          text="Loading Programme Manager Data..."
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
        {openEditProgrammeManagerDialog && (
          <ProgrammeManagerDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditProgrammeManagerDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenEditProgrammeManagerDialog(!notSave);
              return {};
            }}
            data={onOpenProgrammeManagerDialogData}
            programmes={programmes ? programmes : []}
            staffContracts={staffContracts ? staffContracts : []}
          />
        )}

        {openViewProgrammeManagerDialog && (
          <ProgrammeManagerDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewProgrammeManagerDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenViewProgrammeManagerDialog(!notSave);
              return {};
            }}
            data={onOpenProgrammeManagerDialogData}
            programmes={programmes ? programmes : []}
            staffContracts={staffContracts ? staffContracts : []}
          />
        )}
        {openNewProgrammeManagerDialog && (
          <ProgrammeManagerDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewProgrammeManagerDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenNewProgrammeManagerDialog(!notSave);
              return {};
            }}
            programmes={programmes ? programmes : []}
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
            warningText="Please confirm the ID of the programme Manager you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Programme Manager
                {/* <ProgrammeManagerRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">
                Manage and assign programme managers to specific programmes
              </CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Programme Manager")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewProgrammeManagerDialog(true);
                  } else {
                    setError("You do not have Create Programme Manager Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Programme Manager")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Programme Manager
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search role (Programme Manager Name, Programme Manager Custom ID)"
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
                  renderPreviousPage(prevPage, programmeManagers.pages);
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
                  renderNextPage(nextPage, programmeManagers.pages);
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
                      "Programme Manager ID",
                      "Programme Name",
                      "Manager Name",
                      "Management Status",
                      "Managed From",
                      "Managed Until"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Programme Manager ID": "_id",
                          "Manager Name": "programmeManagerFullName",
                          "Programme Name": "programmeName",
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
                {isFetchingprogrammeManagers ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Programme Managers..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingprogrammeManagers) || !programmeManagers ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: programmeManagerId,
                      programmeName,
                      programmeManagerFullName,
                      managedFrom,
                      managedUntil,
                      status
                    } = doc;

                    return (
                      <tr
                        key={programmeManagerId}
                        onClick={() => {
                          if (hasActionAccess("View Programme Managers")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenProgrammeManagerDialogData(doc);
                            setOpenViewProgrammeManagerDialog(true);
                          } else {
                            setError("You do not have View Programme Manager Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          {programmeManagerId.slice(15)}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(programmeManagerId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>{programmeName}</td>
                        <td className={tableCellStyle}>
                          {programmeManagerFullName}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(programmeManagerFullName);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          <StatusFormatter text={status} />
                        </td>
                        <td className={tableCellStyle}>{formatDate(managedFrom)}</td>
                        <td className={tableCellStyle}>{formatDate(managedUntil)}</td>
                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Programme Manager")) {
                                document.body.style.overflow = "hidden";
                                setOnOpenProgrammeManagerDialogData(doc);
                                setOpenEditProgrammeManagerDialog(true);
                              } else {
                                setError("You do not have Edit Programme Manager Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Programme Manager")) {
                                document.body.style.overflow = "hidden";
                                setOpenConfirmDelete(true);
                                setConfirmWithText(programmeManagerId);
                                setConfirmWithReturnObj({
                                  programmeManagerId
                                });
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Programme Manager Access - Please contact your admin"
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

export default ProgrammeManager;
