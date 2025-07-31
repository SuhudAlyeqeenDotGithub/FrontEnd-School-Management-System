"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateAcademicYear } from "@/redux/features/general/academicYear/academicYearThunk";

const EditAcademicYearComponent = ({
  data,
  onClose,
  onSave
}: {
  data: any;
  onClose: (close: boolean) => {};
  onSave: (create: boolean) => {};
}) => {
  const { handleUnload } = useNavigationHandler();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.staffData);
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);

  const [localData, setLocalData] = useState({
    _id: data._id,
    academicYear: data.academicYear,
    startDate: data.startDate,
    endDate: data.endDate
  });

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const { academicYear, startDate, endDate } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };
  const validationPassed = () => {
    if (academicYear === "") {
      setError("Academic Year is required");
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

    return true;
  };

  const handleUpdateAcademicYear = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await dispatch(updateAcademicYear(localData)).unwrap();
        if (response) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err);
      }
    }
  };

  return (
    <ContainerComponent id="AcademicYearDialogContainer" style="w-[50%] gap-5 overflow-auto flex flex-col">
      {openUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onNo={() => {
            const container = document.getElementById("AcademicYearDialogContainer");
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
        <h2>Edit Academic Year</h2>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText="Save"
            loadingButtonText="Updating Academic Year..."
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={isLoading}
            onClick={handleUpdateAcademicYear}
          />
          <IoClose
            onClick={() => {
              if (!unsaved) {
                onClose(true);
              }
              const container = document.getElementById("AcademicYearDialogContainer");
              if (container) {
                container.style.overflow = "hidden";
              }
              setOpenUnsavedDialog(true);
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
            placeholder=" e.g. (Academic Year 2023-2024)"
            required
            name="academicYear"
            value={academicYear}
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

export default EditAcademicYearComponent;
