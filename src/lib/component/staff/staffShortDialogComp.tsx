"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { QualificationType } from "@/interfaces/interfaces";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { nanoid } from "@reduxjs/toolkit";

export const QualificationDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: string;
  data: QualificationType;
  onSave: (save: boolean, returnData: QualificationType) => void;
  onClose: (close: boolean) => void;
}) => {
  const newDialog = type === "new";
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    _id: data._id,
    qualificationName: data.qualificationName,
    schoolName: data.schoolName,
    startDate: data.startDate,
    endDate: data.endDate
  });

  const { qualificationName, schoolName, startDate, endDate } = localData;

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnsaved(true);
    setLocalData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validationPassed = () => {
    if (!qualificationName) {
      setError("Missing Data: Please provide a qualification name");
      return false;
    }

    if (!schoolName) {
      setError("Missing Data: Please provide a school/institution name");
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
    <div className="flex justify-center items-center absolute bg-foregroundColor-70 inset-0">
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
              const container = document.getElementById("staffDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("staffDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{newDialog ? "New" : "Edit"} Qualification</h2>
          <div className="flex justify-between items-center gap-5">
            <LoaderButton
              buttonText="Save"
              loadingButtonText="Saving..."
              disabled={!unsaved}
              buttonStyle="w-full"
              onClick={async () => {
                if (validationPassed()) {
                  setError("");
                  onSave(true, { ...localData, _id: type === "edit" ? localData._id : nanoid() });
                }
              }}
            />
            <IoClose
              onClick={() => {
                if (!unsaved) {
                  onClose(true);
                } else {
                  const container = document.getElementById("staffDialogContainer");
                  if (container) {
                    container.style.overflow = "hidden";
                  }
                  setOpenUnsavedDialog(true);
                }
              }}
              className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
            />
          </div>
        </div>
        <div className="flex gap-3 flex-col">
          <InputComponent
            placeholder="Qualification Name *"
            required
            name="qualificationName"
            value={qualificationName}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="School Name *"
            required
            name="schoolName"
            value={schoolName}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="Start Date *"
            type="date"
            required
            name="startDate"
            value={startDate}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="End Date *"
            type="date"
            required
            name="endDate"
            value={endDate}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
