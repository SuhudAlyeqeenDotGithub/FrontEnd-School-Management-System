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
import { RoleDialog } from "./compLibrary2";

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
    <div id={id} className={`border border-foregroundColor-20 shadow-md rounded-md p-4 ${style} `}>
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

export const UnsavedChangeDialog = ({ onYes, onNo }: { onYes: () => void; onNo: () => void }) => {
  return (
    <div className="w-[100%] h-[100%] bg-foregroundColor-80 items-center justify-center flex absolute inset-0">
      <ContainerComponent style="w-[500px] h-[150px] z-50 flex flex-col bg-backgroundColor gap-10 items-center justify-center">
        <h3>You have unsaved changes. Are you sure you want to proceed?</h3>
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

// export const DeleteDivSkeleton = ({
//   outerDivStyle,
//   innerDivStyle,
//   valueDivStyle,
//   divObj,
//   data,
//   onDeleteClick,
//   onDivClick
// }: {
//   outerDivStyle: string;
//   innerDivStyle: string;
//   valueDivStyle: string;
//   divObj: any;
//   data: string[];
//   onDeleteClick?: (e: React.MouseEvent<SVGElement>) => void;
//   onDivClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
// }) => {
//   return (
//     <div className={outerDivStyle}>
//       <div
//         className={` ${innerDivStyle}`}
//         onClick={() => {
//           onDivClick && onDivClick(divObj);
//           setEditRole && setEditRole(true);
//         }}
//       >
//         {data.map((value, index) => {
//           const sanitizedValue = !value ? "" : value;
//           const valueIsDate = checkDataType(sanitizedValue) === "date";
//           const valueIsArray = Array.isArray(sanitizedValue);
//           const displayValue = valueIsDate
//             ? formatDate(sanitizedValue)
//             : valueIsArray
//             ? sanitizedValue.join(", ") + ", ....."
//             : sanitizedValue.slice(0, 15);
//           return (
//             <span key={index} className={`${valueDivStyle} ${valueIsArray ? "w-full" : "w-[200px]"}`}>
//               {displayValue}
//             </span>
//           );
//         })}
//       </div>

//       <CgTrash className="text-[25px] hover:text-red-500" onClick={onDeleteClick} />
//     </div>
//   );
// };

// export const DataTable = ({
//   title,
//   subTitle,
//   searchPlaceholder,
//   actionButtonText = "",
//   headers,
//   outerDivStyle,
//   innerDivStyle,
//   valueDivStyle,
//   divSkeletonType,
//   data,
//   IdKey = "",
//   keys = [],
//   searchKey = "",
//   onNewActionClick,
//   onDivClick,
//   onDeleteClick
// }: DataTableType) => {

//   const [editRole, setEditRole] = useState(false);

//   useEffect(() => {
//     setLocalData(data);
//   }, [data]);

//   useEffect(() => {
//     if (searchValue !== "") {
//       const filteredData = data.filter((obj: any) => obj[searchKey].toLowerCase().includes(searchValue.toLowerCase()));
//       setLocalData(filteredData);
//     } else {
//       setLocalData(data);
//     }
//   }, [searchValue]);

//   return (
//     <div className="flex flex-col gap-4">
//       {editRole && <RoleDialog />}
//       {/* title */}
//       <div className="flex flex-col gap-2 mb-5">
//         <h2>{title}</h2>
//         <h3>{subTitle}</h3>
//       </div>
//       {/* search bar and new action Button */}
//       <div className="flex justify-between items-center">
//         {/* search div */}
//         <div className="flex w-[500px] h-[50px] items-center gap-2">
//           <input
//             className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
//             placeholder={searchPlaceholder}
//             name="searchValue"
//             onChange={(e) => {
//               setSearchValue(e.target.value);
//             }}
//           />
//           <FaSearch className="text-foregroundColor size-5" />
//         </div>
//         {/* new action button */}
//         <div>{actionButtonText && <button onClick={onNewActionClick}>{actionButtonText}</button>}</div>
//       </div>

//       {/* table body */}
//       <div className="flex flex-col gap-2">
//         {/* table header */}
//         <div className={`${outerDivStyle} p-2 h-[50px]`}>
//           <div className={innerDivStyle}>
//             {headers.map((header, index) => (
//               <span
//                 key={index}
//                 className={`font-semibold ${valueDivStyle} flex gap-1 p-2 hover:bg-foregroundColor-5 hover:border border-foregroundColor-10 hover:cursor-pointer rounded-lg`}
//                 onClick={() => {
//                   const key = "key" + (index + 1);
//                   handleSort(index);
//                 }}
//               >
//                 {header} <LuArrowUpDown />
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* table data */}
//         <div className="flex flex-col gap-2">
//           {localData.length < 1 && searchValue ? (
//             <div className="flex justify-center mt-6">No search result found</div>
//           ) : localData.length < 1 ? (
//             <div className="flex justify-center mt-6">No data available</div>
//           ) : (
//             localData.map((doc: any, index: any) => {
//               return divSkeletonType === "deleteEnabled" ? (
//                 <DeleteDivSkeleton
//                   key={doc[IdKey] || index}
//                   outerDivStyle="w-full flex px-4 border border-foregroundColor-15 rounded-md shadow-sm py-3 hover:bg-foregroundColor-5 hover:cursor-pointer"
//                   innerDivStyle="grid auto-cols-max grid-flow-col w-[95%] gap-5"
//                   valueDivStyle="whitespace-nowrap flex items-center justify-center w-[200px]"
//                   data={keys.map((keyName) => {
//                     return keyName === "tabAccess"
//                       ? [...doc[keyName].map((tabObj: any) => tabObj.tab)].splice(0, 3)
//                       : keyName === "actions"
//                       ? [...doc[keyName].map((action: any) => action.name)].splice(0, 3)
//                       : keyName.split(".").length > 1
//                       ? eval(`doc.${keyName}`)
//                       : doc[keyName];
//                   })}
//                   onDivClick={}
//                   onDeleteClick={onDeleteClick}
//                   divObj={doc}
//                 />
//               ) : (
//                 <div></div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const handleSort = (sortKeyIndex: any) => {
//   // console.log("localData", localData);
//   // console.log("sortKeyIndex", keys[sortKeyIndex]);
//   // console.log("first item", [...localData][0][keys[sortKeyIndex]]);

//   const keyType = checkDataType([...localData][0][keys[sortKeyIndex]]);
//   // console.log("keyType", keyType);

//   const sortOrder = sortOrderTracker[keys[sortKeyIndex]];
//   // console.log("sortOrder", sortOrder);
//   let nextOrder: string;

//   if (sortOrder === "dsc") {
//     nextOrder = "asc";
//   } else {
//     nextOrder = "dsc";
//   }

//   const sortedData = [...localData].sort((a, b) => {
//     if (keyType === "number") {
//       return sortOrder === "asc"
//         ? a[keys[sortKeyIndex]] - b[keys[sortKeyIndex]]
//         : b[keys[sortKeyIndex]] - a[keys[sortKeyIndex]];
//     } else if (keyType === "array") {
//       return sortOrder === "asc"
//         ? a[keys[sortKeyIndex]][0].name.localeCompare(b[keys[sortKeyIndex]][0].name)
//         : b[keys[sortKeyIndex]][0].name.localeCompare(a[keys[sortKeyIndex]][0].name);
//     } else {
//       return sortOrder === "asc"
//         ? a[keys[sortKeyIndex]].localeCompare(b[keys[sortKeyIndex]])
//         : b[keys[sortKeyIndex]].localeCompare(a[keys[sortKeyIndex]]);
//     }
//   });

//   setLocalData(sortedData);
//   setSortOrderTracker((prev: any) => ({ ...prev, [keys[sortKeyIndex]]: nextOrder }));
// };
