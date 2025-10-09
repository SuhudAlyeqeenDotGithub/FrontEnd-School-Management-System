"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { SquareStack, UserRoundSearch } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: SquareStack,
      title: "Level",
      url: "/main/curriculum/level"
    },
    {
      icon: UserRoundSearch,
      title: "Level Manager",
      url: "/main/curriculum/level/manager"
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
