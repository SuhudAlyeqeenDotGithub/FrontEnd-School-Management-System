"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { BookUser, LibraryBig, SquareLibrary, SquareStack, UserRoundSearch } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: SquareLibrary,
      title: "Base Subject",
      url: "/main/curriculum/subject/basesubject"
    },
    {
      icon: BookUser,
      title: "Base Subject Manager",
      url: "/main/curriculum/subject/basesubject/manager"
    },
    {
      icon: LibraryBig,
      title: "Subject",
      url: "/main/curriculum/subject"
    },
    {
      icon: UserRoundSearch,
      title: "Subject Teacher",
      url: "/main/curriculum/subject/teacher"
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
