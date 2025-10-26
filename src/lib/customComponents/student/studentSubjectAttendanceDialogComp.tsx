"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  ActionButtons,
  YesNoDialog,
  CustomHeading,
  TextAreaComponent,
  IconFormatter,
  SearchComponent,
  LoaderDiv
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import {
  useGeneralClientFunctions,
  useNavigationHandler
} from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import {
  defaultButtonStyle,
  inputStyle,
  sortableTableHeadCellStyle,
  tableContainerStyle,
  tableHeaderStyle
} from "@/lib/generalStyles";
import { SearchableDropDownInput } from "../general/compLibrary2";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { MdAdd } from "react-icons/md";

import { checkDataType, generateCustomId, generateSearchText } from "@/lib/shortFunctions/shortFunctions";
import { AllowanceDialog } from "../staff/allowanceDialog";
import { Icon, UserCircle, UserPen, UserRoundCheck, UserRoundMinus, UserRoundPen, UserRoundX } from "lucide-react";
import { LuArrowUpDown } from "react-icons/lu";
import { handleApiRequest } from "@/axios/axiosClient";
import { get } from "http";

const StudentSubjectAttendanceDialog = ({
  type,
  data,
  academicYears,
  levels,
  courses,
  levelManagers,
  canCreate,
  canEdit,
  courseManagers,
  subjects,
  subjectTeachers,
  onClose,
  onSave
}: {
  data?: any;
  type: "new" | "edit" | "view";
  academicYears: any;
  levels: any;
  courses: any;
  subjects: any;
  levelManagers: any;
  courseManagers: any;
  subjectTeachers: any;
  canCreate: boolean;
  canEdit: boolean;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/student/attendance/subjectattendance");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/student/attendance/subjectattendance");
  const [unsaved, setUnsaved] = useState(false);
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [enrolledStudentsData, setEnrolledStudentsData] = useState<any>({
    isFetchingEnrolledStudent: false,
    enrolledStudents: []
  });

  const { isFetchingEnrolledStudent, enrolledStudents } = enrolledStudentsData;

  const initialData = {
    academicYearId: onCreateMode ? "" : data ? data.academicYearId : "",
    academicYear: onCreateMode ? "" : data ? data.academicYear : "",
    attendanceCustomId: onCreateMode
      ? generateCustomId(`STDSUBATT`, true, "numeric")
      : data
      ? data.attendanceCustomId
      : "",
    studentSubjectAttendances: onCreateMode ? [] : data ? data.studentSubjectAttendances : [],

    courseId: onCreateMode ? "" : data ? data.courseId : "",
    courseCustomId: onCreateMode ? "" : data ? data.courseCustomId : "",
    courseFullTitle: onCreateMode ? "" : data ? data.courseFullTitle : "",

    levelId: onCreateMode ? "" : data ? data.levelId : "",
    levelCustomId: onCreateMode ? "" : data ? data.levelCustomId : "",
    level: onCreateMode ? "" : data ? data.level : "",

    subjectId: onCreateMode ? "" : data ? data.subjectId : "",
    subjectCustomId: onCreateMode ? "" : data ? data.subjectCustomId : "",
    subjectFullTitle: onCreateMode ? "" : data ? data.subjectFullTitle : "",

    courseManagerStaffId: onCreateMode ? "" : data ? data.courseManagerStaffId : "",
    courseManagerCustomStaffId: onCreateMode ? "" : data ? data.courseManagerCustomStaffId : "",
    courseManagerFullName: onCreateMode ? "" : data ? data.courseManagerFullName : "",

    levelManagerStaffId: onCreateMode ? "" : data ? data.levelManagerStaffId : "",
    levelManagerCustomStaffId: onCreateMode ? "" : data ? data.levelManagerCustomStaffId : "",
    levelManagerFullName: onCreateMode ? "" : data ? data.levelManagerFullName : "",

    subjectTeacherStaffId: onCreateMode ? "" : data ? data.subjectTeacherStaffId : "",
    subjectTeacherCustomStaffId: onCreateMode ? "" : data ? data.subjectTeacherCustomStaffId : "",
    subjectTeacherFullName: onCreateMode ? "" : data ? data.subjectTeacherFullName : "",

    attendanceStatus: onCreateMode ? "Completed" : data ? data.attendanceStatus : "",
    attendanceDate: onCreateMode ? new Date().toISOString().split("T")[0] : data ? data.attendanceDate : "",

    notes: onCreateMode ? "" : data ? data.notes : ""
  };
  const [localData, setLocalData] = useState(initialData);
  const [studentSubjectAttendanceSearchValue, setStudentSubjectAttendanceSearchValue] = useState("");
  const [filterStudentSubjectAttendanceStatus, setFilterStudentSubjectAttendanceStatus] = useState("All");
  const [onFilterStudentSubjectAttendanceBackup, setOnFilterStudentSubjectAttendanceBackup] = useState<any>([]);
  const {
    attendanceCustomId,
    attendanceDate,
    attendanceStatus,
    academicYearId,
    academicYear,
    courseId,
    courseCustomId,
    courseFullTitle,
    courseManagerCustomStaffId,
    courseManagerFullName,
    levelManagerCustomStaffId,
    levelManagerFullName,
    levelId,
    levelCustomId,
    level,
    subjectId,
    subjectCustomId,
    subjectFullTitle,
    subjectTeacherCustomStaffId,
    subjectTeacherFullName,
    notes,
    studentSubjectAttendances
  } = localData;

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
    let recommendedCourseManager: any;
    const mainCourseManager = courseManagers.find(
      (manager: any) => manager.courseId === courseId && manager.status === "Active" && manager.staffType === "Main"
    );

    if (mainCourseManager) {
      recommendedCourseManager = mainCourseManager;
    } else {
      recommendedCourseManager = courseManagers.find(
        (manager: any) => manager.courseId === courseId && manager.status === "Active"
      );
    }

    if (recommendedCourseManager) {
      setLocalData((prev: any) => ({
        ...prev,
        courseManagerStaffId: recommendedCourseManager.courseManagerStaffId,
        courseManagerCustomStaffId: recommendedCourseManager.courseManagerCustomStaffId,
        courseManagerFullName: recommendedCourseManager.courseManagerFullName
      }));
    }
  }, [courseCustomId, courseId]);

  useEffect(() => {
    let recommendedLevelManager: any;
    const mainLevelManager = levelManagers.find(
      (manager: any) => manager.levelId === levelId && manager.status === "Active" && manager.staffType === "Main"
    );

    if (mainLevelManager) {
      recommendedLevelManager = mainLevelManager;
    } else {
      recommendedLevelManager = levelManagers.find(
        (manager: any) => manager.levelId === levelId && manager.status === "Active"
      );
    }

    if (recommendedLevelManager) {
      setLocalData((prev: any) => ({
        ...prev,
        levelManagerStaffId: recommendedLevelManager.levelManagerStaffId,
        levelManagerCustomStaffId: recommendedLevelManager.levelManagerCustomStaffId,
        levelManagerFullName: recommendedLevelManager.levelManagerFullName
      }));
    }
  }, [levelCustomId, levelId]);

  useEffect(() => {
    let recommendedSubjectTeacher: any;
    const mainSubjectTeacher = subjectTeachers.find(
      (manager: any) => manager.subjectId === subjectId && manager.status === "Active" && manager.staffType === "Main"
    );

    if (mainSubjectTeacher) {
      recommendedSubjectTeacher = mainSubjectTeacher;
    } else {
      recommendedSubjectTeacher = subjectTeachers.find(
        (manager: any) => manager.subjectId === subjectId && manager.status === "Active"
      );
    }

    if (recommendedSubjectTeacher) {
      setLocalData((prev: any) => ({
        ...prev,
        subjectTeacherStaffId: recommendedSubjectTeacher.subjectTeacherStaffId,
        subjectTeacherCustomStaffId: recommendedSubjectTeacher.subjectTeacherCustomStaffId,
        subjectTeacherFullName: recommendedSubjectTeacher.subjectTeacherFullName
      }));
    }
  }, [subjectCustomId, subjectId]);

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

  useEffect(() => {
    let dataToFilter;
    let onFilterStudentSubjectAttendanceBackupLocal: any = [];
    if (onFilterStudentSubjectAttendanceBackup.length === 0) {
      dataToFilter = studentSubjectAttendances;
      onFilterStudentSubjectAttendanceBackupLocal = studentSubjectAttendances;
      setOnFilterStudentSubjectAttendanceBackup(studentSubjectAttendances);
    } else {
      dataToFilter = onFilterStudentSubjectAttendanceBackup;
      onFilterStudentSubjectAttendanceBackupLocal = onFilterStudentSubjectAttendanceBackup;
    }

    if (filterStudentSubjectAttendanceStatus === "All" && studentSubjectAttendanceSearchValue !== "") {
      const filteredData = dataToFilter.filter((studentSubjectAttendance: any) => {
        const { studentCustomId, studentId, studentFullName, attendance } = studentSubjectAttendance;
        const searchText = generateSearchText([studentCustomId, studentId, studentFullName, attendance]);
        return searchText.toLocaleLowerCase().includes(studentSubjectAttendanceSearchValue.toLocaleLowerCase());
      });

      setLocalData((prev: any) => ({ ...prev, studentSubjectAttendances: filteredData }));
    } else if (filterStudentSubjectAttendanceStatus !== "All" && studentSubjectAttendanceSearchValue !== "") {
      const filteredData = dataToFilter.filter((studentSubjectAttendance: any) => {
        const { studentCustomId, studentId, studentFullName, attendance } = studentSubjectAttendance;
        const searchText = generateSearchText([studentCustomId, studentId, studentFullName, attendance]);
        return (
          searchText.toLocaleLowerCase().includes(studentSubjectAttendanceSearchValue.toLocaleLowerCase()) &&
          studentSubjectAttendance.attendance === filterStudentSubjectAttendanceStatus
        );
      });
      setLocalData((prev: any) => ({ ...prev, studentSubjectAttendances: filteredData }));
    } else if (filterStudentSubjectAttendanceStatus !== "All" && studentSubjectAttendanceSearchValue === "") {
      const filteredData = dataToFilter.filter((studentSubjectAttendance: any) => {
        return studentSubjectAttendance.attendance === filterStudentSubjectAttendanceStatus;
      });
      setLocalData((prev: any) => ({ ...prev, studentSubjectAttendances: filteredData }));
    } else {
      setLocalData((prev: any) => ({
        ...prev,
        studentSubjectAttendances: onFilterStudentSubjectAttendanceBackupLocal
      }));
      setOnFilterStudentSubjectAttendanceBackup([]);
    }
  }, [filterStudentSubjectAttendanceStatus, studentSubjectAttendanceSearchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    if (!academicYearId || !academicYear) {
      setError("Please Select an Academic Year");
      return false;
    }

    if (!subjectId || !subjectCustomId) {
      setError("Please Select a Subject");
      return false;
    }

    if (!courseId || !courseCustomId) {
      setError("Please Select a Course");
      return false;
    }
    if (!levelId || !levelCustomId) {
      setError("Please Select a Level");
      return false;
    }

    const subject = subjects.find((subject: any) => subject._id === subjectId);
    if (levelId !== subject.levelId) {
      setError("Subject and Level do not match - Subject is not offered to the selected Level");
      return false;
    }

    const { notes, ...copyLocalData } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  const generateEnrolledStudentSubjectAttendances = (enrolledStudents: any) => {
    const mappedRelevantStudents_Attendance = enrolledStudents.map((studentEnrollmentObj: any) => ({
      studentId: studentEnrollmentObj.studentId,
      studentCustomId: studentEnrollmentObj.studentCustomId,
      studentFullName: studentEnrollmentObj.studentFullName,
      attendance: ""
    }));

    setLocalData((prev: any) => ({
      ...prev,
      studentSubjectAttendances: mappedRelevantStudents_Attendance
    }));
  };

  const handleLoadStudents = async () => {
    setEnrolledStudentsData((prev: any) => ({ ...prev, isFetchingEnrolledStudents: true }));
    if (studentSubjectAttendances.length > 0) return;
    if (validationPassed()) {
      setError("");
      try {
        const response = await handleApiRequest(
          "post",
          "alyeqeenschoolapp/api/student/attendance/enrolledsubjectattendancestudents",
          {
            academicYearId: localData.academicYearId,
            courseId: localData.courseId,
            levelId: localData.levelId,
            subjectId: localData.subjectId,
            subjectTeacherCustomStaffId: localData.subjectTeacherCustomStaffId,
            courseManagerCustomStaffId: localData.courseManagerCustomStaffId,
            levelManagerCustomStaffId: localData.levelManagerCustomStaffId
          }
        );
        const relevantStudents = response?.data;
        if (relevantStudents && relevantStudents.length > 0) {
          generateEnrolledStudentSubjectAttendances(relevantStudents);
          setEnrolledStudentsData((prev: any) => ({
            ...prev,
            isFetchingEnrolledStudents: false,
            enrolledStudents: relevantStudents
          }));
        } else if (relevantStudents.length === 0) {
          setError("No relevant enrolled student records found for the selected course, level and academic year");
        }
      } catch (err: any) {
        setError(err.response.data.message || err.message || "Error loading relevant enrolled student records");
        setEnrolledStudentsData((prev: any) => ({ ...prev, isFetchingEnrolledStudents: false }));
      }
    }
  };

  const handleReLoadStudents = async () => {
    setEnrolledStudentsData((prev: any) => ({ ...prev, isFetchingEnrolledStudents: true }));
    if (validationPassed()) {
      setError("");
      try {
        const response = await handleApiRequest(
          "post",
          "alyeqeenschoolapp/api/student/attendance/enrolledsubjectattendancestudents",
          {
            academicYearId: localData.academicYearId,
            courseId: localData.courseId,
            levelId: localData.levelId,
            subjectId: localData.subjectId,
            subjectTeacherCustomStaffId: localData.subjectTeacherCustomStaffId,
            courseManagerCustomStaffId: localData.courseManagerCustomStaffId,
            levelManagerCustomStaffId: localData.levelManagerCustomStaffId
          }
        );
        const relevantStudents = response?.data;
        if (relevantStudents && relevantStudents.length > 0) {
          const mappedRelevantStudents_Attendance = enrolledStudents.map((studentEnrollmentObj: any) => {
            const attendanceExist = studentSubjectAttendances.find(
              (existingAttendance: any) => studentEnrollmentObj.studentId === existingAttendance.studentId
            );
            if (attendanceExist) {
              return attendanceExist;
            } else {
              return {
                studentId: studentEnrollmentObj.studentId,
                studentCustomId: studentEnrollmentObj.studentCustomId,
                studentFullName: studentEnrollmentObj.studentFullName,
                attendance: ""
              };
            }
          });

          setLocalData((prev: any) => ({
            ...prev,
            studentSubjectAttendances: mappedRelevantStudents_Attendance
          }));
          setEnrolledStudentsData((prev: any) => ({
            ...prev,
            isFetchingEnrolledStudents: false,
            enrolledStudents: relevantStudents
          }));
        } else if (relevantStudents.length === 0) {
          setError("No relevant enrolled student records found for the selected course, level and academic year");
        }
      } catch (err: any) {
        setError(err.response.data.message || err.message || "Error loading relevant enrolled student records");
        setEnrolledStudentsData((prev: any) => ({ ...prev, isFetchingEnrolledStudents: false }));
      }
    }
  };

  const handleCreateStudentSubjectAttendance = async () => {
    if (validationPassed()) {
      setError("");
      if (
        studentSubjectAttendances.filter((studentSubjectAttendance: any) => studentSubjectAttendance.attendance === "")
          .length > 0
      ) {
        setError("Please mark all student attendances");
        return;
      }
      try {
        const response = await createMutation.mutateAsync(localData);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Creating Student Attendance");
      }
    }
  };

  const handleUpdateStudentSubjectAttendance = async () => {
    if (validationPassed()) {
      setError("");
      if (
        studentSubjectAttendances.filter((studentSubjectAttendance: any) => studentSubjectAttendance.attendance === "")
          .length > 0
      ) {
        setError("Please mark all student attendances");
        return;
      }
      try {
        const response = await updateMutation.mutateAsync(localData);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Updating Student Attendance");
      }
    }
  };

  // console.log("localData", localData);
  // console.log("filterStudentSubjectAttendanceStatus", filterStudentSubjectAttendanceStatus);
  //   console.log("sortOrderTracker", sortOrderTracker);
  //   console.log("courseManagers", courseManagers);
  //   console.log("levelManagers", levelManagers);

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="studentDialogContainer" style="w-[90%] h-[95%] gap-5 overflow-auto flex flex-col">
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Student Day Attendance</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Student Attendance..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateStudentSubjectAttendance}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Student Attendance..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleUpdateStudentSubjectAttendance}
              />
            )}
            {onViewMode && (
              <button
                disabled={!canEdit}
                hidden={!canEdit}
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
          <CustomHeading variation="head4">Attendance Detail</CustomHeading>
          <div className="grid grid-cols-3 gap-3 w-full">
            <InputComponent
              disabled={onViewMode || onEditMode}
              title="Attendance Custom ID *"
              placeholder="Attendance Custom ID"
              required
              name="attendanceCustomId"
              value={attendanceCustomId}
              onChange={handleInputChange}
            />{" "}
            <InputComponent
              disabled={onViewMode}
              title="Attendance Date *"
              placeholder="Attendance Date *"
              type="date"
              required
              name="attendanceDate"
              value={attendanceDate}
              onChange={handleInputChange}
            />
            <SelectInputComponent
              disabled={onViewMode}
              title="Attendance Status *"
              name="attendanceStatus"
              placeholder="Attendance Status *"
              value={attendanceStatus}
              onChange={handleInputChange}
              options={[
                { value: "Completed", label: "Completed" },
                { value: "In Progress", label: "In Progress" },
                { value: "Cancelled", label: "Cancelled" }
              ]}
            />
            <SearchableDropDownInput
              disabled={onViewMode || onEditMode}
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
              defaultText={`|${subjectCustomId}`}
              disabled={onViewMode || onEditMode}
              title="Search Subject Custom Id *"
              placeholder="Search Subject *"
              data={subjects}
              displayKeys={["_id", "subjectCustomId", "subjectFullTitle"]}
              onSelected={(selectedData, save) => {
                if (save) {
                  setLocalData((prev: any) => ({
                    ...prev,
                    subjectCustomId: selectedData[1],
                    subjectId: selectedData[0],
                    subjectFullTitle: selectedData[2]
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
              title="Subject Full Title (Auto-fills)"
              placeholder="Subject Full Title"
              required
              name="subjectFullTitle"
              value={subjectFullTitle}
              onChange={handleInputChange}
            />
            <SearchableDropDownInput
              defaultText={`|${courseCustomId}`}
              disabled={onViewMode || onEditMode}
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
            />{" "}
            <InputComponent
              disabled={true}
              title="Course Full Title (Auto-fills)"
              placeholder="Course Full Title"
              required
              name="courseFullTitle"
              value={courseFullTitle}
              onChange={handleInputChange}
            />
            <SearchableDropDownInput
              defaultText={`|${levelCustomId}`}
              disabled={onViewMode || onEditMode}
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
            />{" "}
            <InputComponent
              disabled={true}
              title="Level (Auto-fills)"
              placeholder="Level"
              required
              name="level"
              value={level}
              onChange={handleInputChange}
            />
          </div>{" "}
          <div className="w-full">
            <TextAreaComponent
              disabled={onViewMode}
              title="Notes"
              placeholder="Notes"
              name="notes"
              value={notes}
              onChange={handleInputChange}
            />
          </div>
        </div>
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
          )}{" "}
          <CustomHeading variation="head4">Relevant Staff Detail</CustomHeading>
          <div className="grid grid-cols-3 gap-3 w-full">
            <InputComponent
              disabled={true}
              title="Suggested Subject Teacher (Auto-fills)"
              placeholder="Available only when subject is selected"
              required
              name="subjectTeacherCustomStaffId"
              value={subjectTeacherCustomStaffId}
              onChange={handleInputChange}
            />
            {
              <SearchableDropDownInput
                defaultText={`|${subjectTeacherCustomStaffId}`}
                disabled={onViewMode || onEditMode}
                title="Confirm Subject Teacher *"
                placeholder="Confirm Subject Teacher *"
                data={subjectTeachers}
                displayKeys={["_id", "subjectTeacherCustomStaffId", "subjectTeacherFullName"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      subjectTeacherCustomStaffId: selectedData[1],
                      subjectTeacherStaffId: selectedData[0],
                      subjectTeacherFullName: selectedData[2]
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
            }
            <InputComponent
              disabled={true}
              title="Subject Teacher Full Name * (Auto-fills)"
              placeholder="Subject Teacher Full Name *"
              required
              name="subjectTeacherFullName"
              value={subjectTeacherFullName}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={true}
              title="Suggested Course Manager (Auto-fills)"
              placeholder="Available only when course is selected"
              required
              name="courseManagerCustomStaffId"
              value={courseManagerCustomStaffId}
              onChange={handleInputChange}
            />
            {
              <SearchableDropDownInput
                defaultText={`|${courseManagerCustomStaffId}`}
                disabled={onViewMode || onEditMode}
                title="Confirm Course Manager *"
                placeholder="Confirm Course Manager *"
                data={courseManagers}
                displayKeys={["_id", "courseManagerCustomStaffId", "courseManagerFullName"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      courseManagerCustomStaffId: selectedData[1],
                      courseManagerStaffId: selectedData[0],
                      courseManagerFullName: selectedData[2]
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
            }
            <InputComponent
              disabled={true}
              title="Course Manager Full Name * (Auto-fills)"
              placeholder="Course Manager Full Name *"
              required
              name="courseManagerFullName"
              value={courseManagerFullName}
              onChange={handleInputChange}
            />
            <InputComponent
              disabled={true}
              title="Suggested Level Manager (Auto-fills)"
              placeholder="Available only when level is selected"
              required
              name="levelManagerCustomStaffId"
              value={levelManagerCustomStaffId}
              onChange={handleInputChange}
            />
            {
              <SearchableDropDownInput
                defaultText={`|${levelManagerCustomStaffId}`}
                disabled={onViewMode || onEditMode}
                title="Confirm Level Manager *"
                placeholder="Confirm Level Manager *"
                data={levelManagers}
                displayKeys={["_id", "levelManagerCustomStaffId", "levelManagerFullName"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      levelManagerCustomStaffId: selectedData[1],
                      levelManagerStaffId: selectedData[0],
                      levelManagerFullName: selectedData[2]
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
            }{" "}
            <InputComponent
              disabled={true}
              title="Level Manager Full Name * (Auto-fills)"
              placeholder="Level Manager Full Name *"
              required
              name="levelManagerFullName"
              value={levelManagerFullName}
              onChange={handleInputChange}
            />
          </div>
        </div>{" "}
        <div className="flex flex-col gap-3 border border-borderColor px-4 py-6 rounded-md shadow-md">
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
          <div>
            <CustomHeading variation="head3">Students</CustomHeading>
            <CustomHeading variation="head5light">
              {onCreateMode
                ? "Load students to mark their attendances"
                : onEditMode
                ? "Update existing or newly enrolled student attendances - Use reload button to add new students to mark their attendances"
                : "View existing student attendances"}
            </CustomHeading>
          </div>
          <div className="flex justify-between gap-5 items-center">
            <SearchComponent
              placeholder="Search Student or Attendance"
              name="studentSubjectAttendanceSearchValue"
              value={studentSubjectAttendanceSearchValue}
              onChange={(e) => setStudentSubjectAttendanceSearchValue(e.target.value)}
            />{" "}
            <div className="">
              <SelectInputComponent
                title=""
                name="filterStudentSubjectAttendanceStatus"
                placeholder="Student Attendance Status *"
                value={filterStudentSubjectAttendanceStatus}
                onChange={(e) => setFilterStudentSubjectAttendanceStatus(e.target.value)}
                options={[
                  { value: "All", label: "All" },
                  { value: "Present", label: "Present" },
                  { value: "Late (Excused)", label: "Late (Excused)" },
                  { value: "Late (Unexcused)", label: "Late (Unexcused)" },
                  { value: "Absent (Excused)", label: "Absent (Excused)" },
                  { value: "Absent (Unexcused)", label: "Absent (Unexcused)" }
                ]}
              />
            </div>
            <div>
              {(onCreateMode && !isFetchingEnrolledStudent && studentSubjectAttendances.length === 0) ||
                (studentSubjectAttendances.length === 0 && onEditMode && (
                  <button
                    onClick={handleLoadStudents}
                    className={defaultButtonStyle}
                    disabled={onViewMode}
                    hidden={onViewMode}
                  >
                    <IconFormatter icon={UserRoundCheck} /> Load Students
                  </button>
                ))}
              {isFetchingEnrolledStudent && (
                <LoaderButton
                  buttonText=""
                  loadingButtonText="Loading..."
                  disabled={true}
                  isLoading={isFetchingEnrolledStudent}
                />
              )}
              {!isFetchingEnrolledStudent && studentSubjectAttendances.length > 0 && (
                <button
                  onClick={handleReLoadStudents}
                  className={defaultButtonStyle}
                  disabled={onViewMode}
                  hidden={onViewMode}
                >
                  <IconFormatter icon={UserRoundCheck} /> Reload Students
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-between gap-2 mt-8 mx-2">
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-medium rounded-full px-2 py-1  border border-borderColor bg-backgroundColor-2">
                Students <IconFormatter icon={UserCircle} className="inline-block ml-2" />
              </span>
              <span className="text-[15px] text-foregroundColor-2 font-medium">{studentSubjectAttendances.length}</span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-medium rounded-full px-2 py-1  border border-borderColor bg-green-100">
                Present <IconFormatter icon={UserRoundCheck} className="inline-block ml-2" />
              </span>
              <span className="text-[15px] text-foregroundColor-2 font-medium">
                {studentSubjectAttendances.filter((attendance: any) => attendance.attendance === "Present").length}
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-medium rounded-full px-2 py-1  border border-borderColor bg-blue-200">
                Late (Excused) <IconFormatter icon={UserRoundPen} className="inline-block ml-2" />
              </span>
              <span className="text-[15px] text-foregroundColor-2 font-medium">
                {
                  studentSubjectAttendances.filter((attendance: any) => attendance.attendance === "Late (Excused)")
                    .length
                }
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-medium rounded-full px-2 py-1  border border-borderColor bg-yellow-100">
                Late (Unexcused) <IconFormatter icon={UserRoundMinus} className="inline-block ml-2" />
              </span>
              <span className="text-[15px] text-foregroundColor-2 font-medium">
                {
                  studentSubjectAttendances.filter((attendance: any) => attendance.attendance === "Late (Unexcused)")
                    .length
                }
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-medium rounded-full px-2 py-1  border border-borderColor bg-orange-100">
                Absent (Excused) <IconFormatter icon={UserPen} className="inline-block ml-2" />
              </span>
              <span className="text-[15px] text-foregroundColor-2 font-medium">
                {
                  studentSubjectAttendances.filter((attendance: any) => attendance.attendance === "Absent (Excused)")
                    .length
                }
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-medium rounded-full px-2 py-1  border border-borderColor bg-red-100">
                Absent (Unexcused) <IconFormatter icon={UserRoundX} className="inline-block ml-2" />
              </span>
              <span className="text-[15px] text-foregroundColor-2 font-medium">
                {
                  studentSubjectAttendances.filter((attendance: any) => attendance.attendance === "Absent (Unexcused)")
                    .length
                }
              </span>
            </div>
          </div>
          <div
            className={`border border-borderColor text-foregroundColor rounded-lg shadow relative max-h-[600px] overflow-y-auto overflow-x-auto`}
          >
            <div className="bg-backgroundColor-3 text-foregroundColor font-semibold h-14 flex justify-between items-center">
              <div className="w-[50px] text-center whitespace-nowrap font-medium"></div>
              <div
                className="hover:bg-backgroundColor-2 text-center w-[200px] font-semibold hover:cursor-pointer h-full flex items-center p-2 whitespace-nowrap text-foregroundColor"
                onClick={() => {
                  let sortOrder = sortOrderTracker["studentFullName"];
                  let nextOrder: string;

                  if (sortOrder === "dsc") {
                    nextOrder = "asc";
                  } else {
                    nextOrder = "dsc";
                  }
                  const sortedData = [...studentSubjectAttendances].sort((a, b) => {
                    return sortOrder === "asc"
                      ? a["studentFullName"].localeCompare(b["studentFullName"])
                      : b["studentFullName"].localeCompare(a["studentFullName"]);
                  });

                  setLocalData((prev: any) => ({ ...prev, studentSubjectAttendances: sortedData }));
                  setSortOrderTracker((prev: any) => ({ ...prev, ["studentFullName"]: nextOrder }));
                }}
              >
                Student Custom ID <LuArrowUpDown className="inline-block ml-1" />
              </div>
              <div
                className="hover:bg-backgroundColor-2 text-center w-[200px] font-semibold hover:cursor-pointer h-full flex items-center p-2 whitespace-nowrap text-foregroundColor"
                onClick={() => {
                  let sortOrder = sortOrderTracker["studentFullName"];
                  let nextOrder: string;

                  if (sortOrder === "dsc") {
                    nextOrder = "asc";
                  } else {
                    nextOrder = "dsc";
                  }
                  const sortedData = [...studentSubjectAttendances].sort((a, b) => {
                    return sortOrder === "asc"
                      ? a["studentFullName"].localeCompare(b["studentFullName"])
                      : b["studentFullName"].localeCompare(a["studentFullName"]);
                  });

                  setLocalData((prev: any) => ({ ...prev, studentSubjectAttendances: sortedData }));
                  setSortOrderTracker((prev: any) => ({ ...prev, ["studentFullName"]: nextOrder }));
                }}
              >
                Student Full Name <LuArrowUpDown className="inline-block ml-1" />
              </div>
              <div
                className="hover:bg-backgroundColor-2 text-center w-[200px] font-semibold hover:cursor-pointer h-full flex items-center p-2 whitespace-nowrap text-foregroundColor"
                onClick={() => {
                  let sortOrder = sortOrderTracker["attendance"];
                  let nextOrder: string;

                  if (sortOrder === "dsc") {
                    nextOrder = "asc";
                  } else {
                    nextOrder = "dsc";
                  }
                  const sortedData = [...studentSubjectAttendances].sort((a, b) => {
                    return sortOrder === "asc"
                      ? a["attendance"].localeCompare(b["attendance"])
                      : b["attendance"].localeCompare(a["attendance"]);
                  });

                  setLocalData((prev: any) => ({ ...prev, studentSubjectAttendances: sortedData }));
                  setSortOrderTracker((prev: any) => ({ ...prev, ["attendance"]: nextOrder }));
                }}
              >
                Attendance <LuArrowUpDown className="inline-block ml-1" />
              </div>
            </div>

            <div className="bg-backgroundColor">
              {isFetchingEnrolledStudent ? (
                <div>
                  <div>
                    <div className="flex items-center justify-center p-10">
                      <LoaderDiv
                        type="spinnerText"
                        text="Loading Student Attendances..."
                        textColor="foregroundColor"
                        dimension="h-10 w-10"
                      />
                    </div>
                  </div>
                </div>
              ) : studentSubjectAttendances.length < 1 && !isFetchingEnrolledStudent ? (
                <div>
                  <div className="text-center py-4">No student attendance found. Load student to get started</div>
                </div>
              ) : (
                studentSubjectAttendances.map((attendanceObj: any, index: any) => {
                  const { studentFullName, studentCustomId, attendance } = attendanceObj;

                  return (
                    <div
                      key={studentCustomId}
                      className="hover:bg-backgroundColor-2 hover:cursor-pointer border-y border-borderColor-2 flex justify-between items-center px-4 pb-2"
                    >
                      <span className="w-[50px] flex items-center justify-center whitespace-nowrap font-medium pt-2">
                        <span className="rounded-full bg-backgroundColor-3 p-2 h-10 w-10 flex item-center justify-center border">
                          <p> {studentFullName[0] + "" + studentFullName[1]}</p>
                        </span>
                      </span>
                      <span className="w-[200px] text-center whitespace-nowrap font-medium">{studentCustomId}</span>
                      <span className="w-[200px] text-center whitespace-nowrap font-medium">{studentFullName}</span>
                      <span className="w-[200px] text-center whitespace-nowrap font-medium">
                        {" "}
                        <SelectInputComponent
                          disabled={onViewMode}
                          title=""
                          name="attendance"
                          placeholder="Take Attendance"
                          value={attendance}
                          onChange={(e) => {
                            setLocalData((prev: any) => ({
                              ...prev,
                              studentSubjectAttendances: prev.studentSubjectAttendances.map(
                                (studentSubjectAttendanceObj: any) =>
                                  studentSubjectAttendanceObj.studentCustomId === studentCustomId
                                    ? { ...studentSubjectAttendanceObj, attendance: e.target.value }
                                    : studentSubjectAttendanceObj
                              )
                            }));

                            setOnFilterStudentSubjectAttendanceBackup(
                              onFilterStudentSubjectAttendanceBackup.map((studentSubjectAttendanceObj: any) => {
                                return studentSubjectAttendanceObj.studentCustomId === studentCustomId
                                  ? { ...studentSubjectAttendanceObj, attendance: e.target.value }
                                  : studentSubjectAttendanceObj;
                              })
                            );

                            setUnsaved(true);
                          }}
                          options={[
                            { value: "Present", label: "Present" },
                            { value: "Late (Excused)", label: "Late (Excused)" },
                            { value: "Late (Unexcused)", label: "Late (Unexcused)" },
                            { value: "Absent (Excused)", label: "Absent (Excused)" },
                            { value: "Absent (Unexcused)", label: "Absent (Unexcused)" }
                          ]}
                        />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};

export default StudentSubjectAttendanceDialog;
