"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { IdentificationType } from "@/interfaces/interfaces";
import { nanoid } from "@reduxjs/toolkit";
import { defaultButtonStyle } from "@/lib/generalStyles";

export const IdentificationDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: "new" | "edit" | "view";
  data?: IdentificationType;
  onSave: (save: boolean, returnData: IdentificationType) => void;
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
    identificationType: onCreateMode ? "" : data ? data.identificationType : "",
    identificationValue: onCreateMode ? "" : data ? data.identificationValue : "",
    issueDate: onCreateMode ? "" : data ? data.issueDate : "",
    expiryDate: onCreateMode ? "" : data ? data.expiryDate : ""
  });

  const { identificationType, identificationValue, issueDate, expiryDate } = localData;

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
    if (identificationType === "") {
      setError("Please enter identification type");
      return false;
    }
    if (identificationValue === "") {
      setError("Please enter identification value");
      return false;
    }
    if (issueDate === "") {
      setError("Please enter issue date");
      return false;
    }
    if (expiryDate === "") {
      setError("Please enter expiry date");
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
              const container = document.getElementById("staffQualificationDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("staffQualificationDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : onEditMode ? "Edit" : "View"} Identification</h2>
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
                  const container = document.getElementById("staffQualificationDialogContainer");
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
            title="Identification Type *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Identification Type (Passport, Driver's License, Visa etc) *"
            required
            name="identificationType"
            value={identificationType}
            onChange={handleInputChange}
          />

          <InputComponent
            title="Identification Value *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Identification Value (Passport Number, Driver's License Number, Visa Number etc) *"
            required
            name="identificationValue"
            value={identificationValue}
            onChange={handleInputChange}
          />

          <InputComponent
            title="Issue Date *"
            disabled={onViewMode}
            type="date"
            placeholder="Issue Date *"
            required
            name="issueDate"
            value={issueDate}
            onChange={handleInputChange}
          />

          <InputComponent
            title="Expiry Date *"
            disabled={onViewMode}
            type="date"
            placeholder="Expiry Date *"
            required
            name="expiryDate"
            value={expiryDate}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
