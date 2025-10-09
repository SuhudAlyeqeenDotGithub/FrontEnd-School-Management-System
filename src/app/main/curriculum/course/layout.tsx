"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { BookOpenText, UserRoundSearch } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: BookOpenText,
      title: "Course",
      url: "/main/curriculum/course"
    },
    {
      icon: UserRoundSearch,
      title: "Course Manager",
      url: "/main/curriculum/course/manager"
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
