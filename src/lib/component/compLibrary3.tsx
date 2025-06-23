import { ContainerComponent } from "./compLibrary";

export const DisallowedActionDialog = ({ onOk, warningText }: { onOk: () => void; warningText: string }) => {
  return (
    <div className="w-[100%] h-[100%] bg-foregroundColor-80 items-center justify-center flex absolute inset-0">
      <ContainerComponent style="min-w-[500px] h-[150px] z-50 flex flex-col bg-backgroundColor gap-10 items-center justify-center">
        <span>{warningText}</span>
        <div className="w-full flex justify-center px-30 items-center">
          <button onClick={onOk}>Ok</button>
        </div>
      </ContainerComponent>
    </div>
  );
};
