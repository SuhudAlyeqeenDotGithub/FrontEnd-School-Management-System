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
import { defaultButtonStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd } from "react-icons/md";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { SearchableDropDownInput } from "../general/compLibrary2";
import StaffProfile from "@/app/main/staff/page";

export const ProgrammeManagerDialogComponent = ({
  type,
  data,
  onClose,
  onSave,
  programmes,
  staffContracts
}: {
  type: "new" | "edit" | "view";
  data?: any;
  programmes: any[];
  staffContracts: any[];
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/curriculum/programme/manager");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/curriculum/programme/manager");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);

  const [localData, setLocalData] = useState<any>({
    _id: onCreateMode ? "" : data._id,
    programmeId: onCreateMode ? "" : data.programmeId,
    programmeName: onCreateMode ? "" : data.programmeName,
    programmeCustomId: onCreateMode ? "" : data.programmeCustomId,
    programmeManagerStaffId: onCreateMode ? "" : data.programmeManagerStaffId,
    programmeManagerCustomStaffId: onCreateMode ? "" : data.programmeManagerCustomStaffId,
    programmeManagerFullName: onCreateMode ? "" : data.programmeManagerFullName,
    managedFrom: onCreateMode ? "" : data.managedFrom,
    managedUntil: onCreateMode ? "" : data.managedUntil,
    status: onCreateMode ? "" : data.status
  });

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
    programmeId,
    programmeName,
    programmeCustomId,
    programmeManagerStaffId,
    programmeManagerCustomStaffId,
    programmeManagerFullName,
    managedFrom,
    managedUntil,
    status
  } = localData;

  console.log("localData", localData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    const { managedUntil, _id, ...copyLocalData } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  // function to handle all programme manager programme manager object data update
  const handleUpdateProgrammeManager = async () => {
    try {
      const response = await updateMutation.mutateAsync(localData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating programme manager");
    }
  };

  // function to handle programme manager creation
  const handleCreateProgrammeManager = async () => {
    if (validationPassed()) {
      setError("");

      const { _id, ...copyLocalData } = localData;

      if (onCreateMode) {
        try {
          const response = await createMutation.mutateAsync(copyLocalData);
          if (response?.data) {
            onSave(true);
          }
        } catch (error: any) {
          setError(error.message || error.response?.data.message || "Error creating programme manager");
        }
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent
        id="programmeManagerDialogContainer"
        style="w-[50%] h-[80%] gap-5 overflow-auto flex flex-col"
      >
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("programmeManagerDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Programme Manager</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Programme Manager..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateProgrammeManager}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Programme Manager..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateProgrammeManager}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Programme Manager")}
                hidden={!hasActionAccess("Edit Programme Manager")}
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
                const container = document.getElementById("programmeManagerDialogContainer");
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

          <div className="grid grid-cols-2 gap-3 w-full">
            <SearchableDropDownInput
              defaultText={`|${programmeCustomId}`}
              disabled={onViewMode}
              title="Programme Custom Id *"
              placeholder="Search Programme *"
              data={programmes}
              displayKeys={["_id", "programmeCustomId", "programmeName"]}
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    programmeCustomId: selectedData[1],
                    programmeId: selectedData[0],
                    programmeName: selectedData[2]
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
              defaultText={`|${programmeManagerCustomStaffId}`}
              disabled={onViewMode}
              title="Manager Staff Id *"
              placeholder="Search Staff *"
              data={staffContracts}
              displayKeys={["_id", "staffCustomId", "staffFullName"]}
              onSelected={(selectedData, save) => {
                if (save) {
                  const staffContract = staffContracts.find((contract: any) => contract._id === selectedData[0]);
                  setLocalData((prev: any) => ({
                    ...prev,
                    programmeManagerCustomStaffId: staffContract?.staffCustomId,
                    programmeManagerStaffId: staffContract?.staffId,
                    programmeManagerFullName: staffContract?.staffFullName
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
              title="Programme Name *"
              placeholder="Programme Name * (Auto-fill)"
              required
              name="programmeName"
              value={programmeName}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={true}
              title="Programme Manager Full Name *"
              autocomplete="on"
              placeholder="Programme Manager Full Name * (Auto-fill)"
              name="programmeManagerFullName"
              value={programmeManagerFullName}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Managed From"
              type="date"
              placeholder="Managed From"
              name="managedFrom"
              value={managedFrom}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Managed Until"
              type="date"
              placeholder="Managed Until"
              name="managedUntil"
              value={managedUntil}
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
        </div>
      </ContainerComponent>
    </div>
  );
};
