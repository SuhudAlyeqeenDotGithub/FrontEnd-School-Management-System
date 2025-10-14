"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  ActionButtons,
  YesNoDialog,
  CustomHeading
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import {
  useGeneralClientFunctions,
  useNavigationHandler
} from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { defaultButtonStyle, inputStyle } from "@/lib/generalStyles";
import { SearchableDropDownInput } from "../general/compLibrary2";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { MdAdd } from "react-icons/md";

import { generateCustomId } from "@/lib/shortFunctions/shortFunctions";
import { AllowanceDialog } from "../staff/allowanceDialog";

const StudentEnrollmentDialog = ({
  type,
  data,
  academicYears,
  students,
  levels,
  courses,
  onClose,
  onSave
}: {
  data?: any;
  type: "new" | "edit" | "view";
  academicYears: any;
  students: any;
  levels: any;
  courses: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/student/enrollment");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/student/enrollment");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [newAllowanceDialog, setNewAllowanceDialog] = useState(false);
  const [editAllowanceDialog, setEditAllowanceDialog] = useState(false);
  const [viewAllowanceDialog, setViewAllowanceDialog] = useState(false);

  const [onOpenAllowanceDialogData, setOnOpenAllowanceDialogData] = useState({
    _id: "",
    allowanceType: "",
    amount: ""
  });

  const initialData = {
    academicYearId: onCreateMode ? "" : data ? data.academicYearId : "",
    academicYear: onCreateMode ? "" : data ? data.academicYear : "",
    studentId: onCreateMode ? "" : data ? data.studentId : "",
    studentCustomId: onCreateMode ? "" : data ? data.studentCustomId : "",
    enrollmentCustomId: onCreateMode
      ? generateCustomId(`STDENR`, true, "numeric")
      : data
      ? data.enrollmentCustomId
      : "",
    studentFullName: onCreateMode ? "" : data ? data.studentFullName : "",

    courseId: onCreateMode ? "" : data ? data.courseId : "",
    courseCustomId: onCreateMode ? "" : data ? data.courseCustomId : "",
    courseFullTitle: onCreateMode ? "" : data ? data.courseFullTitle : "",

    levelId: onCreateMode ? "" : data ? data.levelId : "",
    levelCustomId: onCreateMode ? "" : data ? data.levelCustomId : "",
    level: onCreateMode ? "" : data ? data.level : "",

    enrollmentStatus: onCreateMode ? "Active" : data ? data.enrollmentStatus : "",
    enrollmentType: onCreateMode ? "" : data ? data.enrollmentType : "",
    enrollmentDate: onCreateMode ? new Date().toISOString() : data ? data.enrollmentDate : "",
    enrollmentExpiresOn: onCreateMode ? "" : data ? data.enrollmentExpiresOn : "",

    notes: onCreateMode ? "" : data ? data.notes : "",
    allowances: onCreateMode ? "" : data ? data.allowances : ""
  };

  const [localData, setLocalData] = useState(initialData);

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
    academicYearId,
    academicYear,
    studentId,
    studentCustomId,
    enrollmentCustomId,
    studentFullName,
    courseId,
    courseCustomId,
    courseFullTitle,
    levelId,
    levelCustomId,
    level,
    enrollmentStatus,
    enrollmentDate,
    enrollmentExpiresOn,
    notes,
    enrollmentType,
    allowances
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    const { enrollmentExpiresOn, notes, allowances, ...copyLocalData } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  const handleCreateStudentEnrollment = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await createMutation.mutateAsync(localData);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Creating Student Enrollment");
      }
    }
  };

  const handleUpdateStudentEnrollment = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const response = await updateMutation.mutateAsync(localData);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Updating Student Enrollment");
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="studentDialogContainer" style="w-[70%] h-[90%] gap-5 overflow-auto flex flex-col">
        {newAllowanceDialog && (
          <AllowanceDialog
            type="new"
            onSave={(save, returnData) => {
              setNewAllowanceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                allowances: [...prev.allowances, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewAllowanceDialog(!open);
            }}
          />
        )}
        {editAllowanceDialog && (
          <AllowanceDialog
            type="edit"
            data={onOpenAllowanceDialogData}
            onSave={(save, returnData) => {
              setEditAllowanceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                allowances: [...prev.allowances].map((allowance: any) =>
                  allowance._id === returnData._id ? returnData : allowance
                )
              }));
            }}
            onClose={(open) => {
              setEditAllowanceDialog(!open);
            }}
          />
        )}
        {viewAllowanceDialog && (
          <AllowanceDialog
            type="view"
            data={onOpenAllowanceDialogData}
            onSave={(save, returnData) => {
              setViewAllowanceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                allowances: [...prev.allowances].map((allowance: any) =>
                  allowance._id === returnData._id ? returnData : allowance
                )
              }));
            }}
            onClose={(open) => {
              setViewAllowanceDialog(!open);
            }}
          />
        )}
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("studentDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Student Enrollment</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Student Enrollment..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateStudentEnrollment}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Student Enrollment..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleUpdateStudentEnrollment}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Student Enrollment")}
                hidden={!hasActionAccess("Edit Student Enrollment")}
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
                const container = document.getElementById("studentDialogContainer");
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
          <div className="grid grid-cols-3 gap-3 w-full">
            <InputComponent
              disabled={onViewMode}
              title="Enrollment Custom ID *"
              placeholder="Enrollment Custom ID"
              required
              name="enrollmentCustomId"
              value={enrollmentCustomId}
              onChange={handleInputChange}
            />
            <SearchableDropDownInput
              defaultText={`${studentId}|${studentCustomId}`}
              disabled={onViewMode}
              title="Search Student *"
              placeholder="Search Student - ID or Name *"
              data={students}
              displayKeys={["_id", "studentCustomId", "studentFullName"]}
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    studentId: selectedData[0],
                    studentCustomId: selectedData[1],
                    studentFullName: selectedData[2]
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
              disabled={true}
              title="Student Full Name * (Auto-fills)"
              placeholder="Student Full Name *"
              required
              name="studentFullName"
              value={studentFullName}
              onChange={handleInputChange}
            />
            <SearchableDropDownInput
              disabled={onViewMode}
              defaultText={`${academicYearId}|${academicYear}`}
              title="Search Academic Year *"
              placeholder="Search Academic Year *"
              data={academicYears}
              displayKeys={["_id", "academicYear"]}
              searchFieldKey="academicYear"
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    academicYearId: selectedData[0],
                    academicYear: selectedData[1]
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
              defaultText={`|${courseCustomId}`}
              disabled={onViewMode}
              title="Search Course Custom Id *"
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
              title="Search Level Custom Id *"
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

            <InputComponent
              disabled={onViewMode}
              title="Enrollment Date *"
              placeholder="Enrollment Date *"
              type="date"
              required
              name="enrollmentDate"
              value={enrollmentDate}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={onViewMode}
              title="Enrollment Expires On *"
              placeholder="Enrollment Expires On *"
              type="date"
              name="enrollmentExpiresOn"
              value={enrollmentExpiresOn}
              onChange={handleInputChange}
            />
            <SelectInputComponent
              disabled={onViewMode}
              title="Enrollment Type *"
              name="enrollmentType"
              placeholder="Enrollment Type *"
              value={enrollmentType}
              onChange={handleInputChange}
              options={[
                { value: "New", label: "New" },
                { value: "Re-enrolled", label: "Re-enrolled" },
                { value: "Transfer", label: "Transfer" },
                { value: "Returned", label: "Returned" }
              ]}
            />
            <SelectInputComponent
              disabled={onViewMode}
              title="Enrollment Status *"
              name="enrollmentStatus"
              placeholder="Enrollment Status *"
              value={enrollmentStatus}
              onChange={handleInputChange}
              options={[
                { value: "Active", label: "Active" },
                { value: "Completed", label: "Completed" },
                { value: "Withdrawn", label: "Withdrawn" }
              ]}
            />
          </div>
        </div>{" "}
        <div className="flex flex-col gap-1 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-3">
          <CustomHeading variation="head5">Auto-generated Fields (for reference only)</CustomHeading>
          <div className="flex flex-col gap-3 w-full mt-2">
            <div className="grid grid-cols-2 gap-3 w-full">
              <InputComponent
                disabled={true}
                title="Course Full Title"
                placeholder="Course Full Title"
                required
                name="courseFullTitle"
                value={courseFullTitle}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={true}
                title="Level"
                placeholder="Level"
                required
                name="level"
                value={level}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        {/* allowances div */}{" "}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Allowances</h2>
            <div>
              <button
                onClick={() => setNewAllowanceDialog(true)}
                className={defaultButtonStyle}
                disabled={onViewMode}
                hidden={onViewMode}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Allowance
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {allowances.length < 1 ? (
              <div>No Allowance Added</div>
            ) : (
              allowances.map((allowanceV: any) => {
                const { _id, allowanceType, amount } = allowanceV;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenAllowanceDialogData(allowanceV);
                      setViewAllowanceDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-semibold text-[16px]">{allowanceType.slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenAllowanceDialogData(allowanceV);
                          setEditAllowanceDialog(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            allowances: prev.allowances.filter((allowance: any) => allowance._id !== _id)
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>

                    <div className="flex flex-col mt-2">
                      <span>{amount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};

export default StudentEnrollmentDialog;
