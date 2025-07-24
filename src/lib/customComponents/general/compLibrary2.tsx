"use client";
import { useEffect, useRef, useState } from "react";
import { ContainerComponent, ErrorDiv, InputComponent } from "./compLibrary";
import { FaSearch } from "react-icons/fa";
import { inputStyle } from "@/lib/generalStyles";

export const DisallowedActionDialog = ({ onOk, warningText }: { onOk: () => void; warningText: string }) => {
  return (
    <div className="w-[100%] h-[100%] bg-foregroundColor-50 items-center justify-center flex fixed inset-0">
      <ContainerComponent style="min-w-[500px] h-[150px] z-50 flex flex-col bg-backgroundColor gap-10 items-center justify-center">
        <span>{warningText}</span>
        <div className="w-full flex justify-center px-30 items-center">
          <button onClick={onOk}>Ok</button>
        </div>
      </ContainerComponent>
    </div>
  );
};

export const SearchableDropDownInput = ({
  disabled = false,
  placeholder,
  data,
  displayKeys,
  onSelected,
  onClearSearch,
  defaultText = ""
}: {
  disabled?: boolean;
  placeholder: string;
  defaultText?: string;
  data: any[];
  displayKeys: string[];
  onSelected: (selectedDataId: string[], save: boolean) => void;
  onClearSearch: (cleared: boolean) => void;
}) => {
  const [searchValue, setSearchValue] = useState(defaultText.split("|")[1] || "");
  const [localData, setLocalData] = useState<any>([]);
  const [openOptions, setOpenOptions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // console.log("searchValue", searchValue);
  // console.log("defaultText", defaultText);
  // // console.log("defaultText.split()[1]", defaultText.split("|")[0]);

  useEffect(() => {
    if (defaultText) {
      onSelected([defaultText.split("|")[0]], false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpenOptions(false); // clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchValue !== "") {
      const filteredOptions = data.filter((option) =>
        option.searchText.toLowerCase().includes(searchValue.toLowerCase())
      );
      setLocalData(filteredOptions);
    } else {
      setOpenOptions(false);
      setLocalData(data);
      onClearSearch(true);
    }
  }, [searchValue]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  return (
    <div ref={wrapperRef} className="w-full items-center justify-center relative">
      <InputComponent
        placeholder={placeholder}
        required
        disabled={disabled}
        name="searchValue"
        value={searchValue}
        onChange={(e) => {
          setOpenOptions(true);
          setSearchValue(e.target.value);
        }}
        onFocus={() => {
          console.log("openOptions", openOptions);
          setOpenOptions(true);
          setLocalData(data);
        }}
      />
      {openOptions && (
        <div
          className={`border border-foregroundColor-25 shadow-md w-full h-[150px] overflow-auto flex flex-col items-center bg-backgroundColor absolute gap-1        }`}
        >
          {localData.length < 1 ? (
            <div>No match value</div>
          ) : (
            localData.map((option: any, index: number) => {
              return (
                <div
                  className="w-full flex items-center hover:bg-foregroundColor-5 hover:cursor-pointer px-5 py-1 rounded-md"
                  key={index}
                  onClick={() => {
                    setSearchValue(option[displayKeys[1]]);
                    setOpenOptions(false);
                    onSelected(
                      displayKeys.map((key: string) => option[key]),
                      true
                    );
                  }}
                >
                  {displayKeys
                    .filter((key: string) => key !== "searchText" && key !== "_id")
                    .map((key: string) => option[key])
                    .join(" | ")}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const ConfirmActionByInputDialog = ({
  confirmWithText,
  returnObject,
  onCancel,
  onConfirm,
  warningText
}: {
  confirmWithText: string;
  returnObject: any;
  onCancel: () => void;
  onConfirm: (deleted: boolean, returnObject: any) => void;
  warningText: string;
}) => {
  const [error, setError] = useState("");
  const [inputText, setInputText] = useState("");
  return (
    <div className="w-[100%] h-[100%] bg-foregroundColor-50 items-center justify-center z-30 flex fixed inset-0">
      <ContainerComponent style="min-w-[500px] max-h-[300px] z-50 flex flex-col bg-backgroundColor gap-5 items-center justify-center">
        <span>{warningText}</span>
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
        <InputComponent
          type=""
          placeholder="Confirm ID"
          required
          name="inputText"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (confirmWithText !== e.target.value) {
              setError("ID does not match");
            } else {
              setError("");
            }
          }}
        />
        <div className="w-full flex justify-between px-30 items-center">
          <button onClick={onCancel}>Cancel</button>
          <button
            disabled={confirmWithText !== inputText}
            onClick={() => {
              if (confirmWithText !== inputText) {
                setError("Invalid Confirmation: ID does not match");
              } else {
                setError("");
                onConfirm(true, returnObject);
              }
            }}
          >
            Confirm
          </button>
        </div>
      </ContainerComponent>
    </div>
  );
};

export const CustomFilterComponent = ({
  placeholder,
  filters
}: {
  placeholder: string;
  filters: { displayText: string; fieldName: string; options: string[] }[];
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterQuery, setFilterQuery] = useState({});
  console.log("filterQuery", filterQuery);
  return (
    <div className="rounded-lg flex flex-col border border-foregroundColor-25 px-5 py-8">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter: any, index: number) => {
          return (
            <select
              key={index}
              className="rounded-lg hover:cursor-pointer border border-foregroundColor-25 p-2 bg-backgroundColor text-foregroundColor"
              onChange={(e) => {
                console.log("query", { [filter.fieldName]: e.target.value });
                setFilterQuery({
                  ...filterQuery,
                  [filter.fieldName]: e.target.value
                });
              }}
            >
              <option value="" disabled>
                {filter.displayText}
              </option>
              <option value="all">All</option>
              {filter.options.map((option: string, index: number) => {
                return (
                  <option key={index} className="bg-backgroundColor text-foregroundColor" value={option}>
                    {option}
                  </option>
                );
              })}
            </select>
          );
        })}
        <button>Apply</button>
      </div>

      <div className="flex gap-3 mt-7">
        <div className="flex h-[48px] w-full items-center relative">
          <input
            type="text"
            placeholder={placeholder}
            name="searchValue"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            className="rounded-lg h-[48px] border border-foregroundColor-25 p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
          />
          <span className="absolute right-5 bg-backgroundColor">
            <FaSearch className="text-foregroundColor-60 text-[20px] " />
          </span>
        </div>
        <button
          disabled={!searchValue}
          className="justify-center flex items-center gap-5 hover:cursor-pointer bg-foregroundColor text-backgroundColor rounded-r-lg p-2 w-50 h-[48px]"
        >
          Search
        </button>
      </div>
    </div>
  );
};
