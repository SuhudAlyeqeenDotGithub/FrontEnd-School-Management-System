"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import NewUserComponent from "@/lib/customComponents/admin/newUserComponent";
import { deleteUser, getUsers } from "@/redux/features/admin/users/usersThunks";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/customComponents/general/compLibrary2";
import EditUserComponent from "@/lib/customComponents/admin/editUserComponent";
import { resetUsers } from "@/redux/features/admin/users/usersSlice";
import type { RootState } from "@/redux/store";
import { tableRowStyle, dataRowCellStyle } from "@/lib/generalStyles";

const Users = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.usersData);
  const { roles, isLoading: roleIsLoading } = useAppSelector((state) => state.rolesAccess);
  const { accountData } = useAppSelector((state: RootState) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenEditUserData, setOnOpenEditUserData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((tab: any) =>
    tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
  );

  const hasActionAccess = (action: string) => {
    return accountPermittedActions.includes(action);
  };
  useEffect(() => {
    if (!accountData.accountStatus) {
      return;
    }
    const fetchUsersL = async () => {
      try {
        if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
          setError("Your account is no longer active - Please contact your admin");
          return;
        }
        if (!hasActionAccess("View Users") && !accountData.roleId.absoluteAdmin) {
          setError("Unauthorized: You do not have access to view users - Please contact your admin");
          return;
        }

        await dispatch(getUsers()).unwrap();
      } catch (error: any) {
        setError(error);
      }
    };

    fetchUsersL();
  }, [accountData]);

  useEffect(() => {
    if (!accountData.accountEmail || !accountData.accountStatus) {
      return;
    }
    const fetchRoles = async () => {
      try {
        if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
          console.log("accountData", accountData);
          dispatch(resetUsers());
          setError("Your account is no longer active - Please contact your admin");
          return;
        }
        if (!hasActionAccess("View Roles") && !accountData.roleId.absoluteAdmin) {
          dispatch(resetUsers());
          setError("Unauthorized: You do not have access to view roles - Please contact your admin");
          return;
        } else {
          const response = await dispatch(fetchRolesAccess()).unwrap();
        }
      } catch (error: any) {
        setError(error);
      }
    };

    fetchRoles();
  }, [accountData]);

  useEffect(() => {
    setLocalData(users);
  }, [users]);

  useEffect(() => {
    if (searchValue !== "") {
      const filteredData = users.filter((obj: any) => obj.searchText.toLowerCase().includes(searchValue.toLowerCase()));
      setLocalData(filteredData);
    } else {
      setLocalData(users);
    }
  }, [searchValue]);

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
    <div className="px-8 py-6 w-full">
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
        {openEditUserDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <EditUserComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditUserDialog(!open);
                return {};
              }}
              onUpdate={(notSave) => {
                document.body.style.overflow = "";
                setOpenEditUserDialog(!notSave);
                return {};
              }}
              userData={onOpenEditUserData}
              rolesData={roles
                .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
                .map(({ _id, roleName, tabAccess }: any) => ({
                  _id,
                  name: roleName,
                  tabAccess,
                  searchText: _id + roleName
                }))}
            />
          </div>
        )}
        {openNewUserDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <NewUserComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenNewUserDialog(!open);
                return {};
              }}
              onCreate={(notSave) => {
                document.body.style.overflow = "";
                setOpenNewUserDialog(!notSave);
                return {};
              }}
              rolesData={roles
                .filter(({ absoluteAdmin }: any) => !absoluteAdmin)
                .map(({ _id, roleName, tabAccess }: any) => ({
                  _id,
                  name: roleName,
                  tabAccess,
                  searchText: _id + roleName
                }))}
            />
          </div>
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
                  await dispatch(deleteUser(returnObject)).unwrap();
                } catch (err: any) {
                  setError(err);
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
          {/* title */}
          <div className="flex flex-col gap-2 mb-5">
            <h2>Users</h2>
            <h3>Use this section to create and manage users and their access</h3>
          </div>
          {/* search bar and new action Button */}
          <div className="flex justify-between items-center">
            {/* search div */}
            <div className="flex w-[500px] h-[50px] items-center gap-2">
              <input
                className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                placeholder="Search role (User Name, Email, Status)"
                name="searchValue"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <FaSearch className="text-foregroundColor size-5" />
            </div>
            {/* new action button */}
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
              >
                New User
              </button>
            </div>
          </div>

          {/* table body */}

          <div className="flex flex-col gap-2">
            {/* table header */}
            <div className="w-full flex px-4 py-3 p-2 h-[50px] overflow-hidden">
              <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                <span className="whitespace-nowrap flex items-center justify-center w-10 h-10 rounded-full font-semibold"></span>
                {(["User Name", "User Role", "User Email", "Account Status", "Created At"] as const).map((header) => (
                  <div
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
                    className={`${
                      header === "User Role"
                        ? "hover:cursor-not-allowed"
                        : "hover:cursor-pointer hover:bg-foregroundColor-5 hover:border hover:border-foregroundColor-10"
                    } font-semibold flex gap-1 p-2 rounded-lg whitespace-nowrap items-center justify-center w-[200px]`}
                  >
                    {header} {header !== "User Role" && <LuArrowUpDown />}
                  </div>
                ))}
              </div>
            </div>

            {/* table data */}
            <div className="flex flex-col gap-2 mt-3">
              {isLoading ? (
                <div className="flex items-center justify-center mt-10">
                  <LoaderDiv
                    type="spinnerText"
                    borderColor="foregroundColor"
                    text="Loading Users..."
                    textColor="foregroundColor"
                    dimension="h-10 w-10"
                  />
                </div>
              ) : localData.length < 1 && searchValue ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : localData.length < 1 && !isLoading ? (
                <div className="flex justify-center mt-6">No data available</div>
              ) : (
                localData.map((doc: any, index: any) => {
                  const {
                    _id: accountId,
                    staffId,
                    accountName,
                    accountEmail,
                    accountType,
                    roleId,
                    accountStatus,
                    accountPassword,
                    createdAt
                  } = doc;
                  const tabs = roleId.tabAccess
                    .map((tab: any) => tab.tab)
                    .slice(0, 5)
                    .join(", ");
                  return (
                    <div
                      key={accountId}
                      onClick={() => {
                        if (hasActionAccess("Edit User")) {
                          document.body.style.overflow = "hidden";
                          setOnOpenEditUserData({
                            userId: accountId,
                            staffId: roleId.absoluteAdmin ? "" : staffId.staffCustomId,
                            userName: accountName,
                            userEmail: accountEmail,
                            userStatus: accountStatus,
                            userPassword: accountPassword,
                            onEditUserIsAbsoluteAdmin: roleId.absoluteAdmin,
                            roleId: roleId._id + "|" + roleId.roleName
                          });
                          setOpenEditUserDialog(true);
                        } else {
                          setError("You do not have Edit User Access - Please contact your admin");
                        }
                      }}
                      className={tableRowStyle}
                    >
                      <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                        <span className="whitespace-nowrap flex items-center justify-center w-10 h-10 bg-foregroundColor-10 rounded-full font-semibold">
                          {accountName.slice(0, 2)}
                        </span>
                        <span className={dataRowCellStyle}>{accountName}</span>
                        <span className={dataRowCellStyle}>{roleId.roleName.slice(0, 15)}</span>
                        <span className={dataRowCellStyle}>{accountEmail}</span>
                        <span className={dataRowCellStyle}>{accountStatus}</span>
                        <span className={dataRowCellStyle}>{formatDate(createdAt)}</span>
                      </div>

                      <CgTrash
                        className="text-[25px] text-red-500 bg-backgroundColor hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default Users;
