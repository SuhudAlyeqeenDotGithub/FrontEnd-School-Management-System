"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent,
  ActionButtons
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { formatDate, generateCustomId } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { defaultButtonStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { MdAdd } from "react-icons/md";
import { LearningObjectivesDialog } from "./learningObjectiveDialogComp";
import { ResourcesDialog } from "./resourcesDialogComp";

export const TopicDialogComponent = ({
  type,
  data,
  onClose,
  onSave
}: {
  type: "new" | "edit" | "view";
  data?: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/curriculum/topic");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/curriculum/topic");
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [newResourcesDialog, setNewResourcesDialog] = useState(false);
  const [editResourcesDialog, setEditResourcesDialog] = useState(false);
  const [viewResourcesDialog, setViewResourcesDialog] = useState(false);
  const [onOpenResourcesDialogData, setOnOpenResourcesDialogData] = useState({
    _id: "",
    resourceName: "",
    resourceType: "",
    url: ""
  });

  const [newLearningObjectivesDialog, setNewLearningObjectivesDialog] = useState(false);
  const [editLearningObjectivesDialog, setEditLearningObjectivesDialog] = useState(false);
  const [onOpenLearningObjectivesDialogData, setOnOpenLearningObjectivesDialogData] = useState("");

  const [localData, setLocalData] = useState<any>({
    topicCustomId: onCreateMode ? generateCustomId(`TPC`, true, "numeric") : data.topicCustomId || "",
    topic: onCreateMode ? "" : data.topic,
    description: onCreateMode ? "" : data.description,
    offeringStartDate: onCreateMode ? "" : data.offeringStartDate,
    offeringEndDate: onCreateMode ? "" : data.offeringEndDate,
    status: onCreateMode ? "" : data.status,
    resources: onCreateMode ? [] : data.resources || [],
    learningObjectives: onCreateMode ? [] : data.learningObjectives || []
  });

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
    topicCustomId,
    topic,
    description,
    offeringStartDate,
    offeringEndDate,
    status,
    resources,
    learningObjectives
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    const {
      description,
      topicDuration,
      offeringStartDate,
      offeringEndDate,
      resources,
      learningObjectives,
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

  // function to handle all topic topic object data update
  const handleUpdateTopic = async () => {
    try {
      const response = await updateMutation.mutateAsync(localData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating topic");
    }
  };

  // function to handle topic creation
  const handleCreateTopic = async () => {
    if (validationPassed()) {
      setError("");

      if (onCreateMode) {
        try {
          const response = await createMutation.mutateAsync(localData);
          if (response?.data) {
            onSave(true);
          }
        } catch (error: any) {
          setError(error.message || error.response?.data.message || "Error creating topic");
        }
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="topicDialogContainer" style="w-[60%] h-[80%] gap-5 overflow-auto flex flex-col">
        {newLearningObjectivesDialog && (
          <LearningObjectivesDialog
            type="new"
            existingData={learningObjectives}
            onSave={(save, learningObjectives) => {
              setNewLearningObjectivesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                learningObjectives: [...prev.learningObjectives, learningObjectives]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewLearningObjectivesDialog(!open);
            }}
          />
        )}
        {editLearningObjectivesDialog && (
          <LearningObjectivesDialog
            type="edit"
            data={onOpenLearningObjectivesDialogData}
            onSave={(save, returnedLearningObjectives, oldData) => {
              if (learningObjectives.includes(returnedLearningObjectives)) {
                setEditLearningObjectivesDialog(!save);
                return;
              }
              setEditLearningObjectivesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                learningObjectives: prev.learningObjectives.map((learningObjectives: string) =>
                  learningObjectives === oldData ? returnedLearningObjectives : learningObjectives
                )
              }));
            }}
            onClose={(open) => {
              setEditLearningObjectivesDialog(!open);
            }}
          />
        )}
        {newResourcesDialog && (
          <ResourcesDialog
            type="new"
            onSave={(save, returnData) => {
              setNewResourcesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                resources: [...prev.resources, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewResourcesDialog(!open);
            }}
          />
        )}
        {editResourcesDialog && (
          <ResourcesDialog
            type="edit"
            data={onOpenResourcesDialogData}
            onSave={(save, returnData) => {
              setEditResourcesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                resources: [...prev.resources].map((resources: any) =>
                  resources._id === returnData._id ? returnData : resources
                )
              }));
            }}
            onClose={(open) => {
              setEditResourcesDialog(!open);
            }}
          />
        )}
        {viewResourcesDialog && (
          <ResourcesDialog
            type="view"
            data={onOpenResourcesDialogData}
            onSave={(save, returnData) => {
              setViewResourcesDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                resources: [...prev.resources].map((resources: any) =>
                  resources._id === returnData._id ? returnData : resources
                )
              }));
            }}
            onClose={(open) => {
              setViewResourcesDialog(!open);
            }}
          />
        )}
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("topicDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Topic</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Topic..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateTopic}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Topic..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateTopic}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Topic")}
                hidden={!hasActionAccess("Edit Topic")}
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
                const container = document.getElementById("topicDialogContainer");
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
            <div className="grid grid-cols-2 gap-3 w-full">
              <InputComponent
                disabled={onViewMode}
                title="Topic Custom ID *"
                placeholder="Topic Custom ID"
                required
                name="topicCustomId"
                value={topicCustomId}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Topic Title *"
                autocomplete="on"
                placeholder="Topic Title *"
                name="topic"
                value={topic}
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
            <div className="grid grid-cols-2 gap-3 w-full">
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
          </div>
        </div>{" "}
        {/* learningObjectives div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <div className="flex gap-3 items-center">
              <h2>Learning Objectives</h2>
              <p>{learningObjectives.length}</p>
            </div>

            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewLearningObjectivesDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Learning Objective
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2 max-h-[200px] min-h-[100px] overflow-auto">
            {learningObjectives.length < 1 ? (
              <div>No Learning Objectives Added</div>
            ) : (
              learningObjectives.map((learningObjective: string) => {
                return (
                  <button
                    key={learningObjective}
                    onClick={() => {
                      setOnOpenLearningObjectivesDialogData(learningObjective);
                      setEditLearningObjectivesDialog(true);
                    }}
                    className={`${tabGroupButtonStyle} inline-flex gap-2 items-center`}
                  >
                    {learningObjective}
                    <IoClose
                      className="hover:text-red-500 size-[18px]"
                      onClick={(e: React.MouseEvent<SVGElement>) => {
                        e.stopPropagation();
                        setLocalData((prev: any) => ({
                          ...prev,
                          learningObjectives: prev.learningObjectives.filter((s: string) => s !== learningObjective)
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
        {/* resources div */}{" "}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Resource</h2>
            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewResourcesDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Resource
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {resources.length < 1 ? (
              <div>No Resources Added</div>
            ) : (
              resources.map((resource: any) => {
                const { _id, resourceName, url, resourceType } = resource;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenResourcesDialogData(resource);
                      setViewResourcesDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{resourceName || "".slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenResourcesDialogData(resource);
                          setEditResourcesDialog(true);
                          setUnsaved(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            resources: prev.resources.filter((resource: any) => resource._id !== _id)
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor-2 text-[16px]">
                      {resourceType || "".slice(0, 20)}
                    </span>
                    <a
                      href={url || ""}
                      target="_blank"
                      className="font-semibold hover:underline text-blue-500 text-[14px]"
                    >
                      {url || "".slice(0, 50)}
                    </a>
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
