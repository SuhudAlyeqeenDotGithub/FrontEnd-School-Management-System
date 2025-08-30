"use client";
import { InputComponentType } from "@/interfaces/interfaces";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { IoClose } from "react-icons/io5";
import { paginationButtonStyle } from "@/lib/generalStyles";
import type { LucideIcon } from "lucide-react";
export const InputComponent = ({
  type = "text",
  title = "Title",
  autocomplete = "off",
  disabled = false,
  placeholder,
  required = false,
  name,
  value,
  onChange,
  onFocus,
  onBlur
}: InputComponentType) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="block font-medium text-foregroundColor-2 mb-1 ml-1">
        {title}
      </label>
      <input
        disabled={disabled}
        type={type}
        autoComplete={autocomplete}
        placeholder={placeholder}
        name={name}
        value={value}
        required={required}
        className="border border-borderColor rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full placeholder:text-sm"
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  );
};

export const TextAreaComponent = ({
  title = "Title",
  disabled = false,
  placeholder,
  required = false,
  name,
  value,
  onChange,
  onFocus,
  onBlur
}: InputComponentType) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="block font-medium text-foregroundColor-2 mb-1 ml-1">
        {title}
      </label>
      <textarea
        disabled={disabled}
        placeholder={placeholder}
        name={name}
        value={value}
        required={required}
        className="border border-borderColor rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full h-[100px] overflow-auto placeholder:text-sm"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
};

export const SelectInputComponent = ({
  title = "Title",
  disabled = false,
  placeholder,
  required = false,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  options
}: {
  title?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="block font-medium text-foregroundColor-2 mb-1 ml-1">
        {title}
      </label>
      <select
        disabled={disabled}
        name={name}
        value={value}
        required={required}
        className="border border-borderColor rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <option value="" disabled className="text-sm">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
    <div id={id} className={`bg-backgroundColor border border-borderColor shadow-md rounded-lg p-5 ${style} `}>
      {children}
    </div>
  );
};

export const ErrorDiv = ({ children, onClose }: { children: React.ReactNode; onClose: (close: boolean) => void }) => {
  return (
    <div className="text-red-500 text-sm bg-red-50 border border-red-400 p-2 rounded flex gap-5 justify-between items-center">
      {children}
      <IoClose
        title="Close"
        className="hover:cursor-pointer"
        onClick={() => {
          onClose(true);
        }}
      />
    </div>
  );
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
    <div className="flex justify-center gap-10 items-center z-10">
      {type !== "spinner" && <span className={`ml-2 text-${textColor} animate-pulse`}>{text}</span>}
      <div className={`animate-spin rounded-full ${dimension} border-b-2 border-r-2 border-${borderColor}`}></div>
    </div>
  );
};

export const LoaderButton = ({
  type = "button",
  buttonText,
  loadingButtonText,
  disabled = false,
  buttonStyle = "bg-foregroundColor text-backgroundColor shadow-xs hover:bg-foregroundColor-2 hover:cursor-pointer w-full px-4 py-3 rounded-md disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed",
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
    <div className="w-[100%] h-[100%] z-50 bg-foregroundColor-50 items-center justify-center flex fixed inset-0">
      <ContainerComponent style="w-[500px] h-[150px] z-50 flex flex-col bg-backgroundColor gap-10 items-center justify-center">
        <span>{warningText}</span>
        <div className="w-full flex justify-between px-30 items-center">
          <button onClick={onYes}>Yes</button> <button onClick={onNo}>No</button>
        </div>
      </ContainerComponent>
    </div>
  );
};

export const IconFormatter = ({
  icon: Icon = HelpCircle,
  size = 20,
  className = ""
}: {
  icon?: LucideIcon;
  size?: number;
  className?: string;
}) => {
  return <Icon className={`inline-block ${className}`} size={size} />;
};

export const CustomHeading = ({ children, variation = "head1" }: { children: React.ReactNode; variation?: string }) => {
  const variations = {
    head1: "text-[35px] font-bold",
    head1light: "text-[35px] font-semibold text-text-slate-500",
    head2: "text-[30px] font-bold",
    head2light: "text-[30px] font-semibold text-text-slate-500",
    head3: "text-[25px] font-bold",
    head3light: "text-[25px] font-semibold text-slate-500",
    head4: "text-[16px] font-semibold",
    head4light: "text-[16px] font-semibold text-slate-500",
    head5: "text-[15px] font-semibold",
    head5light: "text-[15px] font-semibold text-slate-500"
  };
  return <div className={`${variations[variation as keyof typeof variations]}`}>{children}</div>;
};

export const SubTabLink = ({ icon, title, url }: { icon?: LucideIcon; title: string; url: string }) => {
  const { handleNavigation } = useNavigationHandler();
  const pathname = usePathname();

  return (
    <div
      title={title}
      className={`flex gap-2 px-5 py-3 text-foregroundColor-2 font-medium rounded-md hover:bg-backgroundColor-3 hover:cursor-pointer h-12 items-center justify-center whitespace-nowrap ${
        pathname === url ? "bg-backgroundColor-3 border border-borderColor shadow-xs" : ""
      }`}
      onClick={() => handleNavigation(url)}
    >
      <IconFormatter icon={icon} className="size-5" />
      <span>{title}</span>
    </div>
  );
};
export const SubTabNav = ({
  tabs
}: {
  tabs: {
    icon?: LucideIcon;
    title: string;
    url: string;
  }[];
}) => {
  return (
    <div className="flex gap-2 border-b border-borderColor bg-backgroundColor py-1 px-3 h-[70px] items-center sticky top-0 z-20">
      {tabs.map(({ icon, title, url }) => (
        <SubTabLink key={title} icon={icon} title={title} url={url} />
      ))}
    </div>
  );
};

export const TabLink = ({ icon, tab, url }: { icon?: LucideIcon; tab: string; url: string }) => {
  const { handleNavigation } = useNavigationHandler();
  const pathname = usePathname();
  return (
    <div
      title={tab}
      className={`flex gap-2 px-5 py-3 font-medium rounded-md hover:bg-backgroundColor-2 hover:cursor-pointer h-12 items-center whitespace-nowrap ${
        pathname === url
          ? "text-background bg-foregroundColor hover:bg-foregroundColor-2 border border-borderColor shadow-xs"
          : "text-foregroundColor-2"
      }`}
      onClick={() => handleNavigation(url)}
    >
      <IconFormatter icon={icon} className="size-5" />
      <span>{tab}</span>
    </div>
  );
};
export const SideBarNav = ({
  tabs
}: {
  tabs: {
    icon?: LucideIcon;
    tab: string;
    url: string;
  }[];
}) => {
  return (
    <div className="flex flex-col bg-backgroundColor py-1 px-3 mx-1">
      {tabs.map(({ icon, tab, url }) => (
        <TabLink key={tab} icon={icon} tab={tab} url={url} />
      ))}
    </div>
  );
};

export const NextButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => {
  return (
    <button className={paginationButtonStyle} onClick={onClick} disabled={disabled}>
      Next <ChevronRight className="text-[10px] inline-block" />
    </button>
  );
};

export const PreviousButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => {
  return (
    <button className={paginationButtonStyle} onClick={onClick} disabled={disabled}>
      <ChevronLeft className="inline-block" /> Previous
    </button>
  );
};
