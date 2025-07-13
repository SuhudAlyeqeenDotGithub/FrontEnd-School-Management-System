"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/component/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { ConfirmActionByInputDialog } from "@/lib/component/general/compLibrary2";
import NewStaffContractComponent from "@/lib/component/staff/newContractComp";
import { getStaffContracts, deleteStaffContract } from "@/redux/features/staff/contractThunk";
import { MdContentCopy } from "react-icons/md";
import EditStaffContractComponent from "@/lib/component/staff/editStaffComp";
import { tableRowStyle, dataRowCellStyle, inputStyle } from "@/lib/generalStyles";
import { getStaffProfiles } from "@/redux/features/staff/staffThunks";
import { getAcademicYears } from "@/redux/features/general/academicYear/academicYearThunk";
import { tanFetchStaffContracts, tanFetchStaffProfiles } from "@/tanStack/staff/fetch";
import { useQuery } from "@tanstack/react-query";
import { setAcademicYearOnFocus } from "@/redux/features/general/generalSlice";

const StaffContracts = () => {
  const dispatch = useAppDispatch();
  // const { staffContracts, isLoading: staffContractsLoading } = useAppSelector((state) => state.staffContract);
  const { academicYears, isLoading: academicYearsLoading } = useAppSelector((state) => state.academicYear);
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditUserDialog, setOpenEditStaffContractDialog] = useState(false);
  const [academicYearOnFocus, setAcademicYearOnFocus] = useState("");
  const [openNewStaffContractDialog, setOpenNewStaffContractDialog] = useState(false);
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
    data: staffProfiles,
    isLoading: staffIsLoading,
    isFetching: isFetchingStaffProfiles,
    error: queryError,
    isError: isStaffProfilesError
  } = useQuery({
    queryKey: ["staffProfiles"],
    queryFn: () => tanFetchStaffProfiles(accountData, accountPermittedActions, "View Staff"),
    enabled: Boolean(accountData?.accountStatus),
    retry: false
  });

  const {
    data: staffContracts,
    isLoading: staffContractsIsLoading,
    isFetching: isFetchingStaffContracts,
    error: staffContractsQueryError,
    isError: isStaffContractsError,
    refetch: refetchStaffContracts
  } = useQuery({
    queryKey: ["staffContracts"],
    queryFn: () =>
      tanFetchStaffContracts(accountData, accountPermittedActions, "View Staff Contracts", academicYearOnFocus),
    enabled: Boolean(accountData?.accountStatus && academicYearOnFocus),
    retry: false
  });

  useEffect(() => {
    if (!staffProfiles) return;
    setError("");
  }, [staffProfiles, staffIsLoading]);

  useEffect(() => {
    if (!isStaffProfilesError) return;
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError, isStaffProfilesError]);

  useEffect(() => {
    if (academicYearOnFocus === "") return;
    if (accountData?.accountStatus && academicYearOnFocus) {
      refetchStaffContracts();
    }
  }, [academicYearOnFocus]);

  useEffect(() => {
    if (!staffContracts) return;
    setError("");
    setLocalData(staffContracts);
  }, [staffContracts, staffContractsIsLoading]);

  useEffect(() => {
    if (!isStaffContractsError) return;
    if (staffContractsQueryError) {
      setError(staffContractsQueryError.message);
    }
  }, [staffContractsQueryError, isStaffContractsError]);

  useEffect(() => {
    if (!accountData.accountStatus) {
      return;
    }
    const fetchAcademicYearL = async () => {
      try {
        if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
          setError("Your account is no longer active - Please contact your admin");
          return;
        }
        if (!hasActionAccess("View Academic Years") && !accountData.roleId.absoluteAdmin) {
          setError("Unauthorized: You do not have access to view academic years - Please contact your admin");
          return;
        }

        await dispatch(getAcademicYears()).unwrap();
      } catch (error: any) {
        setError(error);
      }
    };

    fetchAcademicYearL();
  }, [accountData]);

  useEffect(() => {
    if (!staffContracts) return;
    if (searchValue !== "") {
      const filteredData = staffContracts.filter((obj: any) =>
        obj.searchText.toLowerCase().includes(searchValue.toLowerCase())
      );
      setLocalData(filteredData);
    } else {
      setLocalData(staffContracts);
    }
  }, [searchValue]);

  if (!accountData || staffContractsIsLoading || isFetchingStaffContracts) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Staff Contracts..."
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
  // if (!staffContracts || staffContracts.length === 0) return <p>No staff Contract found.</p>;

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
            <EditStaffContractComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditStaffContractDialog(!open);
                return {};
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenEditStaffContractDialog(!notSave);
                return {};
              }}
              data={onOpenEditUserData}
            />
          </div>
        )}
        {openNewStaffContractDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <NewStaffContractComponent
              academicYears={academicYears}
              academicYearOnFocus={academicYearOnFocus}
              staff={staffProfiles}
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenNewStaffContractDialog(!open);
                return {};
              }}
              onCreate={(notSave) => {
                document.body.style.overflow = "";
                setOpenNewStaffContractDialog(!notSave);
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
                setOpenConfirmDelete(false);
                document.body.style.overflow = "";
              }
            }}
            warningText="Please confirm the ID of the staff contract you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-5 items-center">
            {/* title */}
            <div className="flex flex-col gap-2 mb-5">
              <h2>Staff Contract</h2>
              <h3>Create and manage staff contracts</h3>
            </div>
            {/* academic year selector */}
            <div className="w-[40%]">
              <select
                className={inputStyle}
                value={academicYearOnFocus}
                onChange={(e) => {
                  setAcademicYearOnFocus(e.target.value);
                }}
              >
                <option value="" disabled>
                  Select Academic Year
                </option>
                {academicYears.map((academicYear: any) => {
                  return (
                    <option key={academicYear._id} value={academicYear._id}>
                      {academicYear.academicYear}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          {academicYearOnFocus === "" ? (
            <div className="flex justify-center mt-6">Select an Academic Year</div>
          ) : (
            <div>
              {/* search bar and new action Button */}
              <div className="flex justify-between items-center">
                {/* search div */}
                <div className="flex w-[700px] h-[50px] items-center gap-2">
                  <input
                    className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                    placeholder="(Staff Custom ID, Staff Names, Contract Dates, Job Title, Contract Type/Status"
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
                      if (hasActionAccess("Create Staff Contract")) {
                        document.body.style.overflow = "hidden";
                        setOpenNewStaffContractDialog(true);
                      } else {
                        setError("You do not have Create Staff Contract Access - Please contact your admin");
                      }
                    }}
                    disabled={!hasActionAccess("Create Staff Contract")}
                  >
                    New Staff Contract
                  </button>
                </div>
              </div>
              {/* table body */}
              <div className="flex flex-col gap-2">
                {/* table header */}
                <div className="w-full flex px-4 py-3 p-2 h-[55px] overflow-hidden mt-5">
                  <div className="grid auto-cols-max grid-flow-col w-[95%] gap-2">
                    <span className="hover:cursor-pointer hover:bg-foregroundColor-5 hover:border hover:border-foregroundColor-10 font-semibold flex gap-1 p-2 rounded-lg whitespace-nowrap items-center justify-center w-[110px]">
                      Contract Id
                    </span>
                    {(
                      [
                        "Academic Year",
                        "Staff Custom ID",
                        "Staff Name",
                        "Job Title",
                        "Start Date",
                        "Contact Status"
                      ] as const
                    ).map((header) => (
                      <div
                        key={header}
                        onClick={() => {
                          const key_Name = {
                            "Academic Year": "academicYear",
                            "Staff Custom ID": "staffCustomId",
                            "Staff Name": "staffFullName",
                            "Job Title": "jobTitle",
                            "Start Date": "contractStartDate",
                            "Contact Status": "contractStatus"
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
                  {academicYearOnFocus === "" ? (
                    <div className="flex justify-center mt-6">Select an Academic Year</div>
                  ) : staffContractsIsLoading ? (
                    <div className="flex items-center justify-center mt-10">
                      <LoaderDiv
                        type="spinnerText"
                        borderColor="foregroundColor"
                        text="Loading Staff Contracts..."
                        textColor="foregroundColor"
                        dimension="h-10 w-10"
                      />
                    </div>
                  ) : localData.length < 1 && searchValue ? (
                    <div className="flex justify-center mt-6">No search result found</div>
                  ) : (localData.length < 1 && !staffContractsIsLoading) ||
                    !staffContracts ||
                    staffContracts.length === 0 ? (
                    <div className="flex justify-center mt-6">No data available</div>
                  ) : (
                    localData.map((doc: any, index: any) => {
                      const {
                        _id: contractId,
                        academicYear,
                        staffCustomId,
                        staffFullName,
                        jobTitle,
                        contractStartDate,
                        contractStatus
                      } = doc;

                      return (
                        <div
                          key={contractId}
                          onClick={() => {
                            if (hasActionAccess("Edit Staff")) {
                              document.body.style.overflow = "hidden";
                              setOpenEditStaffContractDialog(true);
                              setOnOpenEditStaffData(doc);
                            } else {
                              setError("You do not have Edit User Access - Please contact your admin");
                            }
                          }}
                          className={tableRowStyle}
                        >
                          <div className="grid auto-cols-max grid-flow-col w-[95%] gap-2">
                            <span className="whitespace-nowrap flex items-center justify-center w-[110px] gap-3">
                              CID
                              <MdContentCopy
                                title="copy id"
                                className="text-[20px] text-foregroundColor-80 hover:text-foregroundColor-50 hover:cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await navigator.clipboard.writeText(contractId);
                                }}
                              />
                            </span>
                            <span className={dataRowCellStyle}>{academicYear.slice(0, 25)}</span>
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

                            <span className={dataRowCellStyle}>{staffFullName.slice(0, 10)}</span>
                            <span className={dataRowCellStyle}>{jobTitle.slice(0, 10)}</span>
                            <span className={dataRowCellStyle}>{formatDate(contractStartDate)}</span>
                            <span className={dataRowCellStyle}>{contractStatus}</span>
                          </div>

                          <CgTrash
                            className="text-[25px] text-red-500 bg-backgroundColor hover:cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasActionAccess("Delete Staff")) {
                                document.body.style.overflow = "hidden";
                                setConfirmWithText(contractId);
                                setConfirmWithReturnObj({
                                  contractId
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
          )}
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default StaffContracts;
