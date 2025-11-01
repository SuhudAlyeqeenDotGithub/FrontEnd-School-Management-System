"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  CustomHeading,
  ActionButtons,
  SearchComponent
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { checkDataType, validateEmail, validatePassword } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { SearchableDropDownInput } from "../general/compLibrary2";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { defaultButtonStyle, nestedMapperStyle } from "@/lib/generalStyles";
import { TabActionDialog } from "./tabActionDialog";
import { allTabs } from "@/lib/defaultVariables";
export const UserDialogComponent = ({
  type,
  onClose,
  onSave,
  data,
  staffProfiles,
  roles
}: {
  type: "new" | "edit" | "view";
  onClose: (close: boolean) => {};
  onSave: (save: boolean) => {};
  roles: any[];
  staffProfiles: any[];
  data?: any;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/admin/users");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/admin/users");
  const [unsaved, setUnsaved] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [userRoleGroups, setUserRoleGroups] = useState<string[]>(
    data?.roleId?.tabAccess.map(({ group }: any) => group.group) || []
  );
  const [userRoleTabs, setUserRoleTabs] = useState<string[]>([]);
  const [openNewTabActionDialog, setOpenNewTabActionDialog] = useState(false);
  const [openEditTabActionDialog, setOpenEditTabActionDialog] = useState(false);
  const [openViewTabActionDialog, setOpenViewTabActionDialog] = useState(false);
  const [tabActionDialogData, setTabActionDialogData] = useState<any>({});
  const [userPermittedActions, setUserPermittedActions] = useState<string[]>([]);
  const [recommendedUniqueTabs, setRecommendedUniqueTabs] = useState<any>([]);
  const [recoTabSearchValue, setRecoTabSearchValue] = useState("");
  const [localData, setLocalData] = useState({
    staffId: onCreateMode ? null : data ? data?.staffId : null,
    userName: onCreateMode ? "" : data ? data.accountName : "",
    userEmail: onCreateMode ? "" : data ? data.accountEmail : "",
    userPassword: onCreateMode ? "" : data ? "Change01@Password123?" : "",
    userStatus: onCreateMode ? "" : data ? data?.accountStatus : "",
    roleId: onCreateMode ? null : data ? data?.roleId : null,
    uniqueTabAccess: onCreateMode ? [] : data ? data?.uniqueTabAccess : []
  });

  const { staffId, userEmail, userPassword, userName, userStatus, roleId, uniqueTabAccess } = localData;
  const isAbsoluteAdminRecord = onCreateMode ? false : roleId && data.roleId.absoluteAdmin;

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
    const groupTabs = roleId?.tabAccess ? roleId?.tabAccess.map((group: any) => group.tabs).flat() : [];
    const userActions =
      groupTabs.length > 0
        ? groupTabs
            .flatMap((tab: any) => {
              return tab.actions.filter(({ permission }: any) => permission === true);
            })
            .map(({ action }: any) => action)
        : [];

    const uniqueTabAccessGroupActions =
      uniqueTabAccess.length > 0
        ? uniqueTabAccess
            .map((tab: any) => {
              return tab.actions.filter(({ permission }: any) => permission === true);
            })
            .map((tab: any) => tab.map(({ action }: any) => action))
            .flat()
        : [];

    setUserPermittedActions(Array.from(new Set([...userActions, ...uniqueTabAccessGroupActions])));
  }, [uniqueTabAccess, roleId]);

  useEffect(() => {
    const assignedUniqueTabs = uniqueTabAccess.map((tab: any) => tab.tab);
    const unAssingnedUniqueTabs = allTabs
      .filter((tabObj: any) => !assignedUniqueTabs.includes(tabObj.tab))
      .map((tab: any) => tab.tab);
    const allRoleTabs = roleId?.tabAccess ? roleId?.tabAccess.flatMap((group: any) => group.tabs) : [];
    const allRoleCompletePermittedTabs = allRoleTabs
      .filter((tabObj: any) => {
        const noOfRoleTabsActions = tabObj.actions.length;
        const noOfRoleTabsPermittedActions = tabObj.actions.filter(({ permission }: any) => permission === true).length;
        return noOfRoleTabsActions === noOfRoleTabsPermittedActions;
      })
      .map((tab: any) => tab.tab)
      .flat();
    const unAssignedUnique_inCompletePermittedTabs = unAssingnedUniqueTabs.filter(
      (tab: any) => !allRoleCompletePermittedTabs.includes(tab)
    );

    const recoTabs = allTabs.filter((tabObj: any) => unAssignedUnique_inCompletePermittedTabs.includes(tabObj.tab));

    setRecommendedUniqueTabs(recoTabs);
  }, [roleId, uniqueTabAccess]);

  useEffect(() => {
    const assignedUniqueTabs = uniqueTabAccess.map((tab: any) => tab.tab);
    const unAssingnedUniqueTabs = allTabs
      .filter((tabObj: any) => !assignedUniqueTabs.includes(tabObj.tab))
      .map((tab: any) => tab.tab);
    const allRoleTabs = roleId?.tabAccess ? roleId?.tabAccess.flatMap((group: any) => group.tabs) : [];
    const allRoleCompletePermittedTabs = allRoleTabs
      .filter((tabObj: any) => {
        const noOfRoleTabsActions = tabObj.actions.length;
        const noOfRoleTabsPermittedActions = tabObj.actions.filter(({ permission }: any) => permission === true).length;
        return noOfRoleTabsActions === noOfRoleTabsPermittedActions;
      })
      .map((tab: any) => tab.tab)
      .flat();
    const unAssignedUnique_inCompletePermittedTabs = unAssingnedUniqueTabs.filter(
      (tab: any) => !allRoleCompletePermittedTabs.includes(tab)
    );

    const recoTabs = allTabs.filter((tabObj: any) => unAssignedUnique_inCompletePermittedTabs.includes(tabObj.tab));

    if (recoTabSearchValue !== "") {
      const filteredData = recoTabs.filter((tab: any) =>
        `${tab.tab} >> ${tab.group}`.toLowerCase().trim().includes(recoTabSearchValue.toLowerCase().trim())
      );
      setRecommendedUniqueTabs(filteredData);
    } else {
      setRecommendedUniqueTabs(recoTabs);
    }
  }, [recoTabSearchValue]);

  const getTabGroup = (tab: string) => {
    return allTabs.find((tabObj: any) => tabObj.tab === tab)?.group;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    if (!userName) {
      setError("Missing Data: Please enter a user name");
      return false;
    }
    if (!staffId && !isAbsoluteAdminRecord) {
      setError("Missing Data: Please enter a staff Id");
      return false;
    }
    if (userName.length < 5) {
      setError("Data Error: Role name is too short");
      return false;
    }

    if (!validateEmail(userEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!userStatus) {
      setError(" Please select the user status");
      return;
    }

    if (!validatePassword(userPassword)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and at least one special character [!@#$%^&~*]."
      );
      return;
    }

    if (!roleId) {
      setError("Data Error: Please select a role");
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const dataToCreate = { ...localData, roleId: localData.roleId?._id, staffId: localData.staffId?._id };
        const response = await createMutation.mutateAsync(dataToCreate);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Creating User");
      }
    }
  };

  const handleUpdateUser = async () => {
    if (validationPassed()) {
      setError("");

      try {
        const dataToUpdate = {
          ...localData,
          roleId: localData.roleId?._id,
          staffId: localData.staffId?._id,
          _id: data?._id,
          userPassword: userPassword === "Change01@Password123?" ? "unchanged" : localData.userPassword,
          onEditUserIsAbsoluteAdmin: data?.roleId?.absoluteAdmin || false
        };
        const response = await updateMutation.mutateAsync(dataToUpdate);
        if (response?.data) {
          onSave(true);
        }
      } catch (err: any) {
        setError(err.message || err.response.data.message || "Error Updating User");
      }
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="usersDialogContainer" style="w-[65%] h-[90%] gap-5 overflow-auto flex flex-col">
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("usersDialogContainer");
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
        {openNewTabActionDialog && (
          <TabActionDialog
            type="new"
            tabData={tabActionDialogData}
            onClose={(open) => {
              setOpenNewTabActionDialog(!open);
            }}
            onUpdate={(type, data, tabToSaveActionTo) => {
              if (type === "new") {
                setLocalData((prev: any) => {
                  return {
                    ...prev,
                    uniqueTabAccess: [
                      ...prev.uniqueTabAccess,
                      { tab: tabToSaveActionTo, group: getTabGroup(tabToSaveActionTo), actions: data }
                    ]
                  };
                });
              }

              setUnsaved(true);
              setOpenNewTabActionDialog(!open);
            }}
          />
        )}
        {openEditTabActionDialog && (
          <TabActionDialog
            type="edit"
            tabData={tabActionDialogData}
            onClose={(open) => {
              setOpenEditTabActionDialog(!open);
            }}
            onUpdate={(type, data, tabToSaveActionTo) => {
              if (type === "edit") {
                setLocalData((prev: any) => {
                  return {
                    ...prev,
                    uniqueTabAccess: prev.uniqueTabAccess.map((tabObj: any) => {
                      return tabObj.tab === tabToSaveActionTo ? { ...tabObj, actions: data } : tabObj;
                    })
                  };
                });
              }

              setUnsaved(true);
              setOpenEditTabActionDialog(!open);
            }}
          />
        )}
        {openViewTabActionDialog && (
          <TabActionDialog
            type="view"
            tabData={tabActionDialogData}
            onClose={(open) => {
              setOpenViewTabActionDialog(!open);
            }}
            onUpdate={(type, data, tabToSaveActionTo) => {
              setUnsaved(true);
              setOpenViewTabActionDialog(!open);
            }}
          />
        )}
        {/* top div */}
        <div className="flex justify-between items-center">
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} User</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating User..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateUser}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving User..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleUpdateUser}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit User")}
                hidden={!hasActionAccess("Edit User")}
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
                const container = document.getElementById("usersDialogContainer");
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
          <div className="grid grid-cols-2 gap-3 w-full">
            {!isAbsoluteAdminRecord && (
              <SearchableDropDownInput
                defaultText={!staffId ? "" : `${staffId._id}|${staffId.staffCustomId}`}
                disabled={onViewMode}
                title="Staff Id*"
                placeholder="Search Staff - ID or Name *"
                data={staffProfiles}
                displayKeys={["_id", "staffCustomId", "staffFullName", "staffEmail"]}
                onSelected={(selectedData, save) => {
                  const staffObj = staffProfiles.find((staff: any) => staff._id === selectedData[0]);
                  if (save) {
                    setLocalData((prev: any) => ({
                      ...prev,
                      staffId: staffObj._id,
                      userName: staffObj.staffCustomId,
                      userEmail: staffObj.staffEmail
                    }));
                    setUnsaved(true);
                  }
                }}
                onClearSearch={(cleared) => {
                  if (cleared) {
                  }
                }}
              />
            )}
            <InputComponent
              title="User Name (Auto-fills) *"
              disabled={onViewMode}
              placeholder="User Name *"
              required
              name="userName"
              value={userName}
              onChange={handleInputChange}
            />
            <InputComponent
              title="User Email *"
              disabled={onViewMode}
              placeholder="User Email *"
              required
              name="userEmail"
              value={userEmail}
              onChange={handleInputChange}
            />
            <InputComponent
              title="User Password *"
              disabled={onViewMode}
              placeholder="Assign User Password*"
              required
              name="userPassword"
              value={userPassword}
              onChange={handleInputChange}
            />
            <SearchableDropDownInput
              disabled={isAbsoluteAdminRecord || onViewMode}
              defaultText={roleId ? `${roleId?._id}|${roleId?.roleName}` : ""}
              placeholder="Search Role - (ID, Name)"
              data={roles}
              displayKeys={["_id", "roleName", "searchText", "tabAccess"]}
              onSelected={(selectedData, save) => {
                const roleObj = roles.find((role: any) => role._id === selectedData[0]);
                setLocalData((prev) => ({
                  ...prev,
                  roleId: roleObj
                }));
                setUnsaved(save);

                const userTabAccess = roleObj && roleObj.tabAccess ? roleObj.tabAccess : [];
                const groupTabs = userTabAccess.flatMap((group: any) => group.tabs);
                setUserRoleGroups(userTabAccess.map((group: any) => group.group));
                setUserRoleTabs(groupTabs.map((tab: any) => tab.tab));
              }}
              onClearSearch={(clearTabPermission) => {
                if (clearTabPermission) {
                  setUserRoleGroups([]);
                  setUserPermittedActions([]);
                  setUserRoleTabs([]);
                }
              }}
            />
            <SelectInputComponent
              title="User Status *"
              placeholder="User Status *"
              disabled={isAbsoluteAdminRecord || onViewMode}
              name="userStatus"
              value={userStatus}
              options={[
                { value: "Active", label: "Active" },
                { value: "Locked", label: "Locked" }
              ]}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* tab access div */}
        <div className="flex flex-col border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          <CustomHeading variation="head3">Selected Role Tab Access</CustomHeading>
          <CustomHeading hidden={onViewMode} variation="head6light">
            Group / Tabs Access comes from the selected role
          </CustomHeading>
          <div className="flex flex-col mt-4 gap-2">
            <CustomHeading variation="head5">Groups</CustomHeading>
            <div className="flex flex-wrap gap-2">
              {isAbsoluteAdminRecord ? (
                <div>Has All Groups</div>
              ) : userRoleGroups.length < 1 ? (
                <div>No Tab Access</div>
              ) : (
                userRoleGroups.map((group: any) => (
                  <span
                    key={group}
                    className="max-h-10 px-4 py-2 flex items-center gap-2 border border-borderColor text-foregroundColor-2 bg-backgroundColor hover:bg-backgroundColor-2 hover:cursor-pointer rounded-lg shadow-sm disabled:cursor-not-allowed"
                  >
                    {group}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col mt-5 gap-2">
            <CustomHeading variation="head5">Tabs</CustomHeading>
            <div className="flex flex-wrap gap-2">
              {isAbsoluteAdminRecord ? (
                <div>Has All Tabs</div>
              ) : userRoleTabs.length < 1 ? (
                <div>No Tab Access</div>
              ) : (
                userRoleTabs.map((tab: any) => (
                  <span
                    key={tab}
                    className="max-h-10 px-4 py-2 flex items-center gap-2 border border-borderColor text-foregroundColor-2 bg-backgroundColor hover:bg-backgroundColor-2 hover:cursor-pointer rounded-lg shadow-sm disabled:cursor-not-allowed"
                  >
                    {tab}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        {/* unique tab access div */}
        <div className="flex flex-col border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          <CustomHeading variation="head3">Unique Tab Access</CustomHeading>
          <CustomHeading hidden={onViewMode} variation="head6light">
            Unique Tab Access is specific to this user in addition to the selected role. Can be added or removed
          </CustomHeading>
          {!onViewMode && (
            <div className="flex flex-col mt-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-3">
              <div className="flex gap-5">
                <CustomHeading variation="head5">
                  Recommended Tabs - Click on button to add to unique tab access
                </CustomHeading>
                <SearchComponent
                  placeholder="Search Tab / Group (Name)"
                  name="recoTabSearchValue"
                  value={recoTabSearchValue}
                  onChange={(e) => {
                    setRecoTabSearchValue(e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-6 max-h-[200px] min-h-[100px] overflow-auto">
                {recommendedUniqueTabs.length < 1 && !recoTabSearchValue ? (
                  <div className="text-foregroundColor-2">
                    <b>You have access to all tabs</b>
                  </div>
                ) : recommendedUniqueTabs.length < 1 && recoTabSearchValue ? (
                  <div className="text-foregroundColor-2">
                    <b>No tabs match your search</b>
                  </div>
                ) : (
                  recommendedUniqueTabs.map((tab: any) => (
                    <button
                      disabled={onViewMode}
                      hidden={onViewMode}
                      key={tab.tab}
                      onClick={() => {
                        setTabActionDialogData(tab);
                        setOpenNewTabActionDialog(true);
                      }}
                      className="max-h-10 px-4 py-2 flex items-center gap-2 border border-borderColor text-foregroundColor-2 bg-backgroundColor hover:bg-backgroundColor-2 hover:cursor-pointer rounded-lg shadow-sm disabled:cursor-not-allowed"
                    >
                      {tab.group + " >> " + tab.tab}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col mt-5 gap-2 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-3">
            <CustomHeading variation="head5">Added Tabs - Click on button to remove or edit</CustomHeading>
            <div>
              <div className="w-full flex gap-8 py-3 justify-between px-4 overflow-hidden">
                <span className="w-[180px] font-semibold whitespace-nowrap">Group</span>
                <span className="w-[180px] font-semibold whitespace-nowrap">Tabs</span>

                <span className="w-[100px] font-semibold whitespace-nowrap">Actions</span>
              </div>
              <div className="max-h-[200px] min-h-[100px] overflow-auto">
                <div className="flex flex-wrap gap-2">
                  {isAbsoluteAdminRecord ? (
                    <div className="text-center w-full">
                      Has All Tabs
                      <p></p>
                    </div>
                  ) : uniqueTabAccess.length < 1 ? (
                    <div className="text-center w-full">
                      No Tab Access
                      <p></p>
                    </div>
                  ) : (
                    uniqueTabAccess.map((tabObj: any) => (
                      <div
                        key={tabObj?.tab}
                        onClick={(e) => {
                          setTabActionDialogData({ ...tabObj, mode: "view" });
                          setOpenViewTabActionDialog(true);
                        }}
                        className={nestedMapperStyle}
                      >
                        {" "}
                        <span className="w-[180px] whitespace-nowrap">{tabObj?.tab}</span>
                        <span className="w-[180px] whitespace-nowrap">{tabObj?.group}</span>
                        {!onViewMode && (
                          <span className="w-[180px] whitespace-nowrap flex justify-center items-center">
                            <ActionButtons
                              hideDelete={onViewMode}
                              hideEdit={onViewMode}
                              disableDelete={onViewMode}
                              disableEdit={onViewMode}
                              onEdit={(e) => {
                                setTabActionDialogData({ ...tabObj, mode: "edit" });
                                setOpenEditTabActionDialog(true);
                              }}
                              onDelete={(e) => {
                                setLocalData((prev: any) => ({
                                  ...prev,
                                  uniqueTabAccess: prev.uniqueTabAccess.filter(
                                    (innerTab: any) => innerTab.tab !== tabObj.tab && innerTab
                                  )
                                }));
                                setUnsaved(true);
                              }}
                            />
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          <CustomHeading variation="head3">All permitted actions</CustomHeading>
          <CustomHeading hidden={onViewMode} variation="head6light">
            All permitted actions comes from the selected role and unique tab access
          </CustomHeading>
          <div className="max-h-[200px] min-h-[100px] overflow-auto mt-5">
            <div className="flex flex-wrap gap-2">
              {isAbsoluteAdminRecord ? (
                <div className="text-center w-full">Has All Permissions</div>
              ) : userPermittedActions.length < 1 ? (
                <div className="text-center w-full">No Permitted Actions</div>
              ) : (
                userPermittedActions.map((action: any) => (
                  <span
                    key={action}
                    className="max-h-10 px-4 py-2 flex items-center gap-2 border border-borderColor text-foregroundColor-2 bg-backgroundColor hover:bg-backgroundColor-2 hover:cursor-pointer rounded-lg shadow-sm disabled:cursor-not-allowed"
                  >
                    {action}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};
