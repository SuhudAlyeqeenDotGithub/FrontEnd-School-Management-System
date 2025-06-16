import { SubTabNav } from "@/component/compLibrary";
import { ReactNode } from "react";
import { MdAddTask } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { BsDatabaseAdd } from "react-icons/bs";

const Layout = ({ children }: { children: ReactNode }) => {
  const navTabObj = [
    { icon: <MdAddTask />, title: "Roles", subTitle: "Manage Roles & Access", url: "/admin/rolesandaccess" },
    { icon: <FaRegUserCircle />, title: "User", subTitle: "Create Users", url: "/admin/users" },
    { icon: <BsDatabaseAdd />, title: "Activity Log", subTitle: "View User Actions", url: "/admin/activitylog" }
  ];
  return (
    <div className="">
      <SubTabNav tabs={navTabObj} />
      {children}
    </div>
  );
};

export default Layout;
