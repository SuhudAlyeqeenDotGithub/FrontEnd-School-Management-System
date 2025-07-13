"use client";
import { BASE_API_URL, checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/component/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import NewUserComponent from "@/lib/component/admin/newUserComponent";
import { deleteUser, getUsers } from "@/redux/features/admin/users/usersThunks";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/component/general/compLibrary2";
import EditUserComponent from "@/lib/component/admin/editUserComponent";
import { resetUsers } from "@/redux/features/admin/users/usersSlice";
import NewStaffComponent from "@/lib/component/staff/newStaffComp";
import { deleteStaffProfile, getStaffProfiles } from "@/redux/features/staff/staffThunks";
import { MdContentCopy } from "react-icons/md";
import EditStaffComponent from "@/lib/component/staff/editStaffComp";
import { tableRowStyle, dataRowCellStyle } from "@/lib/generalStyles";
import { useQuery } from "@tanstack/react-query";
import { handleApiRequest } from "@/axios/axiosClient";
import { tanFetchStaffProfiles } from "@/tanStack/staff/fetch";
import { useStaffMutation } from "@/tanStack/staff/mutate";

const StaffProfile = () => {
  const dispatch = useAppDispatch();
  const { tanDeleteStaffProfile } = useStaffMutation();

  // const { staff, isLoading: staffIsLoading } = useAppSelector((state) => state.staffData);
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditUserDialog, setOpenEditStaffDialog] = useState(false);
  const [openNewStaffDialog, setOpenNewStaffDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenEditUserData, setOnOpenEditStaffData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((tab: any) =>
    tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
  );

  const hasActionAccess = (action: string) => {
    return accountPermittedActions.includes(action);
  };

  const {
    data: staff,
    isLoading: staffIsLoading,
    isFetching,
    error: queryError,
    isError
  } = useQuery({
    queryKey: ["staffProfiles"],
    queryFn: () => tanFetchStaffProfiles(accountData, accountPermittedActions, "View Staff"),
    enabled: Boolean(accountData?.accountStatus),
    retry: false
  });

  useEffect(() => {
    if (!staff) return;
    setError("");
    setLocalData(staff);
  }, [staff, staffIsLoading]);

  useEffect(() => {
    if (!isError) return;
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError, isError]);

  // useEffect(() => {
  //   if (!accountData.accountStatus) {
  //     return;
  //   }
  //   const fetchStaffL = async () => {
  //     try {
  //       if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
  //         setError("Your account is no longer active - Please contact your admin");
  //         return;
  //       }
  //       if (!hasActionAccess("View Staff") && !accountData.roleId.absoluteAdmin) {
  //         setError("Unauthorized: You do not have access to view staff profiles - Please contact your admin");
  //         return;
  //       }

  //       await dispatch(getStaffProfiles()).unwrap();
  //     } catch (error: any) {
  //       setError(error);
  //     }
  //   };

  //   fetchStaffL();
  // }, [accountData]);

  useEffect(() => {
    if (!staff) return;
    if (searchValue !== "") {
      const filteredData = staff.filter((obj: any) => obj.searchText.toLowerCase().includes(searchValue.toLowerCase()));
      setLocalData(filteredData);
    } else {
      setLocalData(staff);
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

  if (!accountData || staffIsLoading || isFetching) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Staff Profile..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }
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
            <EditStaffComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditStaffDialog(!open);
                return {};
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenEditStaffDialog(!notSave);
                return {};
              }}
              data={onOpenEditUserData}
            />
          </div>
        )}
        {openNewStaffDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <NewStaffComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenNewStaffDialog(!open);
                return {};
              }}
              onCreate={(notSave) => {
                document.body.style.overflow = "";
                setOpenNewStaffDialog(!notSave);
                return {};
              }}
            />
          </div>
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
                  if (returnObject.staffImageDestination || returnObject.staffImageDestination !== "") {
                    imageDeletionDone = await handledDeleteImage(returnObject.staffImageDestination);
                  } else {
                    imageDeletionDone = true;
                  }

                  if (imageDeletionDone) {
                    await tanDeleteStaffProfile.mutateAsync({ staffIDToDelete: returnObject.staffIDToDelete });
                  } else {
                    return;
                  }
                } catch (err: any) {
                  console.log("error deleting staff profile", err.message);
                  setError(err.message);
                }
              } else {
                setError("An error occured while deleting - Please try again");
              }
              setOpenConfirmDelete(false);
              document.body.style.overflow = "";
            }}
            warningText="Please confirm the ID of the staff profile you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          {/* title */}
          <div className="flex flex-col gap-2 mb-5">
            <h2>Staff Profile</h2>
            <h3>Register and manage staff</h3>
          </div>
          {/* search bar and new action Button */}
          <div className="flex justify-between items-center">
            {/* search div */}
            <div className="flex w-[700px] h-[50px] items-center gap-2">
              <input
                className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                placeholder="Search Staff (Custom ID, Names, Email, Gender, Nationality, Next of Kin)"
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
                  if (hasActionAccess("Create Staff")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewStaffDialog(true);
                  } else {
                    setError("You do not have Create Staff Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Staff")}
              >
                New Staff
              </button>
            </div>
          </div>

          {/* table body */}

          <div className="flex flex-col gap-2">
            {/* table header */}
            <div className="w-full flex px-4 py-3 p-2 h-[50px] overflow-hidden">
              <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                <span className="whitespace-nowrap flex items-center justify-center w-10 h-10 rounded-full font-semibold"></span>
                {(["Staff Custom ID", "First Name", "Last Name", "Gender", "Email"] as const).map((header) => (
                  <div
                    key={header}
                    onClick={() => {
                      const key_Name = {
                        "Staff Custom ID": "staffCustomId",
                        "First Name": "staffFirstName",
                        "Last Name": "staffLastName",
                        Gender: "staffGender",
                        Email: "staffEmail"
                      };
                      const sortKey = key_Name[header];
                      handleSort(sortKey);
                    }}
                    className={`hover:cursor-pointer hover:bg-foregroundColor-5 hover:border hover:border-foregroundColor-10 font-semibold flex gap-1 p-2 rounded-lg whitespace-nowrap items-center justify-center w-[200px]`}
                  >
                    {header} <LuArrowUpDown />
                  </div>
                ))}
              </div>
            </div>

            {/* table data */}
            <div className="flex flex-col gap-2 mt-3">
              {staffIsLoading ? (
                <div className="flex items-center justify-center mt-10">
                  <LoaderDiv
                    type="spinnerText"
                    borderColor="foregroundColor"
                    text="Loading Staff Profile..."
                    textColor="foregroundColor"
                    dimension="h-10 w-10"
                  />
                </div>
              ) : localData.length < 1 && searchValue ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : (localData.length < 1 && !staffIsLoading) || !staff || staff.length === 0 ? (
                <div className="flex justify-center mt-6">No data available</div>
              ) : (
                localData.map((doc: any, index: any) => {
                  const { _id: profileId, staffCustomId, staffFirstName, staffLastName, staffGender, staffEmail } = doc;

                  return (
                    <div
                      key={profileId}
                      onClick={() => {
                        if (hasActionAccess("Edit Staff")) {
                          document.body.style.overflow = "hidden";
                          setOpenEditStaffDialog(true);
                          setOnOpenEditStaffData(doc);
                        } else {
                          setError("You do not have Edit User Access - Please contact your admin");
                        }
                      }}
                      className={tableRowStyle}
                    >
                      <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                        <span className="whitespace-nowrap flex items-center justify-center w-10 h-10 bg-foregroundColor-10 rounded-full font-semibold">
                          {staffFirstName.toUpperCase().slice(0, 2)}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px] gap-3">
                          {staffCustomId.slice(0, 10)}
                          <MdContentCopy
                            title="copy id"
                            className="text-[20px] text-foregroundColor-80 hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(staffCustomId);
                            }}
                          />
                        </span>
                        <span className={dataRowCellStyle}>{staffFirstName.slice(0, 10)}</span>
                        <span className={dataRowCellStyle}>{staffLastName.slice(0, 10)}</span>
                        <span className={dataRowCellStyle}>{staffGender}</span>
                        <span className={dataRowCellStyle}>{staffEmail}</span>
                      </div>

                      <CgTrash
                        className="text-[25px] text-red-500 bg-backgroundColor hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasActionAccess("Delete Staff")) {
                            document.body.style.overflow = "hidden";
                            setConfirmWithText(staffCustomId);
                            setConfirmWithReturnObj({
                              staffIDToDelete: staffCustomId,
                              staffImageDestination: doc.staffImageDestination
                            });
                            setOpenConfirmDelete(true);
                          } else {
                            setError(
                              "Unauthorised Action: You do not have Delete Staff Access - Please contact your admin"
                            );
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

export default StaffProfile;
