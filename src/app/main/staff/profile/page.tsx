"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
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
import {
  DisallowedActionDialog,
  ConfirmActionByInputDialog,
  CustomFilterComponent
} from "@/lib/customComponents/general/compLibrary2";
import { MdContentCopy, MdAdd, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  defaultButtonStyle,
  ghostbuttonStyle,
  paginationButtonStyle,
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
import { UserRoundPen } from "lucide-react";
import StaffProfileDialogComponent from "@/lib/customComponents/staff/staffProfileDIalogComp";

const StaffProfile = () => {
  const { hasActionAccess, useReusableInfiniteQuery } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/staff/profile");

  // const { staff, isLoading: isFetching } = useAppSelector((state) => state.staffData);
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openStaffDialog, setOpenEditStaffDialog] = useState(false);
  const [openNewStaffDialog, setOpenNewStaffDialog] = useState(false);
  const [openViewStaffDialog, setOpenViewStaffDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [openFilterDiv, setOpenFilterDiv] = useState(false);
  const [onOpenStaffProfileDialogData, setOnOpenStaffProfileDialogData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});

  const [paginationData, setPaginationData] = useState<any>({
    totalCount: 0,
    chunkCount: 0,
    hasNext: false
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimit] = useState("10");
  const [queryParams, setQueryParams] = useState({});

  const {
    data: staff,
    isFetching,
    error: queryError,
    isError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "staffProfiles",
    queryParams,
    Number(limit) || 10,
    "View Staff Profiles",
    "alyeqeenschoolapp/api/staff/profile"
  );

  useEffect(() => {
    if (!staff) return;
    const currentPage: any = staff.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.staffProfiles);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [staff, isFetching]);

  useEffect(() => {
    if (!isError) return;
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError, isError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { staffProfiles, ...rest } = foundPage;
      setLocalData(staffProfiles);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { staffProfiles, ...rest } = foundPage;
      setLocalData(staffProfiles);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };
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
      <div className="">
        {openStaffDialog && (
          <StaffProfileDialogComponent
            type="edit"
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditStaffDialog(!open);
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenEditStaffDialog(!notSave);
            }}
            data={onOpenStaffProfileDialogData}
          />
        )}
        {openNewStaffDialog && (
          <StaffProfileDialogComponent
            type="new"
            data={onOpenStaffProfileDialogData}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewStaffDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenNewStaffDialog(!notSave);
              return {};
            }}
          />
        )}

        {openViewStaffDialog && (
          <StaffProfileDialogComponent
            type="view"
            data={onOpenStaffProfileDialogData}
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenViewStaffDialog(!open);
              return {};
            }}
            onSave={(notSave) => {
              document.body.style.overflow = "";
              setOpenViewStaffDialog(!notSave);
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
                  let imageDeletionDone = false;
                  if (returnObject.imageLocalDestination || returnObject.imageLocalDestination !== "") {
                    imageDeletionDone = await handledDeleteImage(returnObject.imageLocalDestination);
                  } else {
                    imageDeletionDone = true;
                  }

                  if (imageDeletionDone) {
                    await deleteMutation.mutateAsync({ staffIDToDelete: returnObject.staffIDToDelete });
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
        <div className="flex flex-col">
          <div className={tableTopStyle}>
            {/* title */}
            <div className="flex flex-col">
              <CustomHeading variation="sectionHeader">
                Staff Profiles
                {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
              </CustomHeading>
              <CustomHeading variation="head5light">Register and manage staff</CustomHeading>
            </div>
            <button onClick={() => setOpenFilterDiv(!openFilterDiv)} className={ghostbuttonStyle}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </button>
            <div>
              <button
                onClick={() => {
                  if (hasActionAccess("Create Staff Profile")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewStaffDialog(true);
                  } else {
                    setError("You do not have Create Staff Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Staff Profile")}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Staff
              </button>
            </div>
          </div>
          <div hidden={!openFilterDiv}>
            <CustomFilterComponent
              currentQuery={queryParams}
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
                  options: ["All", "Male", "Female", "Other"]
                }
              ]}
              onQuery={(query: any) => {
                setQueryParams(query);
              }}
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
                  renderPreviousPage(prevPage, staff.pages);
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
                  renderNextPage(nextPage, staff.pages);
                }}
                disabled={!paginationData.hasNext}
              />
            </div>
          </div>
          {/* table body */}
          {
            <div className={tableContainerStyle}>
              {/* table header */}

              <table className="relative w-full">
                <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                  <tr className={tableHeaderStyle}>
                    <th className="text-center w-[110px] font-semibold p-2 whitespace-nowrap"></th>

                    {(
                      ["Staff Custom ID", "Full Name", "Gender", "Email", "Phone Number", "Marital Status"] as const
                    ).map((header) => (
                      <th
                        key={header}
                        onClick={() => {
                          const key_Name = {
                            "Staff Custom ID": "staffCustomId",
                            "Full Name": "staffFullName",
                            "Marital Status": "staffMaritalStatus",
                            "Phone Number": "staffPhone",
                            Gender: "staffGender",
                            Email: "staffEmail"
                          };
                          const sortKey = key_Name[header];
                          handleSort(sortKey);
                        }}
                        className={sortableTableHeadCellStyle}
                      >
                        {header}
                        <LuArrowUpDown className="inline-block ml-1" />
                      </th>
                    ))}
                    <th className={tableHeadCellStyle}>Actions</th>
                  </tr>
                </thead>

                {/* table data */}
                <tbody className="bg-backgroundColor rounded-b-lg">
                  {isFetching ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex items-center justify-center p-10">
                          <LoaderDiv
                            type="spinnerText"
                            text="Loading Staff Profiles..."
                            textColor="foregroundColor"
                            dimension="h-10 w-10"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (localData.length < 1 && !isFetching) || !staff ? (
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
                        staffFullName,
                        staffGender,
                        staffEmail,
                        staffPhone,
                        staffMaritalStatus
                      } = doc;

                      return (
                        <tr
                          key={profileId}
                          onClick={() => {
                            if (hasActionAccess("View Staff Profile")) {
                              document.body.style.overflow = "hidden";
                              setOnOpenStaffProfileDialogData(doc);
                              setOpenViewStaffDialog(true);
                            } else {
                              setError("You do not have View Staff Profile Access - Please contact your admin");
                            }
                          }}
                          className={tableRowStyle}
                        >
                          <td className="w-[110px] whitespace-nowrap text-center flex items-center justify-center h-15">
                            <span className="rounded-full bg-backgroundColor-3 p-2 text-foregroundColor w-10 h-10 flex items-center justify-center">
                              <p>{staffFullName.toUpperCase().slice(0, 2)}</p>
                            </span>
                          </td>
                          <td className="w-[200px] text-center whitespace-nowrap">
                            {staffCustomId.slice(0, 10)}
                            <MdContentCopy
                              title="copy id"
                              className="ml-2 inline-block text-[19px] text-foregroundColor-2  hover:text-borderColor-3 hover:cursor-pointer"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await navigator.clipboard.writeText(staffCustomId);
                              }}
                            />
                          </td>
                          <td className={tableCellStyle}>{staffFullName.slice(0, 20)}</td>
                          <td className={tableCellStyle}>{staffGender}</td>
                          <td className={tableCellStyle}>{staffEmail}</td>
                          <td className={tableCellStyle}>{staffPhone}</td>
                          <td className={tableCellStyle}>{staffMaritalStatus}</td>

                          <td className="text-center flex items-center justify-center h-15">
                            <ActionButtons
                              onEdit={(e) => {
                                if (hasActionAccess("Edit Staff Profile")) {
                                  document.body.style.overflow = "hidden";
                                  setOnOpenStaffProfileDialogData(doc);
                                  setOpenEditStaffDialog(true);
                                } else {
                                  setError("You do not have Edit Staff Profile Access - Please contact your admin");
                                }
                              }}
                              onDelete={(e) => {
                                if (hasActionAccess("Delete Staff Profile")) {
                                  document.body.style.overflow = "hidden";
                                  setConfirmWithText(staffCustomId);
                                  setConfirmWithReturnObj({
                                    staffIDToDelete: staffCustomId,
                                    imageLocalDestination: doc.imageLocalDestination
                                  });
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
          }
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default StaffProfile;
