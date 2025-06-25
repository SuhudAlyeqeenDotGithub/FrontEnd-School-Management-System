"use client";
import { useState } from "react";
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

export const ConfirmActionByInputDialog = ({
  confirmWithText,
  onCancel,
  onConfirm,
  warningText
}: {
  confirmWithText: string;
  onCancel: () => void;
  onConfirm: (roleId: string) => void;
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
                onConfirm(confirmWithText);
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
