"use client";
import { useEffect, useRef, useState } from "react";
import { ContainerComponent, ErrorDiv, InputComponent } from "./compLibrary";
import { FaSearch } from "react-icons/fa";

import { IoClose } from "react-icons/io5";

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
      onSelected([defaultText.split("|")[0], defaultText.split("|")[1]], false);
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
        autocomplete="off"
        disabled={disabled}
        name="searchValue"
        value={searchValue}
        onChange={(e) => {
          setOpenOptions(true);
          setSearchValue(e.target.value);
        }}
        onFocus={() => {
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
                  className="w-full flex items-center hover:bg-foregroundColor-5 hover:cursor-pointer px-5 py-1"
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
  filters,
  onQuery
}: {
  placeholder: string;
  filters: { displayText: string; fieldName: string; options: string[] }[];
  onQuery: (query: any) => void;
}) => {
  const [filterQuery, setFilterQuery] = useState<Record<string, string>>({ search: "" });
  const { search } = filterQuery;

  return (
    <div className="rounded-lg flex flex-col border border-foregroundColor-25">
      <div className="bg-foregroundColor-3 w-full px-5 py-6 font-bold border-b border-foregroundColor-25 flex justify-between items-center">
        <h2>Filter & Search</h2>
      </div>
      <div className="px-5 py-6">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex h-[48px] items-center relative w-[60%]">
            <input
              type="text"
              placeholder={placeholder}
              name="search"
              value={search}
              onChange={(e) => {
                setFilterQuery((prev: any) => ({ ...prev, search: e.target.value.trim() }));
              }}
              className="rounded-lg h-[48px] border border-foregroundColor-25 p-2 pl-15 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
            />

            <span className="absolute left-5 bg-backgroundColor">
              <FaSearch className="text-foregroundColor-60 text-[19px] " />
            </span>
            <span
              title="Clear"
              hidden={!search}
              className="absolute right-5 bg-backgroundColor hover:cursor-pointer"
              onClick={() => {
                setFilterQuery((prev: any) => ({ ...prev, search: "" }));
              }}
            >
              <IoClose className="text-foregroundColor-60 text-[20px] " />
            </span>
          </div>
          {filters.map((filter: any, index: number) => {
            return (
              <div key={index} className="flex flex-col gap-2">
                <select
                  className="rounded-lg hover:cursor-pointer border border-foregroundColor-25 px-4 bg-backgroundColor text-foregroundColor h-[48px]"
                  value={filterQuery[filter.fieldName]}
                  onChange={(e) => {
                    setFilterQuery((prev: any) => ({ ...prev, [filter.fieldName]: e.target.value }));
                  }}
                >
                  <option value=""> {filter.displayText}</option>
                  {filter.options.map((option: string, index: number) => {
                    return (
                      <option
                        key={index}
                        className="bg-backgroundColor text-foregroundColor"
                        value={option === "All" ? option.toLowerCase() : option}
                      >
                        {option}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
          <div className="flex gap-3">
            <button
              className="justify-center flex items-center gap-5 hover:cursor-pointer bg-foregroundColor text-backgroundColor rounded-r-lg p-2 w-30 h-[48px]"
              onClick={() => onQuery(filterQuery)}
            >
              Run
            </button>
            <button
              className="ghostbutton w-40"
              onClick={() => {
                const copyQuery = { ...filterQuery };
                for (const key in copyQuery) {
                  copyQuery[key] = key !== "search" ? "all" : "";
                }
                setFilterQuery(copyQuery);

                onQuery({});
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
