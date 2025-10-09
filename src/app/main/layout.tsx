"use client";
import { ReactNode, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  IconFormatter,
  LoaderButton,
  SideBarNav,
  TabLink,
  ThemeSelector,
  YesNoDialog
} from "@/lib/customComponents/general/compLibrary";
import Link from "next/link";
import { ImBrightnessContrast } from "react-icons/im";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchAccount } from "@/redux/features/accounts/accountThunks";
import axios from "axios";
import { ErrorDiv } from "@/lib/customComponents/general/compLibrary";
import { resetAccount } from "@/redux/features/accounts/accountSlice";
import { useRouter } from "next/navigation";
import { useNavigationHandler } from "@/lib/shortFunctions/clientFunctions.ts/clientFunctions";
import useWebSocketHandler from "@/lib/shortFunctions/clientFunctions.ts/websocketHandler";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  Settings,
  Clock,
  CreditCard,
  BookOpen,
  FileText,
  School,
  Layers,
  Signature,
  Timer,
  Menu,
  BookUser,
  Home,
  BookOpenCheck,
  UserRoundPen,
  FileCheck,
  ChevronDown,
  Building,
  Icon,
  Waypoints,
  SquareStack,
  LibraryBig,
  UserCog,
  ShieldPlus,
  Receipt,
  Activity,
  Wrench,
  CalendarFold,
  CalendarPlus,
  CalendarClock,
  PanelRightOpen,
  PanelRightClose,
  Sun,
  UserRoundCheck,
  User,
  CalendarSync
} from "lucide-react";
import { useTheme } from "next-themes";
import reusableQueries from "@/tanStack/reusables/reusableQueries";

const layout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { handleNavigation } = useNavigationHandler();
  const { getMergedTabAccess } = reusableQueries();
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [openProfile, setOpenProfile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [mergedTabAccess, setMergedTabAccess] = useState<any>([]);
  const [openSideBar, setOpenSideBar] = useState(true);
  const [groupExpandCollapseState, setGroupExpandCollapseState] = useState<any>({
    Curriculum: true,
    Administration: true,
    Staff: true,
    Finance: true,
    Assessment: true,
    Attendance: true,
    Student: true
  });
  const wrapperDivRef = useRef<HTMLDivElement>(null);

  // try {
  //   useWebSocketHandler((error) => {
  //     setError(error);
  //   });
  // } catch (err: any) {
  //   setError(err.message || "Something went wrong");
  // }

  const themes = ["light", "dark", "emerald", "teal", "indigo", "plum"];
  useWebSocketHandler();

  useEffect(() => {
    const fetchAccountFunc = async () => {
      try {
        if (!accountData.accountEmail || !accountData.accountName) {
          await dispatch(fetchAccount());
        }
      } catch (err: any) {
        setError(err);
      }
    };

    fetchAccountFunc();
  }, []);

  useEffect(() => {
    if (!accountData.accountEmail || !accountData.accountName) return;
    const fetchedMergedTabAccess = getMergedTabAccess();
    setMergedTabAccess(fetchedMergedTabAccess);
  }, [accountData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperDivRef.current && !wrapperDivRef.current.contains(event.target as Node)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSignout = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/signout`, {
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

  if (!accountData || Object.keys(accountData).length === 0)
    return (
      <Link href="/signin" className="hover:underline">
        We could not retrieve your details. Try refreshing or signing in again
      </Link>
    );

  const { accountName, accountEmail, organisationId, roleId } = accountData;

  // tabAccess = [group: "",{tab: "Admin", actions:[{name: "Create Role", permission: false}]}]

  const path_GroupMap = {
    "/main": "Home",
    "/main/admin": "Administration",
    "/main/admin/users": "Administration",
    "/main/admin/roles": "Administration",
    "/main/admin/activitylog": "Administration",
    "/main/admin/billing": "Administration",
    "/main/curriculum": "Curriculum",
    "/main/curriculum/academicsession": "Curriculum",
    "/main/curriculum/programme": "Curriculum",
    "/main/curriculum/programme/manager": "Curriculum",
    "/main/curriculum/course": "Curriculum",
    "/main/curriculum/course/manager": "Curriculum",
    "/main/curriculum/level": "Curriculum",
    "/main/curriculum/level/manager": "Curriculum",
    "/main/curriculum/academicsession/period": "Curriculum",
    "/main/curriculum/academicsession/academicYear": "Curriculum",
    "/main/enrollment": "Enrollment",
    "/main/attendance": "Attendance",
    "/main/attendance/persession": "Attendance",
    "/main/attendance/perday": "Attendance",
    "/main/attendance/event": "Attendance",
    "/main/staff": "Staff",
    "/main/staff/contract": "Staff",
    "/main/staff/profile": "Staff",
    "/main/student": "Student",
    "/main/student/enrollment": "Student",
    "/main/student/profile": "Student"
  };

  const tab_PathMap = {
    Home: "/main",
    "Roles & Permission": "/main/admin/roles",
    Users: "/main/admin/users",
    "Activity Log": "/main/admin/activitylog",
    Billing: "/main/admin/billing",
    Student: "/main/student/profile",
    "Academic Session": "/main/curriculum/academicsession",
    Programme: "/main/curriculum/programme",
    Course: "/main/curriculum/course",
    Level: "/main/curriculum/level",
    Period: "/main/curriculum/academicsession/period",
    Enrollment: "/main/enrollment",
    "Per Day Attendance": "/main/attendance/perday",
    "Per Session Attendance": "/main/attendance/persession",
    "Event Attendance": "/main/attendance/event",
    "Staff Profile": "/main/staff/profile",
    "Staff Contract": "/main/staff/contract",
    "Student Profile": "/main/student/profile",
    "Student Enrollment": "/main/student/enrollment"
  };

  const tab_IconMap = {
    Home: Home,
    Curriculum: GraduationCap,
    Administration: Settings,
    Course: BookOpen,
    Subject: LibraryBig,
    Attendance: ClipboardCheck,
    Assessment: FileText,
    TimeTable: Timer,
    "Staff Profile": UserRoundPen,
    "Staff Contract": Signature,
    Staff: BookUser,
    "Academic Session": Clock,
    "Academic Year": CalendarSync,
    Period: CalendarClock,
    Programme: BookOpenCheck,
    "Student Profile": User,
    "Student Enrollment": UserRoundCheck,
    Student: Users,
    Location: School,
    "Learning Plan": Waypoints,
    Level: SquareStack,
    Users: UserCog,
    "Roles & Permission": ShieldPlus,
    Billing: Receipt,
    "Activity Log": Activity,
    Setting: Wrench,
    "Per Day Attendance": CalendarClock,
    "Per Subject Attendance": CalendarFold,
    "Event Attendance": CalendarPlus
  };

  const profileDialog = (
    <div
      ref={wrapperDivRef}
      className="flex flex-col border border-borderColor w-[290px] max-h-[80vh] min-h-[40vh] px-4 py-4 gap-5 rounded-lg shadow-md absolute bottom-2 z-30 bg-backgroundColor-2"
    >
      {error && (
        <ErrorDiv
          onClose={(close) => {
            if (close) {
              setError("");
            }
          }}
        >
          {error}
        </ErrorDiv>
      )}
      <div className="w-full flex justify-between items-center gap-2">
        <div className="h-20 w-20 rounded-full bg-foregroundColor flex items-center justify-center text-[40px] text-backgroundColor font-bold">
          {accountName.slice(0, 2)}
        </div>
        <div className="w-1/2 h-full">
          <LoaderButton
            buttonText="Sign Out"
            loadingButtonText="Signing Out..."
            disabled={false}
            isLoading={false}
            onClick={handleSignout}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between items-center w-full">
        <div className="flex flex-col gap-1 justify-center items-center">
          <span className="text-[18px] font-bold">{organisationId.accountName}</span>
          <span className="text-[15px] font-semibold">{accountName}</span>
          <span className="text-[15px] text-foregroundColor-60 text-slate-500">{accountEmail}</span>
          <span className="text-[15px] text-foregroundColor-60">({accountData.roleId.roleName.slice(0, 16)})</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex text-[15px]">
      {/* sidebar */}
      <div
        hidden={!openSideBar}
        className="flex flex-col pb-4 border-r border-borderColor w-[370px] bg-backgroundColor h-screen relative"
      >
        {/* top side bar */}

        <div className="flex flex-col items-center gap-5 p-3 bg-backgroundColor sticky top-0 z-20">
          <div className="flex w-full justify-between">
            <div className="w-full flex gap-5 items-center">
              <Building className="h-8 w-8 text-indigo-600" />
              <div>
                <h2 className="font-bold">Al-Yeqeen</h2>
                <p className="text-xs text-foregroundColor-2">School Management System</p>
              </div>
            </div>

            {/* side bar toggle */}
            <div>
              {openSideBar ? (
                <PanelRightOpen
                  className="size-6 text-foregroundColor-2 hover:text-borderColor-3 cursor-pointer"
                  onClick={() => {
                    const groupExpandCollapseStateCopy = { ...groupExpandCollapseState };
                    Object.keys(groupExpandCollapseStateCopy).forEach((key) => {
                      groupExpandCollapseStateCopy[key] = true;
                    });

                    setGroupExpandCollapseState(groupExpandCollapseStateCopy);
                    setOpenSideBar(!openSideBar);
                  }}
                />
              ) : (
                <PanelRightClose
                  className="size-6 text-foregroundColor-2 hover:text-borderColor-3 cursor-pointer"
                  onClick={() => {
                    setOpenSideBar(!openSideBar);
                  }}
                />
              )}
            </div>
          </div>
          {/* theme toggle */}
          <div className="flex items-center w-full border-y border-borderColor py-1 px-5">
            <ThemeSelector />
          </div>
        </div>

        {/* nav div */}
        <div className="flex flex-col gap-3 py-3 h-full px-3 overflow-auto">
          <div
            className={`flex gap-4 px-3 py-3 rounded-md hover:cursor-pointer text-foregroundColor-2 hover:bg-backgroundColor-3 items-center whitespace-nowrap ${
              pathname === "/main" ? "font-bold rounded text-foregroundColor" : ""
            }`}
            onClick={() => {
              handleNavigation(tab_PathMap["Home" as keyof typeof tab_PathMap]);
            }}
          >
            <span
              hidden={pathname !== "/main"}
              className={`${pathname === "/main" ? "bg-green-500 w-2 h-2 rounded-full" : ""}`}
            ></span>
            <IconFormatter icon={tab_IconMap["Home" as keyof typeof tab_IconMap]} className="size-5" />
            Home
          </div>
          {mergedTabAccess.length > 0 &&
            mergedTabAccess.map(({ group, hasAccess, tabs }: any) => {
              const icon_UrlTabs =
                tabs.length > 0 &&
                tabs.map((tabObj: any) => ({
                  ...tabObj,
                  icon: tab_IconMap[tabObj.tab as keyof typeof tab_IconMap],
                  url: tab_PathMap[tabObj.tab as keyof typeof tab_PathMap]
                }));

              return (
                <div key={group} className="flex flex-col">
                  <div
                    className={`flex gap-4 px-3 py-3 rounded-md text-foregroundColor-2 hover:bg-backgroundColor-3 hover:cursor-pointer items-center whitespace-nowrap ${
                      path_GroupMap[pathname as keyof typeof path_GroupMap] === group
                        ? "font-bold rounded text-foregroundColor"
                        : ""
                    }`}
                    onClick={() =>
                      setGroupExpandCollapseState((prev: any) => ({
                        ...prev,
                        [group]: !groupExpandCollapseState[group]
                      }))
                    }
                  >
                    <span
                      hidden={path_GroupMap[pathname as keyof typeof path_GroupMap] !== group}
                      className={`${
                        path_GroupMap[pathname as keyof typeof path_GroupMap] === group
                          ? "bg-green-500 w-2 h-2 rounded-full"
                          : ""
                      }`}
                    ></span>
                    <div className="flex justify-between w-full">
                      <div className="flex gap-3">
                        <IconFormatter icon={tab_IconMap[group as keyof typeof tab_IconMap]} className="size-5" />
                        <span className="">{group}</span>
                      </div>
                      <ChevronDown
                        className={`inline-block ${groupExpandCollapseState[group] ? "rotate-270" : "rotate-180"}`}
                      />
                    </div>
                  </div>
                  {/* link divs */}
                  <div hidden={groupExpandCollapseState[group]}>
                    {tabs.length > 0 && <SideBarNav tabs={icon_UrlTabs} />}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="sticky bottom-0 z-20">
          {openProfile && profileDialog}
          {/* profile and theme div */}
          <div
            className="flex items-center justify-center gap-5 hover:bg-backgroundColor border-t border-borderColor px-4 py-4 hover:cursor-pointer bg-backgroundColor-2"
            onClick={() => setOpenProfile(!openProfile)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{organisationId.accountName}</span>
              <span className="text-[13px]">{accountName}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-backgroundColor-3 flex items-center justify-center text-foregroundColor-2 font-bold">
              {accountName.slice(0, 2)}
            </div>
          </div>
        </div>
      </div>

      {/* collapsed side bar */}
      <div
        hidden={openSideBar}
        className="flex flex-col pb-4 border-r border-borderColor min-w-[150px] bg-backgroundColor h-screen relative"
      >
        {/* top side bar */}
        <div className="sticky top-0 z-20">
          <div className="flex flex-col items-center gap-5 p-3 bg-backgroundColor">
            <div className="flex w-full justify-between">
              <div className="w-full flex gap-5 items-center">
                <Building className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                {openSideBar ? (
                  <PanelRightOpen
                    className="size-6 text-foregroundColor-2 hover:text-borderColor-3 cursor-pointer"
                    onClick={() => {
                      const groupExpandCollapseStateCopy = { ...groupExpandCollapseState };
                      Object.keys(groupExpandCollapseStateCopy).forEach((key) => {
                        groupExpandCollapseStateCopy[key] = true;
                      });

                      setGroupExpandCollapseState(groupExpandCollapseStateCopy);
                      setOpenSideBar(!openSideBar);
                    }}
                  />
                ) : (
                  <PanelRightClose
                    className="size-6 text-foregroundColor-2 hover:text-borderColor-3 cursor-pointer"
                    onClick={() => setOpenSideBar(!openSideBar)}
                  />
                )}
              </div>
            </div>
            {/* theme toggle */}
            <div className="flex items-center justify-center w-full border-y border-borderColor py-2 px-5">
              <Sun
                className="size-6 text-foregroundColor-2 hover:text-borderColor-3 cursor-pointer"
                onClick={() => setOpenSideBar(!openSideBar)}
              />
            </div>
          </div>
        </div>

        {/* school detail div*/}

        {/* nav div */}
        <div className="flex flex-col gap-3 py-3 h-full px-3 overflow-auto">
          <div
            className={`flex flex-col gap-1 px-4 py-2 cursor-pointer items-center justify-center whitespace-nowrap  rounded ${
              pathname === "/main"
                ? "font-bold bg-backgroundColor-2 text-foregroundColor"
                : "text-foregroundColor-2 hover:bg-backgroundColor-2 "
            }`}
            onClick={() => {
              handleNavigation(tab_PathMap["Home" as keyof typeof tab_PathMap]);
            }}
          >
            <IconFormatter icon={tab_IconMap["Home" as keyof typeof tab_IconMap]} className="size-5" />

            <span className="text-foregroundColor-2 w-full flex gap-2 items-center justify-center">
              <span
                hidden={pathname !== "/main"}
                className={`${pathname === "/main" ? "bg-green-500 w-2 h-2 rounded-full" : ""}`}
              ></span>
              <p>Home</p>
            </span>
          </div>
          {mergedTabAccess.length > 0 &&
            mergedTabAccess.map(({ group, hasAccess, tabs }: any) => {
              const icon_UrlTabs =
                tabs.length > 0 &&
                tabs.map((tabObj: any) => ({
                  ...tabObj,
                  icon: tab_IconMap[tabObj.tab as keyof typeof tab_IconMap],
                  url: tab_PathMap[tabObj.tab as keyof typeof tab_PathMap]
                }));

              return (
                <div key={group} className="flex flex-col">
                  <div
                    className={`flex flex-col py-2 gap-1 px-4 cursor-pointer items-center justify-center whitespace-nowrap hover:bg-backgroundColor-2 rounded ${
                      path_GroupMap[pathname as keyof typeof path_GroupMap] === group
                        ? "font-bold bg-backgroundColor-2 text-foregroundColor"
                        : ""
                    }`}
                    onClick={() => {
                      if (tabs.length > 0) {
                        setOpenSideBar(true);
                      }
                    }}
                  >
                    <IconFormatter icon={tab_IconMap[group as keyof typeof tab_IconMap]} className="size-5" />
                    <div className="text-foregroundColor-2 w-full flex gap-2 items-center justify-center">
                      <span
                        hidden={path_GroupMap[pathname as keyof typeof path_GroupMap] !== group}
                        className={`${
                          path_GroupMap[pathname as keyof typeof path_GroupMap] === group
                            ? "bg-green-500 w-2 h-2 rounded-full"
                            : ""
                        }`}
                      ></span>
                      <p>{group}</p>
                    </div>
                  </div>
                  {/* link divs */}
                  <div hidden={groupExpandCollapseState[group]}>
                    {tabs.length > 0 && <SideBarNav tabs={icon_UrlTabs} />}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-backgroundColor-2 w-screen h-screen overflow-auto">
        {error && (
          <ErrorDiv
            onClose={(close) => {
              if (close) {
                setError("");
              }
            }}
          >
            {error}
          </ErrorDiv>
        )}
        {children}
      </div>
    </div>
  );
};

export default layout;
