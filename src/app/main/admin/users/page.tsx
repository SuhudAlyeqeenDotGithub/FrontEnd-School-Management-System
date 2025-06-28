"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/component/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import NewUserComponent from "@/lib/component/admin/newUserComponent";
import { getUsers } from "@/redux/features/admin/users/usersThunks";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/component/general/compLibrary2";

const Users = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.usersData);
  const { roles, isLoading: roleIsLoading } = useAppSelector((state) => state.rolesAccess);
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((tab: any) =>
    tab.actions.map((action: any) => action.name)
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
          setError("Your account is no longer active - Please contact your admin");
          return;
        }
        if (!hasActionAccess("View Roles") && !accountData.roleId.absoluteAdmin) {
          setError("Unauthorized: You do not have access to view roles - Please contact your admin");
          return;
        }
        const response = await dispatch(fetchRolesAccess()).unwrap();
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

    const sortOrder = sortOrderTracker[sortKey];

    let nextOrder: string;

    if (sortOrder === "dsc") {
      nextOrder = "asc";
    } else {
      nextOrder = "dsc";
    }
    console.log("localData", localData);
    console.log("sortKey", sortKey);
    console.log("first item", [...localData][0][sortKey]);
    console.log("keyType", keyType);
    console.log("sortOrder", sortOrder);
    const sortedData = [...localData].sort((a, b) => {
      console.log("a", a);
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
      {error && <ErrorDiv>{error}</ErrorDiv>}

      {/* data table section */}
      <div className="">
        {/* {openEditUserDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <EditRoleDialog
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditUserDialog(!open);
                return {};
              }}
              onUpdate={(notUpdate) => {
                document.body.style.overflow = "";
                setOpenEditUserDialog(!notUpdate);
                return {};
              }}
            />
          </div>
        )} */}
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
              rolesData={roles.map(({ _id, roleName, tabAccess }: any) => ({
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
            warningText="This delete action is disallowed as it relates to the default Admin role"
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
                // try {
                //   await dispatch(deleteRole(returnObject)).unwrap();
                // } catch (err: any) {
                //   setError(err);
                // }
              } else {
                setError("An error occured while deleting - Please try again");
              }
              setOpenConfirmDelete(false);
              document.body.style.overflow = "";
            }}
            warningText="Please confirm the ID of the role you want to delete"
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
                placeholder="Search role (Role Name)"
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
                  if (hasActionAccess("Create Role")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewUserDialog(true);
                  } else {
                    setError("You do not have Create Role Access - Please contact your admin");
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
            <div className="w-full flex px-4 py-3 p-2 h-[50px]">
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
                  const { _id: accountId, accountName, accountEmail, roleId, accountStatus, createdAt } = doc;
                  const tabs = roleId.tabAccess
                    .map((tab: any) => tab.tab)
                    .slice(0, 5)
                    .join(", ");
                  return (
                    <div
                      key={accountId}
                      onClick={() => {
                        if (hasActionAccess("Edit Role")) {
                          document.body.style.overflow = "hidden";
                          setOpenEditUserDialog(true);
                          // dispatch(setOnOpenRoleData(doc));
                        } else {
                          setError("You do not have Edit Role Access - Please contact your admin");
                        }
                      }}
                      className="w-full flex items-center px-4 border border-foregroundColor-15 rounded-md shadow-sm py-2 hover:bg-foregroundColor-5 hover:cursor-pointer"
                    >
                      <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                        <span className="whitespace-nowrap flex items-center justify-center w-10 h-10 bg-foregroundColor-10 rounded-full font-semibold">
                          {accountName.slice(0, 2)}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {accountName}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {roleId.roleName.slice(0, 15)}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {accountEmail}
                        </span>
                        <span className={`whitespace-nowrap flex items-center justify-center w-[200px] h-9 rounded-lg`}>
                          {accountStatus}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {formatDate(createdAt)}
                        </span>
                      </div>

                      <CgTrash
                        className="text-[25px] hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (doc.absoluteAdmin) {
                            setError("Disallowed Action: Default Absolute Admin Role Cannot be deleted");
                            setOpenDisallowedDeleteDialog(true);
                          } else {
                            if (hasActionAccess("Delete Role")) {
                              document.body.style.overflow = "hidden";
                              setOpenConfirmDelete(true);
                              setConfirmWithText(doc._id);
                              setConfirmWithReturnObj({
                                roleIdToDelete: doc._id,
                                roleName: doc.roleName,
                                roleDescription: doc.roleDescription,
                                absoluteAdmin: doc.absoluteAdmin,
                                tabAccess: doc.tabAccess
                              });
                            } else {
                              setError(
                                "Unauthorised Action: You do not have Delete Role Access - Please contact your admin"
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
