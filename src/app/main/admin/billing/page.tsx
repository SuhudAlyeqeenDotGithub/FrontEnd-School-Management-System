"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { ConfirmActionByInputDialog, CustomFilterComponent } from "@/lib/customComponents/general/compLibrary2";
import NewStaffContractComponent from "@/lib/customComponents/staff/newContractComp";
import { MdContentCopy, MdAdd, MdNavigateNext, MdNavigateBefore, MdOutlineDateRange } from "react-icons/md";
import { tableCellStyle, tableContainerStyle, tableHeaderStyle, tableTopStyle } from "@/lib/generalStyles";
import { getAcademicYears } from "@/redux/features/general/academicYear/academicYearThunk";
import { tanFetchStaffContracts, tanFetchStaffProfiles } from "@/tanStack/staff/fetch";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EditStaffContractComponent from "@/lib/customComponents/staff/editContractComp";
import { useStaffMutation } from "@/tanStack/staff/mutate";
import { CiMoneyBill } from "react-icons/ci";

const Billing = () => {
  const dispatch = useAppDispatch();
  const { tanDeleteStaffContract } = useStaffMutation();
  // const { staffContracts, isLoading: staffContractsLoading } = useAppSelector((state) => state.staffContract);
  const { academicYears, isLoading: academicYearsLoading } = useAppSelector((state) => state.academicYear);
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditStaffContractDialog, setOpenEditStaffContractDialog] = useState(false);
  const [openNewStaffContractDialog, setOpenNewStaffContractDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenEditStaffContractData, setOnOpenEditStaffContractData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const [openFilterDiv, setOpenFilterDiv] = useState(false);
  const [paginationData, setPaginationData] = useState<any>({
    totalCount: 0,
    chunkCount: 0,
    nextCursor: "",
    prevCursor: "",
    hasNext: false,
    hasPrev: false
  });
  const [page, setPage] = useState(1);
  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((group: any) =>
    group.tabs.map((tab: any) =>
      tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
    )
  );
  const baseUrl = "alyeqeenschoolapp/api/staff/contracts";
  const searchUrl = new URLSearchParams({});

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
    queryFn: () =>
      tanFetchStaffProfiles(accountData, accountPermittedActions, "View Staff", "alyeqeenschoolapp/api/staff/profile"),
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
      tanFetchStaffContracts(
        accountData,
        accountPermittedActions,
        "View Staff Contracts",
        baseUrl + "?" + searchUrl.toString()
      ),
    enabled: Boolean(staffProfiles && accountData?.accountStatus),
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
    if (!staffContracts || !staffContracts.staffContracts) return;
    setError("");
    const { totalCount, chunkCount, nextCursor, prevCursor, hasNext } = staffContracts;
    setLocalData(staffContracts.staffContracts);

    setPaginationData({ totalCount, chunkCount, nextCursor, prevCursor, hasNext });
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
    <div className="px-8 py-6 w-full h-screen overflow-auto">
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
        {openEditStaffContractDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <EditStaffContractComponent
              academicYears={academicYears}
              staff={staffProfiles.staffProfiles}
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
              data={onOpenEditStaffContractData}
            />
          </div>
        )}

        {openNewStaffContractDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <NewStaffContractComponent
              academicYears={academicYears}
              staff={staffProfiles.staffProfiles}
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
                try {
                  await tanDeleteStaffContract.mutateAsync({
                    staffContractIDToDelete: returnObject.contractId
                  });
                } catch (err: any) {
                  console.log("error deleting staff profile", err.message);
                  setError(err.message);
                }
                setOpenConfirmDelete(false);
                document.body.style.overflow = "";
              }
            }}
            warningText="Please confirm the ID of the staff contract you want to delete"
          />
        )}
        {/* data table div */}
        <div className="flex flex-col gap-2">
          <div className="mb-5 bg-foregroundColor-2 w-full border border-foregroundColor-25 flex justify-between items-center rounded-lg shadow p-6">
            <div className="w-[80%] flex flex-col gap-5">
              <div className="flex gap-4 items-center">
                <CiMoneyBill className="text-[45px]" />
                <h1>Billing & Usage</h1>
              </div>
              <h3>View and manage all your billing statements and usage</h3>
            </div>
            <div className="flex flex-col font-semibold w-[20%] items-end">
              <h3>Total for {new Date().toLocaleDateString("default", { month: "long", year: "numeric" })}</h3>
              <div className="flex flex-col gap-1 mt-2 items-end">
                <span className="text-foregroundColor text-[20px] font-bold">₦445,711.00</span>
                <span className="text-foregroundColor-50 text-[18px]">$266.90</span>
                <span className="text-foregroundColor-50 text-[18px]">£212.09</span>
              </div>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              placeholder="Search"
              filters={[
                {
                  displayText: "Payment Status",
                  fieldName: "paymentStatus",
                  options: ["All", "Paid", "Unpaid", "Pending"]
                }
              ]}
              onQuery={(query: any) => {
                for (const key in query) {
                  searchUrl.set(key, query[key]);
                }
                refetchStaffContracts();
              }}
            />
          </div>

          {staffContractsIsLoading || isFetchingStaffContracts ? (
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
            <div className={tableContainerStyle}>
              <div className={tableTopStyle}>
                {/* title */}

                <div className="flex gap-4 items-center">
                  <MdOutlineDateRange className="text-[25px]" />
                  <h2>Billing History</h2>
                </div>

                <span
                  onClick={() => setOpenFilterDiv(!openFilterDiv)}
                  className="font-semibold cursor-pointer text-foregroundColor-80 ml-3 bg-foregroundColor-10 w-30 rounded-lg text-center p-2 border border-foregroundColor-15"
                >
                  {openFilterDiv ? "Close Filter" : "Open Filter"}
                </span>
              </div>
              <Table className="text-[16px]">
                <TableHeader>
                  <TableRow className={tableHeaderStyle}>
                    <TableHead className="text-center text-foregroundColor-70 w-[110px] font-semibold p-2 whitespace-nowrap">
                      Contract Id
                    </TableHead>
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
                      <TableHead
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
                        className="text-center text-foregroundColor-70 w-[200px] font-semibold hover:cursor-pointer hover:bg-foregroundColor-5 p-2  whitespace-nowrap"
                      >
                        {header} <LuArrowUpDown className="inline-block ml-1" />
                      </TableHead>
                    ))}
                    <TableHead className="text-center text-foregroundColor-70 font-semibold whitespace-nowrap">
                      Delete
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="mt-3 bg-backgroundColor">
                  {staffContractsIsLoading ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex items-center justify-center mt-10">
                          <LoaderDiv
                            type="spinnerText"
                            borderColor="foregroundColor"
                            text="Loading Staff Contracts..."
                            textColor="foregroundColor"
                            dimension="h-10 w-10"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (localData.length < 1 && !staffContractsIsLoading) ||
                    !staffContracts ||
                    staffContracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No data available
                      </td>
                    </tr>
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
                        <TableRow
                          key={contractId}
                          onClick={() => {
                            if (hasActionAccess("Edit Staff")) {
                              document.body.style.overflow = "hidden";
                              setOpenEditStaffContractDialog(true);
                              setOnOpenEditStaffContractData(doc);
                            } else {
                              setError("You do not have Edit User Access - Please contact your admin");
                            }
                          }}
                          className="hover:cursor-pointer"
                        >
                          <TableCell className="w-[110px] whitespace-nowrap text-center">
                            CID
                            <MdContentCopy
                              title="copy id"
                              className="ml-2 inline-block text-[19px] text-foregroundColor-70 hover:text-foregroundColor-50 hover:cursor-pointer"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await navigator.clipboard.writeText(contractId);
                              }}
                            />
                          </TableCell>

                          <TableCell className={tableCellStyle}>{academicYear.slice(0, 25)}</TableCell>

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

                          <TableCell className={tableCellStyle}>{staffFullName.slice(0, 10)}</TableCell>
                          <TableCell className={tableCellStyle}>{jobTitle.slice(0, 10)}</TableCell>
                          <TableCell className={tableCellStyle}>{formatDate(contractStartDate)}</TableCell>
                          <TableCell className={tableCellStyle}>{contractStatus}</TableCell>

                          <TableCell className="w-[200px] text-center whitespace-nowrap">
                            <span
                              className="text-red-500 bg-backgroundColor hover:cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hasActionAccess("Delete Staff")) {
                                  document.body.style.overflow = "hidden";
                                  setConfirmWithText(contractId);
                                  setConfirmWithReturnObj({ contractId });
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
                      searchUrl.set("cursorType", "prev");
                      searchUrl.set("prevCursor", paginationData.prevCursor);
                      setPage(page > 1 ? page - 1 : page);
                      refetchStaffContracts();
                    }}
                    disabled={page < 2}
                    className="ghostbutton"
                  >
                    <MdNavigateBefore className="text-[20px] inline-block" />
                    Previous
                  </button>
                  <span className=" px-2">
                    Page {page} of {Math.ceil(paginationData.totalCount / 15)}
                  </span>
                  <button
                    onClick={() => {
                      searchUrl.set("cursorType", "next");
                      searchUrl.set("nextCursor", paginationData.nextCursor);
                      setPage(paginationData.hasNext ? page + 1 : page);
                      refetchStaffContracts();
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

export default Billing;
