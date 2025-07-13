"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { QualificationType } from "@/interfaces/interfaces";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { nanoid } from "@reduxjs/toolkit";
import { inputStyle } from "@/lib/generalStyles";
import { start } from "repl";

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

export const ResponsibilityDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: string;
  data: { _id: string; responsibility: string; description: string };
  onSave: (save: boolean, returnData: { _id: string; responsibility: string; description: string }) => void;
  onClose: (close: boolean) => void;
}) => {
  const newDialog = type === "new";
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    _id: data._id,
    responsibility: data.responsibility,
    description: data.description
  });

  const { responsibility, description } = localData;

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setUnsaved(true);
    setLocalData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validationPassed = () => {
    if (!responsibility) {
      setError("Missing Data: Please provide a responsibility");
      return false;
    }
    if (!description) {
      setError("Missing Data: Please provide a responsibility description");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-70 inset-0">
      <ContainerComponent style="w-[55%] h-[40%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
          <h2>{newDialog ? "New" : "Edit"} Responsibility</h2>
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
            placeholder="Responsibility *"
            required
            name="responsibility"
            value={responsibility}
            onChange={handleInputChange}
          />
          <textarea
            placeholder="Description *"
            required
            name="description"
            value={description}
            className={inputStyle}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};

export const WorkingScheduleDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: string;
  data: { _id: string; day: string; startTime: string; endTime: string; hours: string };
  onSave: (
    save: boolean,
    returnData: { _id: string; day: string; startTime: string; endTime: string; hours: string }
  ) => void;
  onClose: (close: boolean) => void;
}) => {
  const newDialog = type === "new";
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    _id: data._id,
    day: data.day,
    startTime: data.startTime,
    endTime: data.endTime,
    hours: data.hours
  });

  const { day, startTime, endTime, hours } = localData;

  useEffect(() => {
    if (!startTime || !endTime) return;
    setLocalData((prev: any) => ({ ...prev, hours: parseFloat(endTime) - parseFloat(startTime) }));
  }, [startTime, endTime]);

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
    if (!day) {
      setError("Missing Data: Please provide a day");
      return false;
    }
    if (!startTime) {
      setError("Missing Data: Please provide a start time");
      return false;
    }
    if (!endTime) {
      setError("Missing Data: Please provide an end time");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-70 inset-0">
      <ContainerComponent style="w-[55%] h-[60%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
          <h2>{newDialog ? "New" : "Edit"} Working Schedule</h2>
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
            placeholder="Working Day - e.g Monday *"
            required
            name="day"
            value={day}
            onChange={handleInputChange}
          />
          <InputComponent
            type="time"
            placeholder="Start Time *"
            required
            name="startTime"
            value={startTime}
            onChange={handleInputChange}
          />
          <InputComponent
            type="time"
            placeholder="End Time *"
            required
            name="endTime"
            value={endTime}
            onChange={handleInputChange}
          />
          <InputComponent placeholder="Hours *" required name="hours" value={hours} onChange={handleInputChange} />
        </div>
      </ContainerComponent>
    </div>
  );
};
