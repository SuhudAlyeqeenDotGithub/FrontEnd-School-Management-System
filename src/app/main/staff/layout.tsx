"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { ReactNode } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { LiaFileContractSolid } from "react-icons/lia";
import { UserRoundPen, FileCheck } from "lucide-react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: UserRoundPen,
      title: "Staff Profile",
      subTitle: "Manage Staff Profile",
      url: "/main/staff"
    },
    {
      icon: FileCheck,
      title: "Staff Contracts",
      subTitle: "Manage Staff Contracts",
      url: "/main/staff/contract"
    }
  ];
  return (
    <>
      <SubTabNav tabs={navTabObj} />
      {children}
    </>
  );
};

export default Layout;
