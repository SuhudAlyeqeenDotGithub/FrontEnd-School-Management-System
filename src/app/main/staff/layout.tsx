"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { ReactNode } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { LiaFileContractSolid } from "react-icons/lia";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    { icon: <FaRegUserCircle />, title: "Profile", subTitle: "Manage Staff Profile", url: "/main/staff" },
    {
      icon: <LiaFileContractSolid />,
      title: "Contracts",
      subTitle: "Manage Staff Contracts",
      url: "/main/staff/contract"
    }
  ];
  return (
    <div className="">
      <SubTabNav tabs={navTabObj} />
      {children}
    </div>
  );
};

export default Layout;
