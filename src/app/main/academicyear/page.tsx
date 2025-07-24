"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/customComponents/general/compLibrary2";
import NewAcademicYearComponent from "@/lib/customComponents/academicYear/newAcademicYearComp";
import { deleteAcademicYear, getAcademicYears } from "@/redux/features/general/academicYear/academicYearThunk";
import { MdContentCopy } from "react-icons/md";

import { tableRowStyle, dataRowCellStyle } from "@/lib/generalStyles";

const AcademicYear = () => {
  const dispatch = useAppDispatch();
  const { academicYears, isLoading: academicYearsIsLoading } = useAppSelector((state) => state.academicYear);
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditUserDialog, setOpenEditAcademicYearDialog] = useState(false);
  const [openNewAcademicYearDialog, setOpenNewAcademicYearDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenEditUserData, setOnOpenEditAcademicYearData] = useState<any>({});
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
    setLocalData(academicYears);
  }, [academicYears]);

  useEffect(() => {
    if (searchValue !== "") {
      const filteredData = academicYears.filter((obj: any) =>
        obj.searchText.toLowerCase().includes(searchValue.toLowerCase())
      );
      setLocalData(filteredData);
    } else {
      setLocalData(academicYears);
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
        {/* {openEditUserDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <EditAcademicYearComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditAcademicYearDialog(!open);
                return {};
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenEditAcademicYearDialog(!notSave);
                return {};
              }}
              data={onOpenEditUserData}
            />
          </div>
        )} */}
        {openNewAcademicYearDialog && (
          <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
            <NewAcademicYearComponent
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenNewAcademicYearDialog(!open);
                return {};
              }}
              onCreate={(notSave) => {
                document.body.style.overflow = "";
                setOpenNewAcademicYearDialog(!notSave);
                return {};
              }}
            />
          </div>
        )}

        {/* {openConfirmDelete && (
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
                    console.log("deleting academic year for on backend", returnObject.staffIDToDelete);
                    await dispatch(deleteAcademicYear({ staffIDToDelete: returnObject.staffIDToDelete })).unwrap();
                  } else {
                    return;
                  }
                } catch (err: any) {
                  console.log("error deleting academic year", err.message);
                  setError(err.message);
                }
              } else {
                setError("An error occured while deleting - Please try again");
              }
              setOpenConfirmDelete(false);
              document.body.style.overflow = "";
            }}
            warningText="Please confirm the ID of the academic year you want to delete"
          />
        )} */}
        {/* data table div */}
        <div className="flex flex-col gap-4">
          {/* title */}
          <div className="flex flex-col gap-2 mb-5">
            <h2>Academic Year</h2>
          </div>
          {/* search bar and new action Button */}
          <div className="flex justify-between items-center">
            {/* search div */}
            <div className="flex w-[700px] h-[50px] items-center gap-2">
              <input
                className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                placeholder="Search AcademicYear (Name, Start Date, End Date)"
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
                  if (hasActionAccess("Create Academic Year")) {
                    document.body.style.overflow = "hidden";
                    setOpenNewAcademicYearDialog(true);
                  } else {
                    setError("You do not have Create Academic Year Access - Please contact your admin");
                  }
                }}
                disabled={!hasActionAccess("Create Academic Year")}
              >
                New Academic Year
              </button>
            </div>
          </div>

          {/* table body */}

          <div className="flex flex-col gap-2">
            {/* table header */}
            <div className="w-full flex px-4 py-3 p-2 h-[55px] overflow-hidden">
              <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                {(["Academic Year Id", "Academic Year", "Start Date", "End Date"] as const).map((header) => (
                  <div
                    key={header}
                    onClick={() => {
                      const key_Name = {
                        "Academic Year Id": "_id",
                        "Academic Year": "academicYear",
                        "Start Date": "startDate",
                        "End Date": "endDate"
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
              {academicYearsIsLoading ? (
                <div className="flex items-center justify-center mt-10">
                  <LoaderDiv
                    type="spinnerText"
                    borderColor="foregroundColor"
                    text="Loading AcademicYear Profile..."
                    textColor="foregroundColor"
                    dimension="h-10 w-10"
                  />
                </div>
              ) : localData.length < 1 && searchValue ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : localData.length < 1 && !academicYearsIsLoading ? (
                <div className="flex justify-center mt-6">No data available</div>
              ) : (
                localData.map((doc: any, index: any) => {
                  const { _id: academicYearId, academicYear, startDate, endDate } = doc;

                  return (
                    <div
                      key={academicYearId}
                      onClick={() => {
                        if (hasActionAccess("Edit AcademicYear")) {
                          document.body.style.overflow = "hidden";
                          setOpenEditAcademicYearDialog(true);
                          setOnOpenEditAcademicYearData(doc);
                        } else {
                          setError("You do not have Edit User Access - Please contact your admin");
                        }
                      }}
                      className={tableRowStyle}
                    >
                      <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px] gap-3">
                          Copy Id
                          <MdContentCopy
                            title="copy id"
                            className="text-[20px] text-foregroundColor-80 hover:text-foregroundColor-50 hover:cursor-pointer"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await navigator.clipboard.writeText(academicYearId);
                            }}
                          />
                        </span>
                        <span className={dataRowCellStyle}> {academicYear}</span>
                        <span className={dataRowCellStyle}>{formatDate(startDate)}</span>
                        <span className={dataRowCellStyle}>{formatDate(endDate)}</span>
                      </div>

                      <CgTrash
                        className="text-[25px] text-red-500 bg-backgroundColor hover:cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasActionAccess("Delete Academic Year")) {
                            document.body.style.overflow = "hidden";
                            setConfirmWithText(academicYearId);
                            setConfirmWithReturnObj({
                              academicYearId,
                              academicYear,
                              startDate,
                              endDate
                            });
                            setOpenConfirmDelete(true);
                          } else {
                            setError(
                              "Unauthorised Action: You do not have Delete AcademicYear Access - Please contact your admin"
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

export default AcademicYear;
