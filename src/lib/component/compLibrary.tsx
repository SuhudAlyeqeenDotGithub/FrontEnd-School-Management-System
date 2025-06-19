"use client";
import { InputComponentType } from "@/interfaces/interfaces";
import { TabObject, DataTableType } from "@/interfaces/interfaces";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { LuArrowUpDown } from "react-icons/lu";
import { RiUserStarFill } from "react-icons/ri";
import { checkDataType } from "../shortFunctions/shortFunctions";
import { formatDate } from "../shortFunctions/shortFunctions";

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
  const pathname = usePathname();
  return (
    <Link
      href={url}
      className={`flex flex-col gap-1 items-center justify-center hover:text-foregroundColor-50 border-foregroundColor-15 rounded-lg p-2 ${
        pathname === url ? "bg-foregroundColor-5 border" : ""
      }`}
    >
      <span className="text-[30px]">{icon}</span>
      <div className="flex flex-col items-center justify-center">
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

export const DeleteDivSkeleton = ({
  outerDivStyle,
  innerDivStyle,
  valueDivStyle,
  data,
  onDeleteClick,
  onDivClick
}: {
  outerDivStyle: string;
  innerDivStyle: string;
  valueDivStyle: string;
  data: string[];
  onDeleteClick?: (e: React.MouseEvent<SVGElement>) => void;
  onDivClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div className={outerDivStyle}>
      <div className={innerDivStyle} onClick={onDivClick}>
        {data.map((value, index) => {
          const valueIsDate = checkDataType(value) === "date";
          const displayValue = valueIsDate ? formatDate(value) : value;
          return (
            <span key={index} className={valueDivStyle}>
              {displayValue}
            </span>
          );
        })}
      </div>

      <CgTrash className="text-[25px] hover:text-red-500" onClick={onDeleteClick} />
    </div>
  );
};

export const DataTable = ({
  title,
  subTitle,
  searchPlaceholder,
  actionButtonText,
  headers,
  outerDivStyle,
  innerDivStyle,
  valueDivStyle,
  divSkeletonType,
  data,
  IdKey = "",
  key1 = "",
  key2 = "",
  key3 = "",
  key4 = "",
  key5 = "",
  key6 = "",
  key7 = "",
  key8 = "",
  searchKey = "",
  onNewActionClick,
  onDivClick,
  onDeleteClick
}: DataTableType) => {
  const keyMap: { [key: string]: string } = { key1, key2, key3, key4, key5, key6, key7, key8 };
  const [searchValue, setSearchValue] = useState("");
  const [localData, setLocalData] = useState(data);
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  useEffect(() => {
    if (searchValue !== "") {
      const filteredData = localData.filter((obj) => obj[searchKey].toLowerCase().includes(searchValue.toLowerCase()));
      setLocalData(filteredData);
    } else {
      setLocalData(data);
    }
  }, [searchValue]);

  const handleSort = (sortKey: string) => {
    const keyType = checkDataType([...localData][0][sortKey]);

    const sortOrder = sortOrderTracker[sortKey];
    let nextOrder: string;

    if (sortOrder === "dsc") {
      nextOrder = "asc";
    } else {
      nextOrder = "dsc";
    }

    const sortedData = [...localData].sort((a, b) => {
      if (keyType === "number") {
        return sortOrder === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      } else {
        return sortOrder === "asc" ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      }
    });

    setLocalData(sortedData);
    setSortOrderTracker((prev: any) => ({ ...prev, [sortKey]: nextOrder }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* title */}
      <div className="flex flex-col gap-2 mb-5">
        <h2>{title}</h2>
        <h3>{subTitle}</h3>
      </div>
      {/* search bar and new action Button */}
      <div className="flex justify-between items-center">
        {/* search div */}
        <div className="flex w-[500px] h-[50px] items-center gap-2">
          <input
            className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
            placeholder={searchPlaceholder}
            name="searchValue"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          <FaSearch className="text-foregroundColor size-5" />
        </div>
        {/* new action button */}
        <div>
          <button onClick={onNewActionClick}>{actionButtonText}</button>
        </div>
      </div>

      {/* table body */}
      <div className="flex flex-col gap-2">
        {/* table header */}
        <div className={`${outerDivStyle} p-2 h-[50px]`}>
          <div className={innerDivStyle}>
            {headers.map((header, index) => (
              <span
                key={index}
                className={`font-semibold ${valueDivStyle} flex gap-1 p-2 hover:bg-foregroundColor-5 hover:border border-foregroundColor-10 hover:cursor-pointer rounded-lg`}
                onClick={() => {
                  const key = "key" + (index + 1);
                  handleSort(keyMap[key]);
                }}
              >
                {header} <LuArrowUpDown />
              </span>
            ))}
          </div>
        </div>

        {/* table data */}
        <div className="flex flex-col gap-2">
          {localData.length < 1 && searchValue ? (
            <div className="flex justify-center mt-6">No search result found</div>
          ) : (
            localData.map((doc) =>
              divSkeletonType === "deleteEnabled" ? (
                <DeleteDivSkeleton
                  key={doc[IdKey]}
                  outerDivStyle={`${outerDivStyle} border border-foregroundColor-15 rounded-md shadow-sm py-3 hover:bg-foregroundColor-5 hover:cursor-pointer`}
                  innerDivStyle={innerDivStyle}
                  valueDivStyle={valueDivStyle}
                  data={[doc[key1], doc[key2], doc[key3], doc[key4], doc[key5], doc[key6], doc[key7], doc[key8]]}
                  onDivClick={onDivClick}
                  onDeleteClick={onDeleteClick}
                />
              ) : (
                <div></div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};
