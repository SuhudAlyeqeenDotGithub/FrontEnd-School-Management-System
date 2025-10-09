"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent,
  ActionButtons
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import {
  formatDate,
  generateCustomId,
  handledDeleteImage,
  validateEmail,
  validatePhoneNumber
} from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { useAppSelector } from "@/redux/hooks";
import ImageUploadDiv from "../general/imageUploadCom";
import { handleApiRequest } from "@/axios/axiosClient";
import axios from "axios";
import { defaultButtonStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd } from "react-icons/md";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { SearchableDropDownInput } from "../general/compLibrary2";

export const LevelDialogComponent = ({
  type,
  data,
  onClose,
  onSave,
  courses
}: {
  type: "new" | "edit" | "view";
  data?: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
  courses: any[];
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/curriculum/level");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/curriculum/level");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);

  const [localData, setLocalData] = useState<any>({
    levelCustomId: onCreateMode ? generateCustomId(`LVL`, true, "numeric") : data.levelCustomId || "",
    level: onCreateMode ? "" : data.level,
    levelFullTitle: onCreateMode ? "" : data.levelFullTitle,
    courseId: onCreateMode ? "" : data.courseId,
    courseCustomId: onCreateMode ? "" : data.courseCustomId,
    courseFullTitle: onCreateMode ? "" : data.courseFullTitle,
    description: onCreateMode ? "" : data.description,
    offeringStartDate: onCreateMode ? "" : data.offeringStartDate,
    offeringEndDate: onCreateMode ? "" : data.offeringEndDate,
    status: onCreateMode ? "" : data.status,
    levelDuration: onCreateMode ? "" : data.levelDuration
  });

  const {
    levelCustomId,
    level,
    levelFullTitle,
    description,
    offeringStartDate,
    offeringEndDate,
    status,
    levelDuration,
    courseFullTitle,
    courseCustomId,
    courseId
  } = localData;

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  useEffect(() => {
    setLocalData((prev: any) => ({
      ...prev,
      levelFullTitle:
        courseCustomId === "" ? "Select a Course" : level === "" ? "Enter Level Title" : `${courseFullTitle} - ${level}`
    }));
  }, [courseCustomId, courseId, level]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    const { description, levelDuration, courseFullTitle, ...copyLocalData } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  // function to handle all level object data update
  const handleUpdateLevel = async () => {
    try {
      const response = await updateMutation.mutateAsync(localData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating level");
    }
  };

  // function to handle level creation
  const handleCreateLevel = async () => {
    if (validationPassed()) {
      setError("");

      if (onCreateMode) {
        try {
          const response = await createMutation.mutateAsync(localData);
          if (response?.data) {
            onSave(true);
          }
        } catch (error: any) {
          setError(error.message || error.response?.data.message || "Error creating level");
        }
      }
    }
  };

  console.log("localData", localData);

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="levelDialogContainer" style="w-[50%] h-[90%] gap-5 overflow-auto flex flex-col">
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("levelDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Level</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Level..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateLevel}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Level..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateLevel}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Level")}
                hidden={!hasActionAccess("Edit Level")}
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
                const container = document.getElementById("levelDialogContainer");
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

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 w-full">
              <InputComponent
                disabled={onViewMode}
                title="Level Custom ID *"
                placeholder="Level Custom ID"
                required
                name="levelCustomId"
                value={levelCustomId}
                onChange={handleInputChange}
              />
              <SearchableDropDownInput
                defaultText={`|${courseCustomId}`}
                disabled={onViewMode}
                title="Course Custom Id *"
                placeholder="Search Course *"
                data={courses}
                displayKeys={["_id", "courseCustomId", "courseFullTitle"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      courseCustomId: selectedData[1],
                      courseId: selectedData[0],
                      courseFullTitle: selectedData[2]
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
                title="Level Title *"
                autocomplete="on"
                placeholder="Level Title *"
                name="level"
                value={level}
                onChange={handleInputChange}
              />{" "}
              <InputComponent
                disabled={onViewMode}
                title="Level Duration"
                autocomplete="on"
                placeholder="Level Duration"
                name="levelDuration"
                value={levelDuration}
                onChange={handleInputChange}
              />
              <InputComponent
                title="Course Title (auto-generated)"
                disabled={true}
                autocomplete="on"
                placeholder="Course Title (auto-generated)"
                name="courseFullTitle"
                value={courseFullTitle}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={true}
                title="Level Full Title (auto-generated)"
                autocomplete="on"
                placeholder="Level Full Title (auto-generated)"
                name="levelFullTitle"
                value={levelFullTitle}
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="w-full">
              <TextAreaComponent
                disabled={onViewMode}
                title="Description"
                placeholder="Description"
                name="description"
                value={description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <SelectInputComponent
                disabled={onViewMode}
                title="Status *"
                placeholder="Status *"
                name="status"
                value={status}
                onChange={handleInputChange}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" }
                ]}
              />

              <InputComponent
                disabled={onViewMode}
                title="Offering Start Date *"
                placeholder="Offering Start Date *"
                type="date"
                name="offeringStartDate"
                value={offeringStartDate}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Offering End Date *"
                placeholder="Offering End Date *"
                type="date"
                name="offeringEndDate"
                value={offeringEndDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};
