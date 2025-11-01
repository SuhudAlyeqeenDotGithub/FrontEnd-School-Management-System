"use client";

import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent,
  StatusFormatter
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export const ActivityLogDialogComponent = ({ data, onClose }: { data?: any; onClose: (close: boolean) => void }) => {
  const {
    _id: activityLogId,
    accountId,
    logAction,
    recordModel,
    recordId,
    recordName,
    recordChange,
    logDate,
    createdAt,
    updatedAt
  } = data;

  const { accountName, accountEmail, accountStatus, staffId, roleId } = accountId;
  const { roleName } = roleId || {};
  const { staffCustomId } = staffId || {};

  const cleanPath = (path: any) => {
    const key = path?.[0];
    const isClean = !key?.startsWith("$") && key !== "$__";
    return isClean;
  };

  const changeDialogTriggerStatus = recordChange.reduce((obj: any, _: any, index: number) => {
    obj[index] = true;
    return obj;
  }, {});
  const [changeObjectOpenerObject, setChangeObjectOpenerObject] = useState(changeDialogTriggerStatus);

  const renderObjectFields = (obj: Record<string, any>) => {
    if (obj === null || obj === undefined) return null;

    if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean")
      return <span className="text-sm text-foregroundColor break-all">{JSON.stringify(obj)}</span>;

    if (Array.isArray(obj))
      return <span className="text-sm text-foregroundColor break-all">{JSON.stringify(obj)}</span>;

    return Object.entries(obj).map(([key, value]) => {
      if (value === null || value === undefined) return null;

      if (typeof value === "object" && !Array.isArray(value)) {
        return (
          <div key={key} className="space-y-1">
            <p className="text-sm font-semibold text-foregroundColor-2">{key}:</p>
            <div className="ml-4 space-y-1">{renderObjectFields(value)}</div>
          </div>
        );
      }

      return (
        <div key={key} className="flex items-start gap-2">
          <span className="text-sm font-medium text-foregroundColor-2 min-w-[120px]">{key}:</span>
          <span className="text-sm text-foregroundColor break-all">
            {Array.isArray(value) ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="programmeDialogContainer" style="w-[70%] h-[90%] gap-5 overflow-auto flex flex-col">
        {/* top div */}
        <div className="flex justify-between items-center">
          <h2>Activity Detail</h2>
          <div className="flex justify-between items-center gap-5">
            <IoClose
              onClick={() => {
                onClose(true);
              }}
              className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer w-full"
            />
          </div>
        </div>
        {/* bodydivs */}

        <div className="mt-3">
          <h3 className="font-semibold border-b border-borderColor pb-2 uppercase">Activity Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 w-full place-items-start">
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Activity ID</span>
              <span className="text-foregroundColor-2"> {activityLogId}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Log Action</span>
              <StatusFormatter text={logAction} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Record Model</span>
              <span className="text-foregroundColor-2"> {recordModel}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Record ID</span>
              <span className="text-foregroundColor-2"> {recordId?._id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Log Date</span>
              <span className="text-foregroundColor-2"> {formatDate(createdAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Log Time</span>
              <span className="text-foregroundColor-2"> {new Date(createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="font-semibold border-b border-borderColor pb-2 uppercase">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 w-full place-items-start">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Staff Custom Id</span>
              <span className="text-foregroundColor-2"> {staffCustomId}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> User Name</span>
              <span className="text-foregroundColor-2"> {accountName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> User Email</span>
              <span className="text-foregroundColor-2"> {accountEmail}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> User Account Status</span>
              <StatusFormatter text={accountStatus} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">User Role ID</span>
              <span className="text-foregroundColor-2"> {roleId?._id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">User Role</span>
              <span className="text-foregroundColor-2"> {roleName}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="font-semibold border-b border-borderColor pb-2 uppercase">Record Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 w-full place-items-start">
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Record ID</span>
              <span className="text-foregroundColor-2"> {recordId?._id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium"> Record Name</span>
              <span className="text-foregroundColor-2"> {recordName}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-medium"> Record Tab</span>
              <span className="text-foregroundColor-2"> {recordModel}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="font-semibold border-b border-borderColor pb-2 uppercase">Record Change</h3>
          {recordChange.length === 0 && <span className="text-sm text-foregroundColor-2 italic">No change found</span>}
          {recordChange.length > 0 &&
            recordChange.map((item: any, index: number) => {
              const changeObject = item;
              return (
                cleanPath(changeObject?.path) && (
                  <div className="border border-borderColor rounded-md mt-4 shadow-xs">
                    <div
                      className="flex border-b border-borderColor-2 p-3 gap-2 justify-between items-center rounded-t-sm cursor-pointer hover:bg-backgroundColor-2"
                      onClick={() => setChangeObjectOpenerObject((prev: any) => ({ ...prev, [index]: !prev[index] }))}
                    >
                      <div className="flex gap-2 items-center">
                        {changeObjectOpenerObject[index] ? (
                          <ChevronDown className="h-4 w-4 text-foregroundColor-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-foregroundColor-2" />
                        )}
                        <span className="font-medium text-foregroundColor-2">Click to view change #{index + 1}</span>
                      </div>
                      <StatusFormatter
                        text={
                          changeObject?.kind === "N"
                            ? "Added"
                            : changeObject?.kind === "E"
                            ? "Edited"
                            : changeObject?.kind === " A"
                            ? "List Change"
                            : "Deleted"
                        }
                      />
                    </div>
                    <div hidden={changeObjectOpenerObject[index]} className="py-4">
                      <div className="px-4 gap-4 flex flex-col">
                        {changeObject?.path && (
                          <div>
                            <h4 className="text-sm font-semibold text-foregroundColor-2 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-foregroundColor"></span>
                              Change happend in
                            </h4>
                            <div className="bg-backgroundColor-2 p-3 rounded-md space-y-2 border border-borderColor max-h-[100px] overflow-auto">
                              <div>{renderObjectFields(changeObject?.path)}</div>
                            </div>
                          </div>
                        )}

                        {changeObject?.lhs !== null && changeObject?.rhs !== undefined && (
                          <div>
                            <h4 className="text-sm font-semibold text-foregroundColor-2 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Previous Value
                            </h4>
                            <div className="bg-red-50 p-3 rounded-md space-y-2 border border-red-200 max-h-[300px] overflow-auto">
                              {renderObjectFields(changeObject?.lhs)}
                            </div>
                          </div>
                        )}

                        {changeObject?.rhs !== null && changeObject?.rhs !== undefined && (
                          <div>
                            <h4 className="text-sm font-semibold text-foregroundColor-2 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              New Value
                            </h4>
                            <div className="bg-green-50 p-3 rounded-md space-y-2 border border-green-200 max-h-[300px] overflow-auto">
                              {renderObjectFields(changeObject?.rhs)}
                            </div>
                          </div>
                        )}

                        {!changeObject?.lhs && !changeObject?.rhs && (
                          <p className="text-sm text-foregroundColor-2 italic">No change details available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              );
            })}
        </div>
      </ContainerComponent>
    </div>
  );
};
