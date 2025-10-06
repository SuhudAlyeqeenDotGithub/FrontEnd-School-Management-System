"use client";
import { checkDataType, handledDeleteImage } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import {
  ActionButtons,
  CustomHeading,
  ErrorDiv,
  LoaderDiv,
  SearchComponent
} from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaLeaf, FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/customComponents/general/compLibrary2";
import NewAcademicYearComponent from "@/lib/customComponents/academicYear/newAcademicYearComp";
import { MdContentCopy, MdAdd } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  defaultButtonStyle,
  tableCellStyle,
  tableContainerStyle,
  tableHeadCellStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import EditAcademicYearComponent from "@/lib/customComponents/academicYear/editAcademicYear";
import { useTimelineMutation } from "@/tanStack/timeline/mutate";
import reusableQueries from "@/tanStack/reusables/reusableQueries";

const AcademicYear = () => {
  const { accountData } = useAppSelector((state) => state.accountData);
  const { useReusableQuery, hasActionAccess } = reusableQueries();
  const { tanDeleteAcademicYear } = useTimelineMutation();
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditAcademicYearDialog, setOpenEditAcademicYearDialog] = useState(false);
  const [openNewAcademicYearDialog, setOpenNewAcademicYearDialog] = useState(false);
  const [onOpenEditAcademicYearData, setOnOpenEditAcademicYearData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});

  const {
    data: academicYears,
    isPending: academicYearsIsPending,
    isFetching: academicYearsIsFetching,
    error: academicYearsError,
    isError: isAcademicYearsError,
    refetch: refetchAcademicYears
  } = useReusableQuery("academicYears", "View Academic Years", `alyeqeenschoolapp/api/academicsession/academicYear`);

  useEffect(() => {
    if (!academicYears) return;
    setError("");
    setLocalData(academicYears);
  }, [academicYears, academicYearsIsPending]);

  useEffect(() => {
    if (!isAcademicYearsError) return;
    if (academicYearsError) {
      setError(academicYearsError.message);
    }
  }, [academicYearsError, isAcademicYearsError]);

  useEffect(() => {
    if (!academicYears) return;
    if (searchValue !== "") {
      const filteredData = (academicYears as any[]).filter((obj: any) =>
        obj.academicYear.toLowerCase().includes(searchValue.toLowerCase())
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

  console.log("localData", localData);

  return (
    <div className="px-8 py-6 w-full gap-5 flex flex-col">
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
                  const response = await tanDeleteAcademicYear.mutateAsync({
                    academicYearIdToDelete: returnObject.academicYearId
                  });
                  if (response) {
                    setOpenConfirmDelete(false);
                    document.body.style.overflow = "";
                  }
                } catch (err: any) {
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

        {/* table header */}

        <div className={tableTopStyle}>
          <div className="flex flex-col">
            <CustomHeading variation="sectionHeader">
              Academic Years
              {/* <UserRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
            </CustomHeading>
            <CustomHeading variation="head5light">Manage Academic Years and Periods</CustomHeading>
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
              onClick={() => {
                if (hasActionAccess("Create Academic Year")) {
                  document.body.style.overflow = "hidden";
                  setOpenNewAcademicYearDialog(true);
                } else {
                  setError("You do not have Create Academic Year Access - Please contact your admin");
                }
              }}
              className={defaultButtonStyle}
              disabled={!hasActionAccess("Create Academic Year")}
            >
              <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> New Academic Year
            </button>
          </div>
        </div>
        {academicYearsIsPending || academicYearsIsFetching || !academicYears ? (
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
          <div className={`${tableContainerStyle} mt-8`}>
            <table className="relative w-full">
              <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                <tr className={tableHeaderStyle}>
                  {(["Academic Year Id", "Academic Year", "Start Date", "End Date"] as const).map((header) => (
                    <th
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
                    </th>
                  ))}{" "}
                  <th className={tableHeadCellStyle}>Periods</th>
                  <th className={tableHeadCellStyle}>Actions</th>
                </tr>
              </thead>
              {/* table data */}
              <tbody className="mt-3 bg-backgroundColor">
                {academicYearsIsPending ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex items-center justify-center mt-10">
                        <LoaderDiv type="spinnerText" text="Loading Academic Years..." dimension="h-10 w-10" />
                      </div>
                    </td>
                  </tr>
                ) : localData.length < 1 && searchValue ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="flex justify-center mt-6">No search result found</div>
                    </td>
                  </tr>
                ) : localData.length < 1 && !academicYearsIsPending ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="flex justify-center mt-6">No data available</div>{" "}
                    </td>
                  </tr>
                ) : (
                  localData.map((doc: any, index: any) => {
                    const { _id: academicYearId, academicYear, startDate, endDate, periods } = doc;

                    return (
                      <tr
                        key={academicYearId}
                        onClick={() => {
                          if (hasActionAccess("Edit Academic Year")) {
                            document.body.style.overflow = "hidden";
                            setOpenEditAcademicYearDialog(true);
                            setOnOpenEditAcademicYearData(doc);
                          } else {
                            setError("You do not have Academic Year Access - Please contact your admin");
                          }
                        }}
                        className={tableRowStyle}
                      >
                        <td className="w-[110px] whitespace-nowrap text-center">
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
                        </td>
                        <td className={tableCellStyle}> {academicYear}</td>

                        <td className={tableCellStyle}>{formatDate(startDate)}</td>
                        <td className={tableCellStyle}>{formatDate(endDate)}</td>
                        <td className={tableCellStyle}>
                          {periods && periods.length > 0 ? periods.map((period: any) => period.period).join(", ") : []}
                          ...
                        </td>
                        <td className="text-center flex items-center justify-center h-15">
                          <ActionButtons
                            onEdit={(e) => {
                              if (hasActionAccess("Edit Academic Year")) {
                                document.body.style.overflow = "hidden";
                                setOpenEditAcademicYearDialog(true);
                                setOnOpenEditAcademicYearData(doc);
                              } else {
                                setError("You do not have Academic Year Access - Please contact your admin");
                              }
                            }}
                            onDelete={(e) => {
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
                                  "Unauthorised Action: You do not have Delete Academic Year Access - Please contact your admin"
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
        )}
      </div>
      {/* end of data table */}
    </div>
  );
};

export default AcademicYear;
