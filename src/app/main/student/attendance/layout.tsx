"use client";
import { SubTabNav } from "@/lib/customComponents/general/compLibrary";
import { CalendarClock, CalendarFold, CalendarPlus } from "lucide-react";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    {
      icon: CalendarClock,
      title: "Day Attendance",
      url: "/main/student/attendance"
    },
    {
      icon: CalendarFold,
      title: "Subject Attendance",
      url: "/main/student/attendance/subject"
    },
    {
      icon: CalendarPlus,
      title: "Event Attendance",
      url: "/main/student/attendance/event"
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
