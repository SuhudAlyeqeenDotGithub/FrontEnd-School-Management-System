"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LoaderButton } from "@/component/compLibrary";
import Link from "next/link";
import { ImBrightnessContrast } from "react-icons/im";
import { useState, useEffect } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [openProfile, setOpenProfile] = useState(false);
  const [lightTheme, setLightTheme] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (!lightTheme) {
      root.style.setProperty("--backgroundColor", "#000000");
      root.style.setProperty("--foregroundColor", "#ffffff");
    } else {
      root.style.setProperty("--backgroundColor", "#ffffff");
      root.style.setProperty("--foregroundColor", "#000000");
    }
  }, [lightTheme]);

  const simulatedRole = {
    _id: "666abc123def456789abcd01",
    organisationId: "665ef123456789abcde45678",
    roleName: "Teacher",
    roleDescription: "Handles academic interactions with students and course content.",
    absoluteAdmin: false,
    tabAccess: {
      Admin: [""],
      Course: ["viewCourses", "viewLevels", "viewSubjects"],
      Student: ["viewStudents", "editStudent"],
      Enrollment: [],
      Attendance: ["createAttendance", "editAttendance", "viewAttendance"],
      Staff: undefined
    },
    createdAt: "2025-06-15T12:30:00Z",
    updatedAt: "2025-06-15T12:30:00Z"
  };

  const tabs = Object.entries(simulatedRole.tabAccess).filter(
    ([key, value]) => Array.isArray(value) && value.length > 0
  );

  const pathname = usePathname();

  const path_NameMap = {
    "/main": "Home",
    "/main/admin": "Admin",
    "/main/admin/rolesandaccess": "Admin",
    "/main/admin/activitylog": "Admin",
    "/main/course": "Course",
    "/main/student": "Student",
    "/main/enrollment": "Enrollment",
    "/main/attendance": "Attendance",
    "/main/attendance/persession": "Attendance",
    "/main/attendance/perday": "Attendance",
    "/main/staff": "Staff",
    "/main/staff/contract": "Staff",
    "/main/staff/profile": "Staff"
  };
  const pathToNameValue = path_NameMap[pathname as keyof typeof path_NameMap];
  const name_PathMap = {
    Home: "/main",
    Admin: "/main/admin",
    Course: "/main/course",
    Student: "/main/student",
    Enrollment: "/main/enrollment",
    Attendance: "/main/attendance",
    Staff: "/main/staff"
  };

  const profileDialog = (
    <div className="flex flex-col border border-foregroundColor-20 w-[400px] h-[200px] p-5 mt-1 gap-5 rounded-lg shadow-md absolute top-[100%] right-5 z-20 bg-backgroundColor">
      <div className="w-full flex justify-end">
        <LoaderButton
          buttonText="Sign Out"
          loadingButtonText="Signing Out..."
          disabled={false}
          buttonStyle="w-1/2"
          isLoading={false}
        />
      </div>
      <div className="flex gap-5 justify-between items-center mx-5">
        <div className="h-25 w-25 rounded-full bg-foregroundColor-10 flex items-center justify-center text-[40px] text-foregroundColor-50 font-bold">
          OR
        </div>
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="text-[18px] font-bold">Organisation Name</span>
          <span className="text-[15px] font-semibold text-foregroundColor-90">Account Name</span>
          <span className="text-[15px] text-foregroundColor-60">user@gmail.com</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center bg-foregroundColor-10 border-b border-foregroundColor-15 px-8 py-1 relative">
        {openProfile && profileDialog}
        {/* nav div */}
        <div className="flex gap-5 w-3/4">
          <Link
            href={`${name_PathMap["Home" as keyof typeof name_PathMap]}`}
            className={`${
              pathToNameValue === "Home" ? "border-b-3" : ""
            } hover:cursor-pointer hover:text-foregroundColor-80`}
          >
            Home
          </Link>

          {tabs.map((tab) => (
            <Link
              href={`${name_PathMap[tab[0] as keyof typeof name_PathMap]}`}
              className={`${
                pathToNameValue === tab[0] ? "border-b-3" : ""
              } hover:cursor-pointer hover:text-foregroundColor-80`}
            >
              {tab[0]}
            </Link>
          ))}
        </div>
        {/* profile and theme div */}
        <div className="flex items-center justify-between gap-5 w-1/4">
          <div
            onClick={() => setLightTheme(!lightTheme)}
            className="hover:cursor-pointer hover:bg-foregroundColor-5 p-1 rounded-full"
          >
            <ImBrightnessContrast className="text-[25px]" />
          </div>

          <div
            className="flex items-center justify-center gap-5 hover:bg-foregroundColor-10 rounded-lg p-2 hover:cursor-pointer"
            onClick={() => setOpenProfile(!openProfile)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">Organisation Name</span>
              <span className="text-[13px]">Account Name</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-foregroundColor-10 flex items-center justify-center text-foregroundColor-50 font-bold">
              OR
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default layout;
