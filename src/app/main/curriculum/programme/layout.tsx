"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { BookOpenText, UserRoundSearch } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: BookOpenText,
      title: "Programme",
      url: "/main/curriculum/programme"
    },
    {
      icon: UserRoundSearch,
      title: "Programme Manager",
      url: "/main/curriculum/programme/manager"
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
