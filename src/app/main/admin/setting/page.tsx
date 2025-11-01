"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { use, useEffect, useState } from "react";
import {
  CustomHeading,
  ErrorDiv,
  IconFormatter,
  LoaderDiv,
  YesNoDialog
} from "@/lib/customComponents/general/compLibrary";

import { setTriggerUnsavedDialog } from "@/redux/features/general/generalSlice";

import { Activity } from "lucide-react";
import { defaultButtonStyle } from "@/lib/generalStyles";
import { useNavigationHandler } from "@/lib/shortFunctions/clientFunctions.ts/clientFunctions";
import { handleApiRequest } from "@/axios/axiosClient";
import { updateSettings } from "@/redux/features/accounts/accountSlice";

const Setting = () => {
  const dispatch = useAppDispatch();
  const { handleUnload, handleNavigation } = useNavigationHandler();
  const { triggerUnsavedDialog, proceedUrl } = useAppSelector((state) => state.generalState);
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [error, setError] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const [settings, setSettings] = useState(
    accountData?.settings
      ? accountData?.settings
      : {
          logActivity: true
        }
  );

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");
    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  useEffect(() => {
    if (!accountData) return;

    if (accountData?.settings) {
      setSettings(accountData?.settings);
    } else {
      setSettings({
        logActivity: true
      });
    }
  }, [accountData]);

  if (!accountData?.roleId?.absoluteAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <div className=" flex flex-col items-center mb-5">
          <div className="h-10 w-22">
            <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
          </div>
          <p className="text-[18px] text-[#0097a7]  font-medium">School Management System</p>
        </div>
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="mb-6">Oops! You do not have access to this page - Contact your admin if you need access</p>
        <a href="/main" className="text-[#0097a7]  underline">
          Go back home
        </a>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Activity Log Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  const handleToggle = (key: keyof typeof settings) => {
    setUnsaved(true);
    setError("You have unsaved changes. Enure to save before proceeding.");
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSetting = async () => {
    try {
      const response = await handleApiRequest("post", `alyeqeenschoolapp/api/admin/settings`, { settings });

      if (response?.data) {
        dispatch(updateSettings(settings));
        dispatch(setTriggerUnsavedDialog(false));
        setUnsaved(false);
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error saving settings");
    }
  };

  return (
    <div id="settingContainer" className="px-4 py-6 w-full">
      {triggerUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onNo={() => {
            const container = document.getElementById("settingContainer");
            if (container) {
              container.style.overflow = "";
            }

            dispatch(setTriggerUnsavedDialog(false));
          }}
          onYes={() => {
            handleUnload("remove");
            dispatch(setTriggerUnsavedDialog(false));
            handleNavigation(proceedUrl, true);
          }}
        />
      )}
      <div className="bg-backgroundColor p-6 rounded-md shadow border border-borderColor">
        <div className="border-b border-borderColor pb-2 mb-6">
          {/* title */}
          <div className="flex items-center">
            <CustomHeading variation="sectionHeader">Settings</CustomHeading>
            <div className="ml-auto">
              <button hidden={!unsaved} className={defaultButtonStyle} onClick={handleSaveSetting}>
                Save
              </button>
            </div>
          </div>
        </div>
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
        {/* activity log */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-col">
            <div className="flex gap-3 items-center">
              <CustomHeading variation="head4">Activity Tracking</CustomHeading>
              <IconFormatter icon={Activity} />
            </div>
            <CustomHeading variation="head6light">Manage activity logging and monitoring features</CustomHeading>
          </div>
          <div className="bg-backgroundColor-2 p-4 h-[90px] rounded-md border border-borderColor-2 flex">
            <div className="flex flex-col">
              <h3 className="font-semibold pb-2">Activity Logs</h3>
              <span className="text-foregroundColor-2 text-small">
                Track all user actions and system changes for audit purposes: (Note: This feature uses more resources
                and increases your usage costs)
              </span>
            </div>
            <div className="flex items-center ml-auto">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.logActivity}
                  onChange={() => handleToggle("logActivity")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-borderColor peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-backgroundColor-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-backgroundColor after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-backgroundColor after:border-borderColor after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foregroundColor"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
