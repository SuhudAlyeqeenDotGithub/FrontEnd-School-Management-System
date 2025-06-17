"use client";
import { InputComponentType } from "@/interfaces/interfaces";
import { TabObject } from "@/interfaces/interfaces";
import Link from "next/link";

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

export const SubTabLink = ({ icon, title, subTitle, url }: TabObject) => {
  return (
    <Link
      href={url}
      className="flex flex-col gap-1 items-center justify-center hover:bg-foregroundColor-5 hover:border border-foregroundColor-15 rounded-lg p-2"
    >
      <span className="text-[30px]">{icon}</span>
      <div className="flex flex-col items-center justify-center">
        {" "}
        <span>{title}</span>
        <span className="text-[13px] text-foregroundColor-50">{subTitle}</span>
      </div>
    </Link>
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
