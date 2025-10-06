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
import { QualificationDialog } from "../staff/qualificationDialog";
import { IdentificationDialog } from "../staff/identificationDialog";

export const ProgrammeProfileDialogComponent = ({
  type,
  data,
  onClose,
  onSave
}: {
  type: "new" | "edit" | "view";
  data?: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/curriculum/programme");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/curriculum/    programme");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);

  const [localData, setLocalData] = useState<any>({
    organisationId: onCreateMode ? generateCustomId(`STD`, true, "numeric") : data.organisationId || "",
    programmeCustomId: onCreateMode ? "" : data.programmeCustomId,
    programmeName: onCreateMode ? "" : data.programmeName,
    description: onCreateMode ? "" : data.description,
    offeringStartDate: onCreateMode ? "" : data.offeringStartDate,
    offeringEndDate: onCreateMode ? "" : data.offeringEndDate,
    status: onCreateMode ? "" : data.status,
    searchText: onCreateMode ? "" : data.searchText,
    programmeDuration: onCreateMode ? "" : data.programmeDuration
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
    programmeCustomId,
    programmeFullName,
    programmeDateOfBirth,
    programmeGender,
    programmePhone,
    programmeEmail,
    programmeAddress,
    programmePostCode,
    programmeImageUrl,
    imageLocalDestination,
    programmeStartDate,
    programmeEndDate,
    programmeNationality,
    programmeAllergies,
    programmeNextOfKinName,
    programmeNextOfKinRelationship,
    programmeNextOfKinPhone,
    programmeNextOfKinEmail,
    programmeQualification,

    identification
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };
  const sanitizeProgrammeImageName = (originalName: string) => {
    const timestamp = Date.now();
    const extension = originalName.split(".").pop();
    return `programme_${timestamp}.${extension}`;
  };

  const validationPassed = () => {
    const {
      programmeCustomId,
      programmeImageUrl,
      imageLocalDestination,
      programmeQualification,
      identification,
      programmePostCode,
      programmeEndDate,
      ...copyLocalData
    } = localData;

    if (!validateEmail(programmeEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePhoneNumber(programmePhone)) {
      setError("Please enter a valid phone number with the country code. e.g +234, +447");
      return;
    }

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  // function to handle all programme profile object data update
  const handleUpdateProgramme = async (programmeData: any) => {
    try {
      const response = await updateMutation.mutateAsync(programmeData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating profile");
    }
  };

  // function to handle programme creation
  const handleCreateProgramme = async () => {
    if (validationPassed()) {
      setError("");

      if (onCreateMode) {
        try {
          const response = await createMutation.mutateAsync(localData);
          if (response?.data) {
            onSave(true);
          }
        } catch (error: any) {
          setError(error.message || error.response?.data.message || "Error creating profile");
        }
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="programmeDialogContainer" style="w-[80%] h-[90%] gap-5 overflow-auto flex flex-col">
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("programmeDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Programme</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Programme..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateProgramme}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Programme..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateProgramme}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Programme Profile")}
                hidden={!hasActionAccess("Edit Programme Profile")}
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
                const container = document.getElementById("programmeDialogContainer");
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
          <div className="flex">
            {/* text div */}
            <div className="grid grid-cols-2 gap-3 w-[70%]">
              <InputComponent
                disabled={onViewMode}
                title="Programme Custom ID *"
                placeholder="Programme Custom ID"
                required
                name="programmeCustomId"
                value={programmeCustomId}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Full Name *"
                autocomplete="on"
                placeholder="Full Name *"
                name="programmeFullName"
                value={programmeFullName}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Date Of Birth *"
                type="date"
                placeholder="Date Of Birth *"
                name="programmeDateOfBirth"
                value={programmeDateOfBirth}
                onChange={handleInputChange}
              />

              <SelectInputComponent
                disabled={onViewMode}
                title="Gender *"
                placeholder="Gender *"
                name="programmeGender"
                value={programmeGender}
                onChange={handleInputChange}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" }
                ]}
              />

              <InputComponent
                disabled={onViewMode}
                title="Phone *"
                placeholder="Phone (+44787654321)*"
                name="programmePhone"
                value={programmePhone}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                autocomplete="on"
                title="Email *"
                placeholder="Email *"
                name="programmeEmail"
                value={programmeEmail}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Nationality *"
                placeholder="Nationality *"
                autocomplete="on"
                name="programmeNationality"
                value={programmeNationality}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Joined Date *"
                placeholder="Joined Date *"
                type="date"
                name="programmeStartDate"
                value={programmeStartDate}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Leave Date *"
                placeholder="Leave Date *"
                type="date"
                name="programmeEndDate"
                value={programmeEndDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex w-full gap-3">
            <div className="w-[70%]">
              <InputComponent
                disabled={onViewMode}
                title="Address *"
                placeholder="Address *"
                name="programmeAddress"
                value={programmeAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-[30%]">
              <InputComponent
                disabled={onViewMode}
                title="Post Code *"
                placeholder="Post Code *"
                name="programmePostCode"
                value={programmePostCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <TextAreaComponent
            disabled={onViewMode}
            title="Allergies *"
            required
            placeholder="Allergies *"
            name="programmeAllergies"
            value={programmeAllergies}
            onChange={handleInputChange}
          />

          <div className="flex flex-col gap-3">
            {/* next of kin section */}
            <span className="text-[20px] font-bold mt-2">Next of Kin </span>
            <div className="grid grid-cols-2 gap-3">
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Name *"
                name="programmeNextOfKinName"
                value={programmeNextOfKinName}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Relationship *"
                name="programmeNextOfKinRelationship"
                value={programmeNextOfKinRelationship}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Phone *"
                name="programmeNextOfKinPhone"
                value={programmeNextOfKinPhone}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Email *"
                name="programmeNextOfKinEmail"
                value={programmeNextOfKinEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};
