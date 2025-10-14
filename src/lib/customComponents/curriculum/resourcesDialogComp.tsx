"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { nanoid } from "@reduxjs/toolkit";
import { defaultButtonStyle } from "@/lib/generalStyles";
import { url } from "inspector";

export const ResourcesDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: "new" | "edit" | "view";
  data?: { _id: string; resourceType: string; resourceName: string; url: string };
  onSave: (save: boolean, returnData: { _id: string; resourceType: string; resourceName: string; url: string }) => void;
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
    resourceType: onCreateMode ? "" : data ? data.resourceType : "",
    resourceName: onCreateMode ? "" : data ? data.resourceName : "",
    url: onCreateMode ? "" : data ? data.url : ""
  });

  const { resourceName, url, resourceType } = localData;

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
    if (!resourceName) {
      setError("Missing Data: Please provide a resource name");
      return false;
    }

    if (!resourceType) {
      setError("Missing Data: Please provide a resource type");
      return false;
    }

    if (!url) {
      setError("Missing Data: Please provide a resource URL");
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
              const container = document.getElementById("ResourcesDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("ResourcesDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "New" : onEditMode ? "Edit" : "View"} Resources</h2>
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
                  const container = document.getElementById("ResourcesDialogContainer");
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
            title="Resource Name *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Resource Name *"
            required
            name="resourceName"
            value={resourceName}
            onChange={handleInputChange}
          />
          <InputComponent
            title="Resource Type *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Resource Type *"
            required
            name="resourceType"
            value={resourceType}
            onChange={handleInputChange}
          />
          <InputComponent
            title="Resource URL *"
            disabled={onViewMode}
            autocomplete="on"
            placeholder="Resource URL *"
            required
            name="url"
            value={url}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};
