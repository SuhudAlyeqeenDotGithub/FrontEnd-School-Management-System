import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-backgroundColor-3">
      <div className=" flex flex-col items-center">
        <div className="h-15 w-40">
          <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
        </div>
        <p className="text-[16px] text-[#0097a7]  font-medium">School Management System</p>
      </div>
      {children}
    </div>
  );
};

export default layout;
