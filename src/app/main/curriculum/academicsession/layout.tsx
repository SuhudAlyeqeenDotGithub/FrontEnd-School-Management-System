"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { CalendarClock, CalendarSync } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: CalendarSync,
      title: "Academic Year",
      subTitle: "Manage Academic Years",
      url: "/main/curriculum/academicsession"
    },
    {
      icon: CalendarClock,
      title: "Periods",
      subTitle: "Terms, Cycle in an Academic Year",
      url: "/main/curriculum/academicsession/period"
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
