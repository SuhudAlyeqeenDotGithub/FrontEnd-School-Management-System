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
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";

import {
  DisallowedActionDialog,
  ConfirmActionByInputDialog,
  CustomFilterComponent
} from "@/lib/customComponents/general/compLibrary2";
import { ProgrammeDialogComponent } from "@/lib/customComponents/admin/programmeDialogComp";

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

const Programmes = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/admin/programmes");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditProgrammeDialog, setOpenEditProgrammeDialog] = useState(false);
  const [openNewProgrammeDialog, setOpenNewProgrammeDialog] = useState(false);
  const [openViewProgrammeDialog, setOpenViewProgrammeDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenProgrammeDialogData, setOnOpenProgrammeDialogData] = useState<any>({});
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
  const [limit, setLimit] = useState("3");
  const [queryParams, setQueryParams] = useState({});

  const {
    data: staffProfiles,
    isFetching: isFetchingStaffProfiles,
    error: staffProfilesError,
    isError: isStaffProfilesError
  } = useReusableQuery("staffProfiles", "View Staff Profiles", "alyeqeenschoolapp/api/staff/allprofile");

  const {
    data: roles,
    isFetching: isFetchingroles,
    error: rolesError,
    isError: isrolesError
  } = useReusableQuery("roles", "View Roles", "alyeqeenschoolapp/api/admin/roles");

  const {
    data: programmes,
    isFetching: isFetchingprogrammes,
    error: programmesError,
    isError: isProgrammesError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "programmes",
    queryParams,
    Number(limit) || 10,
    "View Programmes",
    "alyeqeenschoolapp/api/admin/programmes"
  );

  useEffect(() => {
    if (!staffProfiles) return;
    setError("");
  }, [staffProfiles, isFetchingStaffProfiles]);

  useEffect(() => {
    if (!isStaffProfilesError) return;
    if (staffProfilesError) {
      setError(staffProfilesError.message);
    }
  }, [staffProfilesError, isStaffProfilesError]);

  useEffect(() => {
    if (!roles) return;
    setError("");
  }, [roles, isFetchingroles]);

  useEffect(() => {
    if (!isrolesError) return;
    if (rolesError) {
      setError(rolesError.message);
    }
  }, [rolesError, isStaffProfilesError]);

  useEffect(() => {
    if (!programmes) return;
    setError("");
    const currentPage: any = programmes.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.programmes);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [programmes, isFetchingprogrammes]);

  useEffect(() => {
    if (!isProgrammesError) return;
    if (programmesError) {
      setError(programmesError.message);
    }
  }, [programmesError, isProgrammesError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { programmes, ...rest } = foundPage;
      setLocalData(programmes);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { programmes, ...rest } = foundPage;
      setLocalData(programmes);
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
          text="Loading Programme Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (!roles || !staffProfiles) {
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
        {openEditProgrammeDialog && (
          <ProgrammeDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditProgrammeDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenEditProgrammeDialog(!notSave);
              return {};
            }}
            staffProfiles={staffProfiles}
            data={onOpenProgrammeDialogData}
            roles={roles
              .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
              .map(({ _id, roleName, tabAccess }: any) => ({
                _id,
                name: roleName,
                tabAccess,
                searchText: _id + roleName
              }))}
          />
        )}

        {openViewProgrammeDialog && (
          <ProgrammeDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewProgrammeDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewProgrammeDialog(!notSave);
              return {};
            }}
            data={onOpenProgrammeDialogData}
            staffProfiles={staffProfiles}
            roles={roles
              .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
              .map((roleDocument: any) => ({
                ...roleDocument,
                searchText: roleDocument._id + roleDocument.roleName
              }))}
          />
        )}
        {openNewProgrammeDialog && (
          <ProgrammeDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewProgrammeDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewProgrammeDialog(!notSave);
              return {};
            }}
            staffProfiles={staffProfiles}
            roles={roles
              .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
              .map((roleDocument: any) => ({
                ...roleDocument,
                searchText: roleDocument._id + roleDocument.roleName
              }))}
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
            warningText="Please confirm the ID of the programme/account you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Programmes
                {/* <ProgrammeRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">
                Use this section to create and manage programmes and their access
              </CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Programme")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewProgrammeDialog(true);
                  } else {
                    setError("You do not have Create Programme Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Programme")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Programme
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              placeholder="Search role (Programme Name, Email, Status)"
              filters={[
                {
                  displayText: "Account Status",
                  fieldName: "accountStatus",
                  options: ["All", "Active", "Locked"]
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
                  renderPreviousPage(prevPage, programmes.pages);
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
                  renderNextPage(nextPage, programmes.pages);
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
                  <th className="text-center w-[110px] font-semibold p-2 whitespace-nowrap">Programme Id</th>
                  {(["Programme Name", "Programme Role", "Programme Email", "Account Status", "Created At"] as const).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Programme Name": "accountName",
                          "Programme Role": "role",
                          "Programme Email": "accountEmail",
                          "Account Status": "accountStatus",
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
                  <th className={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>

              {/* table data */}
              <tbody className="mt-3 bg-backgroundColor">
                {isFetchingprogrammes ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Programmes..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingprogrammes) || !programmes ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const {
                      _id: accountId,
                      staffId,
                      accountName,
                      accountEmail,
                      accountType,
                      accountStatus,
                      roleId,
                      accountPassword,
                      createdAt
                    } = doc;

                    const tabs = roleId
                      ? roleId.tabAccess
                          ?.map((tab: any) => tab.tab)
                          .slice(0, 5)
                          .join(", ")
                      : "Unknown Role";
                    return (
                      <tr
                        key={accountId}
                        onClick={() => {
                          if (hasActionAccess("View Programme")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenProgrammeDialogData(doc);
                            setOpenViewProgrammeDialog(true);
                          } else {
                            setError("You do not have View Programme Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          CID
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(accountId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          {accountName}{" "}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(accountName);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>{roleId ? roleId?.roleName.slice(0, 15) : "Unknown Role"}</td>
                        <td className={tableCellStyle}>
                          {accountEmail}{" "}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(accountEmail);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>{accountStatus}</td>
                        <td className={tableCellStyle}>{formatDate(createdAt)}</td>

                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Programme")) {
                                document.body.style.overflow = "hidden";

                                setOnOpenProgrammeDialogData(doc);
                                setOpenEditProgrammeDialog(true);
                              } else {
                                setError("You do not have Edit Programme Access - Please contact your admin");
                              }
                            }}
                            disableDelete={roleId.absoluteAdmin}
                            hideDelete={roleId.absoluteAdmin}
                            onDelete={(e) => {
                              if (roleId.absoluteAdmin) {
                                setError(
                                  "Disallowed Action: Default Absolute Admin / organisation account Cannot be deleted"
                                );
                                setOpenDisallowedDeleteDialog(true);
                              } else {
                                if (hasActionAccess("Delete Programme")) {
                                  document.body.style.overflow = "hidden";
                                  setOpenConfirmDelete(true);
                                  setConfirmWithText(accountId);
                                  setConfirmWithReturnObj({
                                    accountIdToDelete: accountId,
                                    accountType,
                                    staffId,
                                    programmeName: accountName,
                                    programmeEmail: accountEmail,
                                    programmeStatus: accountStatus,
                                    roleId
                                  });
                                } else {
                                  setError(
                                    "Unauthorised Action: You do not have Delete Programme Access - Please contact your admin"
                                  );
                                }
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

export default Programmes;
