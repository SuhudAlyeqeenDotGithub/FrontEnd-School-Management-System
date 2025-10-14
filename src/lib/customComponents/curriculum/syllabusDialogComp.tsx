"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent,
  ActionButtons,
  CustomHeading
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useDebugValue, useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { formatDate, generateCustomId } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { defaultButtonStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { MdAdd, MdContentCopy } from "react-icons/md";
import { LearningObjectivesDialog } from "./learningObjectiveDialogComp";
import { TopicDialogComponent } from "./topicDialogComp";
import { SyllabusTopicsDialog } from "./syllabusTopicDialogComp";
import { SearchableDropDownInput } from "../general/compLibrary2";

export const SyllabusDialogComponent = ({
  type,
  data,
  onClose,
  onSave,
  topics: importedTopics,
  subjects
}: {
  type: "new" | "edit" | "view";
  data?: any;
  topics: any;
  subjects: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/curriculum/syllabus");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/curriculum/syllabus");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [newTopicsDialog, setNewTopicsDialog] = useState(false);
  const [editTopicsDialog, setEditTopicsDialog] = useState(false);
  const [viewTopicsDialog, setViewTopicsDialog] = useState(false);
  const [onOpenTopicsDialogData, setOnOpenTopicsDialogData] = useState({
    topicId: "",
    week: "",
    topicCustomId: "",
    topic: ""
  });

  const [localData, setLocalData] = useState<any>({
    syllabusCustomId: onCreateMode ? generateCustomId(`SYl`, true, "numeric") : data.syllabusCustomId || "",
    syllabus: onCreateMode ? "" : data.syllabus,
    description: onCreateMode ? "" : data.description,
    learningOutcomes: onCreateMode ? [] : data.learningOutcomes || [],
    offeringStartDate: onCreateMode ? "" : data.offeringStartDate,
    offeringEndDate: onCreateMode ? "" : data.offeringEndDate,
    subjectFullTitle: onCreateMode ? "" : data.subjectFullTitle,
    subjectCustomId: onCreateMode ? "" : data.subjectCustomId,
    courseCustomId: onCreateMode ? "" : data.courseCustomId,
    baseSubjectCustomId: onCreateMode ? "" : data.baseSubjectCustomId,
    courseId: onCreateMode ? "" : data.courseId,
    subjectId: onCreateMode ? "" : data.subjectId,
    levelId: onCreateMode ? "" : data.levelId,
    levelCustomId: onCreateMode ? "" : data.levelCustomId,
    status: onCreateMode ? "" : data.status,
    topics: onCreateMode ? [] : data.topics || []
  });

  const {
    syllabusCustomId,
    syllabus,
    description,
    offeringStartDate,
    offeringEndDate,
    status,
    topics,
    learningOutcomes,
    notes,
    subjectFullTitle,
    levelCustomId,
    subjectCustomId,
    courseCustomId,
    baseSubjectCustomId,
    subjectId,
    courseId,
    levelId
  } = localData;

  const [newLearningOutcomesDialog, setNewLearningOutcomesDialog] = useState(false);
  const [editLearningOutcomesDialog, setEditLearningOutcomesDialog] = useState(false);
  const [onOpenLearningOutcomesDialogData, setOnOpenLearningOutcomesDialogData] = useState("");

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

  useEffect(() => {
    if (!localData.subjectCustomId) return;
    const selectedSubject = subjects.find((subject: any) => subject._id === localData.subjectId);
    const {
      subjectCustomId,
      _id: subjectId,
      subjectFullTitle,
      courseId,
      courseCustomId,
      baseSubjectCustomId,
      levelId,
      levelCustomId
    } = selectedSubject;

    console.log("selectedSubject", selectedSubject);

    setLocalData((prev: any) => ({
      ...prev,
      subjectCustomId,
      subjectId,
      subjectFullTitle,
      courseId,
      courseCustomId,
      baseSubjectCustomId,
      levelId,
      levelCustomId
    }));
  }, [localData.subjectCustomId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    if (!syllabus) {
      setError("Missing Data: Please fill in the Syllabus Title input");
      return false;
    }
    const {
      description,
      syllabusDuration,
      offeringStartDate,
      offeringEndDate,
      topics,
      learningOutcomes,
      notes,
      ...copyLocalData
    } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  // function to handle all syllabus syllabus object data update
  const handleUpdateSyllabus = async () => {
    try {
      const response = await updateMutation.mutateAsync(localData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating syllabus");
    }
  };

  // function to handle syllabus creation
  const handleCreateSyllabus = async () => {
    if (validationPassed()) {
      setError("");

      if (onCreateMode) {
        try {
          const response = await createMutation.mutateAsync(localData);
          if (response?.data) {
            onSave(true);
          }
        } catch (error: any) {
          setError(error.message || error.response?.data.message || "Error creating syllabus");
        }
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="syllabusDialogContainer" style="w-[60%] h-[80%] gap-5 overflow-auto flex flex-col">
        {" "}
        {newLearningOutcomesDialog && (
          <LearningObjectivesDialog
            type="new"
            existingData={learningOutcomes}
            onSave={(save, learningOutcomes) => {
              setNewLearningOutcomesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                learningOutcomes: [...prev.learningOutcomes, learningOutcomes]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewLearningOutcomesDialog(!open);
            }}
          />
        )}
        {editLearningOutcomesDialog && (
          <LearningObjectivesDialog
            type="edit"
            data={onOpenLearningOutcomesDialogData}
            onSave={(save, returnedLearningOutcomes, oldData) => {
              if (learningOutcomes.includes(returnedLearningOutcomes)) {
                setEditLearningOutcomesDialog(!save);
                return;
              }
              setEditLearningOutcomesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                learningOutcomes: prev.learningOutcomes.map((learningOutcomes: string) =>
                  learningOutcomes === oldData ? returnedLearningOutcomes : learningOutcomes
                )
              }));
            }}
            onClose={(open) => {
              setEditLearningOutcomesDialog(!open);
            }}
          />
        )}
        {newTopicsDialog && (
          <SyllabusTopicsDialog
            type="new"
            onSave={(save, returnData) => {
              setNewTopicsDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                topics: [...prev.topics, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewTopicsDialog(!open);
            }}
            topics={importedTopics ? importedTopics : []}
          />
        )}
        {editTopicsDialog && (
          <SyllabusTopicsDialog
            type="edit"
            data={onOpenTopicsDialogData}
            onSave={(save, returnData) => {
              setEditTopicsDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                topics: [...prev.topics].map((topics: any) =>
                  topics.topicId === returnData.topicId ? returnData : topics
                )
              }));
            }}
            onClose={(open) => {
              setEditTopicsDialog(!open);
            }}
            topics={importedTopics ? importedTopics : []}
          />
        )}
        {viewTopicsDialog && (
          <SyllabusTopicsDialog
            type="view"
            data={onOpenTopicsDialogData}
            onSave={(save, returnData) => {
              setViewTopicsDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                topics: [...prev.topics].map((topics: any) =>
                  topics.topicId === returnData.topicId ? returnData : topics
                )
              }));
            }}
            onClose={(open) => {
              setViewTopicsDialog(!open);
            }}
            topics={importedTopics ? importedTopics : []}
          />
        )}
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("syllabusDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Syllabus</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Syllabus..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateSyllabus}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Syllabus..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateSyllabus}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Syllabus")}
                hidden={!hasActionAccess("Edit Syllabus")}
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
                const container = document.getElementById("syllabusDialogContainer");
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
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3 w-full">
              <InputComponent
                disabled={onViewMode}
                title="Syllabus Custom ID *"
                placeholder="Syllabus Custom ID"
                required
                name="syllabusCustomId"
                value={syllabusCustomId}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Syllabus Title"
                autocomplete="on"
                placeholder="Syllabus Title"
                name="syllabus"
                value={syllabus}
                onChange={handleInputChange}
              />

              <SearchableDropDownInput
                defaultText={`|${subjectCustomId}`}
                disabled={onViewMode}
                title="Subject Custom Id *"
                placeholder="Search Subject *"
                data={subjects}
                displayKeys={["_id", "subjectCustomId", "subjectFullTitle"]}
                onSelected={(selectedData, save) => {
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      subjectId: selectedData[0],
                      subjectCustomId: selectedData[1]
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
            </div>{" "}
            <div className="w-full">
              <InputComponent
                disabled={true}
                title="Subject Full Title (auto-generated)"
                autocomplete="on"
                placeholder="Subject Full Title (auto-generated)"
                name="subjectFullTitle"
                value={subjectFullTitle}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-full">
              <TextAreaComponent
                disabled={onViewMode}
                title="Description"
                placeholder="Description"
                name="description"
                value={description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              <SelectInputComponent
                disabled={onViewMode}
                title="Status"
                placeholder="Status"
                name="status"
                value={status}
                onChange={handleInputChange}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" }
                ]}
              />

              <InputComponent
                disabled={onViewMode}
                title="Offering Start Date"
                placeholder="Offering Start Date"
                type="date"
                name="offeringStartDate"
                value={offeringStartDate}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Offering End Date"
                placeholder="Offering End Date"
                type="date"
                name="offeringEndDate"
                value={offeringEndDate}
                onChange={handleInputChange}
              />
            </div>
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
        <div className="flex flex-col gap-1 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-3">
          <CustomHeading variation="head5">Auto-generated Fields (for reference only)</CustomHeading>
          <div className="flex flex-col gap-3 w-full mt-2">
            <div className="grid grid-cols-4 gap-3 w-full">
              <InputComponent
                disabled={true}
                title="Course Custom ID"
                placeholder="Course Custom ID"
                required
                name="courseCustomId"
                value={courseCustomId}
                onChange={handleInputChange}
              />{" "}
              <InputComponent
                disabled={true}
                title="Base Subject Custom ID"
                placeholder="Base Subject Custom ID"
                required
                name="baseSubjectCustomId"
                value={baseSubjectCustomId}
                onChange={handleInputChange}
              />{" "}
              <InputComponent
                disabled={true}
                title="Subject Custom ID"
                placeholder="Subject Custom ID"
                required
                name="subjectCustomId"
                value={subjectCustomId}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={true}
                title="Level Custom ID"
                placeholder="Level Custom ID"
                required
                name="levelCustomId"
                value={levelCustomId}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        {/* topics div */}{" "}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Topic</h2>
            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewTopicsDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Topic
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {topics.length < 1 ? (
              <div>No Topics Added</div>
            ) : (
              topics.map((topicObj: any) => {
                const { topicId, topic, topicCustomId, week } = topicObj;
                return (
                  <div
                    key={topicId}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenTopicsDialogData(topicObj);
                      setViewTopicsDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{topic || "".slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenTopicsDialogData(topicObj);
                          setEditTopicsDialog(true);
                          setUnsaved(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            topics: prev.topics.filter((topic: any) => topic.topicId !== topicId)
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor-2 text-[16px]">
                      {topicCustomId}
                      <MdContentCopy
                        title="copy id"
                        className="ml-2 inline-block text-[19px] text-foregroundColor-2 hover:text-borderColor-3 hover:cursor-pointer"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await navigator.clipboard.writeText(topicCustomId);
                        }}
                      />
                    </span>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor-2 text-[15px]">
                      Week: {week || "".slice(0, 20)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>{" "}
        {/* learningOutcomes div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <div className="flex gap-3 items-center">
              <h2>Learning Outcomes</h2>
              <p>{learningOutcomes.length}</p>
            </div>

            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewLearningOutcomesDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Learning Outcome
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2 max-h-[200px] min-h-[100px] overflow-auto">
            {learningOutcomes.length < 1 ? (
              <div>No Learning Outcomes Added</div>
            ) : (
              learningOutcomes.map((learningOutcome: string) => {
                return (
                  <button
                    key={learningOutcome}
                    onClick={() => {
                      setOnOpenLearningOutcomesDialogData(learningOutcome);
                      setEditLearningOutcomesDialog(true);
                    }}
                    className={`${tabGroupButtonStyle} inline-flex gap-2 items-center`}
                  >
                    {learningOutcome}
                    <IoClose
                      className="hover:text-red-500 size-[18px]"
                      onClick={(e: React.MouseEvent<SVGElement>) => {
                        e.stopPropagation();
                        setLocalData((prev: any) => ({
                          ...prev,
                          learningOutcomes: prev.learningOutcomes.filter((s: string) => s !== learningOutcome)
                        }));
                        setUnsaved(true);
                      }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};
