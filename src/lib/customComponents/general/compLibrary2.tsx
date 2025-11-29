"use client";
import { useEffect, useRef, useState } from "react";
import { ContainerComponent, CustomHeading, ErrorDiv, InputComponent } from "./compLibrary";
import { FaSearch } from "react-icons/fa";

import { IoClose } from "react-icons/io5";
import { defaultButtonStyle, ghostbuttonStyle } from "@/lib/generalStyles";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import reusableQueries from "@/tanStack/reusables/reusableQueries";

export const DateRangePicker = ({
  onClose,
  defaultDate
}: {
  onClose: (dates: { from: string | undefined; to: string | undefined }) => void;
  defaultDate?: any;
}) => {
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>(undefined);

  useEffect(() => {
    if (defaultDate === undefined) {
      setDate(undefined);
    } else {
      setDate({
        from: defaultDate.from ? new Date(defaultDate.from) : undefined,
        to: defaultDate.to ? new Date(defaultDate.to) : undefined
      });
    }
  }, [defaultDate]);

  const handleSelect = (
    range:
      | {
          from?: Date | undefined;
          to?: Date | undefined;
        }
      | undefined
  ) => {
    setDate(range ? { from: range.from, to: range.to } : undefined);
    if (range?.from && range?.to) {
      const formattedRange = {
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to, "yyyy-MM-dd")
      };
      onClose(formattedRange);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="px-4 py-2 rounded-sm border border-borderColor bg-backgroundColor text-foregroundColor hover:bg-backgroundColor-2 hover:cursor-pointer shadow-xs whitespace-nowrap h-[43px]">
            <CalendarIcon className="mr-2 h-4 w-4 inline-block" />
            {date?.from && date?.to ? (
              <>
                {format(date!.from as Date, "dd MMM yyyy")} – {format(date!.to as Date, "dd MMM yyyy")}
              </>
            ) : (
              <span>Pick a date range</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="range" numberOfMonths={4} selected={date} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const DisallowedActionDialog = ({
  onOk,
  warningText,
  p1,
  p2
}: {
  onOk: () => void;
  warningText: string;
  p1?: string;
  p2?: string;
}) => {
  return (
    <div className="w-[100%] h-[100%] bg-foregroundColor-transparent items-center justify-center z-30 flex fixed inset-0">
      <ContainerComponent style="min-w-[500px] max-h-[300px] z-50 flex flex-col bg-backgroundColor gap-5 items-center justify-center">
        <span>{warningText}</span>
        <p>{p1}</p>
        <p>{p2}</p>
        <div className="w-full flex justify-center px-30 items-center">
          <button onClick={onOk} className={defaultButtonStyle}>
            Ok
          </button>
        </div>
      </ContainerComponent>
    </div>
  );
};

export const SearchableDropDownInput = ({
  title,
  disabled = false,
  placeholder,
  data,
  displayKeys,
  searchFieldKey = "searchText",
  onSelected,
  onClearSearch,
  defaultText = ""
}: {
  title?: string;
  searchFieldKey?: string;
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

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  useEffect(() => {
    if (defaultText) {
      onSelected([defaultText.split("|")[0], defaultText.split("|")[1]], false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpenOptions(false);
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
        option[searchFieldKey].toLowerCase().includes(searchValue.toLowerCase())
      );
      setLocalData(filteredOptions);
    } else {
      setOpenOptions(false);
      setLocalData(data);
      onClearSearch(true);
    }
  }, [searchValue]);
  return (
    <div ref={wrapperRef} className="w-full flex flex-col gap-1 relative">
      <InputComponent
        title={title || placeholder}
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
          className={`z-30 border border-borderColor rounded-sm py-2 shadow-md w-full h-[150px] overflow-auto flex flex-col items-center bg-backgroundColor absolute top-[100%] gap-1}`}
        >
          {localData.length < 1 ? (
            <div>No match value</div>
          ) : (
            localData.map((option: any, index: number) => {
              return (
                <div
                  className="w-full flex items-center hover:bg-backgroundColor-2 hover:cursor-pointer px-5 py-1"
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
                    .filter((key: string) => key !== "searchText" && key !== "_id" && key !== "tabAccess")
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
    <div className="w-[100%] h-[100%] bg-foregroundColor-transparent items-center justify-center z-30 flex fixed inset-0">
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
          <button onClick={onCancel} className={defaultButtonStyle}>
            Cancel
          </button>
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
            className={defaultButtonStyle}
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
  onQuery,
  currentQuery
}: {
  placeholder: string;
  filters: { displayText: string; fieldName: string; options: string[] }[];
  onQuery: (query: any) => void;
  currentQuery?: any;
}) => {
  const { isOwnerAccount } = reusableQueries();
  const [filterQuery, setFilterQuery] = useState<Record<string, string>>(currentQuery);
  const [defaultDate, setDefaultDate] = useState<{ from: string | undefined; to: string | undefined } | undefined>({
    from: currentQuery?.from,
    to: currentQuery?.to
  });
  const { search } = filterQuery;
  console.log("filterQuery", filterQuery);
  return (
    <div className="flex flex-col rounded-lg border border-borderColor bg-backgroundColor shadow my-4">
      <div className="bg-backgroundColor rounded-t-md w-full px-5 py-4 font-bold border-b border-borderColor flex justify-between items-center">
        <CustomHeading variation="head2">Filter & Search</CustomHeading>
      </div>

      <div className="px-5 py-4 flex flex-col gap-5">
        <div className="flex h-[48px] items-center relative w-[60%]">
          <input
            type="text"
            placeholder={placeholder}
            name="search"
            value={search}
            onChange={(e) => {
              setFilterQuery((prev: any) => ({ ...prev, search: e.target.value.trim() }));
            }}
            className="rounded-lg h-[48px] border border-borderColor p-2 pl-15 outline-none focus:border-b-3 focus:border-borderColor-3 w-full"
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
              onQuery({ ...filterQuery, search: "" });
            }}
          >
            <IoClose className="text-foregroundColor-60 text-[20px] " />
          </span>
        </div>
        <div className="flex gap-3">
          {isOwnerAccount && filters.find((filter) => filter.fieldName === "organisationId") && (
            <div key={"organisationId"} className="flex flex-col gap-1">
              <span className="text-foregroundColor-2 font-medium">{"Organisation"}</span>
              <select
                className="bg-backgroundColor border border-borderColor shadow-xs rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full"
                value={filterQuery["organisationId"]}
                onChange={(e) => {
                  setFilterQuery((prev: any) => ({
                    ...prev,
                    ["organisationId"]: e.target.value
                  }));
                }}
              >
                <option value="" disabled>
                  {"Organisation"}
                </option>
                {filters
                  .find((filter) => filter.fieldName === "organisationId")
                  ?.options.map((option: string, index: number) => {
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
          )}
          {filters
            .filter((filter) => filter.fieldName !== "organisationId")
            .map((filter: any, index: number) => {
              return (
                <div key={index} className="flex flex-col gap-1">
                  <span className="text-foregroundColor-2 font-medium">{filter.displayText}</span>
                  <select
                    className="bg-backgroundColor border border-borderColor shadow-xs rounded p-2 outline-none focus:border-b-3 focus:border-borderColor-3 w-full"
                    value={filterQuery[filter.fieldName]}
                    onChange={(e) => {
                      setFilterQuery((prev: any) => ({
                        ...prev,
                        [filter.fieldName]: e.target.value
                      }));
                    }}
                  >
                    <option value="" disabled>
                      {filter.displayText}
                    </option>
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
          <div className="flex flex-col gap-1">
            <span className="text-foregroundColor-2 font-medium">Dates Between # & #</span>
            <DateRangePicker
              defaultDate={defaultDate}
              onClose={({ from, to }: { from: string | undefined; to: string | undefined }) => {
                setDefaultDate({ from, to });
                setFilterQuery((prev: any) => ({ ...prev, from: from || "", to: to || "" }));
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className={defaultButtonStyle}
            onClick={() => {
              const copyQuery = { ...filterQuery };
              const { search, ...filters } = copyQuery;
              const filtersValues = Object.values(filters);
              const alls = filtersValues.filter((value) => value === "all");
              if (alls.length === filtersValues.length && search === "") {
                onQuery({});
              } else {
                onQuery(filterQuery);
              }
            }}
          >
            Run
          </button>
          <button
            className={ghostbuttonStyle}
            onClick={() => {
              setDefaultDate(undefined);
              const copyQuery = { ...filterQuery };
              for (const key in copyQuery) {
                copyQuery[key] = key !== "search" && key !== "from" && key !== "to" ? "all" : "";
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
  );
};
