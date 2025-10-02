"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { QualificationType } from "@/interfaces/interfaces";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { nanoid } from "@reduxjs/toolkit";
import { defaultButtonStyle, inputStyle } from "@/lib/generalStyles";

export const AllowanceDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: "new" | "edit" | "view";
  data?: { _id: string; allowanceType: string; amount: string };
  onSave: (save: boolean, returnData: { _id: string; allowanceType: string; amount: string }) => void;
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
    allowanceType: onCreateMode ? "" : data ? data.allowanceType : "",
    amount: onCreateMode ? "" : data ? data.amount : ""
  });

  const { allowanceType, amount } = localData;

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    setLocalData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validationPassed = () => {
    if (!allowanceType) {
      setError("Missing Data: Please enter allowance type");
      return false;
    }
    if (!amount) {
      setError("Missing Data: Please enter allowance amount");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-transparent inset-0">
      <ContainerComponent style="w-[55%] h-[55%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
              const container = document.getElementById("staffResponsibilityDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("staffResponsibilityDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : onEditMode ? "Edit" : "View"} Allowance</h2>
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
                  const container = document.getElementById("staffResponsibilityDialogContainer");
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
            title="Allowance Type *"
            disabled={onViewMode}
            placeholder="Allowance Type *"
            required
            name="allowanceType"
            value={allowanceType}
            onChange={handleInputChange}
          />
          <TextAreaComponent
            title="Allowance Amount *"
            disabled={onViewMode}
            placeholder="Allowance Amount *"
            required
            name="amount"
            value={amount}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
