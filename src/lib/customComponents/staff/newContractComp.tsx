"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { nanoid } from "@reduxjs/toolkit";
import ImageUploadDiv from "../general/imageUploadCom";
import { handleApiRequest } from "@/axios/axiosClient";
import axios from "axios";
import { createStaffProfile } from "@/redux/features/staff/staffThunks";
import { createStaffContract } from "@/redux/features/staff/contractThunk";
import { inputStyle } from "@/lib/generalStyles";
import { SearchableDropDownInput } from "../general/compLibrary2";
import { ResponsibilityDialog, WorkingScheduleDialog } from "./staffShortDialogComp";
import { useStaffMutation } from "@/tanStack/staff/mutate";

const NewStaffContractComponent = ({
  academicYears,
  staff,
  onClose,
  onCreate
}: {
  academicYears: any[];
  staff: any[];
  onClose: (close: boolean) => {};
  onCreate: (create: boolean) => {};
}) => {
  const { handleUnload } = useNavigationHandler();
  const dispatch = useAppDispatch();
  const { tanCreateStaffContract } = useStaffMutation();
  // const { isLoading: staffContractsLoading } = useAppSelector((state) => state.staffContract);
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newWorkingScheduleDialog, setNewWorkingScheduleDialog] = useState(false);
  const [newResponsibilityDialog, setNewResponsibilityDialog] = useState(false);
  const [editWorkingScheduleDialog, setEditWorkingScheduleDialog] = useState(false);
  const [editResponsibilityDialog, setEditResponsibilityDialog] = useState(false);
  const [editResponsibilityData, setEditResponsibilityData] = useState({
    _id: "",
    responsibility: "",
    description: ""
  });
  const [editWorkingScheduleData, setEditWorkingScheduleData] = useState({
    _id: "",
    day: "",
    startTime: "",
    endTime: "",
    hours: ""
  });
  const [localData, setLocalData] = useState({
    academicYearId: "",
    academicYear: "",
    staffId: "",
    staffCustomId: "",
    staffFullName: "",
    jobTitle: "",
    contractStartDate: "",
    contractEndDate: "",
    responsibilities: [],
    contractType: "",
    contractStatus: "",
    contractSalary: "",
    workingSchedule: []
  });

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const {
    academicYearId,
    academicYear,
    staffId,
    staffCustomId,
    staffFullName,
    jobTitle,
    contractStartDate,
    contractEndDate,
    responsibilities,
    contractType,
    contractStatus,
    contractSalary,
    workingSchedule
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    const { contractEndDate, workingSchedule, responsibilities, ...copyLocalData } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  const handleCreateStaffContract = async () => {
    setIsLoading(true);
    if (validationPassed()) {
      setError("");

      try {
        const response = await tanCreateStaffContract.mutateAsync(localData);
        if (response?.data) {
          onCreate(true);
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || err.response.data.message || "Error Creating Staff Contract");
      }
    }
  };

  return (
    <ContainerComponent id="staffDialogContainer" style="w-[60%] h-[90%] gap-5 overflow-auto flex flex-col">
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
          data={editResponsibilityData}
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
      {newWorkingScheduleDialog && (
        <WorkingScheduleDialog
          type="new"
          data={{
            _id: "",
            day: "",
            startTime: "",
            endTime: "",
            hours: ""
          }}
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
      {editWorkingScheduleDialog && (
        <WorkingScheduleDialog
          type="edit"
          data={editWorkingScheduleData}
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
        <h2>New Staff Contract</h2>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText="Create"
            loadingButtonText="Creating Staff Contract..."
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={tanCreateStaffContract.isPending}
            onClick={handleCreateStaffContract}
          />
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
            className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
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
        {/* text and image div */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <SearchableDropDownInput
            placeholder="Search Academic Year *"
            data={academicYears}
            displayKeys={["_id", "academicYear"]}
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
          <SearchableDropDownInput
            placeholder="Search Staff - ID or Name *"
            data={staff}
            displayKeys={["_id", "staffCustomId", "staffFirstName", "staffMiddleName", "staffLastName"]}
            onSelected={(selectedData, save) => {
              if (save) {
                setLocalData((prev: any) => ({
                  ...prev,
                  staffId: selectedData[0],
                  staffCustomId: selectedData[1],
                  staffFullName: `${selectedData[2]} ${selectedData[3] || ""} ${selectedData[4] || ""}`.trim()
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
            placeholder="Staff Full Name *"
            required
            name="staffFullName"
            value={staffFullName}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="Job Title *"
            required
            name="jobTitle"
            value={jobTitle}
            onChange={handleInputChange}
          />

          <div className="gap-1 flex flex-col">
            <h3 className="ml-1">Contract Start Date *</h3>
            <InputComponent
              placeholder="Contract Start Date *"
              type="date"
              required
              name="contractStartDate"
              value={contractStartDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="gap-1 flex flex-col">
            <h3 className="ml-1">Contract End Date *</h3>
            <InputComponent
              placeholder="Contract End Date *"
              type="date"
              name="contractEndDate"
              value={contractEndDate}
              onChange={handleInputChange}
            />
          </div>

          <InputComponent
            placeholder="Contract Salary *"
            required
            name="contractSalary"
            value={contractSalary}
            onChange={handleInputChange}
          />
          <select name="contractType" value={contractType} onChange={handleInputChange} className={inputStyle}>
            <option value="">Select Contract Type * </option>
            <option value="Full-time">Full-Time</option>
            <option value="Part-time">Part-Time</option>
          </select>
          <select name="contractStatus" value={contractStatus} onChange={handleInputChange} className={inputStyle}>
            <option value="">Select Contract Status * </option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        {/* working schedule div */}
        <div className="flex flex-col gap-5 mt-5">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Working Schedule</h2>
            <div>
              <button onClick={() => setNewWorkingScheduleDialog(true)}>Add Schedule</button>
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
                    className="flex flex-col w-[300px] max-h-[300px] min-h-[150px] hover:cursor-pointer hover:bg-foregroundColor-5 border border-foregroundColor-15 rounded-lg shadow p-4"
                    onClick={() => {
                      setEditWorkingScheduleData(workingSchedule);
                      setEditWorkingScheduleDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{day.slice(0, 20)}</span>{" "}
                      <CgTrash
                        className="text-[25px] hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnsaved(true);
                          setLocalData((prev: any) => ({
                            ...prev,
                            workingSchedule: prev.workingSchedule.filter(
                              (workingSchedule: any) => workingSchedule._id !== _id
                            )
                          }));
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-bold text-foregroundColor-60">Working Hours: {hours}</span>
                    <div className="flex flex-col mt-2 overflow-auto">
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
        <div className="flex flex-col gap-5 mt-5">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Responsibilities</h2>
            <div>
              <button onClick={() => setNewResponsibilityDialog(true)}>Add Responsibility</button>
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
                    className="flex flex-col w-[300px] max-h-[300px] min-h-[150px] hover:cursor-pointer hover:bg-foregroundColor-5 border border-foregroundColor-15 rounded-lg shadow p-4"
                    onClick={() => {
                      setEditResponsibilityData(responsibilityV);
                      setEditResponsibilityDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{responsibility.slice(0, 20)}</span>
                      <CgTrash
                        className="text-[25px] hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnsaved(true);
                          setLocalData((prev: any) => ({
                            ...prev,
                            responsibilities: prev.responsibilities.filter(
                              (qualification: any) => qualification._id !== _id
                            )
                          }));
                        }}
                      />
                    </div>

                    <div className="flex flex-col mt-2 overflow-auto">
                      <span>{description}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ContainerComponent>
  );
};

export default NewStaffContractComponent;
