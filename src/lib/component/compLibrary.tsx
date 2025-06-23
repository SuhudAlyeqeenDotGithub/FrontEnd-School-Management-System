"use client";
import { InputComponentType } from "@/interfaces/interfaces";
import { TabObject, DataTableType } from "@/interfaces/interfaces";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { RiUserStarFill } from "react-icons/ri";
import { checkDataType } from "../shortFunctions/shortFunctions";
import { formatDate } from "../shortFunctions/shortFunctions";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { setTriggerUnsavedDialog } from "@/redux/features/general/generalSlice";
import { useNavigationHandler } from "../shortFunctions/clientFunctions";
import { RoleDialog } from "./roleComponents";

export const InputComponent = ({
  type = "text",
  placeholder,
  required = false,
  name,
  value,
  onChange
}: InputComponentType) => {
  const inputStyle =
    "border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full";
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      required={required}
      className={inputStyle}
      onChange={onChange}
    />
  );
};

export const ContainerComponent = ({
  style = "",
  children,
  id
}: {
  style?: string;
  children: ReactNode;
  id?: string;
}) => {
  return (
    <div id={id} className={`bg-backgroundColor order border-foregroundColor-20 shadow-md rounded-md p-4 ${style} `}>
      {children}
    </div>
  );
};

export const ErrorDiv = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-red-500 text-sm bg-red-50 border border-red-400 p-2 rounded">{children}</div>;
};

export const SuccessDiv = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-green-600 text-sm bg-green-50 border border-green-600 p-2 rounded">{children}</div>;
};

export const LoaderDiv = ({
  type = "spinner",
  borderColor,
  text,
  textColor,
  dimension
}: {
  type?: string;
  borderColor: string;
  text?: string;
  textColor?: string;
  dimension: string;
}) => {
  return (
    <div className="flex justify-center gap-10 items-center">
      {type !== "spinner" && <span className={`ml-2 text-${textColor} animate-pulse`}>{text}</span>}
      <div className={`animate-spin rounded-full ${dimension} border-b-2 border-r-2 ${borderColor}`}></div>
    </div>
  );
};

export const LoaderButton = ({
  type = "button",
  buttonText,
  loadingButtonText,
  disabled = false,
  buttonStyle,
  isLoading,
  spinnerDimension = "w-6 h-6",
  onClick
}: {
  type?: "button" | "submit" | "reset";
  buttonText: string;
  loadingButtonText: string;
  disabled?: boolean;
  buttonStyle?: string;
  isLoading?: boolean;
  spinnerDimension?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <button type={type} disabled={disabled} className={buttonStyle} onClick={onClick}>
      <span className="flex justify-center gap-5 items-center">
        {isLoading ? (
          <LoaderDiv
            type="spinnerText"
            borderColor="backgroundColor"
            text={loadingButtonText}
            textColor="backgroundColor"
            dimension={spinnerDimension}
          />
        ) : (
          buttonText
        )}
      </span>
    </button>
  );
};

export const YesNoDialog = ({
  onYes,
  onNo,
  warningText
}: {
  onYes: () => void;
  onNo: () => void;
  warningText: string;
}) => {
  return (
    <div className="w-[100%] h-[100%] bg-foregroundColor-80 items-center justify-center flex absolute inset-0">
      <ContainerComponent style="w-[500px] h-[150px] z-50 flex flex-col bg-backgroundColor gap-10 items-center justify-center">
        <span>{warningText}</span>
        <div className="w-full flex justify-between px-30 items-center">
          <button onClick={onYes}>Yes</button> <button onClick={onNo}>No</button>
        </div>
      </ContainerComponent>
    </div>
  );
};

export const SubTabLink = ({ icon, title, subTitle, url }: TabObject) => {
  const { handleNavigation } = useNavigationHandler();
  const pathname = usePathname();
  return (
    <span
      className={`flex flex-col gap-1 items-center justify-center hover:text-foregroundColor-50 border-foregroundColor-15 rounded-lg p-2 ${
        pathname === url ? "bg-foregroundColor-5 border" : ""
      }`}
      onClick={() => handleNavigation(url)}
    >
      <span className="text-[30px]">{icon}</span>
      <div className="flex flex-col items-center justify-center">
        <span>{title}</span>
        <span className="text-[13px] text-foregroundColor-50">{subTitle}</span>
      </div>
    </span>
  );
};
export const SubTabNav = ({ tabs }: { tabs: TabObject[] }) => {
  return (
    <div className="flex gap-2 border-b border-foregroundColor-15 py-1 px-4 h-[100px] mt-2">
      {tabs.map(({ icon, title, subTitle, url }) => (
        <SubTabLink key={title} icon={icon} title={title} subTitle={subTitle} url={url} />
      ))}
    </div>
  );
};
