"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { useTimelineMutation } from "@/tanStack/timeline/mutate";
import { useQuery } from "@tanstack/react-query";
import { generateCustomId } from "@/lib/shortFunctions/shortFunctions";

const PeriodComponent = ({
  type = "create",
  data,
  disallowedPeriods = [],
  onClose,
  onUpdate
}: {
  type?: "create" | "edit";
  data?: any;
  disallowedPeriods?: string[];
  onClose: (close: boolean) => void;
  onUpdate: (update: boolean, updateType: "create" | "edit", newPeriod: any) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [localData, setLocalData] = useState({
    _id: type === "create" ? "" : data._id,
    customId: type === "create" ? generateCustomId() : data.customId,
    period: type === "create" ? "" : data.period,
    startDate: type === "create" ? "" : data.startDate,
    endDate: type === "create" ? "" : data.endDate
  });
  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const { period, startDate, endDate } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };
  const validationPassed = () => {
    if (period === "") {
      setError("Period is required");
      return false;
    }
    if (startDate === "") {
      setError("Start Date is required");
      return false;
    }
    if (endDate === "") {
      setError("End Date is required");
      return false;
    }

    if (disallowedPeriods.includes(period)) {
      setError("Period already exists");
      return false;
    }

    return true;
  };

  const handleUpdatePeriod = async () => {
    setIsLoading(true);
    if (validationPassed()) {
      setError("");
      setIsLoading(false);
      if (type === "create") {
        onUpdate(true, "create", localData);
      } else {
        onUpdate(true, "edit", localData);
      }
    }
    setIsLoading(false);
  };

  return (
    <ContainerComponent id="PeriodDialogContainer" style="w-[40%] gap-5 overflow-auto flex flex-col">
      {openUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onNo={() => {
            const container = document.getElementById("PeriodDialogContainer");
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
        <h2>{type === "create" ? "New" : "Edit"} Period</h2>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText={type === "create" ? "Add" : "Save"}
            loadingButtonText={type === "create" ? "Adding Period..." : "Saving Changes..."}
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={isLoading}
            onClick={handleUpdatePeriod}
          />
          <IoClose
            onClick={() => {
              const container = document.getElementById("PeriodDialogContainer");
              if (!unsaved) {
                onClose(true);
              } else {
                setOpenUnsavedDialog(true);
                if (container) {
                  container.style.overflow = "hidden";
                }
              }
            }}
            className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
          />
        </div>
      </div>
      {/* input divs */}
      <div className="flex flex-col gap-3">
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

        {/* text div */}
        <div className="flex flex-col gap-3 w-full">
          <InputComponent
            placeholder="Title (Period 1, Term 1, Semester 1) *"
            required
            name="period"
            value={period}
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
      </div>
    </ContainerComponent>
  );
};

export default PeriodComponent;
