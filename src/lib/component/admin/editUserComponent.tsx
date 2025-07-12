"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../../component/general/compLibrary";
import { IoClose } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { checkDataType } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../../component/general/compLibrary";
import { DisallowedActionDialog, SearchableDropDownInput } from "../general/compLibrary2";
import { TabActionDialog } from "./editRoleComponents";
import { updateUser } from "@/redux/features/admin/users/usersThunks";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { EditParamUserType } from "@/interfaces/interfaces";

const EditUserComponent = ({
  onClose,
  onUpdate,
  userData,
  rolesData
}: {
  onClose: (close: boolean) => {};
  onUpdate: (update: boolean) => {};
  rolesData: any[];
  userData: EditParamUserType;
}) => {
  const { handleUnload } = useNavigationHandler();
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.usersData);
  const [unsaved, setUnsaved] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [error, setError] = useState("");
  const [userTabs, setUserTabs] = useState<string[]>([]);
  const [userPermittedActions, setUserPermittedActions] = useState<string[]>([]);
  const [localData, setLocalData] = useState({
    staffId: userData.staffId,
    userName: userData.userName,
    userEmail: userData.userEmail,
    userPassword: "Change01@Password123?",
    userStatus: userData.userStatus,
    roleId: userData.roleId.split("|")[0]
  });

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const { staffId, userName, userEmail, userPassword, userStatus, roleId } = localData;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };

  const validationPassed = () => {
    if (!userName) {
      setError("Missing Data: Please enter a user name");
      return false;
    }
    if (!staffId && !userData.onEditUserIsAbsoluteAdmin) {
      setError("Missing Data: Please enter a staff Id");
      return false;
    }
    if (userName.length < 5) {
      setError("Data Error: Role name is too short");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&~*+-]).{8,}$/;
    if (!passwordStrengthRegex.test(userPassword)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and at least one special character [!@#$%^&~*]."
      );
      return;
    }

    // if (userPassword === "Change01@Password123?") {
    //   setError("Change01@Password123? cannot be used for password as it is reserved");
    //   return;
    // }

    if (!roleId) {
      setError("Data Error: Role name is too short");
      return false;
    }

    return true;
  };

  return (
    <ContainerComponent id="usersDialogContainer" style="w-[60%] h-[90%] gap-10 overflow-auto flex flex-col">
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
      {/* top div */}
      <div className="flex justify-between items-center">
        <div className="flex gap-5 items-center">
          <h2>Edit User</h2>
          <div className="flex gap-2 items-center">
            <h3>{userData.userId.slice(0, 5)}.......</h3>
            <MdContentCopy
              title="copy id"
              className="text-[20px] text-foregroundColor-80 hover:text-foregroundColor-50 hover:cursor-pointer"
              onClick={async () => {
                await navigator.clipboard.writeText(userData.userId);
              }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText="Update"
            loadingButtonText="Saving User..."
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={isLoading}
            onClick={async () => {
              if (validationPassed()) {
                setError("");
                try {
                  const dataToUpdate = {
                    ...localData,
                    userId: userData.userId,
                    userPassword:
                      userPassword === "Change01@Password123?" ? userData.userPassword : localData.userPassword,
                    onEditUserIsAbsoluteAdmin: userData.onEditUserIsAbsoluteAdmin,
                    passwordChanged:
                      userPassword !== "Change01@Password123?" && userData.userPassword !== localData.userPassword
                  };
                  const response = await dispatch(updateUser(dataToUpdate)).unwrap();
                  if (response) {
                    onUpdate(true);
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
              const container = document.getElementById("usersDialogContainer");
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
          placeholder="Staff ID - (Custom) *"
          required
          name="staffId"
          value={staffId}
          onChange={handleInputChange}
        />
        <InputComponent
          placeholder="User Name *"
          required
          name="userName"
          value={userName}
          onChange={handleInputChange}
        />
        <InputComponent
          placeholder="User Email *"
          required
          name="userEmail"
          value={userEmail}
          onChange={handleInputChange}
        />
        <InputComponent
          placeholder="Assign User Password*"
          required
          name="userPassword"
          value={userPassword}
          onChange={handleInputChange}
        />
        <SearchableDropDownInput
          disabled={userData.onEditUserIsAbsoluteAdmin}
          defaultText={userData.roleId}
          placeholder="Search Role - (ID, Name)"
          data={rolesData}
          displayKeys={["_id", "name", "searchText"]}
          onSelected={(selectedData, save) => {
            setLocalData((prev) => ({ ...prev, roleId: selectedData[0] }));
            setUnsaved(save);
            const roleObj = rolesData.find((role: any) => role._id === selectedData[0]);
            const userTabs = roleObj && roleObj.tabAccess ? roleObj.tabAccess.map((tab: any) => tab.tab) : [];
            const userActions =
              roleObj && roleObj.tabAccess
                ? roleObj.tabAccess
                    .flatMap((tab: any) => tab.actions)
                    .filter((action: any) => action.permission)
                    .map((action: any) => action.name)
                : [];
            setUserTabs(userTabs);
            setUserPermittedActions(userActions);
          }}
          onClearSearch={(clearTabPermission) => {
            if (clearTabPermission) {
              setUserTabs([]);
              setUserPermittedActions([]);
            }
          }}
        />
        <select
          disabled={userData.onEditUserIsAbsoluteAdmin}
          name="userStatus"
          value={userStatus}
          onChange={handleInputChange}
          className="bg-backgroundColor border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
        >
          <option disabled value="">
            User Status *
          </option>
          <option value="Active"> User Status - Active</option>
          <option value="Locked"> User Status - Locked</option>
        </select>
      </div>
      {/* tab access div */}
      <div className="flex flex-col gap-5">
        <h2>Tab Access</h2>
        <div className="flex flex-wrap gap-2">
          {userData.onEditUserIsAbsoluteAdmin ? (
            <div>Has All Access</div>
          ) : userTabs.length < 1 ? (
            <div>No Tab Access</div>
          ) : (
            userTabs.map((tab: any) => (
              <span key={tab} className="p-2 border border-foregroundColor-25 rounded-lg shadow-sm">
                {tab}
              </span>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <h2>Permitted Actions</h2>
        <div className="flex flex-wrap gap-2">
          {userData.onEditUserIsAbsoluteAdmin ? (
            <div>Has All Permissions</div>
          ) : userPermittedActions.length < 1 ? (
            <div>No Permitted Actions</div>
          ) : (
            userPermittedActions.map((action: any) => (
              <span key={action} className="p-2 border border-foregroundColor-25 rounded-lg shadow-sm">
                {action}
              </span>
            ))
          )}
        </div>
      </div>
    </ContainerComponent>
  );
};

export default EditUserComponent;
