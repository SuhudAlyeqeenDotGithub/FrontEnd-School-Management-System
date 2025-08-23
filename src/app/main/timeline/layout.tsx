"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { ReactNode } from "react";
import { MdOutlineSchool } from "react-icons/md";
import { TbBellSchool } from "react-icons/tb";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    { icon: <MdOutlineSchool />, title: "Academic Years", subTitle: "Manage Academic Years", url: "/main/timeline" },
    {
      icon: <TbBellSchool />,
      title: "Periods",
      subTitle: "Terms, Cycle in an Academic Year",
      url: "/main/timeline/period"
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
