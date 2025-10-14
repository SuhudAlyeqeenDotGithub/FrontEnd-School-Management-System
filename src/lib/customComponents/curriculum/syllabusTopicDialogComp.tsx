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
import { nanoid } from "@reduxjs/toolkit";
import { defaultButtonStyle } from "@/lib/generalStyles";
import { SearchableDropDownInput } from "../general/compLibrary2";
import { LearningObjectivesDialog } from "./learningObjectiveDialogComp";

export const SyllabusTopicsDialog = ({
  type = "new",
  data,
  onSave,
  onClose,
  topics
}: {
  type?: "new" | "edit" | "view";
  data?: { topicId: string; topic: string; topicCustomId: string; week: string };
  onSave: (save: boolean, returnData: { topicId: string; topic: string; topicCustomId: string; week: string }) => void;
  onClose: (close: boolean) => void;
  topics: { topicId: string; topic: string; topicCustomId: string }[];
}) => {
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    topicId: onCreateMode ? nanoid() : data ? data.topicId : "",
    topicCustomId: onCreateMode ? "" : data ? data.topicCustomId : "",
    topic: onCreateMode ? "" : data ? data.topic : "",
    week: onCreateMode ? "" : data ? data.week : ""
  });

  const { topic, week, topicCustomId } = localData;

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
    if (!topic) {
      setError("Missing Data: Please provide a topic");
      return false;
    }

    if (!topicCustomId) {
      setError("Missing Data: Please provide a topicCustomId");
      return false;
    }

    if (!week) {
      setError("Missing Data: Please provide a week");
      return false;
    }

    return true;
  };

  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-transparent inset-0">
      <ContainerComponent style="w-[55%] h-[45%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
              const container = document.getElementById("SyllabusTopicsDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("SyllabusTopicsDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : onEditMode ? "Edit" : "View"} Syllabus Topic</h2>
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
                  const container = document.getElementById("SyllabusTopicsDialogContainer");
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
          <SearchableDropDownInput
            defaultText={`|${topicCustomId}`}
            disabled={onViewMode}
            title="Topic Custom Id *"
            placeholder="Search Topic *"
            data={topics}
            displayKeys={["_id", "topicCustomId", "topic"]}
            onSelected={(selectedData, save) => {
              if (save) {
                setLocalData((prev: any) => ({
                  ...prev,
                  topicCustomId: selectedData[1],
                  topic: selectedData[2],
                  topicId: selectedData[0]
                }));
                setUnsaved(true);
              }
            }}
            onClearSearch={(cleared) => {
              if (cleared) {
                // setSearchValue("");
              }
            }}
          />{" "}
          <InputComponent
            title="Topic *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Topic *"
            required
            name="topic"
            value={topic}
            onChange={handleInputChange}
          />
          <SelectInputComponent
            disabled={onViewMode}
            title="Week"
            placeholder="Week"
            name="week"
            value={week}
            onChange={handleInputChange}
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
              { label: "6", value: "6" },
              { label: "7", value: "7" },
              { label: "8", value: "8" },
              { label: "9", value: "9" },
              { label: "10", value: "10" },
              { label: "11", value: "11" },
              { label: "12", value: "12" },
              { label: "13", value: "13" },
              { label: "14", value: "14" },
              { label: "15", value: "15" },
              { label: "16", value: "16" },
              { label: "17", value: "17" },
              { label: "18", value: "18" },
              { label: "19", value: "19" },
              { label: "20", value: "20" },
              { label: "21", value: "21" },
              { label: "22", value: "22" },
              { label: "23", value: "23" },
              { label: "24", value: "24" },
              { label: "25", value: "25" },
              { label: "26", value: "26" },
              { label: "27", value: "27" },
              { label: "28", value: "28" },
              { label: "29", value: "29" },
              { label: "30", value: "30" }
            ]}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
