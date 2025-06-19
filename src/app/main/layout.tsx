"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LoaderButton } from "@/lib/component/compLibrary";
import Link from "next/link";
import { ImBrightnessContrast } from "react-icons/im";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchAccount } from "@/redux/features/accounts/accountThunks";
import axios from "axios";
import { ErrorDiv } from "@/lib/component/compLibrary";
import { resetAccount } from "@/redux/features/accounts/accountSlice";
import { useRouter } from "next/navigation";

const layout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { accountData } = useAppSelector((state) => state.orgAccountData);
  const [openProfile, setOpenProfile] = useState(false);
  const [lightTheme, setLightTheme] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccountFunc = async () => {
      try {
        if (!accountData.accountEmail || !accountData.accountName) {
          await dispatch(fetchAccount());
        }
      } catch (err: any) {
        throw err;
      }
    };

    fetchAccountFunc();
  }, []);

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

  const handleSignout = async () => {
    try {
      const response = await axios.get("http://localhost:5000/alyeqeenschoolapp/api/orgaccount/signout", {
        withCredentials: true
      });
      if (response) {
        dispatch(resetAccount());
        router.push("/signin");
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error signing out");
    }
  };

  const { accountName, accountEmail, organisationId, roleId } = accountData;
  const { absoluteAdmin, tabAccess } = roleId;

  const tabs = Object.entries(tabAccess).filter(
    ([key, value]) => (Array.isArray(value) && value.length > 0) || absoluteAdmin
  );

  const pathname = usePathname();

  const path_NameMap = {
    "/main": "Home",
    "/main/admin": "Admin",
    "/main/admin/users": "Admin",
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
    <div className="flex flex-col border border-foregroundColor-20 w-[400px] max-h-[80vh] p-5 mt-1 gap-5 rounded-lg shadow-md absolute top-[100%] right-5 z-20 bg-backgroundColor">
      {error && <ErrorDiv>{error}</ErrorDiv>}
      <div className="w-full flex justify-end">
        <LoaderButton
          buttonText="Sign Out"
          loadingButtonText="Signing Out..."
          disabled={false}
          buttonStyle="w-1/2"
          isLoading={false}
          onClick={handleSignout}
        />
      </div>
      <div className="flex gap-5 justify-between items-center mx-5">
        <div className="h-25 w-25 rounded-full bg-foregroundColor-10 flex items-center justify-center text-[40px] text-foregroundColor-50 font-bold">
          {accountName.slice(0, 2)}
        </div>
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="text-[18px] font-bold">{organisationId.accountName}</span>
          <span className="text-[15px] font-semibold text-foregroundColor-90">{accountName}</span>
          <span className="text-[15px] text-foregroundColor-60">{accountEmail}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center bg-foregroundColor-10 border-b border-foregroundColor-15 px-8 relative">
        {openProfile && profileDialog}
        {/* nav div */}
        <div className="flex gap-5 w-3/4">
          <Link
            href={`${name_PathMap["Home" as keyof typeof name_PathMap]}`}
            className={`${
              pathToNameValue === "Home" ? "border-b-3" : ""
            } hover:cursor-pointer hover:border-b-3 hover:border-foregroundColor-30`}
          >
            Home
          </Link>

          {tabs.map((tab) => (
            <Link
              key={tab[0]}
              href={`${name_PathMap[tab[0] as keyof typeof name_PathMap]}`}
              className={`${
                pathToNameValue === tab[0] ? "border-b-3" : ""
              } hover:cursor-pointer hover:border-b-3 hover:border-foregroundColor-30`}
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
            className="flex items-center justify-center gap-5 hover:bg-foregroundColor-10 rounded-lg px-4 py-1 hover:cursor-pointer"
            onClick={() => setOpenProfile(!openProfile)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{organisationId.accountName}</span>
              <span className="text-[13px]">{accountName}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-foregroundColor-10 flex items-center justify-center text-foregroundColor-50 font-bold">
              {accountName.slice(0, 2)}
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default layout;
