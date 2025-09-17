"use client";
import { InputComponentType } from "@/interfaces/interfaces";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, HelpCircle, Trash2, Pencil, Eye, SquarePen } from "lucide-react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { IoClose } from "react-icons/io5";
import { defaultButtonStyle, paginationButtonStyle } from "@/lib/generalStyles";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
export const InputComponent = ({
  type = "text",
  title,
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
      {title && (
        <label htmlFor={name} className="block font-medium text-foregroundColor mb-1 ml-1">
          {title}
        </label>
      )}
      <input
        disabled={disabled}
        type={type}
        autoComplete={autocomplete}
        placeholder={placeholder}
        name={name}
        value={value}
        required={required}
        className="border border-borderColor shadow-xs rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full placeholder:text-sm text-foregroundColor-2"
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  );
};

export const CheckBoxComponent = ({
  title = "Title",
  name,
  disabled = false,
  checked,
  onChange
}: {
  title: string;
  name: string;
  disabled?: boolean;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="flex gap-5 w-full">
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 shadow-xs accent-foregroundColor rounded-xs cursor-pointer"
      />
    </div>
  );
};

export const DeleteButton = ({
  onClick,
  disabled,
  hidden
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
}) => {
  return (
    <button
      title="Delete"
      hidden={hidden}
      disabled={disabled}
      className="flex justify-center items-center hover:cursor-pointer disabled:cursor-not-allowed hover:text-borderColor-3 text-foregroundColor-2 disabled:text-borderColor-2"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <Trash2 className="size-[20px]" />
    </button>
  );
};

export const EditButton = ({
  onClick,
  disabled,
  hidden
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
}) => {
  return (
    <button
      title="Edit"
      hidden={hidden}
      disabled={disabled}
      className="flex justify-center items-center hover:cursor-pointer disabled:cursor-not-allowed hover:text-borderColor-3 text-foregroundColor-2 disabled:text-borderColor-2"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <SquarePen className="size-[20px]" />
    </button>
  );
};

export const ViewButton = ({
  onClick,
  disabled,
  hidden
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  hidden?: boolean;
}) => {
  return (
    <button
      title="View"
      hidden={hidden}
      disabled={disabled}
      className="flex justify-center items-center hover:cursor-pointer disabled:cursor-not-allowed hover:text-borderColor-3 text-foregroundColor-2 disabled:text-borderColor-2"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <Eye className="size-[20px]" />
    </button>
  );
};

export const ActionButtons = ({
  // onView,
  onEdit,
  onDelete,
  disableView,
  disableEdit,
  disableDelete,
  hideView,
  hideEdit,
  hideDelete
}: {
  // onView: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disableView?: boolean;
  disableEdit?: boolean;
  disableDelete?: boolean;
  hideView?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
}) => {
  return (
    <span className="w-[100px] gap-5 flex justify-center items-center">
      {/* <ViewButton hidden={hideView} disabled={disableView} onClick={onView} /> */}
      <EditButton hidden={hideEdit} disabled={disableEdit} onClick={onEdit} />
      <DeleteButton hidden={hideDelete} disabled={disableDelete} onClick={onDelete} />
    </span>
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
        className="border border-borderColor shadow-xs rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full h-[100px] overflow-auto placeholder:text-sm"
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
        className="border border-borderColor shadow-xs rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full"
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

export const SearchComponent = ({
  placeholder,
  name,
  value,
  onChange
}: {
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => {
  return (
    <div className="flex w-[500px] h-[50px] items-center gap-2 relative">
      <InputComponent placeholder={placeholder} name={name} value={value} onChange={onChange} />
      <FaSearch className="text-foregroundColor size-5 absolute right-3" />
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
    <div className="w-[100%] h-[100%] z-50 bg-foregroundColor-transparent items-center justify-center flex fixed inset-0">
      <ContainerComponent style="w-[500px] h-[150px] z-50 flex flex-col bg-backgroundColor gap-10 items-center justify-center">
        <span>{warningText}</span>
        <div className="w-full flex justify-between px-30 items-center">
          <button onClick={onYes} className={defaultButtonStyle}>
            Yes
          </button>
          <button className={defaultButtonStyle} onClick={onNo}>
            No
          </button>
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

export const CustomHeading = ({
  children,
  variation = "head1",
  hidden
}: {
  children: React.ReactNode;
  variation?: string;
  hidden?: boolean;
}) => {
  const variations = {
    head1: "text-[35px] font-bold",
    head1light: "text-[35px] font-semibold text-text-slate-500",
    head2: "text-[25px] font-bold",
    head2light: "text-[25px] font-semibold text-text-slate-500",
    head3: "text-[23px] font-bold",
    head3light: "text-[23px] font-semibold text-slate-500",
    head4: "text-[20px] font-bold",
    head4light: "text-[20px] font-semibold text-slate-500",
    head5: "text-[16px] font-semibold",
    head5light: "text-[16px] text-slate-500",
    head6: "text-[15px] font-semibold",
    head6light: "text-[15px] text-slate-500"
  };
  return (
    <div hidden={hidden} className={`${variations[variation as keyof typeof variations]}`}>
      {children}
    </div>
  );
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
          ? "text-backgroundColor bg-foregroundColor hover:bg-foregroundColor-2 border border-borderColor shadow-xs"
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
    <div className="flex flex-col bg-backgroundColor py-1 px-3 mx-1 mt-2">
      {tabs.map(({ icon, tab, url }) => {
        return <TabLink key={tab} icon={icon} tab={tab} url={url} />;
      })}
    </div>
  );
};

export const NextButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => {
  return (
    <button className={paginationButtonStyle} onClick={onClick} disabled={disabled}>
      Next <ChevronRight className="inline-block" />
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

export const ThemeSelector: any = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    "light",
    "dark",
    "emerald",
    "emerald-dark",
    "teal",
    "teal-dark",
    "indigo",
    "indigo-dark",
    "plum",
    "plum-dark",
    "yellow",
    "yellow-dark",
    "cyan",
    "cyan-dark"
  ];

  return (
    <div className="p-2">
      <label htmlFor="theme-select" className="mr-2 text-foregroundColor">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="p-1 rounded-lg border border-borderColor bg-backgroundColor text-foregroundColor hover:border-borderColor-2 focus:border-2 focus:outline-none"
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};
