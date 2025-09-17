"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import {
  ActionButtons,
  DeleteButton,
  ErrorDiv,
  LoaderDiv,
  SearchComponent
} from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/customComponents/general/compLibrary2";
import {
  defaultButtonStyle,
  sortableTableHeadCellStyle,
  tableCellStyle,
  tableContainerStyle,
  tableHeadCellStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import { MdAdd, MdContentCopy } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { RoleDialog } from "@/lib/customComponents/admin/roleDialogComponent";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
const RolesAccess = () => {
  const { useReusableQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/admin/roles");
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [openNewRoleDialog, setOpenNewRoleDialog] = useState(false);
  const [openViewRoleDialog, setOpenViewRoleDialog] = useState(false);
  const [onOpenRoleData, setOnOpenRoleData] = useState<any>({});
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});

  const {
    data: roles,
    isPending,
    isFetching,
    isError,
    error: rolesError
  } = useReusableQuery("roles", "View Roles", "alyeqeenschoolapp/api/admin/roles");

  useEffect(() => {
    if (!roles) return;
    setError("");

    setLocalData(roles);
  }, [roles, isPending]);

  useEffect(() => {
    if (!isError) return;
    if (rolesError) {
      setError(rolesError.message);
    }
  }, [rolesError, isError]);

  useEffect(() => {
    if (!roles) return;
    if (searchValue !== "") {
      const filteredData = (roles as any[]).filter((obj: any) =>
        obj.roleName.toLowerCase().includes(searchValue.toLowerCase())
      );
      setLocalData(filteredData);
    } else {
      setLocalData(roles);
    }
  }, [searchValue]);

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

  if (!roles) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Roles..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (rolesError)
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
    // console.log("localData", localData);
    // console.log("sortKey", sortKey);
    // console.log("first item", [...localData][0][sortKey]);
    // console.log("keyType", keyType);
    // console.log("sortOrder", sortOrder);
    const sortedData = [...localData].sort((a, b) => {
      // console.log("a", a);
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
    <div className="px-8 py-6 w-full bg-foregroundColor-3">
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
        {openEditRoleDialog && (
          <div className="fixed flex z-30 items-center justify-center inset-0 bg-foregroundColor-transparent">
            <RoleDialog
              type="edit"
              data={onOpenRoleData}
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditRoleDialog(!open);
                return {};
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenEditRoleDialog(!notSave);
                return {};
              }}
            />
          </div>
        )}
        {openNewRoleDialog && (
          <div className="fixed flex z-30 items-center justify-center inset-0 bg-foregroundColor-transparent">
            <RoleDialog
              type="new"
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenNewRoleDialog(!open);
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenNewRoleDialog(!notSave);
              }}
            />
          </div>
        )}
        {openViewRoleDialog && (
          <div className="fixed flex z-30 items-center justify-center inset-0 bg-foregroundColor-transparent">
            <RoleDialog
              type="view"
              data={onOpenRoleData}
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenViewRoleDialog(!open);
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenViewRoleDialog(!notSave);
              }}
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
                try {
                  const response = await deleteMutation.mutateAsync(returnObject);
                } catch (err: any) {
                  setError(err.message);
                }
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
          {/* table header */}
          <div className={tableContainerStyle}>
            <div className={tableTopStyle}>
              <div className="flex flex-col gap-2 mb-2">
                <h2>Role & Permission</h2>
                <h3>Use this section to create and manage roles, and specify each access for each</h3>
              </div>

              {/* search div */}
              <SearchComponent
                placeholder="Search role (Role Name)"
                name="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              {/* new action button */}
              <div>
                <button
                  className={defaultButtonStyle}
                  onClick={() => {
                    if (hasActionAccess("Create Role")) {
                      document.body.style.overflow = "hidden";
                      setOpenNewRoleDialog(true);
                    } else {
                      setError("You do not have Create Role Access - Please contact your admin");
                    }
                  }}
                  disabled={!hasActionAccess("Create Role")}
                >
                  <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Role
                </button>
              </div>
            </div>

            <Table className="text-[16px]">
              <TableHeader>
                <TableRow className={tableHeaderStyle}>
                  {(["Role ID", "Role Name", "Created At", "Updated At"] as const).map((header) => (
                    <TableHead
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Role ID": "_id",
                          "Role Name": "roleName",
                          "Created At": "createdAt",
                          "Updated At": "updatedAt"
                        };
                        const sortKey = key_Name[header];
                        handleSort(sortKey);
                      }}
                      className={sortableTableHeadCellStyle}
                    >
                      {header} <LuArrowUpDown className="inline-block ml-1" />
                    </TableHead>
                  ))}
                  <TableHead className={tableHeadCellStyle}>Groups</TableHead>
                  <TableHead className={tableHeadCellStyle}>Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* table data */}
              <TableBody className="mt-3 bg-backgroundColor">
                {isPending || isFetching ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center mt-10">
                        <LoaderDiv
                          type="spinnerText"
                          borderColor="foregroundColor"
                          text="Loading Roles..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : localData.length < 1 && searchValue ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="flex justify-center mt-6">No search result found</div>
                    </td>
                  </tr>
                ) : localData.length < 1 && !isPending && !isFetching ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="flex justify-center mt-6">No data available</div>
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const { _id: roleId, roleName, accountId, createdAt, updatedAt, tabAccess } = doc;
                    const groups = tabAccess
                      .map((group: any) => group.group)
                      .slice(0, 2)
                      .join(", ");
                    return (
                      <TableRow
                        key={roleId}
                        onClick={() => {
                          if (hasActionAccess("View Role")) {
                            document.body.style.overflow = "hidden";
                            setOpenViewRoleDialog(true);
                            setOnOpenRoleData(doc);
                          } else {
                            setError("You do not have View Role Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <TableCell className="w-[200px] text-center whitespace-nowrap">
                          {roleId.slice(0, 10)}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2  hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(roleId);
                            }}
                          />
                        </TableCell>
                        <TableCell className={tableCellStyle}>{roleName.slice(0, 20)}</TableCell>
                        <TableCell className={tableCellStyle}>{formatDate(createdAt)}</TableCell>{" "}
                        <TableCell className={tableCellStyle}>{formatDate(updatedAt)}</TableCell>
                        <TableCell className="whitespace-nowrap text-center min-w-[400px]">{groups}.....</TableCell>
                        <TableCell className="text-center whitespace-nowrap flex items-center justify-center pt-4">
                          <ActionButtons
                            onEdit={() => {
                              if (hasActionAccess("Edit Role")) {
                                document.body.style.overflow = "hidden";
                                setOpenEditRoleDialog(true);
                                setOnOpenRoleData(doc);
                              } else {
                                setError("You do not have Edit Role Access - Please contact your admin");
                              }
                            }}
                            onDelete={() => {
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
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default RolesAccess;
