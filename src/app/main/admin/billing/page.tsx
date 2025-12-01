"use client";
import {
  checkDataType,
  dollarToDollar,
  dollarToNaira,
  dollarToPounds,
  getDayDifferenceSafe,
  isExpired,
  makeHumanReadable,
  safeText
} from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { use, useEffect, useState } from "react";
import {
  ActionButtons,
  CustomHeading,
  ErrorDiv,
  InputComponent,
  LoaderDiv,
  NextButton,
  PreviousButton,
  StatusFormatter,
  SuccessDiv
} from "@/lib/customComponents/general/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";

import {
  DisallowedActionDialog,
  ConfirmActionByInputDialog,
  CustomFilterComponent
} from "@/lib/customComponents/general/compLibrary2";

import {
  dataRowCellStyle,
  defaultButtonStyle,
  ghostbuttonStyle,
  paginationContainerStyle,
  sortableTableHeadCellStyle,
  tableCellStyle,
  tableContainerStyle,
  tableHeaderStyle,
  tableRowStyle,
  tableTopStyle
} from "@/lib/generalStyles";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd, MdContentCopy } from "react-icons/md";
import { AlertCircle, Calendar, CheckCircle, Crown } from "lucide-react";
import { BillingDialogComponent } from "@/lib/customComponents/admin/billingDialog";
import { features } from "process";
import { handleApiRequest } from "@/axios/axiosClient";
import { set } from "date-fns";
// import { BillingDialogComponent } from "@/lib/customComponents/admin/billingDialogComp";

const Billing = () => {
  const { useReusableQuery, useReusableInfiniteQuery, hasActionAccess, isOwnerAccount } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const deleteMutation = tanMutateAny("delete", "alyeqeenschoolapp/api/admin/billings");
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeSection, setActiveSection] = useState("billing");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openViewBillingDialog, setOpenViewBillingDialog] = useState(false);
  const [restructuredOrganisations, setRestructuredOrganisations] = useState<any>([]);
  const [openDisallowedDeleteDialog, setOpenDisallowedDeleteDialog] = useState(false);
  const [onOpenBillingDialogData, setOnOpenBillingDialogData] = useState<any>({});
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [confirmWithText, setConfirmWithText] = useState("");
  const [confirmWithReturnObj, setConfirmWithReturnObj] = useState({});
  const [openFilterDiv, setOpenFilterDiv] = useState(false);
  const [paginationData, setPaginationData] = useState<any>({
    totalCount: 0,
    chunkCount: 0,
    hasNext: false
  });
  const [editableSubscriptionData, setEditableSubscriptionData] = useState<any>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimit] = useState("10");
  const [queryParams, setQueryParams] = useState({});
  const [localSubscription, setLocalSubscription] = useState<any>({});
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);
  const [subscriptionUpgraded, setSubscriptionUpgraded] = useState(false);
  const [transactionInitiated, setTransactionInitiated] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState("");
  const {
    subscriptionType,
    organisationId,
    freemiumStartDate,
    freemiumEndDate,
    premiumStartDate,
    premiumEndDate,
    subscriptionStatus,
    billingAddress,
    billingPostcode,
    paymentDetails
  } = localSubscription || {};

  const {
    data: billings,
    isFetching: isFetchingbillings,
    error: billingsError,
    isError: isBillingsError,
    fetchNextPage,
    fetchPreviousPage
  } = useReusableInfiniteQuery(
    "billings",
    queryParams,
    Number(limit) || 10,
    "View Billings",
    "alyeqeenschoolapp/api/admin/billings"
  );

  const {
    data: subscription,
    isFetching: subscriptionIsFetching,
    error: subscriptionError,
    isError: isSubscriptionError
  } = useReusableQuery("subscriptions", "View Subscriptions", `alyeqeenschoolapp/api/admin/billing/subscription`);

  const {
    data: organisations,
    isFetching: organisationsIsFetching,
    error: organisationsError,
    isError: isOrganisationsError
  } = useReusableQuery("organisations", "", `alyeqeenschoolapp/api/admin/billing/organisations`);

  useEffect(() => {
    if (!billings) return;
    const currentPage: any = billings.pages[pageIndex];
    if (currentPage === undefined) return;
    setLocalData(currentPage.billings);
    const { totalCount, chunkCount, hasNext } = currentPage;
    setPaginationData({ totalCount, chunkCount, hasNext });
  }, [billings, isFetchingbillings]);

  useEffect(() => {
    if (!isBillingsError) return;
    if (billingsError) {
      setError(billingsError.message);
    }
  }, [billingsError, isBillingsError]);

  useEffect(() => {
    if (!subscription) return;
    setLocalSubscription(subscription);
  }, [subscription, subscriptionIsFetching]);

  useEffect(() => {
    if (!isSubscriptionError) return;
    if (subscriptionError) {
      setError(subscriptionError.message);
    }
  }, [subscriptionError, isSubscriptionError]);

  useEffect(() => {
    if (!organisations) return;

    const organisationOptions = organisations.map((org: any) => `${org.accountName} | ${org._id}`);

    setRestructuredOrganisations(organisationOptions);
  }, [organisations, organisationsIsFetching]);

  useEffect(() => {
    if (!isOrganisationsError) return;
    if (organisationsError) {
      setError(organisationsError.message);
    }
  }, [organisationsError, isOrganisationsError]);

  const renderNextPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { billings, ...rest } = foundPage;
      setLocalData(billings);
      setPaginationData(rest);
    } else {
      fetchNextPage();
    }
  };

  const renderPreviousPage = (pageIndex: number, pages: any) => {
    const foundPage = pages[pageIndex];
    if (foundPage !== undefined) {
      const { billings, ...rest } = foundPage;
      setLocalData(billings);
      setPaginationData(rest);
    } else {
      fetchPreviousPage();
    }
  };

  if (!hasActionAccess("View Billings")) {
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
          text="Loading Billing Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  if (isFetchingbillings || subscriptionIsFetching || (isOwnerAccount && organisationsIsFetching)) {
    return (
      <div className="flex items-center justify-center mt-10">
        <LoaderDiv
          type="spinnerText"
          borderColor="foregroundColor"
          text="Loading Required Data..."
          textColor="foregroundColor"
          dimension="h-10 w-10"
        />
      </div>
    );
  }

  const upgradeToPremium = async () => {
    try {
      const response = await handleApiRequest("post", `alyeqeenschoolapp/api/admin/billing/subscription/topremium`);
      if (response?.data) {
        setLocalSubscription(response?.data);
        setSubscriptionCancelled(false);
        setSubscriptionUpgraded(true);
        false;
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error upgrading to premium");
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await handleApiRequest("post", `alyeqeenschoolapp/api/admin/billing/subscription/cancel`);
      if (response?.data) {
        setSubscriptionCancelled(true);
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error canceling subscription");
    }
  };

  const features = [
    "Unlimited database operations",
    "Chat bot support",
    "Team collaboration (unlimited users)",
    "Role based access control",
    "User Activity Tracking",
    "Curriculum Management",
    "Staff Management",
    "Student Management",
    "Attendance Management"
  ];

  // function to handle sorting
  const handleSort = (sortKey: any) => {
    const keyType = checkDataType([...localData][0][sortKey]);

    let sortOrder = sortOrderTracker[sortKey];

    // console.log("sortOrder", sortOrder);

    let nextOrder: string;

    if (sortOrder === "dsc") {
      nextOrder = "asc";
    } else {
      nextOrder = "dsc";
    }
    const sortedData = [...localData].sort((a, b) => {
      if (keyType === "number") {
        return sortOrder === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      } else if (keyType === "date") {
        return sortOrder === "asc"
          ? new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()
          : new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime();
      } else if (keyType === "array") {
        return sortOrder === "asc"
          ? a[sortKey][0].tab.localeCompare(b[sortKey][0].tab)
          : b[sortKey][0].tab.localeCompare(a[sortKey][0].tab);
      } else {
        return sortOrder === "asc" ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      }
    });

    setLocalData(sortedData);
    setSortOrderTracker((prev: any) => ({ ...prev, [sortKey]: nextOrder }));
  };

  return (
    <div className="px-4 py-6 w-full">
      {subscriptionCancelled && (
        <DisallowedActionDialog
          onOk={() => setSubscriptionCancelled(false)}
          warningText="Your subscription has been cancelled"
          p1="Please note that you will still be charged the regular cost for usages before the cancellation date."
          p2="This will be on the 5th of next month"
        />
      )}
      {subscriptionUpgraded && (
        <DisallowedActionDialog
          onOk={() => setSubscriptionUpgraded(false)}
          warningText="You have successfully upgraded to premium"
          p1="Your bill for this month will be charged on the 5th of the next month."
          p2="For the meantime you can track your usage in Billing section of your admin dashboard"
        />
      )}
      <div className="flex flex-col">
        <div className={tableTopStyle}>
          {/* title */}
          <div className="flex flex-col">
            <CustomHeading variation="sectionHeader">
              Billings
              {/* <BillingRoundPen className="inline-block ml-4 size-8 mb-2" /> */}
            </CustomHeading>
            <CustomHeading variation="head5light">
              Manage your billing, subscriptions, and payment history
            </CustomHeading>
          </div>
        </div>
        {transactionInitiated && authorizationUrl && (
          <div className="text-green-500 bg-green-50 border border-green-600 p-2 rounded">
            Transaction Initiated. You will be redirected. You can also click
            <a href={authorizationUrl} target="_blank" rel="noopener noreferrer">
              {authorizationUrl}
            </a>{" "}
            to complete the payment.
          </div>
        )}
        {/* Section Tabs */}
        <div className="mb-6 bg-backgroundColor rounded-xl shadow-xs border border-borderColor-2 p-2 mt-5">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveSection("billing");
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "billing"
                  ? "bg-foregroundColor hover:bg-foregroundColor-2 text-backgroundColor shadow-md"
                  : "text-foregroundColor-2 hover:bg-backgroundColor-2"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("subscription");
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "subscription"
                  ? "bg-foregroundColor hover:bg-foregroundColor-2 text-backgroundColor shadow-md"
                  : "text-foregroundColor-2 hover:bg-backgroundColor-2"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("failed");
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "failed"
                  ? "bg-foregroundColor hover:bg-foregroundColor-2 text-backgroundColor shadow-md"
                  : "text-foregroundColor-2 hover:bg-backgroundColor-2"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Failed Payments
                {billings && (
                  <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                    {
                      billings.pages
                        .flatMap((page: any) => page.billings)
                        .filter((bill: any) => bill.paymentStatus === "Failed").length
                    }
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
        {/* billing section */}
        {activeSection === "billing" && (
          <div className="flex flex-col gap-3">
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

            {success && (
              <SuccessDiv
                onClose={(close) => {
                  if (close) {
                    setSuccess("");
                  }
                }}
              >
                {success}
              </SuccessDiv>
            )}
            {openViewBillingDialog && (
              <BillingDialogComponent
                data={onOpenBillingDialogData}
                onClose={(open: boolean) => {
                  document.body.style.overflow = "";
                  setOpenViewBillingDialog(!open);
                  return {};
                }}
                makeHumanReadable={makeHumanReadable}
                dollarToDollar={dollarToDollar}
                dollarToNaira={dollarToNaira}
                dollarToPounds={dollarToPounds}
              />
            )}
            <span onClick={() => setOpenFilterDiv(!openFilterDiv)} className={`${defaultButtonStyle} w-25`}>
              {openFilterDiv ? "Close Filter" : "Open Filter"}
            </span>
            <div hidden={!openFilterDiv}>
              <CustomFilterComponent
                currentQuery={queryParams}
                placeholder="Search role (Billing Name, Email, Status)"
                filters={[
                  {
                    displayText: "Organisation",
                    fieldName: "organisationId",
                    options: ["All", ...restructuredOrganisations]
                  },
                  {
                    displayText: "Bill Status",
                    fieldName: "billingStatus",
                    options: ["All", "Billed", "Not Billed"]
                  },
                  {
                    displayText: "Payment Status",
                    fieldName: "paymentStatus",
                    options: ["All", "Paid", "Unpaid", "Pending", "Failed"]
                  }
                ]}
                onQuery={(query: any) => {
                  setQueryParams(query);
                }}
              />
            </div>

            {/* pagination div */}
            <div className={paginationContainerStyle}>
              <div>
                Showing {paginationData.chunkCount} of {paginationData.totalCount} records
              </div>

              <div className="flex gap-3 items-center">
                <p>Limit</p>
                <div className="w-20">
                  <InputComponent
                    type="text"
                    name="limit"
                    placeholder="5"
                    value={limit}
                    onChange={(e) => {
                      setLimit(e.target.value);
                    }}
                  />
                </div>

                <button
                  className={defaultButtonStyle}
                  onClick={() => {
                    setQueryParams((prev) => ({ ...prev, limit: limit }));
                  }}
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center gap-2">
                <PreviousButton
                  onClick={() => {
                    const prevPage = pageIndex - 1;
                    setPageIndex(prevPage);
                    renderPreviousPage(prevPage, billings.pages);
                  }}
                  disabled={pageIndex === 0}
                />

                <span className=" px-2">
                  Page {pageIndex + 1} of {Math.ceil(paginationData.totalCount / Number(limit))}
                </span>
                <NextButton
                  onClick={() => {
                    const nextPage = pageIndex + 1;
                    setPageIndex(nextPage);
                    renderNextPage(nextPage, billings.pages);
                  }}
                  disabled={!paginationData.hasNext}
                />
              </div>
            </div>
            <div className="flex gap-5">
              <button
                hidden={!isOwnerAccount}
                onClick={async () => {
                  try {
                    const response = await handleApiRequest(
                      "post",
                      "alyeqeenschoolapp/api/admin/billing/chargeoldbills",
                      {}
                    );

                    if (response && response.data) {
                      setSuccess(response.data);
                    }
                  } catch (error: any) {
                    setError(error?.response?.data?.message || "Error charging old bills");
                  }
                }}
                className={defaultButtonStyle}
              >
                Prepare Old Bills
              </button>
              <button
                hidden={!isOwnerAccount}
                onClick={async () => {
                  await handleApiRequest("post", "alyeqeenschoolapp/api/admin/billing/preparelastbills", {});
                }}
                className={defaultButtonStyle}
              >
                Prepare Last Bills
              </button>
              <button
                hidden={!isOwnerAccount}
                onClick={async () => {
                  const response = await handleApiRequest(
                    "post",
                    "alyeqeenschoolapp/api/admin/billing/initializefirstcharge",
                    {
                      email: "suhudalyeqeenapp@gmail.com",
                      amount: 200
                    }
                  );

                  if (response?.data) {
                    const { authorization_url } = response?.data?.data;
                    setTransactionInitiated(true);
                    setAuthorizationUrl(authorization_url);

                    setTimeout(() => {
                      window.open(authorization_url, "_blank");
                    }, 1000);
                  }
                }}
                className={defaultButtonStyle}
              >
                Simulate First Charge
              </button>
            </div>

            {/* table body */}
            <div className={tableContainerStyle}>
              {/* table header */}
              <table className="relative w-full">
                <thead className="sticky top-0 z-10 border-b border-borderColor-2">
                  <tr className={tableHeaderStyle}>
                    <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                      Organisation
                    </th>
                    {(["Bill Id", "Billing Month", "Billing Date", " App Provision Costs"] as const).map((header) => (
                      <th
                        key={header}
                        onClick={() => {
                          const key_Name = {
                            "Bill Id": "billingId",
                            "Billing Date": "paymentStatus",
                            "Billing Month": "billingMonth",
                            " App Provision Costs": "appProvisionCost"
                          };
                          const sortKey = key_Name[header];
                          handleSort(sortKey);
                        }}
                        className={sortableTableHeadCellStyle}
                      >
                        {header} <LuArrowUpDown className="inline-block ml-1" />
                      </th>
                    ))}

                    <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                      Usage
                    </th>
                    <th className="hover:bg-backgroundColor-2 text-center font-semibold whitespace-nowrap text-foregroundColor p-2">
                      Total Cost
                    </th>
                  </tr>
                </thead>

                {/* table data */}
                <tbody className="mt-3 bg-backgroundColor">
                  {isFetchingbillings ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex items-center justify-center p-10">
                          <LoaderDiv
                            type="spinnerText"
                            text="Loading Billings..."
                            textColor="foregroundColor"
                            dimension="h-10 w-10"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (localData.length < 1 && !isFetchingbillings) || !billings ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    localData.map((doc: any, index: any) => {
                      const {
                        billingId,
                        billingMonth,
                        billingDate,
                        billingStatus,
                        totalCost,
                        databaseStorageAndBackup,
                        appProvisionCost,
                        organisationId,
                        databaseOperation,
                        paymentStatus,
                        dollarToNairaRate,
                        dollarToPoundsRate
                      } = doc || {};

                      const { accountName, _id } = organisationId || {};

                      return (
                        <tr
                          key={billingId}
                          onClick={() => {
                            if (hasActionAccess("View Billings")) {
                              document.body.style.overflow = "hidden";
                              setOnOpenBillingDialogData(doc);
                              setOpenViewBillingDialog(true);
                            } else {
                              setError("You do not have View Billing Access - Please contact your admin");
                            }
                          }}
                          className="hover:bg-backgroundColor-2 hover:cursor-pointer border-y border-borderColor-2 h-22 p-7"
                        >
                          <td className="w-[270px] text-center px-3 whitespace-nowrap">
                            <div className="font-semibold text-foregroundColor">{safeText(accountName)}</div>
                            <div className="text-[14px] text-foregroundColor-2">{safeText(_id)}</div>
                          </td>

                          <td className="w-[150px] text-center px-3 whitespace-nowrap font-medium">
                            {safeText(billingId)}
                          </td>

                          <td className="w-[150px] text-center px-3 whitespace-nowrap font-medium">
                            <div className="flex flex-col gap-2 justify-center items-center">
                              <span className="font-medium">{safeText(billingMonth)}</span>
                              <span className="text-foregroundColor-2 text-[14px] font-medium">
                                <StatusFormatter text={billingStatus} />
                              </span>
                            </div>
                          </td>

                          <td className="w-[150px] text-center px-3 whitespace-nowrap font-medium">
                            <div className="flex flex-col gap-2 justify-center items-center">
                              <span className="font-medium">{safeText(billingDate)}</span>
                              <span className="text-foregroundColor-2 text-[14px] font-medium">
                                <StatusFormatter text={paymentStatus} />
                              </span>
                            </div>
                          </td>

                          <td className="w-[270px] text-center px-3 whitespace-nowrap">
                            <div className="font-semibold text-foregroundColor">
                              {makeHumanReadable(dollarToDollar(appProvisionCost), "USD")}
                            </div>
                            <div className="text-[14px] text-foregroundColor-2">
                              {makeHumanReadable(dollarToNaira(appProvisionCost, dollarToNairaRate), "NGN")} •
                              {makeHumanReadable(dollarToPounds(appProvisionCost, dollarToPoundsRate), "GBP")}
                            </div>
                          </td>
                          <td className="w-[150px] text-center px-3 whitespace-nowrap font-medium">
                            <div className="flex flex-col gap-1 justify-center items-center">
                              <span className="font-medium">{safeText(databaseOperation.value)} operations</span>
                              <span className="text-foregroundColor-2 text-[14px] font-medium">
                                {safeText(databaseStorageAndBackup.value.toFixed(2))} GB storage & backup
                              </span>
                            </div>
                          </td>

                          <td className="w-[270px] text-center px-3 whitespace-nowrap">
                            <div className="font-semibold text-foregroundColor">
                              {makeHumanReadable(dollarToDollar(totalCost), "USD")}
                            </div>
                            <div className="text-[14px] text-foregroundColor-2">
                              {makeHumanReadable(dollarToNaira(totalCost, dollarToNairaRate), "NGN")} •
                              {makeHumanReadable(dollarToPounds(totalCost, dollarToPoundsRate), "GBP")}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscription Section */}
        {activeSection === "subscription" && (
          <div className="space-y-6">
            {/* Main Subscription Card */}
            <div className="bg-backgroundColor rounded-xl shadow-md border border-borderColor-2 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                    <Crown className="h-8 w-8 text-backgroundColor" />
                  </div>
                  <h2 className="text-3xl font-bold text-foregroundColor mb-2">{subscriptionType} Plan</h2>
                  <StatusFormatter text={subscriptionStatus} />
                </div>

                {/* Subscription Details Grid */}
                <div className="bg-gradient-to-r from-backgroundColor-3 to-backgroundColor-3/80 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foregroundColor mb-4">Subscription Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-foregroundColor-2 mb-2">Organisation ID</p>
                      <p className="text-base font-medium text-foregroundColor">{organisationId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foregroundColor-2 mb-2">Subscription Type</p>
                      <p className="text-base font-medium text-foregroundColor">{subscriptionType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foregroundColor-2 mb-2">Monthly Price</p>
                      {subscriptionType === "Premium" ? (
                        <div className="space-y-1">
                          <div className="text-base font-medium text-foregroundColor">
                            Usage Cost + App Provision Cost
                          </div>
                        </div>
                      ) : (
                        <p className="text-base font-medium text-foregroundColor">Free</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-foregroundColor-2 mb-2">Freemium Period</p>
                      <p className="text-base font-medium text-foregroundColor">
                        {formatDate(freemiumStartDate)} - {formatDate(freemiumEndDate)}
                      </p>
                    </div>
                    {subscriptionType === "Premium" && (
                      <div>
                        <p className="text-sm text-foregroundColor-2 mb-2">Premium Period</p>
                        <p className="text-base font-medium text-foregroundColor">
                          {formatDate(premiumStartDate)} - {premiumEndDate ? formatDate(premiumEndDate) : "N/A"}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-foregroundColor-2 mb-2">Status</p>
                      <StatusFormatter
                        text={
                          subscriptionType === "Freemium" && isExpired(freemiumEndDate)
                            ? "Inactive"
                            : subscriptionStatus
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foregroundColor mb-4">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-backgroundColor-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-foregroundColor">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  {(subscriptionType === "Freemium" && isExpired(freemiumEndDate)) ||
                    (subscriptionType === "Premium" && subscriptionStatus === "Inactive" && (
                      <button
                        onClick={upgradeToPremium}
                        className="px-4 py-3 rounded-md bg-emerald-600 hover:bg-emerald-600/80 hover:cursor-pointer text-backgroundColor shadow-xs whitespace-nowrap disabled:bg-backgroundColor-4 disabled:text-emerald-600/80 disabled:cursor-not-allowed"
                      >
                        Upgrade to Premium
                      </button>
                    ))}

                  {subscriptionType === "Freemium" && !isExpired(freemiumEndDate) && (
                    <span className="bg-backgroundColor-3 font-medium shadow text-foregroundColor px-4 py-3 rounded-md">
                      You have {getDayDifferenceSafe(freemiumEndDate, new Date())} day(s) left till your Freemium period
                      ends
                    </span>
                  )}
                  {subscriptionType === "Premium" && subscriptionStatus === "Active" && (
                    <button
                      onClick={cancelSubscription}
                      className="px-4 py-3 rounded-md bg-red-500 hover:bg-red-500/80 hover:cursor-pointer text-backgroundColor shadow-xs whitespace-nowrap disabled:bg-backgroundColor-4 disabled:text-red-500/80 disabled:cursor-not-allowed"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="bg-backgroundColor rounded-xl shadow-md border border-borderColor-2 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foregroundColor">Payment & Billing Details</h3>
                  {!isEditingPayment && (
                    <button className={defaultButtonStyle} onClick={() => setIsEditingPayment(true)}>
                      Edit Details
                    </button>
                  )}
                </div>

                {!isEditingPayment ? (
                  // View Mode
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-backgroundColor-2 to-[#0097a7]/5 rounded-xl p-6 border border-borderColor-2">
                      <h4 className="text-lg font-semibold text-foregroundColor mb-4">Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-foregroundColor-2 mb-2">Card Type</p>
                          <p className="text-base font-semibold text-foregroundColor">nOT SET</p>
                        </div>
                        <div>
                          <p className="text-sm text-foregroundColor-2 mb-2">Card Number</p>
                          <p className="text-base font-semibold text-foregroundColor">•••• •••• •••• 2334444</p>
                        </div>
                        <div>
                          <p className="text-sm text-foregroundColor-2 mb-2">Expiry Date</p>
                          <p className="text-base font-semibold text-foregroundColor">nOT SET </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-l from-backgroundColor-2 to-[#0097a7]/5 rounded-xl p-6 border border-borderColor-2">
                      <h4 className="text-lg font-semibold text-foregroundColor mb-4">Billing Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-foregroundColor-2 mb-2">Address</p>
                          <p className="text-base font-semibold text-foregroundColor">dUMMT@example.com</p>
                        </div>
                        <div>
                          <p className="text-sm text-foregroundColor-2 mb-2">Postcode</p>
                          <p className="text-base font-semibold text-foregroundColor">1234</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-backgroundColor-2 to-[#0097a7]/5 rounded-xl p-6 border border-borderColor-2">
                      <h4 className="text-lg font-semibold text-foregroundColor mb-4">Update Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2"></label>
                          <InputComponent title="Card Number" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2"></label>
                          <InputComponent title="Expiry Date" type="date" placeholder="MM/YYYY" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-L from-backgroundColor-2 to-[#0097a7]/5 rounded-xl p-6 border border-borderColor-2">
                      <h4 className="text-lg font-semibold text-foregroundColor mb-4">Update Billing Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Billing Address</label>
                          <textarea
                            placeholder="Enter your billing address"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2"></label>
                          <InputComponent title="Billing Postcode" type="text" placeholder="Enter postcode" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                      <button className={defaultButtonStyle} onClick={() => setIsEditingPayment(false)}>
                        Cancel
                      </button>
                      <button className={defaultButtonStyle}>Save Changes</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Failed Payments Section */}
        {activeSection === "failed" && (
          <>
            {displayedData.length === 0 ? (
              <div className="bg-backgroundColor rounded-xl shadow-md border border-borderColor-2 p-12 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foregroundColor mb-2">All Caught Up!</h3>
                <p className="text-foregroundColor-2">You have no failed payments at this time.</p>
              </div>
            ) : (
              <div className="bg-backgroundColor rounded-xl shadow-md border border-borderColor-2 overflow-hidden">
                <div className="bg-rose-50 border-b border-rose-200 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-foregroundColor">Failed Payments</h3>
                      <p className="text-sm text-foregroundColor-2">These payments require your attention</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-rose-100 to-red-100 border-b border-borderColor-2">
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Bill ID</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Billing Month</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Due Date</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Payment Method</th>
                        <th className="py-4 px-6 text-right text-sm font-semibold text-slate-700">Amount</th>
                        <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedData.map((bill, index) => (
                        <tr
                          key={bill.id}
                          onClick={() => setSelectedBill(bill)}
                          className={`cursor-pointer hover:bg-rose-50 transition-colors border-b border-slate-100 ${
                            index % 2 === 0 ? "bg-backgroundColor" : "bg-slate-50"
                          }`}
                        >
                          <td className="py-4 px-6 font-medium text-foregroundColor">{bill.id}</td>
                          <td className="py-4 px-6 text-foregroundColor-2">{bill.billingMonth}</td>
                          <td className="py-4 px-6 text-foregroundColor-2">{bill.dueDate}</td>
                          <td className="py-4 px-6 text-foregroundColor-2">{bill.paymentMethod}</td>
                          <td className="py-4 px-6">
                            <CompactCurrencyDisplay amount={bill.totalCost} />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRetryPayment(bill.id);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-backgroundColor rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                              >
                                <RefreshCw className="h-4 w-4" />
                                Retry Payment
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBill(bill);
                                }}
                                className="p-2 text-foregroundColor-2 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;
