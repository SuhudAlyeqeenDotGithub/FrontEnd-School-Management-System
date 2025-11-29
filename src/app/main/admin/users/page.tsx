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
import { UserDialogComponent } from "@/lib/customComponents/admin/userDialogComp";

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

const Users = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/admin/users");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [openViewUserDialog, setOpenViewUserDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenUserDialogData, setOnOpenUserDialogData] = useState<any>({});
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
    data: users,
    isFetching: isFetchingusers,
    error: usersError,
    isError: isUsersError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "users",
    queryParams,
    Number(limit) || 10,
    "View Users",
    "alyeqeenschoolapp/api/admin/users"
  );

  useEffect(() => {
    if (!staffProfiles) return;
  }, [staffProfiles, isFetchingStaffProfiles]);

  useEffect(() => {
    if (!isStaffProfilesError) return;
    if (staffProfilesError) {
      setError(staffProfilesError.message);
    }
  }, [staffProfilesError, isStaffProfilesError]);

  useEffect(() => {
    if (!roles) return;
  }, [roles, isFetchingroles]);

  useEffect(() => {
    if (!isrolesError) return;
    if (rolesError) {
      setError(rolesError.message);
    }
  }, [rolesError, isrolesError]);

  useEffect(() => {
    if (!users) return;
    const currentPage: any = users.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.users);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [users, isFetchingusers]);

  useEffect(() => {
    if (!isUsersError) return;
    if (usersError) {
      setError(usersError.message);
    }
  }, [usersError, isUsersError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { users, ...rest } = foundPage;
      setLocalData(users);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { users, ...rest } = foundPage;
      setLocalData(users);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };

  if (!hasActionAccess("View Users")) {
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
          text="Loading User Data..."
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
        {openEditUserDialog && (
          <UserDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditUserDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenEditUserDialog(!notSave);
              return {};
            }}
            staffProfiles={staffProfiles}
            data={onOpenUserDialogData}
            roles={
              onOpenUserDialogData?.roleId?.absoluteAdmin
                ? roles.map(({ _id, roleName, tabAccess }: any) => ({
                    _id,
                    name: roleName,
                    tabAccess,
                    searchText: _id + roleName
                  }))
                : roles
                    .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
                    .map(({ _id, roleName, tabAccess }: any) => ({
                      _id,
                      name: roleName,
                      tabAccess,
                      searchText: _id + roleName
                    }))
            }
          />
        )}

        {openViewUserDialog && (
          <UserDialogComponent
            type="view"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewUserDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewUserDialog(!notSave);
              return {};
            }}
            data={onOpenUserDialogData}
            staffProfiles={staffProfiles}
            roles={
              onOpenUserDialogData?.roleId?.absoluteAdmin
                ? roles.map(({ _id, roleName, tabAccess }: any) => ({
                    _id,
                    name: roleName,
                    tabAccess,
                    searchText: _id + roleName
                  }))
                : roles
                    .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
                    .map(({ _id, roleName, tabAccess }: any) => ({
                      _id,
                      name: roleName,
                      tabAccess,
                      searchText: _id + roleName
                    }))
            }
          />
        )}
        {openNewUserDialog && (
          <UserDialogComponent
            type="new"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewUserDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewUserDialog(!notSave);
              return {};
            }}
            staffProfiles={staffProfiles}
            roles={
              onOpenUserDialogData?.roleId?.absoluteAdmin
                ? roles.map(({ _id, roleName, tabAccess }: any) => ({
                    _id,
                    name: roleName,
                    tabAccess,
                    searchText: _id + roleName
                  }))
                : roles
                    .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
                    .map(({ _id, roleName, tabAccess }: any) => ({
                      _id,
                      name: roleName,
                      tabAccess,
                      searchText: _id + roleName
                    }))
            }
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
            warningText="Please confirm the ID of the user/account you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Users
                {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">
                Use this section to create and manage users and their access
              </CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create User")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewUserDialog(true);
                  } else {
                    setError("You do not have Create User Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create User")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New User
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
              placeholder="Search role (User Name, Email, Status)"
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
                  renderPreviousPage(prevPage, users.pages);
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
                  renderNextPage(nextPage, users.pages);
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
                  <th className="text-center w-[110px] font-semibold p-2 whitespace-nowrap">User Id</th>
                  {(["User Name", "User Role", "User Email", "Account Status", "Created At"] as const).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "User Name": "accountName",
                          "User Role": "role",
                          "User Email": "accountEmail",
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
                {isFetchingusers ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Users..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingusers) || !users ? (
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
                          if (hasActionAccess("View User")) {
                            document.body.style.overflow = "hidden";
                            setOnOpenUserDialogData(doc);
                            setOpenViewUserDialog(true);
                          } else {
                            setError("You do not have View User Access - Please contact your admin");
                          }
                        }}
                        className="hover:bg-backgroundColor-2 hover:cursor-pointer border-y border-borderColor-2 h-15 gap-7"
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
                          {accountId.slice(15)}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(accountId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          <div className="flex flex-col justify-center items-center">
                            <span className="font-medium text-[14px] text-foregroundColor-2">
                              {staffId ? staffId?.staffCustomId.slice(0, 15) : "Not a Staff"}
                            </span>

                            <span className=" font-medium">
                              {accountName}
                              <MdContentCopy
                                title="copy id"
                                className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await navigator.clipboard.writeText(accountName);
                                }}
                              />
                            </span>
                          </div>
                        </td>

                        <td className={tableCellStyle}>{roleId ? roleId?.roleName.slice(0, 15) : "Unknown Role"}</td>
                        <td className={tableCellStyle}>
                          {accountEmail}{" "}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(accountEmail);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>
                          <StatusFormatter text={accountStatus} />
                        </td>
                        <td className={tableCellStyle}>{formatDate(createdAt)}</td>

                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit User")) {
                                document.body.style.overflow = "hidden";

                                setOnOpenUserDialogData(doc);
                                setOpenEditUserDialog(true);
                              } else {
                                setError("You do not have Edit User Access - Please contact your admin");
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
                                if (hasActionAccess("Delete User")) {
                                  document.body.style.overflow = "hidden";
                                  setOpenConfirmDelete(true);
                                  setConfirmWithText(accountId);
                                  setConfirmWithReturnObj({
                                    accountIdToDelete: accountId,
                                    accountType,
                                    staffId,
                                    userName: accountName,
                                    userEmail: accountEmail,
                                    userStatus: accountStatus,
                                    roleId
                                  });
                                } else {
                                  setError(
                                    "Unauthorised Action: You do not have Delete User Access - Please contact your admin"
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

export default Users;
