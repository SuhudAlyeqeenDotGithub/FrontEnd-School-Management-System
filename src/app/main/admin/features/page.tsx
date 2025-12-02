"use client";
import {
  checkDataType,
  dollarToNaira,
  dollarToPounds,
  generateSearchText,
  getDollarNairaRate,
  getDollarPoundsRate,
  makeHumanReadable
} from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import {
  ActionButtons,
  CustomBadge,
  CustomHeading,
  DeleteButton,
  ErrorDiv,
  IconFormatter,
  LoaderDiv,
  SearchComponent
} from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
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
  CalendarSync,
  CalendarRange,
  Puzzle,
  Check
} from "lucide-react";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { DisallowedActionDialog, ConfirmActionByInputDialog } from "@/lib/customComponents/general/compLibrary2";
import {
  defaultButtonStyle,
  sortableTableHeadCellStyle,
  tableCellStyle,
  tableContainerStyle,
  tableHeadCellStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import { MdAdd, MdContentCopy } from "react-icons/md";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
const Features = () => {
  const { useReusableQuery, hasActionAccess, orgFeatures } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/admin/features");
  const { accountData } = useAppSelector((state) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [openNewRoleDialog, setOpenNewRoleDialog] = useState(false);
  const [openViewRoleDialog, setOpenViewRoleDialog] = useState(false);
  const [onOpenRoleData, setOnOpenRoleData] = useState<any>({});
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});

  const {
    data: features,
    isPending,
    isFetching,
    isError,
    error: featuresError
  } = useReusableQuery("features", "View Roles", "alyeqeenschoolapp/api/admin/features");

  useEffect(() => {
    if (!features) return;

    setLocalData(features);
  }, [features, isPending]);

  useEffect(() => {
    if (!isError) return;
    if (featuresError) {
      setError(featuresError.message);
    }
  }, [featuresError, isError]);

  useEffect(() => {
    if (!features) return;
    if (searchValue !== "") {
      const filteredData = (features as any[]).filter((obj: any) => {
        const searchText = generateSearchText([obj.name, obj.description, obj.price, obj.availability]);
        obj = { ...obj, searchText };
        return obj.searchText.toLowerCase().includes(searchValue.toLowerCase());
      });
      setLocalData(filteredData);
    } else {
      setLocalData(features);
    }
  }, [searchValue]);

  if (!hasActionAccess("View Roles")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <div className=" flex flex-col items-center mb-5">
          <div className="h-20 w-45">
            <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
          </div>
          <p className="text-[18px] text-[#0097a7]  font-medium">Management System</p>
        </div>
        <h1 className="text-4xl font-bold mb-4">Unauthorized Access</h1>
        <p className="mb-6">Oops! You do not have access to this page - Contact your admin if you need access</p>
        <a href="/main" className="text-[#0097a7]  underline">
          Go back home
        </a>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading User Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (!features) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Roles..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (featuresError)
    return (
      <ErrorDiv
        onClose={(close) => {
          if (close) {
            setError("");
          }
        }}
      >
        {error}
      </ErrorDiv>
    );

  const feature_IconMap = {
    Home: Home,
    Curriculum: GraduationCap,
    Administration: Settings,
    Course: BookOpen,
    Subject: LibraryBig,
    "Student Attendance": ClipboardCheck,
    "Student Assessment": FileText,
    TimeTable: Timer,
    "Student Profile & Enrollment": UserRoundCheck,
    "Staff Profile & Contract": BookUser
  };

  return (
    <div className="px-8 py-6 w-full bg-foregroundColor-3">
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

      {/* data table section */}
      <div className="">
        {/* {openEditRoleDialog && (
          <div className="fixed flex z-30 items-center justify-center inset-0 bg-foregroundColor-transparent">
            <RoleDialog
              type="edit"
              data={onOpenRoleData}
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenEditRoleDialog(!open);
                return {};
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenEditRoleDialog(!notSave);
                return {};
              }}
            />
          </div>
        )}
        {openNewRoleDialog && (
          <div className="fixed flex z-30 items-center justify-center inset-0 bg-foregroundColor-transparent">
            <RoleDialog
              type="new"
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenNewRoleDialog(!open);
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenNewRoleDialog(!notSave);
              }}
            />
          </div>
        )}
        {openViewRoleDialog && (
          <div className="fixed flex z-30 items-center justify-center inset-0 bg-foregroundColor-transparent">
            <RoleDialog
              type="view"
              data={onOpenRoleData}
              onClose={(open: boolean) => {
                document.body.style.overflow = "";
                setOpenViewRoleDialog(!open);
              }}
              onSave={(notSave) => {
                document.body.style.overflow = "";
                setOpenViewRoleDialog(!notSave);
              }}
            />
          </div>
        )} */}
        {openConfirmDelete && (
          <ConfirmActionByInputDialog
            returnObject={confirmWithReturnObj}
            confirmWithText={confirmWithText}
            onCancel={() => {
              document.body.style.overflow = "";
              setOpenConfirmDelete(false);
              setError("");
            }}
            onConfirm={async (confirmed, returnObject) => {
              setError("");
              if (confirmed) {
                try {
                  const response = await deleteMutation.mutateAsync(returnObject);
                } catch (err: any) {
                  setError(err.message);
                }
              } else {
                setError("An error occured while deleting - Please try again");
              }
              setOpenConfirmDelete(false);
              document.body.style.overflow = "";
            }}
            warningText="Please confirm the ID of the feature you want to delete"
          />
        )}
        {/* table header */}
        <div className="text-center mb-12 flex flex-col items-center gap-2">
          <div className="mb-5">
            <h1 className="text-4xl font-bold text-foregroundColor mb-4">Feature Marketplace</h1>
            <p className="text-lg text-foregroundColor-2 max-w-2xl mx-auto">
              Enhance your platform with powerful features. Add what you need, when you need it.
            </p>
          </div>
          <SearchComponent
            placeholder="Search features by name, description"
            name="searchValue"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto h-[calc(100vh-250px)] pr-5">
          {localData.map((feature: any) => {
            const isAdded = feature.mandatory || orgFeatures.some((f: any) => f._id === feature._id);

            return (
              <div
                key={feature._id}
                onClick={() => {
                  if (feature.mandatory) return;

                  alert("Yh you just purchased");
                }}
                className={`rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                  isAdded ? "border-indigo-300 bg-indigo-50/70" : "border-slate-200 hover:border-indigo-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <IconFormatter
                      icon={feature_IconMap[feature.name as keyof typeof feature_IconMap]}
                      className="h-6 w-6 text-indigo-600"
                    />
                  </div>
                  {isAdded && (
                    <CustomBadge variant="success">
                      <Check className="h-3 w-3 mr-1" />
                      Added
                    </CustomBadge>
                  )}
                  {feature.availability === "Launching Soon" && (
                    <CustomBadge variant="warning">Launching Soon</CustomBadge>
                  )}
                  {!isAdded && feature.availability === "Available" && (
                    <CustomBadge variant="default">Purchase</CustomBadge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{feature.description}</p>

                {feature.tabs.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs text-slate-500 mb-2">Included Tabs:</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.tabs.map((tab: string) => (
                        <CustomBadge key={tab} variant="info">
                          {tab}
                        </CustomBadge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-indigo-600">{makeHumanReadable(feature.price, "USD")}</p>
                    <p className="text-xs text-slate-500">
                      per month + usage - <strong>{feature.mandatory && "covered by app cost"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">
                      {makeHumanReadable(dollarToNaira(feature.price, getDollarNairaRate), "NGN")}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600">
                      {makeHumanReadable(dollarToPounds(feature.price, getDollarPoundsRate), "GBP")}
                    </span>
                  </div>
                  {feature.mandatory && (
                    <div className="pt-2">
                      <CustomBadge variant="mandatory">Mandatory</CustomBadge>
                    </div>
                  )}
                </div>

                {feature.requirements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Required Feature(s):</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.requirements.map((requiredFeature: any) => {
                        return (
                          requiredFeature && (
                            <CustomBadge key={requiredFeature} variant="danger">
                              {requiredFeature}
                            </CustomBadge>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default Features;
