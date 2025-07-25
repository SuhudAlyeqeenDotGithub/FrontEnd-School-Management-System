"use client";
import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { checkDataType } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { DisallowedActionDialog } from "../general/compLibrary2";
import { TabActionDialog } from "./editRoleComponents";
import { createRole } from "@/redux/features/admin/roles/roleThunks";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

export const NewRoleDialog = ({
  onClose,
  onCreate
}: {
  onClose: (close: boolean) => {};
  onCreate: (create: boolean) => {};
}) => {
  const { handleUnload } = useNavigationHandler();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.rolesAccess);
  const [localData, setLocalData] = useState<any>({
    roleName: "",
    roleDescription: "",
    tabAccess: []
  });
  // console.log("localData", localData);
  const [recommendedTabs, setRecommendedTabs] = useState<any>([]);
  const [unsaved, setUnsaved] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [openTabActionDialog, setOpenTabActionDialog] = useState(false);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [tabActionDialogData, setTabActionDialogData] = useState<any>({});
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const { roleId, roleName, roleDescription, tabAccess } = localData;
  useEffect(() => {
    const tabs = ["Admin", "Attendance", "Course", "Staff", "Student", "Enrollment", "Academic Year"];
    const assignedTabs = tabAccess.map((tabObj: any) => tabObj.tab);
    const recoTabs = tabs.filter((tab) => !assignedTabs.includes(tab));
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
      const filteredData = tabAccess.filter((tab: any) => tab.tab.toLowerCase().includes(searchValue.toLowerCase()));
      setLocalData((prev: any) => ({ ...prev, tabAccess: filteredData }));
    } else {
      setLocalData((prev: any) => ({ ...prev, tabAccess: localData.tabAccess }));
    }
  }, [searchValue]);

  // function to handle sorting
  const handleSort = (sortKey: any) => {
    const keyType = checkDataType([...tabAccess][0][sortKey]);

    const sortOrder = sortOrderTracker[sortKey];

    let nextOrder: string;

    if (sortOrder === "dsc") {
      nextOrder = "asc";
    } else {
      nextOrder = "dsc";
    }
    // console.log("localData", localData);
    // console.log("sortKey", sortKey);
    // console.log("first item", [...localData][0][keys[sortKey]]);console.log("keyType", keyType);
    // console.log("sortOrder", sortOrder);
    const sortedData = [...tabAccess].sort((a, b) => {
      if (keyType === "number" || keyType === "date") {
        return sortOrder === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      } else if (keyType === "array") {
        return sortOrder === "asc"
          ? a[sortKey][0].name.localeCompare(b[sortKey][0].name)
          : b[sortKey][0].name.localeCompare(a[sortKey][0].name);
      } else {
        return sortOrder === "asc" ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      }
    });

    setLocalData((prev: any) => ({ ...prev, tabAccess: sortedData }));
    setSortOrderTracker((prev: any) => ({ ...prev, [sortKey]: nextOrder }));
  };

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
  const textAreaStyle =
    "border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full h-[100px] overflow-auto";

  const defaultTabActions: any = {
    Admin: [
      "Create Role",
      "Edit Role",
      "Delete Role",
      "View Roles",
      "Create User",
      "Edit User",
      "Delete User",
      "View Users",
      "View Activity Logs"
    ],
    Course: [
      "Create Course",
      "Edit Course",
      "Delete Course",
      "View Courses",
      "Create Level",
      "Edit Level",
      "Delete Level",
      "View Levels",
      "Create Subject",
      "Edit Subject",
      "Delete Subject",
      "View Subjects"
    ],
    Student: ["Create Student", "Edit Student", "Delete Student", "View Students"],
    Enrollment: ["Create Enrollment", "Edit Enrollment", "Delete Enrollment", "View Enrollments"],
    Attendance: ["Create Attendance", "Edit Attendance", "Delete Attendance", "View Attendances"],
    Staff: [
      "Create Staff",
      "Edit Staff",
      "Delete Staff",
      "View Staff",
      "Create Staff Contract",
      "Edit Staff Contract",
      "Delete Staff Contract",
      "View Staff Contracts"
    ],
    "Academic Year": ["Create Academic Year", "Edit Academic Year", "Delete Academic Year", "View Academic Years"]
  };
  return (
    <ContainerComponent id="roleDialogContainer" style="w-[60%] h-[90%] gap-10 overflow-auto flex flex-col">
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
      {openTabActionDialog && (
        <TabActionDialog
          tabData={tabActionDialogData}
          roleData={{ roleId, roleName }}
          onClose={(open) => {
            setOpenTabActionDialog(!open);
            return {};
          }}
          onSave={(data, tabToSaveActionTo) => {
            setLocalData((prev: any) => ({
              ...prev,
              tabAccess: localData.tabAccess.map(({ tab, actions }: any) =>
                tab === tabToSaveActionTo ? { tab, actions: data } : { tab, actions }
              )
            }));
            setUnsaved(true);
            setOpenTabActionDialog(!open);
            return {};
          }}
        />
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
        <h2>New Role</h2>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText="Create"
            loadingButtonText="Creating Role..."
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={isLoading}
            onClick={async () => {
              if (validationPassed()) {
                setError("");
                try {
                  const response = await dispatch(createRole(localData)).unwrap();
                  if (response) {
                    onCreate(true);
                  }
                } catch (err: any) {
                  setError(err);
                }
              }
            }}
          />
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
            className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
          />
        </div>
      </div>
      {/* input divs */}
      <div className="flex flex-col gap-4">
        <InputComponent
          type=""
          placeholder="Role Name"
          required
          name="roleName"
          value={roleName}
          onChange={handleInputChange}
        />
        <textarea
          placeholder="Role Description"
          required
          name="roleDescription"
          value={roleDescription}
          onChange={handleInputChange}
          className={textAreaStyle}
        />
      </div>
      {/* tab access div */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2>Tab Access</h2>
          <h3>Click on each button to add the tab access to this role</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendedTabs.length < 1 ? (
            <div>You have access to all tabs - {tabAccess.map((tabObj: any) => tabObj.tab).join(", ")}</div>
          ) : (
            recommendedTabs.map((tab: any) => (
              <span
                key={tab}
                onClick={() => {
                  setUnsaved(true);
                  setLocalData((prev: any) => ({
                    ...prev,
                    tabAccess: [
                      ...localData.tabAccess,
                      {
                        tab,
                        actions: defaultTabActions[tab].map((actionName: string) => ({
                          name: actionName,
                          permission: false
                        }))
                      }
                    ]
                  }));
                }}
                className="p-2 border border-foregroundColor-25 hover:bg-foregroundColor-5 hover:cursor-pointer rounded-lg shadow-sm"
              >
                {tab}
              </span>
            ))
          )}
        </div>
      </div>
      {/* tab actions div */}
      <div className="flex flex-col gap-2">
        {/* data table div */}
        <div className="flex flex-col gap-2">
          {/* title */}
          <div className="flex flex-col gap-2 mb-2">
            <h2>Permitted Actions</h2>
            <h3>Specify permitted actions for each tab</h3>
          </div>
          {/* search bar and new action Button */}
          <div className="flex justify-between items-center">
            {/* search div */}
            <div className="flex w-[500px] h-[50px] items-center gap-2">
              <input
                className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                placeholder="Searh Tab (Name)"
                name="searchValue"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <FaSearch className="text-foregroundColor size-5" />
            </div>
          </div>

          {/* table body */}
          <div className="flex flex-col gap-2">
            {/* table header */}
            <div className="w-full flex px-4 py-3 p-2 h-[50px]">
              <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                {["Tab", "Permitted Actions"].map((header) => (
                  <div
                    key={header}
                    onClick={() => {
                      const sortKey = header === "Tab" ? "tab" : "actions";
                      handleSort(sortKey);
                    }}
                    className="font-semibold flex gap-1 p-2 hover:bg-foregroundColor-5 hover:border border-foregroundColor-10 hover:cursor-pointer rounded-lg whitespace-nowrap items-center justify-center w-[200px]"
                  >
                    {header} <LuArrowUpDown />
                  </div>
                ))}
              </div>
            </div>

            {/* table data */}
            <div className="flex flex-col gap-2 mt-3">
              {tabAccess.length < 1 && searchValue ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : tabAccess.length < 1 ? (
                <div className="flex justify-center mt-6">No Tab Access has been added for this role</div>
              ) : (
                tabAccess.map((tabObj: any) => {
                  const { tab, actions } = tabObj;
                  const permittedActions = actions
                    .map((action: any) => (action.permission ? action.name : ""))
                    .filter((data: any) => data !== "")
                    .slice(0, 3)
                    .join(", ");
                  return (
                    <div
                      key={tab}
                      onClick={(e) => {
                        setTabActionDialogData(tabObj);
                        setOpenTabActionDialog(true);
                      }}
                      className="w-full flex px-4 border border-foregroundColor-15 rounded-md shadow-sm py-3 hover:bg-foregroundColor-5 hover:cursor-pointer"
                    >
                      <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {tab.slice(0, 15)}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-full">
                          {permittedActions.length < 1 ? "No actions allowed yet" : permittedActions}.....
                        </span>
                      </div>

                      <CgTrash
                        className="text-[25px] hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (localData.absoluteAdmin) {
                            setOpenDisallowedDeleteDialog(true);
                          } else {
                            setLocalData((prev: any) => ({
                              ...prev,
                              tabAccess: localData.tabAccess.filter((innerTab: any) => innerTab.tab !== tab && innerTab)
                            }));

                            setUnsaved(true);
                          }
                        }}
                      />
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
