"use client";
import { SubTabNav } from "@/lib/component/compLibrary";
import { ReactNode } from "react";
import { MdAddTask } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { BsDatabaseAdd } from "react-icons/bs";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    { icon: <MdAddTask />, title: "Roles", subTitle: "Manage Roles & Access", url: "/main/admin" },
    { icon: <FaRegUserCircle />, title: "Users", subTitle: "Create Users", url: "/main/admin/users" },
    { icon: <BsDatabaseAdd />, title: "Activity Log", subTitle: "View User Actions", url: "/main/admin/activitylog" }
  ];
  return (
    <div className="">
      <SubTabNav tabs={navTabObj} />
      {children}
    </div>
  );
};

export default Layout;
