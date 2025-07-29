"use client";
import { BASE_API_URL, checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
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
import {
  DisallowedActionDialog,
  ConfirmActionByInputDialog,
  CustomFilterComponent
} from "@/lib/customComponents/general/compLibrary2";
import EditUserComponent from "@/lib/customComponents/admin/editUserComponent";
import { resetUsers } from "@/redux/features/admin/users/usersSlice";
import NewStaffComponent from "@/lib/customComponents/staff/newStaffComp";
import { deleteStaffProfile, getStaffProfiles } from "@/redux/features/staff/staffThunks";
import { MdContentCopy, MdAdd, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tableCellStyle, dataRowCellStyle } from "@/lib/generalStyles";
import { useQuery } from "@tanstack/react-query";
import { handleApiRequest } from "@/axios/axiosClient";
import { tanFetchStaffProfiles } from "@/tanStack/staff/fetch";
import { useStaffMutation } from "@/tanStack/staff/mutate";
import EditStaffComponent from "@/lib/customComponents/staff/editStaffComp";

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
  const [paginationData, setPaginationData] = useState<any>({
    totalCount: 0,
    chunkCount: 0,
    nextCursor: "",
    prevCursor: "",
    hasNext: false,
    hasPrev: false
  });
  const [page, setPage] = useState(1);

  const baseUrl = "alyeqeenschoolapp/api/staff/contracts";
  const searchUrl = new URLSearchParams({});

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

          <CustomFilterComponent
            placeholder="Search Staff (Custom ID, Names, Email, Gender, Nationality, Next of Kin)"
            filters={[
              {
                displayText: "Marital Status",
                fieldName: "staffMaritalStatus",
                options: ["All", "Married", "Single"]
              },
              {
                displayText: "Gender",
                fieldName: "staffGender",
                options: ["All", "Male", "Female"]
              }
            ]}
            onQuery={(query: any) => {
              // for (const key in query) {
              //   searchUrl.set(key, query[key]);
              // }
              // refetchStaffContracts();
            }}
          />

          {/* table body */}

          {staffIsLoading ? (
            <div className="flex items-center justify-center mt-10">
              <LoaderDiv
                type="spinnerText"
                borderColor="foregroundColor"
                text="Loading User Data..."
                textColor="foregroundColor"
                dimension="h-10 w-10"
              />
            </div>
          ) : (
            <div className="border border-foregroundColor-25 bg-backgroundColor text-foregroundColor rounded-lg overflow-hidden mt-5 z-10">
              {/* table header */}
              <Table className="text-[16px]">
                <TableHeader>
                  <TableRow className="bg-foregroundColor-5 h-14">
                    <TableHead className="text-center text-foregroundColor-70 w-[110px] font-semibold p-2 whitespace-nowrap"></TableHead>

                    {(["Staff Custom ID", "First Name", "Last Name", "Gender", "Email"] as const).map((header) => (
                      <TableHead
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
                        className="text-center text-foregroundColor-70 w-[200px] font-semibold hover:cursor-pointer hover:bg-foregroundColor-5 p-2  whitespace-nowrap"
                      >
                        {header}
                        <LuArrowUpDown className="inline-block ml-1" />
                      </TableHead>
                    ))}
                    <TableHead className="text-center text-foregroundColor-70 font-semibold whitespace-nowrap">
                      Delete
                    </TableHead>
                  </TableRow>
                </TableHeader>

                {/* table data */}
                <TableBody className="mt-3">
                  {staffIsLoading ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex items-center justify-center mt-10">
                          <LoaderDiv
                            type="spinnerText"
                            borderColor="foregroundColor"
                            text="Loading Staff Profiles..."
                            textColor="foregroundColor"
                            dimension="h-10 w-10"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : localData.length < 1 && searchValue ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No search result found
                      </td>
                    </tr>
                  ) : (localData.length < 1 && !staffIsLoading) || !staff || staff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    localData.map((doc: any, index: any) => {
                      const {
                        _id: profileId,
                        staffCustomId,
                        staffFirstName,
                        staffLastName,
                        staffGender,
                        staffEmail
                      } = doc;

                      return (
                        <TableRow
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
                          className="hover:cursor-pointer"
                        >
                          <TableCell className="w-[110px] whitespace-nowrap text-center">
                            <span className="rounded-full bg-foregroundColor-10 p-2">
                              {staffFirstName.toUpperCase().slice(0, 2)}
                            </span>
                          </TableCell>
                          <TableCell className="w-[200px] text-center whitespace-nowrap">
                            {staffCustomId.slice(0, 10)}
                            <MdContentCopy
                              title="copy id"
                              className="ml-2 inline-block text-[19px] text-foregroundColor-70 hover:text-foregroundColor-50 hover:cursor-pointer"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await navigator.clipboard.writeText(staffCustomId);
                              }}
                            />
                          </TableCell>
                          <TableCell className={tableCellStyle}>{staffFirstName.slice(0, 10)}</TableCell>
                          <TableCell className={tableCellStyle}>{staffLastName.slice(0, 10)}</TableCell>
                          <TableCell className={tableCellStyle}>{staffGender}</TableCell>
                          <TableCell className={tableCellStyle}>{staffEmail}</TableCell>

                          <TableCell className="w-[200px] text-center whitespace-nowrap">
                            <span
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
                            >
                              <CgTrash className="inline-block text-[20px]" />
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-6 py-4 border-t border-foregroundColor-25 text-[15px] font-semibold text-foregroundColor-60">
                <div>
                  Showing {paginationData.chunkCount} of {paginationData.totalCount} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // searchUrl.set("cursorType", "prev");
                      // searchUrl.set("prevCursor", paginationData.prevCursor);
                      // setPage(page > 1 ? page - 1 : page);
                      // refetchStaffContracts();
                    }}
                    disabled={page < 2}
                    className="ghostbutton"
                  >
                    <MdNavigateBefore className="text-[20px] inline-block" />
                    Previous
                  </button>
                  <span className=" px-2">
                    Page {page} of {Math.ceil(paginationData.totalCount / 4)}
                  </span>
                  <button
                    onClick={() => {
                      // searchUrl.set("cursorType", "next");
                      // searchUrl.set("nextCursor", paginationData.nextCursor);
                      // setPage(paginationData.hasNext ? page + 1 : page);
                      // refetchStaffContracts();
                    }}
                    disabled={!paginationData.hasNext}
                    className="ghostbutton"
                  >
                    Next
                    <MdNavigateNext className=" text-[20px] inline-block" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default StaffProfile;
