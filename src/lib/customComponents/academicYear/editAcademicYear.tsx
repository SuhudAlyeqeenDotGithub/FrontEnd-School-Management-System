"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv, LoaderDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { useTimelineMutation } from "@/tanStack/timeline/mutate";
import PeriodComponent from "./periodComp";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { useQueryClient } from "@tanstack/react-query";
import { defaultButtonStyle } from "@/lib/generalStyles";

const EditAcademicYearComponent = ({
  onClose,
  onSave,
  data
}: {
  onClose: (close: boolean) => {};
  onSave: (create: boolean) => {};
  data: any;
}) => {
  const { handleUnload } = useNavigationHandler();
  const queryClient = useQueryClient();
  const { tanUpdateAcademicYear, tanCreatePeriod, tanUpdatePeriod, tanDeletePeriod, tanCreateAcademicYear } =
    useTimelineMutation();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [openNewPeriodDialog, setOpenNewPeriodDialog] = useState(false);
  const [openEditPeriodDialog, setOpenEditPeriodDialog] = useState(false);
  const [onEditPeriodData, setOnEditPeriodData] = useState({
    _id: "",
    customId: "",
    period: "",
    startDate: "",
    endDate: ""
  });
  const [existingPeriods, setExistingPeriods] = useState([]);

  const [localData, setLocalData] = useState({
    _id: data?._id || "",
    academicYear: data?.academicYear || "",
    startDate: data?.startDate || "",
    endDate: data?.endDate || "",
    periods: data?.periods || []
  });

  const { academicYear, startDate, endDate, periods } = localData;
  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  // effect to update newly created periods as existing
  useEffect(() => {
    setExistingPeriods(periods.map(({ period }: { period: string }) => period));
  }, [periods]);

  // effect to get ride of existing period when editing
  useEffect(() => {
    setExistingPeriods((prev: any) => prev.filter((period: string) => period !== onEditPeriodData.period));
  }, [onEditPeriodData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };
  const validationPassed = () => {
    if (academicYear === "") {
      setError("Academic Year is required");
      return false;
    }
    // Access academic years from react-query cache and check for duplicates
    const cachedAcademicYears = queryClient.getQueryData(["academicYears"]);
    if (cachedAcademicYears && Array.isArray(cachedAcademicYears)) {
      const exists = cachedAcademicYears.some(
        (ay: any) => ay.academicYear.trim().toLowerCase() === academicYear.trim().toLowerCase()
      );
      if (exists) {
        setError(`Academic Year ${academicYear} already exists`);
        return false;
      }
    }
    if (startDate === "") {
      setError("Start Date is required");
      return false;
    }
    if (endDate === "") {
      setError("End Date is required");
      return false;
    }

    if (periods.length === 0) {
      setError("At least one period is required under each academic year");
      return false;
    }

    return true;
  };

  const handleUpdateAcademicYear = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await tanUpdateAcademicYear.mutateAsync(localData);
        if (response) {
          onSave(true);
        }
      } catch (error: any) {
        setError(error.message || error.response?.data.message || "Error creating academic year");
      }
    }
  };

  const handleCreateAcademicYear = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await tanCreateAcademicYear.mutateAsync(localData);
        if (response) {
          onSave(true);
        }
      } catch (error: any) {
        setError(error.message || error.response?.data.message || "Error creating academic year");
      }
    }
  };

  return (
    <ContainerComponent id="AcademicYearDialogContainer" style="w-[50%] h-[90%] gap-5 overflow-auto flex flex-col">
      {openUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onNo={() => {
            const container = document.getElementById("AcademicYearDialogContainer");
            if (container) {
              container.style.overflow = "";
            }
            setOpenUnsavedDialog(false);
          }}
          onYes={() => {
            handleUnload("remove");
            onClose(true);
          }}
        />
      )}
      {openNewPeriodDialog && (
        <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
          <PeriodComponent
            type="create"
            disallowedPeriods={existingPeriods}
            onClose={async (closed) => {
              if (closed) setOpenNewPeriodDialog(!closed);
            }}
            onUpdate={async (created, updateType, newPeriod) => {
              const { _id, ...transformedPeriod } = newPeriod;
              const academicYearAttachedPeriod = {
                ...transformedPeriod,
                academicYearId: localData._id,
                academicYear: localData.academicYear
              };

              let savedToBackend = false;
              let savedPeriod = {};

              try {
                const response = await tanCreatePeriod.mutateAsync(academicYearAttachedPeriod);
                if (response) {
                  savedToBackend = true;
                  savedPeriod = response?.data;
                }
              } catch (error: any) {
                setError(error.response?.data.message || error.message || "Error creating period");
              }

              if (savedToBackend && created && updateType === "create") {
                setLocalData((prev: any) => ({
                  ...prev,
                  periods: [...prev.periods, savedPeriod]
                }));
                setOpenNewPeriodDialog(!created);
              }
            }}
          />
        </div>
      )}
      {openEditPeriodDialog && (
        <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-50">
          <PeriodComponent
            type="edit"
            data={onEditPeriodData}
            disallowedPeriods={existingPeriods}
            onClose={(closed) => {
              if (closed) setOpenEditPeriodDialog(!closed);
            }}
            onUpdate={async (updated, updateType, updatedPeriod) => {
              const academicYearAttachedPeriod = {
                ...updatedPeriod,
                academicYearId: localData._id,
                academicYear: localData.academicYear
              };

              let savedToBackend = false;

              try {
                const response = await tanUpdatePeriod.mutateAsync(academicYearAttachedPeriod);
                if (response) {
                  savedToBackend = true;
                }
              } catch (error: any) {
                setError(error.response?.data.message || error.message || "Error updating period");
              }

              if (savedToBackend && updated && updateType === "edit") {
                setLocalData((prev: any) => ({
                  ...prev,
                  periods: [
                    ...prev.periods.filter((periodField: any) => periodField.customId !== updatedPeriod.customId),
                    updatedPeriod
                  ]
                }));
                setOpenEditPeriodDialog(!updated);
              }
            }}
          />
        </div>
      )}

      {/* top div */}
      <div className="flex justify-between items-center">
        <h2>Edit Academic Year</h2>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText="Save"
            loadingButtonText="Saving Academic Year..."
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={tanUpdateAcademicYear.isPending}
            onClick={handleUpdateAcademicYear}
          />
          <IoClose
            onClick={() => {
              if (!unsaved) {
                onClose(true);
              }
              const container = document.getElementById("AcademicYearDialogContainer");
              if (container) {
                container.style.overflow = "hidden";
              }
              setOpenUnsavedDialog(true);
            }}
            className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer w-full"
          />
        </div>
      </div>
      {/* input divs */}
      <div className="flex flex-col gap-3">
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
        {/* text div */}
        <div className="flex flex-col gap-3 w-full">
          <InputComponent
            title="Academic Year *"
            autocomplete="on"
            placeholder=" e.g. (Academic Year 2023-2024)"
            required
            name="academicYear"
            value={academicYear}
            onChange={handleInputChange}
          />
          <div className="flex gap-3">
            <InputComponent
              placeholder="Start Date *"
              type="date"
              required
              name="startDate"
              value={startDate}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="End Date *"
              type="date"
              required
              name="endDate"
              value={endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* period section */}
        <div className="flex flex-col gap-3 w-full">
          <div className="mt-4 flex justify-between items-center">
            <div>
              <h2>Academic Year Periods</h2>
              <h3>Manage periods in academic years</h3>
            </div>
            <button
              onClick={() => {
                setOpenNewPeriodDialog(true);
              }} className={defaultButtonStyle}
            >
              Add Period
            </button>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-full gap-5 flex justify-between items-center px-4 mb-4 mt-4 text-foreground font-semibold">
              <h3>Period</h3>
              <h3>Start Date</h3>
              <h3>End Date</h3>
              <h3>Action</h3>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {tanDeletePeriod.isPending ? (
                <div>
                  <LoaderDiv
                    type="spinnerText"
                    text="Deleting Period..."
                    dimension="h-5 w-5"
                    borderColor="foregroundColor"
                    textColor="foregroundColor text-[14px]"
                  />
                </div>
              ) : periods.length > 0 ? (
                periods.map((periodObj: any) => {
                  const { _id, customId, period, startDate, endDate } = periodObj;
                  return (
                    <div
                      key={_id}
                      className="w-full gap-5 flex justify-between items-center px-4 border border-foregroundColor-15 rounded-md shadow-sm py-3 hover:bg-foregroundColor-5 hover:cursor-pointer"
                      onClick={() => {
                        setOnEditPeriodData(periodObj);
                        setOpenEditPeriodDialog(true);
                      }}
                    >
                      <h4>{period}</h4>
                      <h4>{formatDate(startDate)}</h4>
                      <h4>{formatDate(endDate)}</h4>

                      <CgTrash
                        className="text-[25px] hover:text-red-500"
                        onClick={async (e) => {
                          e.stopPropagation();
                          let savedToBackend = false;

                          try {
                            const response = await tanDeletePeriod.mutateAsync({ periodIdToDelete: _id });
                            if (response) {
                              savedToBackend = true;
                            }
                          } catch (error: any) {
                            setError(error.response?.data.message || error.message || "Error deleteing period");
                          }
                          if (savedToBackend) {
                            setLocalData((prev: any) => ({
                              ...prev,
                              periods: prev.periods.filter((periodField: any) => periodField.customId !== customId)
                            }));
                          }
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="mt-10">No periods added</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContainerComponent>
  );
};

export default EditAcademicYearComponent;
