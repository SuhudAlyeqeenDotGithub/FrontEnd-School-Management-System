"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent,
  ActionButtons,
  CustomHeading
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

export const SubjectDialogComponent = ({
  type,
  data,
  onClose,
  onSave,
  courses,
  levels,
  baseSubjects
}: {
  type: "new" | "edit" | "view";
  data?: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
  courses: any[];
  levels: any[];
  baseSubjects: any[];
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/curriculum/subject");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/curriculum/subject");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);

  const [localData, setLocalData] = useState<any>({
    subjectCustomId: onCreateMode ? generateCustomId(`SBJ`, true, "numeric") : data.subjectCustomId || "",
    subject: onCreateMode ? "" : data.subject || "",
    subjectFullTitle: onCreateMode ? "" : data.subjectFullTitle,
    baseSubjectId: onCreateMode ? "" : data.baseSubjectId,
    baseSubjectCustomId: onCreateMode ? "" : data.baseSubjectCustomId,
    baseSubjectName: onCreateMode ? "" : data.baseSubjectName,
    courseId: onCreateMode ? "" : data.courseId,
    courseCustomId: onCreateMode ? "" : data.courseCustomId,
    courseFullTitle: onCreateMode ? "" : data.courseFullTitle,
    levelId: onCreateMode ? "" : data.levelId,
    levelCustomId: onCreateMode ? "" : data.levelCustomId,
    level: onCreateMode ? "" : data.level,
    description: onCreateMode ? "" : data.description,
    offeringStartDate: onCreateMode ? "" : data.offeringStartDate,
    offeringEndDate: onCreateMode ? "" : data.offeringEndDate,
    status: onCreateMode ? "" : data.status
  });

  const {
    subjectCustomId,
    subjectFullTitle,
    baseSubjectCustomId,
    baseSubjectName,
    courseId,
    subject,
    courseCustomId,
    courseFullTitle,
    levelId,
    levelCustomId,
    level,
    description,
    offeringStartDate,
    offeringEndDate,
    status
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
      subjectFullTitle:
        courseFullTitle === ""
          ? "Select Course"
          : level === ""
          ? "Select Level"
          : baseSubjectName === ""
          ? "Select Base Subject"
          : ` ${courseFullTitle} - ${baseSubjectName} - ${level}`
    }));
  }, [baseSubjectCustomId, levelCustomId, courseCustomId]);

  useEffect(() => {
    setLocalData((prev: any) => ({
      ...prev,
      subject:
        level === ""
          ? "Select Level"
          : baseSubjectName === ""
          ? "Select Base Subject"
          : ` ${baseSubjectName} - ${level}`
    }));
  }, [baseSubjectCustomId, levelCustomId]);

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
    const { description, ...copyLocalData } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  // function to handle all subject object data update
  const handleUpdateSubject = async () => {
    try {
      const response = await updateMutation.mutateAsync(localData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating subject");
    }
  };

  // function to handle subject creation
  const handleCreateSubject = async () => {
    if (validationPassed()) {
      setError("");

      if (onCreateMode) {
        try {
          const response = await createMutation.mutateAsync(localData);
          if (response?.data) {
            onSave(true);
          }
        } catch (error: any) {
          setError(error.message || error.response?.data.message || "Error creating subject");
        }
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="subjectDialogContainer" style="w-[70%] h-[90%] gap-5 overflow-auto flex flex-col">
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("subjectDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Subject</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Subject..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateSubject}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Subject..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateSubject}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Subject")}
                hidden={!hasActionAccess("Edit Subject")}
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
                const container = document.getElementById("subjectDialogContainer");
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
            <div className="grid grid-cols-3 gap-3 w-full">
              <InputComponent
                disabled={onViewMode}
                title="Subject Custom ID *"
                placeholder="Subject Custom ID"
                required
                name="subjectCustomId"
                value={subjectCustomId}
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
              <SearchableDropDownInput
                defaultText={`|${levelCustomId}`}
                disabled={onViewMode}
                title="Level Custom Id *"
                placeholder="Search Level *"
                data={levels}
                displayKeys={["_id", "levelCustomId", "level"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      levelCustomId: selectedData[1],
                      levelId: selectedData[0],
                      level: selectedData[2]
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
                defaultText={`|${baseSubjectCustomId}`}
                disabled={onViewMode}
                title="Base Subject Custom Id *"
                placeholder="Search Base Subject *"
                data={baseSubjects}
                displayKeys={["_id", "baseSubjectCustomId", "baseSubjectName"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      baseSubjectCustomId: selectedData[1],
                      baseSubjectId: selectedData[0],
                      baseSubjectName: selectedData[2]
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
                title="Subject (auto-generated)"
                disabled={true}
                autocomplete="on"
                placeholder="Subject (auto-generated)"
                name="subject"
                value={subject}
                onChange={handleInputChange}
              />
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
              {" "}
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
        <div className="flex flex-col gap-3 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-3">
          <CustomHeading variation="head4">Auto-generated Fields (for reference only)</CustomHeading>
          <div className="flex flex-col gap-3 w-full mt-2">
            <div className="grid grid-cols-3 gap-3 w-full">
              <InputComponent
                disabled={true}
                title="Base Subject Title (auto-generated)"
                autocomplete="on"
                placeholder="Base Subject Title (auto-generated)"
                name="baseSubjectName"
                value={baseSubjectName}
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
                title="Level (auto-generated)"
                disabled={true}
                autocomplete="on"
                placeholder="Level (auto-generated)"
                name="level"
                value={level}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-full">
              <InputComponent
                disabled={true}
                title="Subject Full Title (auto-generated)"
                autocomplete="on"
                placeholder="Subject Full Title (auto-generated)"
                name="subjectFullTitle"
                value={subjectFullTitle}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};
