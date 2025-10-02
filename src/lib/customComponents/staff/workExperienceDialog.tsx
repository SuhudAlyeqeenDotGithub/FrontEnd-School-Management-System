"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv, TextAreaComponent } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { WorkExperienceType } from "@/interfaces/interfaces";
import { nanoid } from "@reduxjs/toolkit";
import { defaultButtonStyle } from "@/lib/generalStyles";

export const WorkExperienceDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: "new" | "edit" | "view";
  data?: WorkExperienceType;
  onSave: (save: boolean, returnData: WorkExperienceType) => void;
  onClose: (close: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    _id: onCreateMode ? nanoid() : data ? data._id : "",
    organisation: onCreateMode ? "" : data ? data.organisation : "",
    position: onCreateMode ? "" : data ? data.position : "",
    experience: onCreateMode ? "" : data ? data.experience : "",
    startDate: onCreateMode ? "" : data ? data.startDate : "",
    endDate: onCreateMode ? "" : data ? data.endDate : ""
  });

  const { organisation, position, experience, startDate, endDate } = localData;

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
    if (!organisation) {
      setError("Missing Data: Please provide a company name/organisation name");
      return false;
    }

    if (!position) {
      setError("Missing Data: Please provide a position title or role name");
      return false;
    }

    if (!experience) {
      setError("Missing Data: Please provide a description of your experience");
      return false;
    }

    if (!startDate) {
      setError("Missing Data: Please provide a qualification start date");
      return false;
    }
    if (!endDate) {
      setError("Missing Data: Please provide a qualification end date");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-transparent inset-0">
      <ContainerComponent style="w-[55%] h-[65%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
              const container = document.getElementById("staffExperienceDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("staffExperienceDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : onEditMode ? "Edit" : "View"} Work Experience</h2>
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
                  const container = document.getElementById("staffExperienceDialogContainer");
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
          <InputComponent
            title="Organisation *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Organisation Name *"
            required
            name="organisation"
            value={organisation}
            onChange={handleInputChange}
          />
          <InputComponent
            title="Position *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Position *"
            required
            name="position"
            value={position}
            onChange={handleInputChange}
          />
          <InputComponent
            title="Start Date *"
            disabled={onViewMode}
            placeholder="Start Date *"
            type="date"
            required
            name="startDate"
            value={startDate}
            onChange={handleInputChange}
          />
          <InputComponent
            title="End Date *"
            disabled={onViewMode}
            placeholder="End Date *"
            type="date"
            required
            name="endDate"
            value={endDate}
            onChange={handleInputChange}
          />
          <TextAreaComponent
            title="Experience Description (e.g. Responsibilities, Achievements etc) *"
            disabled={onViewMode}
            placeholder="Work Experience Description *"
            required
            name="experience"
            value={experience}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
