import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-1/2 gap-5">
        <h1>Al-Yeqeen School Management App</h1>
        {children}
      </div>
    </div>
  );
};

export default layout;
