"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ErrorDiv, LoaderDiv } from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaLeaf, FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/customComponents/general/compLibrary2";
import NewAcademicYearComponent from "@/lib/customComponents/academicYear/newAcademicYearComp";
import { deleteAcademicYear, getAcademicYears } from "@/redux/features/general/academicYear/academicYearThunk";
import { MdContentCopy, MdAdd } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tableCellStyle, tableContainerStyle, tableHeaderStyle, tableTopStyle } from "@/lib/generalStyles";
import EditAcademicYearComponent from "@/lib/customComponents/academicYear/editAcademicYear";
import { useQuery } from "@tanstack/react-query";
import { tanFetchAny } from "@/tanStack/timeline/fetch";

const AcademicYear = () => {
  const dispatch = useAppDispatch();
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditAcademicYearDialog, setOpenEditAcademicYearDialog] = useState(false);
  const [openNewAcademicYearDialog, setOpenNewAcademicYearDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenEditAcademicYearData, setOnOpenEditAcademicYearData] = useState<any>({});
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
    data: academicYears,
    isLoading: academicYearsIsLoading,
    isFetching: academicYearsIsFetching,
    error: academicYearsError,
    isError: isAcademicYearsError,
    refetch: refetchAcademicYears
  } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () =>
      tanFetchAny(
        accountData,
        accountPermittedActions,
        "View Academic Years",
        `alyeqeenschoolapp/api/timeline/academicYear`
      ),
    enabled: Boolean(accountData?.accountStatus),
    retry: false
  });

  useEffect(() => {
    if (!academicYears) return;
    setError("");
    setLocalData(academicYears);
  }, [academicYears, academicYearsIsLoading]);

  useEffect(() => {
    if (!isAcademicYearsError) return;
    if (academicYearsError) {
      setError(academicYearsError.message);
    }
  }, [academicYearsError, isAcademicYearsError]);

  useEffect(() => {
    if (!academicYears) return;
    if (searchValue !== "") {
      const filteredData = academicYears.filter((obj: any) =>
        obj.searchText.toLowerCase().includes(searchValue.toLowerCase())
      );
      setLocalData(filteredData);
    } else {
      setLocalData(academicYears);
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

  if (!academicYears) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Academic Years Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (academicYearsError)
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
    <div className="px-8 py-6 w-full mt-10 gap-5 flex flex-col">
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
        {openEditAcademicYearDialog && (
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
              data={onOpenEditAcademicYearData}
            />
          </div>
        )}
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
                  const response = await dispatch(
                    deleteAcademicYear({ academicYearIdToDelete: returnObject.academicYearId })
                  ).unwrap();
                  if (response) {
                    setOpenConfirmDelete(false);
                    document.body.style.overflow = "";
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
        )}
        {/* data table div */}
        {/* table body */}

        {academicYearsIsLoading || academicYearsIsFetching || !academicYears ? (
          <div className="flex items-center justify-center mt-10">
            <LoaderDiv
              type="spinnerText"
              borderColor="foregroundColor"
              text="Loading Academic Years Data..."
              textColor="foregroundColor"
              dimension="h-10 w-10"
            />
          </div>
        ) : (
          <div className={tableContainerStyle}>
            {/* table header */}
            <div className={tableTopStyle}>
              <div className="flex flex-col gap-2 mb-2">
                <h2>Academic Year</h2>
              </div>

              {/* search div */}
              <div className="flex w-[700px] h-[50px] items-center gap-2 relative">
                <input
                  className="border border-foregroundColor-25 bg-backgroundColor rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                  placeholder="Search AcademicYear (Name, Start Date, End Date)"
                  name="searchValue"
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                />
                <FaSearch className="text-foregroundColor size-5 absolute right-3" />
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
                  <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Academic Year
                </button>
              </div>
            </div>

            <Table className="text-[16px]">
              <TableHeader>
                <TableRow className={tableHeaderStyle}>
                  {(["Academic Year Id", "Academic Year", "Start Date", "End Date"] as const).map((header) => (
                    <TableHead
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
                      className="text-center text-foregroundColor-70 w-[200px] font-semibold hover:cursor-pointer
                      hover:bg-foregroundColor-5 p-2 whitespace-nowrap"
                    >
                      {header} <LuArrowUpDown className="inline-block ml-1" />
                    </TableHead>
                  ))}
                  <TableHead className="text-center text-foregroundColor-70 font-semibold whitespace-nowrap">
                    Delete
                  </TableHead>
                </TableRow>
              </TableHeader>
              {/* table data */}
              <TableBody className="mt-3 bg-backgroundColor">
                {academicYearsIsLoading ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center mt-10">
                        <LoaderDiv
                          type="spinnerText"
                          borderColor="foregroundColor"
                          text="Loading Academic Years..."
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
                ) : localData.length < 1 && !academicYearsIsLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="flex justify-center mt-6">No data available</div>{" "}
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const { _id: academicYearId, academicYear, startDate, endDate } = doc;

                    return (
                      <TableRow
                        key={academicYearId}
                        onClick={() => {
                          if (hasActionAccess("Edit Academic Year")) {
                            document.body.style.overflow = "hidden";
                            setOpenEditAcademicYearDialog(true);
                            setOnOpenEditAcademicYearData(doc);
                          } else {
                            setError("You do not have Edit User Access - Please contact your admin");
                          }
                        }}
                        className="hover:cursor-pointer"
                      >
                        <TableCell className="w-[110px] whitespace-nowrap text-center">
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
                        </TableCell>
                        <TableCell className={tableCellStyle}> {academicYear}</TableCell>
                        <TableCell className={tableCellStyle}>{formatDate(startDate)}</TableCell>
                        <TableCell className={tableCellStyle}>{formatDate(endDate)}</TableCell>

                        <TableCell className="w-[200px] text-center whitespace-nowrap">
                          <span
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
          </div>
        )}
      </div>
      {/* end of data table */}
    </div>
  );
};

export default AcademicYear;
