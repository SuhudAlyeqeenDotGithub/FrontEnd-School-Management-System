"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
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
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { ConfirmActionByInputDialog, CustomFilterComponent } from "@/lib/customComponents/general/compLibrary2";
import { MdContentCopy, MdAdd, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import {
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
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import StaffContractDialog from "@/lib/customComponents/staff/staffContractDialogComp";

const StaffContracts = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/staff/contract");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditStaffContractDialog, setOpenEditStaffContractDialog] = useState(false);
  const [openNewStaffContractDialog, setOpenNewStaffContractDialog] = useState(false);
  const [openViewStaffContractDialog, setOpenViewStaffContractDialog] = useState(false);
  const [onOpenStaffContractData, setOnOpenEditStaffContractData] = useState<any>({});
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
    error: queryError,
    isError: isStaffProfilesError
  } = useReusableQuery("staffProfiles", "View Staff Profiles", "alyeqeenschoolapp/api/staff/allprofile");

  const {
    data: academicYears,
    isFetching: academicYearsIsFetching,
    error: academicYearsError,
    isError: isAcademicYearsError,
    refetch: refetchAcademicYears
  } = useReusableQuery("academicYears", "View Academic Years", `alyeqeenschoolapp/api/academicsession/academicYear`);

  const {
    data: staffContracts,
    isFetching: isFetchingStaffContracts,
    error: staffContractsQueryError,
    isError: isStaffContractsError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "staffContracts",
    queryParams,
    Number(limit) || 10,
    "View Staff Contracts",
    "alyeqeenschoolapp/api/staff/contract"
  );

  useEffect(() => {
    if (!staffProfiles) return;
    setError("");
  }, [staffProfiles, isFetchingStaffProfiles]);

  useEffect(() => {
    if (!isStaffProfilesError) return;
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError, isStaffProfilesError]);

  useEffect(() => {
    if (!academicYears) return;
    setError("");
  }, [academicYears, academicYearsIsFetching]);

  useEffect(() => {
    if (!isAcademicYearsError) return;
    if (academicYearsError) {
      setError(academicYearsError.message);
    }
  }, [academicYearsError, isAcademicYearsError]);

  useEffect(() => {
    if (!staffContracts) return;
    setError("");
    const currentPage: any = staffContracts.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.staffContracts);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [staffContracts, isFetchingStaffContracts]);

  useEffect(() => {
    if (!isStaffContractsError) return;
    if (staffContractsQueryError) {
      setError(staffContractsQueryError.message);
    }
  }, [staffContractsQueryError, isStaffContractsError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { staffContracts, ...rest } = foundPage;
      setLocalData(staffContracts);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { staffContracts, ...rest } = foundPage;
      setLocalData(staffContracts);
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
          text="Loading User Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (!academicYears || !staffContracts || !staffProfiles) {
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
      <>
        {openEditStaffContractDialog && (
          <StaffContractDialog
            type="edit"
            data={onOpenStaffContractData}
            academicYears={academicYears}
            staff={staffProfiles}
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
          />
        )}

        {openViewStaffContractDialog && (
          <StaffContractDialog
            type="view"
            data={onOpenStaffContractData}
            academicYears={academicYears}
            staff={staffProfiles}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewStaffContractDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewStaffContractDialog(!notSave);
              return {};
            }}
          />
        )}

        {openNewStaffContractDialog && (
          <StaffContractDialog
            type="new"
            academicYears={academicYears}
            staff={staffProfiles}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewStaffContractDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewStaffContractDialog(!notSave);
              return {};
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
                  await deleteMutation.mutateAsync({
                    staffContractIDToDelete: returnObject.contractId
                  });
                } catch (err: any) {
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

        <div className="flex flex-col">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Staff Contract
                {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">Create and manage staff contracts</CustomHeading>
            </div>

            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
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
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Staff Contract
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              placeholder="Search Staff Custom ID, Staff Names, Contract Dates, Job Title, Contract Type/Status"
              filters={[
                {
                  displayText: "Academic Year",
                  fieldName: "academicYear",
                  options: [
                    "All",
                    ...(Array.isArray(academicYears) ? academicYears.map(({ academicYear }: any) => academicYear) : [])
                  ]
                },
                {
                  displayText: "Contract Type",
                  fieldName: "contractType",
                  options: ["All", "Full-time", "Part-time"]
                },
                {
                  displayText: "Contract Status",
                  fieldName: "contractStatus",
                  options: ["All", "Active", "Closed"]
                }
              ]}
              onQuery={(query: any) => {}}
            />
          </div>
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
                  renderPreviousPage(prevPage, staffContracts.pages);
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
                  renderNextPage(nextPage, staffContracts.pages);
                }}
                disabled={!paginationData.hasNext}
              />
            </div>
          </div>

          <div className={tableContainerStyle}>
            <table className="relative w-full">
              <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                <tr className={tableHeaderStyle}>
                  <th className="text-center w-[110px] font-semibold p-2 whitespace-nowrap">Contract Id</th>
                  {(
                    [
                      "Staff Custom ID",
                      "Academic Year",
                      "Staff Full Name",
                      "Job Title",
                      "Start Date",
                      "Contact Status"
                    ] as const
                  ).map((header) => (
                    <th
                      key={header}
                      onClick={() => {
                        const key_Name = {
                          "Academic Year": "academicYear",
                          "Staff Custom ID": "staffCustomId",
                          "Staff Full Name": "staffFullName",
                          "Job Title": "jobTitle",
                          "Start Date": "contractStartDate",
                          "Contact Status": "contractStatus"
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

              <tbody className="mt-3 bg-backgroundColor">
                {isFetchingStaffContracts ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center p-10">
                        <LoaderDiv
                          type="spinnerText"
                          text="Loading Staff Contracts..."
                          textColor="foregroundColor"
                          dimension="h-10 w-10"
                        />
                      </div>
                    </td>
                  </tr>
                ) : (localData.length < 1 && !isFetchingStaffContracts) || !staffContracts ? (
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
                      <tr
                        key={contractId}
                        onClick={() => {
                          if (hasActionAccess("View Staff Contract")) {
                            document.body.style.overflow = "hidden";
                            setOpenViewStaffContractDialog(true);
                            setOnOpenEditStaffContractData(doc);
                          } else {
                            setError("You do not have Edit User Access - Please contact your admin");
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
                              await navigator.clipboard.writeText(contractId);
                            }}
                          />
                        </td>
                        <td className="w-[200px] text-center whitespace-nowrap">
                          {staffCustomId.slice(0, 10)}
                          <MdContentCopy
                            title="copy id"
                            className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(staffCustomId);
                            }}
                          />
                        </td>
                        <td className={tableCellStyle}>{academicYear.slice(14)}</td>
                        <td className={tableCellStyle}>{staffFullName.slice(0, 20)}</td>
                        <td className={tableCellStyle}>{jobTitle.slice(0, 20)}</td>
                        <td className={tableCellStyle}>{formatDate(contractStartDate)}</td>
                        <td className={tableCellStyle}>{contractStatus}</td>
                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Staff Contract")) {
                                document.body.style.overflow = "hidden";
                                setOpenEditStaffContractDialog(true);
                                setOnOpenEditStaffContractData(doc);
                              } else {
                                setError("You do not have Edit User Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
                              if (hasActionAccess("Delete Staff Contract")) {
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
      {/* end of data table */}
    </div>
  );
};

export default StaffContracts;
