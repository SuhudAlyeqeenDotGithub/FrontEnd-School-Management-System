"use client";
import { useEffect, useState } from "react";
import { ContainerComponent, ErrorDiv, InputComponent } from "./compLibrary";

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
  placeholder,
  data,
  displayKeys,
  onSelected,
  onClearSearch
}: {
  placeholder: string;
  data: any[];
  displayKeys: string[];
  onSelected: (selectedDataId: string) => {};
  onClearSearch: (cleared: boolean) => {};
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [localData, setLocalData] = useState<any>([]);
  const [openOptions, setOpenOptions] = useState(false);

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
    <div className="w-full items-center justify-center relative">
      <InputComponent
        placeholder={placeholder}
        required
        name="searchValue"
        value={searchValue}
        onChange={(e) => {
          setOpenOptions(true);
          setSearchValue(e.target.value);
        }}
      />
      <div
        className={`border border-foregroundColor-15 shadow-md w-full h-[150px] overflow-auto flex flex-col items-center bg-backgroundColor absolute gap-1 ${
          !openOptions && "hidden"
        }`}
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
                  setSearchValue(option["name"]);
                  setOpenOptions(false);
                  onSelected(option["_id"]);
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
    <div className="w-[100%] h-[100%] bg-foregroundColor-50 items-center justify-center flex fixed inset-0">
      <ContainerComponent style="min-w-[500px] max-h-[300px] z-50 flex flex-col bg-backgroundColor gap-5 items-center justify-center">
        <span>{warningText}</span>
        {error && <ErrorDiv>{error}</ErrorDiv>}
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
