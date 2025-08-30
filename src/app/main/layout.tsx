"use client";
import { ReactNode, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  IconFormatter,
  LoaderButton,
  SideBarNav,
  TabLink,
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
  Timer,
  Menu,
  Home,
  UserRoundPen,
  FileCheck,
  ChevronDown,
  Building,
  Icon
} from "lucide-react";
import { useTheme } from "next-themes";

const layout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { handleNavigation } = useNavigationHandler();
  const { accountData } = useAppSelector((state) => state.accountData);
  const [openProfile, setOpenProfile] = useState(false);
  // const [lightTheme, setLightTheme] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState("");
  const [groupExpandCollapseState, setGroupExpandCollapseState] = useState<any>({
    Curriculum: true,
    Administration: true,
    Finance: true,
    Assessment: true,
    Attendance: true
  });
  const wrapperDivRef = useRef<HTMLDivElement>(null);

  try {
    useWebSocketHandler((error) => {
      setError(error);
    });
  } catch (err: any) {
    setError(err.message || "Something went wrong");
  }

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

  // useEffect(() => {
  //   const root = document.documentElement;
  //   if (!lightTheme) {
  //     root.style.setProperty("--backgroundColor", "oklch(18.032% 0.07258 267.521)");
  //     root.style.setProperty("--foregroundColor", "#ffffff");
  //   } else {
  //     root.style.setProperty("--backgroundColor", "#ffffff");
  //     root.style.setProperty("--foregroundColor", "oklch(12.9% 0.042 264.695)");
  //   }
  // }, [lightTheme]);

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
  const { absoluteAdmin, tabAccess } = roleId;

  // tabAccess = [group: "",{tab: "Admin", actions:[{name: "Create Role", permission: false}]}]

  const tabs = tabAccess.map((tabObj: any) => tabObj.tab);

  const mockTabAccess = [
    {
      group: "Administration",
      hasAccess: true,
      tabs: [
        {
          group: "Administration",
          tab: "Roles & Permissions",
          hasAccess: false,
          actions: [
            { action: "Create Role", permission: false },
            { action: "View Roles", permission: false },
            { action: "Edit Role", permission: false },
            { action: "Delete Role", permission: false }
          ]
        },
        {
          group: "Administration",
          tab: "Users",
          hasAccess: false,
          actions: [
            { action: "Create User", permission: false },
            { action: "View Users", permission: false },
            { action: "Edit User", permission: false },
            { action: "Delete User", permission: false }
          ]
        },
        {
          group: "Administration",
          tab: "Activity Log",
          hasAccess: false,
          actions: [
            { action: "Create Activity Log", permission: false },
            { action: "View Activity Logs", permission: false },
            { action: "Edit Activity Log", permission: false },
            { action: "Delete Activity Log", permission: false }
          ]
        },
        {
          group: "Administration",
          tab: "Billing",
          hasAccess: false,
          actions: [
            { action: "Create Billing", permission: false },
            { action: "View Billings", permission: false },
            { action: "Edit Billing", permission: false },
            { action: "Delete Billing", permission: false },
            { action: "Update Subscription", permission: false },
            { action: "View Subscriptions", permission: false },
            { action: "Update Failed Payments", permission: false },
            { action: "View Failed Payments", permission: false }
          ]
        },
        {
          group: "Administration",
          tab: "Settings",
          hasAccess: false,
          actions: [
            { action: "Update Settings", permission: false },
            { action: "Edit Organisation Profile", permission: false }
          ]
        }
      ]
    },
    {
      group: "Attendance",
      hasAccess: true,
      tabs: [
        {
          group: "Attendance",
          tab: "Per Subject Attendance",
          hasAccess: false,
          actions: [
            { action: "Create Subject Attendance", permission: false },
            { action: "View Subject Attendances", permission: false },
            { action: "Edit Subject Attendance", permission: false },
            { action: "Delete Subject Attendance", permission: false }
          ]
        },
        {
          group: "Attendance",
          tab: "Per Day Attendance",
          hasAccess: false,
          actions: [
            { action: "Create Day Attendance", permission: false },
            { action: "View Day Attendances", permission: false },
            { action: "Edit Day Attendance", permission: false },
            { action: "Delete Day Attendance", permission: false }
          ]
        },
        {
          group: "Attendance",
          tab: "Event Attendance",
          hasAccess: false,
          actions: [
            { action: "Create Event Attendance", permission: false },
            { action: "View Event Attendances", permission: false },
            { action: "Edit Event Attendance", permission: false },
            { action: "Delete Event Attendance", permission: false }
          ]
        }
      ]
    },
    {
      group: "Curriculum",
      hasAccess: true,
      tabs: [
        {
          group: "Curriculum",
          tab: "Programme",
          hasAccess: false,
          actions: [
            { action: "Create Programme", permission: false },
            { action: "View Programmes", permission: false },
            { action: "Edit Programme", permission: false },
            { action: "Delete Programme", permission: false },
            { action: "Create Programme Manager", permission: false },
            { action: "View Programme Managers", permission: false },
            { action: "Edit Programme Manager", permission: false },
            { action: "Delete Programme Manager", permission: false }
          ]
        },
        {
          group: "Curriculum",
          tab: "Course",
          hasAccess: false,
          actions: [
            { action: "Create Course", permission: false },
            { action: "View Courses", permission: false },
            { action: "Edit Course", permission: false },
            { action: "Delete Course", permission: false },
            { action: "Create Base Course", permission: false },
            { action: "View Base Courses", permission: false },
            { action: "Edit Base Course", permission: false },
            { action: "Delete Base Course", permission: false },
            { action: "Create Course Manager", permission: false },
            { action: "View Course Managers", permission: false },
            { action: "Edit Course Manager", permission: false },
            { action: "Delete Course Manager", permission: false }
          ]
        },
        {
          group: "Curriculum",
          tab: "Level",
          hasAccess: false,
          actions: [
            { action: "Create Level", permission: false },
            { action: "View Levels", permission: false },
            { action: "Edit Level", permission: false },
            { action: "Delete Level", permission: false },
            { action: "Create Level Manager", permission: false },
            { action: "View Level Managers", permission: false },
            { action: "Edit Level Manager", permission: false },
            { action: "Delete Level Manager", permission: false }
          ]
        },
        {
          group: "Curriculum",
          tab: "Subject",
          hasAccess: false,
          actions: [
            { action: "Create Base Subject", permission: false },
            { action: "View Base Subjects", permission: false },
            { action: "Edit Base Subject", permission: false },
            { action: "Delete Base Subject", permission: false },
            { action: "Create Subject", permission: false },
            { action: "View Subjects", permission: false },
            { action: "Edit Subject", permission: false },
            { action: "Delete Subject", permission: false },
            { action: "Create Subject Manager", permission: false },
            { action: "View Subject Managers", permission: false },
            { action: "Edit Subject Manager", permission: false },
            { action: "Delete Subject Manager", permission: false }
          ]
        },
        {
          group: "Curriculum",
          tab: "Learning Plan",
          hasAccess: false,
          actions: [
            { action: "Create Syllabus", permission: false },
            { action: "View Syllabus", permission: false },
            { action: "Edit Syllabus", permission: false },
            { action: "Delete Syllabus", permission: false },
            { action: "Create Topic", permission: false },
            { action: "View Topics", permission: false },
            { action: "Edit Topic", permission: false },
            { action: "Delete Topic", permission: false },
            { action: "Create Timetable", permission: false },
            { action: "View Timetables", permission: false },
            { action: "Edit Timetable", permission: false },
            { action: "Delete Timetable", permission: false }
          ]
        },
        {
          group: "Curriculum",
          tab: "Academic Session",
          hasAccess: false,
          actions: [
            { action: "Create Academic Year", permission: false },
            { action: "View Academic Years", permission: false },
            { action: "Edit Academic Year", permission: false },
            { action: "Delete Academic Year", permission: false },
            { action: "Create Period", permission: false },
            { action: "View Periods", permission: false },
            { action: "Edit Period", permission: false },
            { action: "Delete Period", permission: false }
          ]
        },
        {
          group: "Curriculum",
          tab: "Location",
          hasAccess: false,
          actions: [
            { action: "Create Location", permission: false },
            { action: "View Locations", permission: false },
            { action: "Edit Location", permission: false },
            { action: "Delete Location", permission: false }
          ]
        }
      ]
    }
  ];

  const path_NameMap = {
    "/main": "Home",
    "/main/admin": "Admin",
    "/main/admin/users": "Admin",
    "/main/admin/activitylog": "Admin",
    "/main/admin/billing": "Admin",
    "/main/course": "Course",
    "/main/student": "Student",
    "/main/timeline": "Timeline",
    "/main/timeline/period": "Timeline",
    "/main/enrollment": "Enrollment",
    "/main/attendance": "Attendance",
    "/main/attendance/persession": "Attendance",
    "/main/attendance/perday": "Attendance",
    "/main/staff": "Staff",
    "/main/staff/contract": "Staff",
    "/main/staff/profile.ts": "Staff"
  };
  const pathToNameValue = path_NameMap[pathname as keyof typeof path_NameMap];
  const name_PathMap = {
    Home: "/main",
    Admin: "/main/admin",
    Course: "/main/course",
    Student: "/main/student",
    Enrollment: "/main/enrollment",
    Attendance: "/main/attendance",
    Staff: "/main/staff",
    Timeline: "/main/timeline"
  };

  const tabToIconMap = {
    Home: Home,
    Curriculum: GraduationCap,
    Administration: Settings,
    Course: BookOpen,
    Subject: FileText,
    Attendance: ClipboardCheck,
    "Staff Profile": UserRoundPen,
    "Staff Contracts": FileCheck
  };

  const profileDialog = (
    <div
      ref={wrapperDivRef}
      className="flex flex-col border border-foregroundColor-20 w-[400px] max-h-[80vh] p-5 mt-1 gap-5 rounded-lg shadow-md absolute top-[100%] right-5 z-20 bg-backgroundColor"
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
          <span className="text-[15px] text-foregroundColor-60">({accountData.roleId.roleName.slice(0, 16)})</span>
        </div>
      </div>
    </div>
  );

  return (
    // main app container
    <div className="flex">
      {/* {triggerUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onYes={() => {
            handleNavigation(proceedUrl, true);
          }}
          onNo={() => {
            document.body.style.overflow = "";
            handleNavigation(proceedUrl, false);
          }}
        />
      )} */}

      {/* sidebar */}
      <div className="flex flex-col gap-3 pb-4 border-r border-borderColor px-5 w-[400px] bg-backgroundColor not-only:h-screen sticky top-0 overflow-auto">
        {openProfile && profileDialog}

        {/* school detail div*/}
        <div className="flex items-center gap-5 p-3 border-b border-borderColor h-[100px] sticky top-0 z-20 bg-backgroundColor">
          <>
            <Building className="h-8 w-8 text-indigo-600" />
            <div>
              <h2 className="font-bold">Al-Yeqeen</h2>
              <p className="text-xs text-slate-500">School Management System</p>
            </div>
          </>

          {/* theme toggle */}
          <div
            title="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:cursor-pointer hover:text-foregroundColor-2 p-1 rounded-full"
          >
            <ImBrightnessContrast className="text-[25px]" />
          </div>
        </div>

        {/* nav div */}
        <div className="flex flex-col gap-3 py-3">
          <TabLink
            icon={tabToIconMap["Home" as keyof typeof tabToIconMap]}
            tab="Home"
            url={name_PathMap[pathToNameValue as keyof typeof name_PathMap]}
          />

          {mockTabAccess.length > 0 &&
            mockTabAccess.map(({ group, hasAccess, tabs }: any, index) => {
              const icon_UrlTabs =
                tabs.length > 0 &&
                tabs.map((tabObj: any) => ({
                  ...tabObj,
                  icon: tabToIconMap[tabObj.tab as keyof typeof tabToIconMap],
                  url: name_PathMap[tabObj.tab as keyof typeof name_PathMap]
                }));
              return (
                hasAccess && (
                  <div className="flex flex-col">
                    <div
                      key={group}
                      className="flex gap-4 px-5 py-3 text-foregroundColor-2 rounded-md font-medium hover:bg-backgroundColor-2 bg-backgroundColor-3 hover:cursor-pointer items-center justify-between shadow-xs"
                      onClick={() =>
                        setGroupExpandCollapseState((prev: any) => ({
                          ...prev,
                          [group]: !groupExpandCollapseState[group]
                        }))
                      }
                    >
                      <div className="flex gap-3">
                        <IconFormatter icon={tabToIconMap[group as keyof typeof tabToIconMap]} className="size-5" />
                        <span className="">{group}</span>
                      </div>

                      <ChevronDown className={`inline-block ${groupExpandCollapseState[group] ? "" : "rotate-180"}`} />
                    </div>
                    {/* link divs */}
                    <div hidden={groupExpandCollapseState[group]}>
                      {tabs.length > 0 && <SideBarNav tabs={icon_UrlTabs} />}
                    </div>
                  </div>
                )
              );
            })}

          {tabs.map((tab) => (
            <span
              key={tab}
              className={`${
                pathToNameValue === tab ? "border-b-3 border-foregroundColor" : ""
              } hover:cursor-pointer hover:border-b-3 hover:border-foregroundColor-30`}
              onClick={() => {
                handleNavigation(`${name_PathMap[tab as keyof typeof name_PathMap]}`);
              }}
            >
              {tab}
            </span>
          ))}
        </div>
        {/* profile and theme div */}
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
