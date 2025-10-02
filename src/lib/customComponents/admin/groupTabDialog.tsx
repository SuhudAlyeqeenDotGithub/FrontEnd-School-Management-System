"use client";
import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  TextAreaComponent,
  CheckBoxComponent,
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
import { TabActionDialog } from "./tabActionDialog";
import { allTabs } from "@/lib/defaultVariables";
import { defaultButtonStyle, nestedMapperStyle, tabGroupButtonStyle } from "@/lib/generalStyles";

export const GroupTabDialog = ({
  type,
  data,
  onClose,
  onUpdate
}: {
  type: "new" | "edit" | "view";
  data: any;
  onClose: (close: boolean) => void;
  onUpdate: (type: string, data: any, groupToAddTo: string) => void;
}) => {
  const { handleUnload } = useNavigationHandler();

  const onViewMode = data.mode === "view";
  const [localData, setLocalData] = useState<any>({ group: data.group, tabs: data.tabs });

  // console.log("localData", localData);
  const [recommendedTabs, setRecommendedTabs] = useState<any>([]);
  const [unsaved, setUnsaved] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [openNewTabActionDialog, setOpenNewTabActionDialog] = useState(false);
  const [openEditTabActionDialog, setOpenEditTabActionDialog] = useState(false);
  const [openViewTabActionDialog, setOpenViewTabActionDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [tabActionDialogData, setTabActionDialogData] = useState<any>({});
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  const { tabs, group } = localData;

  useEffect(() => {
    const groupTabs = allTabs.filter((tabObj: any) => tabObj.group === group);
    const assignedTabs = tabs.map((tab: any) => tab.tab);
    const recoTabs = groupTabs.filter((tabObj: any) => !assignedTabs.includes(tabObj.tab));
    setRecommendedTabs(recoTabs);
  }, [localData]);

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  // effect to have searching
  useEffect(() => {
    if (searchValue !== "") {
      const filteredData = tabs.filter((tab: any) => tab.tab.toLowerCase().includes(searchValue.toLowerCase()));
      setLocalData((prev: any) => ({ ...prev, tabs: filteredData }));
    } else {
      setLocalData({ group: data.group, tabs: data.tabs });
    }
  }, [searchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDeleteTab = () => {
    setUnsaved(true);
  };

  return (
    <ContainerComponent id="groupTabContainer" style="w-[50%] h-[80%] gap-5 overflow-auto flex flex-col py-5">
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
                  tabs: [...prev.tabs, { tab: tabToSaveActionTo, group, actions: data }]
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
                  tabs: prev.tabs.map((tabObj: any) => {
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
      {openUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onNo={() => {
            const container = document.getElementById("groupTabContainer");
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
        <div className="flex flex-col">
          <CustomHeading variation="head2">Configure {group} Tabs</CustomHeading>
          <CustomHeading variation="head6light">
            Click on each button to assign tab access of this {group} group
          </CustomHeading>
        </div>

        <div className="flex justify-between items-center gap-5">
          {!onViewMode && (
            <LoaderButton
              buttonText="Save"
              loadingButtonText="Saving..."
              disabled={!unsaved}
              buttonStyle={defaultButtonStyle}
              onClick={() => {
                onUpdate(type, tabs, group);
              }}
            />
          )}
          <IoClose
            onClick={() => {
              if (!unsaved) {
                onClose(true);
              }
              const container = document.getElementById("groupTabContainer");
              if (container) {
                container.style.overflow = "hidden";
              }
              setOpenUnsavedDialog(true);
            }}
            className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer"
          />
        </div>
      </div>

      {/* tab access div */}
      <div className="gap-5 flex flex-col h-full">
        <div
          hidden={onViewMode}
          className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2"
        >
          <div className="flex flex-col">
            <CustomHeading variation="head3">Tab Access</CustomHeading>
            {!onViewMode && (
              <CustomHeading variation="head6light">
                Click on each button to add the tab access to this role
              </CustomHeading>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedTabs.length < 1 ? (
              <div className="text-foregroundColor-2">
                <b>You have access to all tabs</b>- {tabs.map((tabObj: any) => tabObj.tab).join(" | ")}
              </div>
            ) : (
              recommendedTabs.map((tab: any) => (
                <button
                  disabled={onViewMode}
                  hidden={onViewMode}
                  key={tab.tab}
                  onClick={() => {
                    setTabActionDialogData(tab);
                    setOpenNewTabActionDialog(true);
                  }}
                  className={tabGroupButtonStyle}
                >
                  {tab.tab}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* title */}
          <div className="flex flex-col mb-2">
            <CustomHeading variation="head3">Permitted Actions</CustomHeading>
            <CustomHeading variation="head6light">Specify permitted actions for each tab</CustomHeading>
          </div>
          {/* search bar and new action Button */}
          <div className="flex justify-between items-center">
            <SearchComponent
              placeholder="Search Tab (Name)"
              name="searchValue"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* table body */}
          <div className="flex flex-col">
            {/* table header */}
            <div className="w-full flex mt-2">
              <div className="w-full flex gap-5 py-3 justify-between px-4 overflow-hidden">
                <span className="w-[180px] font-semibold whitespace-nowrap">Tabs</span>
                <span className="font-semibold whitespace-nowrap">Permitted Actions</span>
                <span className="w-[100px] font-semibold whitespace-nowrap">Actions</span>
              </div>
            </div>

            {/* table data */}
            <div className="flex flex-col gap-2">
              {tabs.length < 1 && searchValue ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : tabs.length < 1 ? (
                <div className="flex justify-center mt-6">No Tab Access has been added for this role</div>
              ) : (
                tabs.map((tabObj: any) => {
                  const { tab, actions } = tabObj;
                  const permittedActions = actions
                    .map((action: any) => (action.permission === true ? action.action : ""))
                    .filter((data: any) => data !== "")
                    .slice(0, 2)
                    .join(", ");
                  return (
                    <div
                      key={tab}
                      onClick={(e) => {
                        setTabActionDialogData({ ...tabObj, mode: "view" });
                        setOpenViewTabActionDialog(true);
                      }}
                      className={nestedMapperStyle}
                    >
                      <span className="w-[180px] whitespace-nowrap">{tab}</span>
                      <span className="whitespace-nowrap items-center overflow-x-auto w-full">
                        {permittedActions.length < 1 ? "No actions allowed yet" : permittedActions}.....
                      </span>

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
                              tabs: prev.tabs.filter((innerTab: any) => innerTab.tab !== tab && innerTab)
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

//   { group, tabs: data } --- CORRECT

//  { group, tabs: [...tabs, data] } --- WRONG
