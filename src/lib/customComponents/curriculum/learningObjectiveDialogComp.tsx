"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";

export const LearningObjectivesDialog = ({
  type = "new",
  data,
  existingData,
  onSave,
  onClose
}: {
  type?: "new" | "edit";
  data?: string;
  existingData?: string[];
  onSave: (save: boolean, returnData: string, oldData?: string) => void;
  onClose: (close: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [learningObjectives, setLearningObjectives] = useState(data ? data : "");

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const validationPassed = () => {
    if (!learningObjectives) {
      setError("Missing Data: Please enter a learningObjectives");
      return false;
    }

    if (onCreateMode && existingData && existingData.includes(learningObjectives)) {
      setError("Duplicate Data: Learning Objective already exists");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-transparent inset-0">
      <ContainerComponent style="w-[30%] h-[35%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
              const container = document.getElementById("learningObjectivesDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("learningObjectivesDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : "Edit"} Learning Objective</h2>
          <div className="flex justify-between items-center gap-5">
            <LoaderButton
              buttonText="Save"
              loadingButtonText="Saving..."
              disabled={!unsaved}
              onClick={async () => {
                if (validationPassed()) {
                  setError("");
                  onSave(true, learningObjectives, onEditMode ? data : undefined);
                }
              }}
            />

            <IoClose
              onClick={() => {
                if (!unsaved) {
                  onClose(true);
                } else {
                  const container = document.getElementById("learningObjectivesDialogContainer");
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
            title="Learning Objectives *"
            autocomplete="on"
            placeholder="Learning Objectives *"
            required
            name="learningObjectives"
            value={learningObjectives}
            onChange={(e) => {
              setLearningObjectives(e.target.value);
              setUnsaved(true);
            }}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
