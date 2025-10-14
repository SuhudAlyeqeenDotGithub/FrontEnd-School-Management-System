"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { LandPlot, NotebookPen, SquareStack, UserRoundSearch } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: LandPlot,
      title: "Topic",
      url: "/main/curriculum/learningplan"
    },
    {
      icon: NotebookPen,
      title: "Syllabus",
      url: "/main/curriculum/learningplan/syllabus"
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
