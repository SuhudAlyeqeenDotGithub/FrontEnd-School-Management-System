"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { QualificationType } from "@/interfaces/interfaces";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { nanoid } from "@reduxjs/toolkit";
import { defaultButtonStyle, inputStyle } from "@/lib/generalStyles";

export const WorkingScheduleDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: "new" | "edit" | "view";
  data?: { _id: string; day: string; startTime: string; endTime: string; hours: string };
  onSave: (
    save: boolean,
    returnData: { _id: string; day: string; startTime: string; endTime: string; hours: string }
  ) => void;
  onClose: (close: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    _id: onCreateMode ? nanoid() : data ? data._id : "",
    day: onCreateMode ? "" : data ? data.day : "",
    startTime: onCreateMode ? "" : data ? data.startTime : "",
    endTime: onCreateMode ? "" : data ? data.endTime : "",
    hours: onCreateMode ? "" : data ? data.hours : ""
  });

  const { day, startTime, endTime, hours } = localData;

  useEffect(() => {
    if (!startTime || !endTime) return;
    setLocalData((prev: any) => ({ ...prev, hours: parseFloat(endTime) - parseFloat(startTime) }));
  }, [startTime, endTime]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setUnsaved(true);
    setLocalData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validationPassed = () => {
    if (!day) {
      setError("Missing Data: Please provide a day");
      return false;
    }
    if (!startTime) {
      setError("Missing Data: Please provide a start time");
      return false;
    }
    if (!endTime) {
      setError("Missing Data: Please provide an end time");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-transparent inset-0">
      <ContainerComponent style="w-[55%] h-[60%] gap-5 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("staffWorkingScheduleDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("staffWorkingScheduleDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : onEditMode ? "Edit" : "View"} Working Schedule</h2>
          <div className="flex justify-between items-center gap-5">
            {!onViewMode ? (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving..."
                disabled={!unsaved}
                onClick={async () => {
                  if (validationPassed()) {
                    setError("");
                    onSave(true, localData);
                  }
                }}
              />
            ) : (
              <button className={defaultButtonStyle} onClick={() => setOnEditMode(true)}>
                Edit
              </button>
            )}
            <IoClose
              onClick={() => {
                if (!unsaved) {
                  onClose(true);
                } else {
                  const container = document.getElementById("staffWorkingScheduleDialogContainer");
                  if (container) {
                    container.style.overflow = "hidden";
                  }
                  setOpenUnsavedDialog(true);
                }
              }}
              className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer w-full"
            />
          </div>
        </div>
        <div className="flex gap-3 flex-col">
          <SelectInputComponent
            disabled={onViewMode}
            title="Working Day *"
            placeholder="Select Working Day *"
            name="day"
            value={day}
            onChange={handleInputChange}
            options={[
              { label: "Monday", value: "Monday" },
              { label: "Tuesday", value: "Tuesday" },
              { label: "Wednesday", value: "Wednesday" },
              { label: "Thursday", value: "Thursday" },
              { label: "Friday", value: "Friday" },
              { label: "Saturday", value: "Saturday" },
              { label: "Sunday", value: "Sunday" }
            ]}
          />

          <InputComponent
            disabled={onViewMode}
            title="Start Time *"
            type="time"
            placeholder="Start Time *"
            required
            name="startTime"
            value={startTime}
            onChange={handleInputChange}
          />
          <InputComponent
            disabled={onViewMode}
            title="End Time *"
            type="time"
            placeholder="End Time *"
            required
            name="endTime"
            value={endTime}
            onChange={handleInputChange}
          />
          <InputComponent
            disabled={onViewMode}
            title="Hours *"
            placeholder="Hours *"
            required
            name="hours"
            value={hours}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
