"use client";
import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  CustomHeading,
  CheckBoxComponent
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { YesNoDialog } from "../general/compLibrary";

export const TabActionDialog = ({
  type,
  tabData,
  onUpdate,
  onClose
}: {
  type: string;
  tabData: any;
  onUpdate: (updateType: string, data: any, tabToSaveActionTo: string) => void;
  onClose: (close: any) => void;
}) => {
  const [localActions, setLocalActions] = useState<{ action: string; permission: boolean }[]>(tabData.actions);
  const [onViewMode, setOnViewMode] = useState(tabData.mode === "view");
  const [unsaved, setUnsaved] = useState(false);
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-transparent inset-0">
      <ContainerComponent style="w-[40%] h-[70%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
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
              const container = document.getElementById("roleDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        {/* top div */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <CustomHeading variation="head4">Permitted Actions</CustomHeading>
              <span>
                <span className="font-semibold">Tab:</span> {tabData.tab}
              </span>
            </div>

            <div className="flex justify-between items-center gap-5">
              {!onViewMode && (
                <LoaderButton
                  buttonText="Save"
                  loadingButtonText="Saving..."
                  disabled={!unsaved}
                  isLoading={false}
                  onClick={() => {
                    onUpdate(type, localActions, tabData.tab);
                  }}
                />
              )}
              <IoClose
                onClick={() => {
                  if (!unsaved) {
                    const container = document.getElementById("roleDialogContainer");
                    if (container) {
                      container.style.overflow = "";
                    }
                    onClose(true);
                  } else {
                    const container = document.getElementById("roleDialogContainer");
                    if (container) {
                      container.style.overflow = "hidden";
                    }
                    setOpenUnsavedDialog(true);
                  }
                }}
                className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full pl-8">
          {localActions.map((actionObj: any) => {
            const { action, permission } = actionObj;
            return (
              <div className="grid grid-cols-2 gap-4 items-center" key={action}>
                <span className="w-full">{action}</span>
                <CheckBoxComponent
                  name={action}
                  title={action}
                  disabled={onViewMode}
                  checked={permission}
                  onChange={(e) => {
                    setUnsaved(true);
                    const updatedActions = localActions.map(({ action: innerName, permission: innerPermission }) =>
                      innerName === action
                        ? { action, permission: e.target.checked }
                        : { action: innerName, permission: innerPermission }
                    );
                    setLocalActions(updatedActions);
                  }}
                />
              </div>
            );
          })}
        </div>
      </ContainerComponent>
    </div>
  );
};
