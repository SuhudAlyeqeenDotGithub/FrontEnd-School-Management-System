"use client";
import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  TextAreaComponent,
  CustomHeading,
  SearchComponent,
  DeleteButton,
  ActionButtons
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { checkDataType } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { DisallowedActionDialog } from "../general/compLibrary2";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { defaultButtonStyle, ghostbuttonStyle, nestedMapperStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import { allGroups } from "@/lib/defaultVariables";
import { GroupTabDialog } from "./groupTabDialog";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { on } from "events";
import reusableQueries from "@/tanStack/reusables/reusableQueries";

export const RoleDialog = ({
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
  const { tanMutateAny } = useReusableMutations();
  const { hasActionAccess } = reusableQueries();

  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/admin/roles");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/admin/roles");

  const initialLocalData = {
    roleId: type === "edit" && data ? data._id : type === "view" && data ? data._id : "",
    roleName: type === "edit" && data ? data.roleName : type === "view" && data ? data.roleName : "",
    roleDescription:
      type === "edit" && data ? data.roleDescription : type === "view" && data ? data.roleDescription : "",
    groups: type === "edit" && data ? data.tabAccess : type === "view" && data ? data.tabAccess : []
  };

  const [localData, setLocalData] = useState<any>(initialLocalData);
  // console.log("localData", localData);
  const [recommendedGroups, setRecommendedGroups] = useState<any>([]);
  const [unsaved, setUnsaved] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [openNewGroupTabDialog, setOpenNewGroupTabDialog] = useState(false);
  const [openEditGroupTabDialog, setOpenEditGroupTabDialog] = useState(false);
  const [openViewGroupTabDialog, setOpenViewGroupTabDialog] = useState(false);
  const [groupTabDialogData, setGroupTabDialogData] = useState({ mode: "view", group: "", tabs: [] });
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [error, setError] = useState("");
  const { roleName, roleDescription, groups } = localData;

  useEffect(() => {
    const assignedGroups = groups.map((group: any) => group.group);
    const recoGroups = allGroups.filter((group: any) => !assignedGroups.includes(group));

    setRecommendedGroups(recoGroups);
  }, [localData]);

  useEffect(() => {
    if (onViewMode) {
      setOnEditMode(false);
      setOnCreateMode(false);
    }
  }, [onViewMode]);

  useEffect(() => {
    if (onEditMode) {
      setOnViewMode(false);
      setOnCreateMode(false);
    }
  }, [onEditMode]);

  useEffect(() => {
    if (onCreateMode) {
      setOnEditMode(false);
      setOnViewMode(false);
    }
  }, [onCreateMode]);

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  // effect to have searching
  // useEffect(() => {
  //   if (searchValue !== "") {
  //     const filteredData = groups.filter((group: any) => group.group.toLowerCase().includes(searchValue.toLowerCase()));
  //     setLocalData((prev: any) => ({ ...prev, groups: filteredData }));
  //   } else {
  //     setLocalData(initialLocalData);
  //   }
  // }, [searchValue]);

  // function to handle sorting

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDeleteTab = () => {
    setUnsaved(true);
  };
  const validationPassed = () => {
    if (!roleName) {
      setError("Missing Data: Please enter a role name");
      return false;
    } else if (roleName.length < 5) {
      setError("Data Error: Role name is too short");
      return false;
    }

    return true;
  };

  return (
    <ContainerComponent id="roleDialogContainer" style="w-[60%] h-[90%] gap-5 overflow-auto flex flex-col">
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
            const container = document.getElementById("roleDialogContainer");
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
      {openNewGroupTabDialog && (
        <div className="w-[100%] h-[100%] z-50 bg-foregroundColor-transparent items-center justify-center flex fixed inset-0">
          <GroupTabDialog
            type="new"
            data={groupTabDialogData}
            onClose={() => setOpenNewGroupTabDialog(false)}
            onUpdate={(type, data: any, groupToSaveTo: string) => {
              if (type === "new") {
                setLocalData((prev: any) => ({
                  ...prev,
                  groups: [...prev.groups, { group: groupToSaveTo, tabs: data }]
                }));
              }
              setUnsaved(true);
              setOpenNewGroupTabDialog(false);
              setUnsaved(true);
            }}
          />
        </div>
      )}
      {openEditGroupTabDialog && (
        <div className="w-[100%] h-[100%] z-50 bg-foregroundColor-transparent items-center justify-center flex fixed inset-0">
          <GroupTabDialog
            type="edit"
            data={groupTabDialogData}
            onClose={() => setOpenEditGroupTabDialog(false)}
            onUpdate={(type, data: any, groupToSaveTo: string) => {
              if (type === "edit") {
                setLocalData((prev: any) => ({
                  ...prev,
                  groups: prev.groups.map(({ group, tabs }: any) =>
                    group === groupToSaveTo ? { group, tabs: data } : { group, tabs }
                  )
                }));
              }
              setUnsaved(true);
              setOpenEditGroupTabDialog(false);
              setUnsaved(true);
            }}
          />
        </div>
      )}

      {openViewGroupTabDialog && (
        <div className="w-[100%] h-[100%] z-50 bg-foregroundColor-transparent items-center justify-center flex fixed inset-0">
          <GroupTabDialog
            type="view"
            data={groupTabDialogData}
            onClose={() => setOpenViewGroupTabDialog(false)}
            onUpdate={(type, data: any, groupToSaveTo: string) => {
              if (type === "edit") {
                setLocalData((prev: any) => ({
                  ...prev,
                  groups: prev.groups.map(({ group, tabs }: any) =>
                    group === groupToSaveTo ? { group, tabs: [...tabs, data] } : { group, tabs }
                  )
                }));
              }
              setUnsaved(true);
              setOpenViewGroupTabDialog(false);
              setUnsaved(true);
            }}
          />
        </div>
      )}

      {openDisallowedDeleteDialog && (
        <DisallowedActionDialog
          warningText="This delete action is disallowed as it relates to the default Admin role"
          onOk={() => {
            setOpenDisallowedDeleteDialog(false);
          }}
        />
      )}
      {/* top div */}
      <div className="flex justify-between items-center">
        <CustomHeading variation="head2">
          {onViewMode ? "View Role" : onEditMode ? "Edit Role" : "Create Role"}
        </CustomHeading>

        <div className="flex justify-between items-center gap-5">
          {onEditMode ? (
            <LoaderButton
              buttonText="Save"
              loadingButtonText={type === "edit" ? "Saving Changes..." : "Creating Role..."}
              disabled={!unsaved}
              buttonStyle={defaultButtonStyle}
              isLoading={updateMutation.isPending}
              onClick={async () => {
                if (validationPassed()) {
                  setError("");
                  const { groups, ...rest } = localData;
                  const dataToSend = { ...rest, tabAccess: groups };

                  try {
                    const response = await updateMutation.mutateAsync(dataToSend);
                    if (response?.data) {
                      onSave(true);
                    }
                  } catch (err: any) {
                    setError(err.message);
                  }
                }
              }}
            />
          ) : onCreateMode ? (
            <LoaderButton
              buttonText="Create"
              loadingButtonText="Creating Role..."
              disabled={!unsaved}
              buttonStyle={defaultButtonStyle}
              isLoading={createMutation.isPending}
              onClick={async () => {
                if (validationPassed()) {
                  setError("");
                  const { groups, ...rest } = localData;
                  const dataToSend = { ...rest, tabAccess: groups };

                  try {
                    const response = await createMutation.mutateAsync(dataToSend);
                    if (response?.data) {
                      onSave(true);
                    }
                  } catch (err: any) {
                    setError(err.message);
                  }
                }
              }}
            />
          ) : (
            <button
              className={defaultButtonStyle}
              disabled={!hasActionAccess("Edit Role")}
              hidden={!hasActionAccess("Edit Role")}
              onClick={() => {
                if (hasActionAccess("Edit Role")) {
                  setOnEditMode(true);
                } else {
                  setError("You do not have Edit access - Please contact your admin");
                }
              }}
            >
              Edit
            </button>
          )}
          <IoClose
            onClick={() => {
              if (!unsaved) {
                onClose(true);
              }
              const container = document.getElementById("roleDialogContainer");
              if (container) {
                container.style.overflow = "hidden";
              }
              setOpenUnsavedDialog(true);
            }}
            className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer"
          />
        </div>
      </div>
      {/* input divs */}
      <div className="flex flex-col gap-4 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
        <InputComponent
          disabled={onViewMode}
          title="Role Name *"
          type=""
          placeholder="Role Name"
          required
          name="roleName"
          value={roleName}
          onChange={handleInputChange}
        />
        <TextAreaComponent
          disabled={onViewMode}
          title="Role Description *"
          placeholder="Role Description"
          required
          name="roleDescription"
          value={roleDescription}
          onChange={handleInputChange}
        />
      </div>
      {/* tab access div */}
      <div className="border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2 flex flex-col gap-10 h-full">
        <div hidden={onViewMode} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <CustomHeading variation="head3">Tab Groups</CustomHeading>
            <CustomHeading hidden={onViewMode} variation="head6light">
              Click on each button to add the tab group for this role
            </CustomHeading>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedGroups.length < 1 ? (
              <div className="text-foregroundColor-2">
                <b>You have access to all group</b> - {groups.map((groupObj: any) => groupObj.group).join(" | ")}
              </div>
            ) : (
              recommendedGroups.map((group: any) => {
                return (
                  <button
                    disabled={onViewMode}
                    key={group}
                    onClick={() => {
                      setGroupTabDialogData({ ...groupTabDialogData, group, tabs: [], mode: "new" });
                      setOpenNewGroupTabDialog(true);
                    }}
                    className={tabGroupButtonStyle}
                  >
                    {group}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* data table div */}
        <div className="flex flex-col gap-2">
          {/* title */}

          <div className="flex flex-col mb-2">
            <CustomHeading variation="head3">{onViewMode ? "View" : "Edit"} Tab Groups</CustomHeading>
            <CustomHeading variation="head6light">Specify permitted actions for each tab</CustomHeading>
          </div>
          {/* search bar and new action Button */}
          {/* <div className="flex justify-between items-center">
            <SearchComponent
              placeholder="Search Tab (Name)"
              name="searchValue"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div> */}

          {/* table body */}
          <div className="flex flex-col">
            {/* table header */}
            <div className="w-full flex mt-2">
              <div className="w-full flex gap-8 py-3 justify-between px-4 overflow-hidden">
                <span className="w-[180px] font-semibold whitespace-nowrap">Groups</span>
                <span className="font-semibold whitespace-nowrap w-full">Tabs</span>
                <span className="w-[100px] font-semibold whitespace-nowrap">Actions</span>
              </div>
            </div>

            {/* table data */}
            <div className="flex flex-col gap-2">
              {groups.length < 1 ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : groups.length < 1 ? (
                <div className="flex justify-center mt-6">No Group has been added for this role</div>
              ) : (
                groups.map((groupObj: any) => {
                  const { group, tabs } = groupObj;
                  const permittedTabs = tabs
                    .map((tab: any) => tab.tab)
                    .slice(0, 2)
                    .join(", ");
                  return (
                    <div
                      key={group}
                      onClick={(e) => {
                        console.log("data passed in", { ...groupObj, mode: "view" });
                        console.log("groups", groups);
                        setGroupTabDialogData({ ...groupObj, mode: "view" });
                        setOpenViewGroupTabDialog(true);
                      }}
                      className={nestedMapperStyle}
                    >
                      <span className="w-[180px] whitespace-nowrap">{group}</span>
                      <span className="whitespace-nowrap overflow-x-auto w-full">
                        {permittedTabs.length < 1 ? "No actions allowed yet" : permittedTabs}.....
                      </span>

                      <span className="w-[180px] whitespace-nowrap flex justify-center items-center">
                        <ActionButtons
                          hideDelete={onViewMode}
                          hideEdit={onViewMode}
                          disableDelete={onViewMode}
                          disableEdit={onViewMode}
                          onEdit={(e) => {
                            setGroupTabDialogData({ ...groupObj, mode: "edit" });
                            setOpenEditGroupTabDialog(true);
                          }}
                          onDelete={(e) => {
                            setLocalData((prev: any) => ({
                              ...prev,
                              groups: prev.groups.filter((groupObj: any) => groupObj.group !== group)
                            }));

                            setUnsaved(true);
                          }}
                        />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </ContainerComponent>
  );
};
