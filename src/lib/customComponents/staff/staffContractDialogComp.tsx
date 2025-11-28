"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  ActionButtons,
  YesNoDialog
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import {
  useGeneralClientFunctions,
  useNavigationHandler
} from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { CgTrash } from "react-icons/cg";
import { defaultButtonStyle, inputStyle } from "@/lib/generalStyles";
import { SearchableDropDownInput } from "../general/compLibrary2";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { on } from "events";
import { ResponsibilityDialog } from "./responsibilityDialog";
import { WorkingScheduleDialog } from "./workingScheduleDialog";
import { MdAdd } from "react-icons/md";
import { AllowanceDialog } from "./allowanceDialog";
import { generateCustomId } from "@/lib/shortFunctions/shortFunctions";

const StaffContractDialog = ({
  type,
  data,
  academicYears,
  staff,
  onClose,
  onSave
}: {
  data?: any;
  type: "new" | "edit" | "view";
  academicYears: any;
  staff: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const { getStaffImageViewSignedUrl } = useGeneralClientFunctions();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/staff/contract");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/staff/contract");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [newWorkingScheduleDialog, setNewWorkingScheduleDialog] = useState(false);
  const [editWorkingScheduleDialog, setEditWorkingScheduleDialog] = useState(false);
  const [viewWorkingScheduleDialog, setViewWorkingScheduleDialog] = useState(false);

  const [newResponsibilityDialog, setNewResponsibilityDialog] = useState(false);
  const [editResponsibilityDialog, setEditResponsibilityDialog] = useState(false);
  const [viewResponsibilityDialog, setViewResponsibilityDialog] = useState(false);

  const [newAllowanceDialog, setNewAllowanceDialog] = useState(false);
  const [editAllowanceDialog, setEditAllowanceDialog] = useState(false);
  const [viewAllowanceDialog, setViewAllowanceDialog] = useState(false);

  const [onOpenResponsibilityDialogData, setOnOpenResponsibilityDialogData] = useState({
    _id: "",
    responsibility: "",
    description: ""
  });
  const [onOpenWorkingScheduleDialogData, setOnOpenWorkingScheduleDialogData] = useState({
    _id: "",
    day: "",
    startTime: "",
    endTime: "",
    hours: ""
  });
  const [onOpenAllowanceDialogData, setOnOpenAllowanceDialogData] = useState({
    _id: "",
    allowanceType: "",
    amount: ""
  });

  const initialData = {
    academicYearId: onCreateMode ? "" : data ? data.academicYearId : "",
    academicYear: onCreateMode ? "" : data ? data.academicYear : "",
    staffId: onCreateMode ? "" : data ? data.staffId : "",
    staffCustomId: onCreateMode ? "" : data ? data.staffCustomId : "",
    contractCustomId: onCreateMode ? generateCustomId(`STFCON`, true, "numeric") : data ? data.contractCustomId : "",
    staffFullName: onCreateMode ? "" : data ? data.staffFullName : "",
    reportingManagerCustomId: onCreateMode ? "" : data ? data.reportingManagerCustomId : "",
    jobTitle: onCreateMode ? "" : data ? data.jobTitle : "",
    department: onCreateMode ? "" : data ? data.department : "",
    contractStartDate: onCreateMode ? "" : data ? data.contractStartDate : "",
    contractEndDate: onCreateMode ? "" : data ? data.contractEndDate : "",
    responsibilities: onCreateMode ? [] : data ? data.responsibilities : [],
    contractType: onCreateMode ? "" : data ? data.contractType : "",
    contractStatus: onCreateMode ? "" : data ? data.contractStatus : "",
    contractSalary: onCreateMode ? "" : data ? data.contractSalary : "",
    payFrequency: onCreateMode ? "" : data ? data.payFrequency : "",
    workingSchedule: onCreateMode ? [] : data ? data.workingSchedule : [],
    probationStartDate: onCreateMode ? "" : data ? data.probationStartDate : "",
    probationEndDate: onCreateMode ? "" : data ? data.probationEndDate : "",
    probationMonths: onCreateMode ? "" : data ? data.probationMonths : "",
    terminationNoticePeriod: onCreateMode ? "" : data ? data.terminationNoticePeriod : "",
    allowances: onCreateMode ? [] : data ? data.allowances : []
  };

  const [localData, setLocalData] = useState(initialData);

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  useEffect(() => {
    if (onViewMode) {
      setOnEditMode(false);
      setOnCreateMode(false);
    }
  }, [onViewMode]);

  useEffect(() => {
    if (onCreateMode) {
      setOnEditMode(false);
      setOnViewMode(false);
    }
  }, [onCreateMode]);

  useEffect(() => {
    if (onEditMode) {
      setOnCreateMode(false);
      setOnViewMode(false);
    }
  }, [onEditMode]);

  const {
    academicYearId,
    academicYear,
    staffId,
    staffCustomId,
    contractCustomId,
    staffFullName,
    reportingManagerCustomId,
    jobTitle,
    department,
    contractStartDate,
    contractEndDate,
    responsibilities,
    contractType,
    contractStatus,
    contractSalary,
    payFrequency,
    workingSchedule,
    probationStartDate,
    probationEndDate,
    probationMonths,
    terminationNoticePeriod,
    allowances
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    const {
      contractEndDate,
      workingSchedule,
      responsibilities,
      probationStartDate,
      probationEndDate,
      department,
      allowances,
      probationMonths,
      terminationNoticePeriod,
      reportingManagerCustomId,
      ...copyLocalData
    } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  const handleCreateStaffContract = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await createMutation.mutateAsync(localData);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Creating Staff Contract");
      }
    }
  };

  const handleUpdateStaffContract = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await updateMutation.mutateAsync(localData);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Updating Staff Contract");
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="staffDialogContainer" style="w-[70%] h-[90%] gap-5 overflow-auto flex flex-col">
        {newResponsibilityDialog && (
          <ResponsibilityDialog
            type="new"
            data={{
              _id: "",
              responsibility: "",
              description: ""
            }}
            onSave={(save, returnData) => {
              setNewResponsibilityDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                responsibilities: [...prev.responsibilities, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewResponsibilityDialog(!open);
            }}
          />
        )}
        {editResponsibilityDialog && (
          <ResponsibilityDialog
            type="edit"
            data={onOpenResponsibilityDialogData}
            onSave={(save, returnData) => {
              setEditResponsibilityDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                responsibilities: [...prev.responsibilities].map((responsibility: any) =>
                  responsibility._id === returnData._id ? returnData : responsibility
                )
              }));
            }}
            onClose={(open) => {
              setEditResponsibilityDialog(!open);
            }}
          />
        )}
        {viewResponsibilityDialog && (
          <ResponsibilityDialog
            type="view"
            data={onOpenResponsibilityDialogData}
            onSave={(save, returnData) => {
              setViewResponsibilityDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                responsibilities: [...prev.responsibilities].map((responsibility: any) =>
                  responsibility._id === returnData._id ? returnData : responsibility
                )
              }));
            }}
            onClose={(open) => {
              setViewResponsibilityDialog(!open);
            }}
          />
        )}
        {newWorkingScheduleDialog && (
          <WorkingScheduleDialog
            type="new"
            onSave={(save, returnData) => {
              setNewWorkingScheduleDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                workingSchedule: [...prev.workingSchedule, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewWorkingScheduleDialog(!open);
            }}
          />
        )}
        {viewWorkingScheduleDialog && (
          <WorkingScheduleDialog
            type="view"
            data={onOpenWorkingScheduleDialogData}
            onSave={(save, returnData) => {
              setViewWorkingScheduleDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                workingSchedule: [...prev.workingSchedule, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setViewWorkingScheduleDialog(!open);
            }}
          />
        )}
        {editWorkingScheduleDialog && (
          <WorkingScheduleDialog
            type="edit"
            data={onOpenWorkingScheduleDialogData}
            onSave={(save, returnData) => {
              setEditWorkingScheduleDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                workingSchedule: [...prev.workingSchedule].map((workingSchedule: any) =>
                  workingSchedule._id === returnData._id ? returnData : workingSchedule
                )
              }));
            }}
            onClose={(open) => {
              setEditWorkingScheduleDialog(!open);
            }}
          />
        )}
        {newAllowanceDialog && (
          <AllowanceDialog
            type="new"
            onSave={(save, returnData) => {
              setNewAllowanceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                allowances: [...prev.allowances, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewAllowanceDialog(!open);
            }}
          />
        )}
        {editAllowanceDialog && (
          <AllowanceDialog
            type="edit"
            data={onOpenAllowanceDialogData}
            onSave={(save, returnData) => {
              setEditAllowanceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                allowances: [...prev.allowances].map((allowance: any) =>
                  allowance._id === returnData._id ? returnData : allowance
                )
              }));
            }}
            onClose={(open) => {
              setEditAllowanceDialog(!open);
            }}
          />
        )}
        {viewAllowanceDialog && (
          <AllowanceDialog
            type="view"
            data={onOpenAllowanceDialogData}
            onSave={(save, returnData) => {
              setViewAllowanceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                allowances: [...prev.allowances].map((allowance: any) =>
                  allowance._id === returnData._id ? returnData : allowance
                )
              }));
            }}
            onClose={(open) => {
              setViewAllowanceDialog(!open);
            }}
          />
        )}
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("staffDialogContainer");
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
        {/* top div */}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Staff Contract</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Staff Contract..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateStaffContract}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Staff Contract..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleUpdateStaffContract}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Staff Contract")}
                hidden={!hasActionAccess("Edit Staff Contract")}
                onClick={() => setOnEditMode(true)}
                className={defaultButtonStyle}
              >
                Edit
              </button>
            )}

            <IoClose
              onClick={() => {
                if (!unsaved) {
                  onClose(true);
                }
                const container = document.getElementById("staffDialogContainer");
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
        <div className="flex flex-col gap-3 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
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
          {/* text and image div */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <InputComponent
              disabled={onViewMode}
              title="Contract Custom ID *"
              placeholder="Contract Custom ID"
              required
              name="contractCustomId"
              value={contractCustomId}
              onChange={handleInputChange}
            />
            <SearchableDropDownInput
              defaultText={`${staffId}|${staffCustomId}`}
              disabled={onViewMode}
              title="Staff *"
              placeholder="Search Staff - ID or Name *"
              data={staff}
              displayKeys={["_id", "staffCustomId", "staffFullName"]}
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    staffId: selectedData[0],
                    staffCustomId: selectedData[1],
                    staffFullName: selectedData[2]
                  }));
                  setUnsaved(true);
                }
              }}
              onClearSearch={(cleared) => {
                if (cleared) {
                  // setSearchValue("");
                }
              }}
            />
            <SearchableDropDownInput
              disabled={onViewMode}
              defaultText={`${academicYearId}|${academicYear}`}
              title="Academic Year *"
              placeholder="Search Academic Year *"
              data={academicYears}
              displayKeys={["_id", "academicYear"]}
              searchFieldKey="academicYear"
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    academicYearId: selectedData[0],
                    academicYear: selectedData[1]
                  }));
                  setUnsaved(true);
                }
              }}
              onClearSearch={(cleared) => {
                if (cleared) {
                  // setSearchValue("");
                }
              }}
            />
            <InputComponent
              disabled={onViewMode}
              title="Staff Full Name * (Auto-fills)"
              placeholder="Staff Full Name *"
              required
              name="staffFullName"
              value={staffFullName}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Job Title *"
              placeholder="Job Title *"
              required
              name="jobTitle"
              value={jobTitle}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Contract Start Date *"
              placeholder="Contract Start Date *"
              type="date"
              required
              name="contractStartDate"
              value={contractStartDate}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Contract End Date *"
              placeholder="Contract End Date *"
              type="date"
              name="contractEndDate"
              value={contractEndDate}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Contract Salary *"
              placeholder="Contract Salary *"
              required
              name="contractSalary"
              value={contractSalary}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Pay Frequency *"
              placeholder="Pay Frequency (e.g., Weekly, Monthly) *"
              required
              name="payFrequency"
              value={payFrequency}
              onChange={handleInputChange}
            />
            <SelectInputComponent
              disabled={onViewMode}
              title="Contract Type *"
              name="contractType"
              placeholder="Contract Type *"
              value={contractType}
              onChange={handleInputChange}
              options={[
                { value: "Full-time", label: "Full-time" },
                { value: "Part-time", label: "Part-time" },
                { value: "Casual", label: "Casual" },
                { value: "Internship", label: "Internship" },
                { value: "Fixed-term", label: "Fixed-term" }
              ]}
            />
            <SelectInputComponent
              disabled={onViewMode}
              title="Contract Status *"
              name="contractStatus"
              placeholder="Contract Status *"
              value={contractStatus}
              onChange={handleInputChange}
              options={[
                { value: "Active", label: "Active" },
                { value: "Closed", label: "Closed" }
              ]}
            />
          </div>
        </div>
        {/* optional inputs */}
        <div className="flex flex-col gap-3 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          <h2 className="mb-2">Optional Details</h2>
          {/* text and image div */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <SearchableDropDownInput
              defaultText={`|${reportingManagerCustomId}`}
              disabled={onViewMode}
              title="Reporting Manager"
              placeholder="Search Reporting Manager"
              data={staff}
              displayKeys={["_id", "staffCustomId", "staffFullName"]}
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    reportingManagerCustomId: selectedData[1]
                  }));
                  setUnsaved(true);
                }
              }}
              onClearSearch={(cleared) => {
                if (cleared) {
                  // setSearchValue("");
                }
              }}
            />
            <InputComponent
              disabled={onViewMode}
              title="Department"
              placeholder="Staff Department"
              required
              name="department"
              value={department}
              onChange={handleInputChange}
            />

            <InputComponent
              disabled={onViewMode}
              title="Probation Months"
              placeholder="Probation Months (e.g., 6, 12, 3)"
              required
              name="probationMonths"
              value={probationMonths}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Probation Start Date"
              placeholder="Probation Start Date"
              type="date"
              required
              name="probationStartDate"
              value={probationStartDate}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Probation End Date"
              placeholder="Probation End Date"
              type="date"
              name="probationEndDate"
              value={probationEndDate}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Termination Notice Period"
              placeholder="Termination Notice Period"
              required
              name="terminationNoticePeriod"
              value={terminationNoticePeriod}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* working schedule div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Working Schedule</h2>
            <div>
              <button
                onClick={() => setNewWorkingScheduleDialog(true)}
                className={defaultButtonStyle}
                disabled={onViewMode}
                hidden={onViewMode}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Schedule
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {workingSchedule.length < 1 ? (
              <div>No Working Schedule Added</div>
            ) : (
              workingSchedule.map((workingSchedule: any) => {
                const { _id, day, startTime, endTime, hours } = workingSchedule;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenWorkingScheduleDialogData(workingSchedule);
                      setViewWorkingScheduleDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{day.slice(0, 20)}</span>{" "}
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenWorkingScheduleDialogData(workingSchedule);
                          setEditWorkingScheduleDialog(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            workingSchedule: prev.workingSchedule.filter(
                              (workingSchedule: any) => workingSchedule._id !== _id
                            )
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor-2 text-[16px]">
                      Working Hours: {hours}
                    </span>
                    <div className="flex flex-col mt-2">
                      <span>{startTime}</span>
                      <span>{endTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* responsibilities div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Responsibilities</h2>
            <div>
              <button
                onClick={() => setNewResponsibilityDialog(true)}
                className={defaultButtonStyle}
                disabled={onViewMode}
                hidden={onViewMode}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Responsibility
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {responsibilities.length < 1 ? (
              <div>No Responsibilities Added</div>
            ) : (
              responsibilities.map((responsibilityV: any) => {
                const { _id, responsibility, description } = responsibilityV;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenResponsibilityDialogData(responsibilityV);
                      setViewResponsibilityDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-semibold text-[16px]">{responsibility.slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenResponsibilityDialogData(responsibilityV);
                          setEditResponsibilityDialog(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            responsibilities: prev.responsibilities.filter(
                              (responsibility: any) => responsibility._id !== _id
                            )
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>

                    <div className="flex flex-col mt-2">
                      <span>{description}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* allowances div */}{" "}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Allowances</h2>
            <div>
              <button
                onClick={() => setNewAllowanceDialog(true)}
                className={defaultButtonStyle}
                disabled={onViewMode}
                hidden={onViewMode}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Allowance
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {allowances.length < 1 ? (
              <div>No Allowance Added</div>
            ) : (
              allowances.map((allowanceV: any) => {
                const { _id, allowanceType, amount } = allowanceV;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenAllowanceDialogData(allowanceV);
                      setViewAllowanceDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-semibold text-[16px]">{allowanceType.slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenAllowanceDialogData(allowanceV);
                          setEditAllowanceDialog(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            allowances: prev.allowances.filter((allowance: any) => allowance._id !== _id)
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>

                    <div className="flex flex-col mt-2">
                      <span>{amount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};

export default StaffContractDialog;
