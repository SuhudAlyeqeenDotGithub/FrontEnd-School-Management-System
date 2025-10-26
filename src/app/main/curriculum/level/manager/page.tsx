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
import { LevelManagerDialogComponent } from "@/lib/customComponents/curriculum/levelManagerDialogComp";

const LevelManager = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/curriculum/level/manager");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditLevelManagerDialog, setOpenEditLevelManagerDialog] = useState(false);
  const [openNewLevelManagerDialog, setOpenNewLevelManagerDialog] = useState(false);
  const [openViewLevelManagerDialog, setOpenViewLevelManagerDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenLevelManagerDialogData, setOnOpenLevelManagerDialogData] = useState<any>({});
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
    data: levels,
    isFetching: isFetchinglevels,
    error: levelsError,
    isError: islevelsError
  } = useReusableQuery("levels", "View Levels", "alyeqeenschoolapp/api/curriculum/alllevels");

  const {
    data: levelManagers,
    isFetching: isFetchinglevelManagers,
    error: levelManagersError,
    isError: isLevelManagersError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "levelmanagers",
    queryParams,
    Number(limit) || 10,
    "View Level Managers",
    "alyeqeenschoolapp/api/curriculum/level/managers"
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
    if (!levels) return;
  }, [levels, isFetchinglevels]);

  useEffect(() => {
    if (!islevelsError) return;
    if (levelsError) {
      setError(levelsError.message);
    }
  }, [levelsError, islevelsError]);

  useEffect(() => {
    if (!levelManagers) return;
    const currentPage: any = levelManagers.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.levelManagers);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [levelManagers, isFetchinglevelManagers]);

  useEffect(() => {
    if (!isLevelManagersError) return;
    if (levelManagersError) {
      setError(levelManagersError.message);
    }
  }, [levelManagersError, isLevelManagersError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { levelManagers, ...rest } = foundPage;
      setLocalData(levelManagers);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { levelManagers, ...rest } = foundPage;
      setLocalData(levelManagers);
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
          text="Loading Level Manager Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (isFetchinglevels) {
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
        {openEditLevelManagerDialog && (
          <LevelManagerDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditLevelManagerDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenEditLevelManagerDialog(!notSave);
              return {};
            }}
            data={onOpenLevelManagerDialogData}
            levels={levels ? levels : []}
            staffContracts={staffContracts ? staffContracts : []}
          />
        )}

        {openViewLevelManagerDialog && (
          <LevelManagerDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewLevelManagerDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenViewLevelManagerDialog(!notSave);
              return {};
            }}
            data={onOpenLevelManagerDialogData}
            levels={levels ? levels : []}
            staffContracts={staffContracts ? staffContracts : []}
          />
        )}
        {openNewLevelManagerDialog && (
          <LevelManagerDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewLevelManagerDialog(!open);
              return {};
            }}
            onSave={(notSave: boolean) => {
              document.body.style.overflow = "";
              setOpenNewLevelManagerDialog(!notSave);
              return {};
            }}
            levels={levels ? levels : []}
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
            warningText="Please confirm the ID of the level Manager you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Level Manager
                {/* <LevelManagerRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">Manage and assign level managers to specific levels</CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Level Manager")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewLevelManagerDialog(true);
                  } else {
                    setError("You do not have Create Level Manager Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Level Manager")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Level Manager
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search role (Level Manager Name, Level Manager Custom ID)"
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
                  renderPreviousPage(prevPage, levelManagers.pages);
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
                  renderNextPage(nextPage, levelManagers.pages);
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
                      "Level Manager ID",
                      "Level Full Title",
                      "Manager Name",
                      "Management Status",
                      "Management Type",

                      "Managed From",
                      "Managed Until"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Level Manager ID": "_id",
                          "Manager Name": "levelManagerFullName",
                          "Level Full Title": "levelFullTitle",
                          "Management Status": "status",
                          "Management Type": "staffType",
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
                {isFetchinglevelManagers ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Level Managers..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchinglevelManagers) || !levelManagers ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: levelManagerId,
                      levelFullTitle,
                      levelManagerFullName,
                      managedFrom,
                      managedUntil,
                      status,
                      staffType
                    } = doc;

                    return (
                      <tr
                        key={levelManagerId}
                        onClick={() => {
                          if (hasActionAccess("View Level Managers")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenLevelManagerDialogData(doc);
                            setOpenViewLevelManagerDialog(true);
                          } else {
                            setError("You do not have View Level Manager Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          {levelManagerId.slice(15)}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(levelManagerId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {levelFullTitle}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(levelFullTitle);
                            }}
                          />
                        </td>

                        <td className={tableCellStyle}>
                          {levelManagerFullName}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(levelManagerFullName);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>{staffType}</td>
                        <td className={tableCellStyle}>
                          <StatusFormatter text={status} />
                        </td>
                        <td className={tableCellStyle}>{formatDate(managedFrom)}</td>
                        <td className={tableCellStyle}>{formatDate(managedUntil)}</td>
                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Level Manager")) {
                                document.body.style.overflow = "hidden";
                                setOnOpenLevelManagerDialogData(doc);
                                setOpenEditLevelManagerDialog(true);
                              } else {
                                setError("You do not have Edit Level Manager Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Level Manager")) {
                                document.body.style.overflow = "hidden";
                                setOpenConfirmDelete(true);
                                setConfirmWithText(levelManagerId);
                                setConfirmWithReturnObj({
                                  levelManagerId
                                });
                              } else {
                                setError(
                                  "Unauthorised Action: You do not have Delete Level Manager Access - Please contact your admin"
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

export default LevelManager;
