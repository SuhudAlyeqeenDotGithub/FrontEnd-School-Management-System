import { useAppSelector } from "@/redux/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { tanFetchAny } from "./fetch";
import { ownerMongoId } from "@/lib/shortFunctions/shortFunctions";

const reusableQueries = () => {
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const queryClient = useQueryClient();

  const tab_GroupMap = {
    Home: "Home",

    // Administration
    "Roles & Permission": "Administration",
    Users: "Administration",
    "Activity Log": "Administration",
    Billing: "Administration",
    Setting: "Administration",
    Features: "Administration",

    // Curriculum
    "Academic Session": "Curriculum",
    "Learning Plan": "Curriculum",
    Programme: "Curriculum",
    Course: "Curriculum",
    Level: "Curriculum",
    Subject: "Curriculum",
    Period: "Curriculum",
    Event: "Curriculum",

    // Student
    "Student Attendance": "Student",
    "Student Profile": "Student",
    "Student Enrollment": "Student",

    // Staff
    "Staff Profile": "Staff",
    "Staff Contract": "Staff"
  };
  // get features purchased by organisation
  const features = accountData.organisationId.features;
  // get the tabs included in all features
  const allowedTabsFromFeatures = features?.flatMap((feature: any) => feature.tabs);
  // get the groups included in all features by mapping the tabs
  const allowedGroupsFromFeatures = allowedTabsFromFeatures?.map(
    (tab: any) => tab_GroupMap[tab as keyof typeof tab_GroupMap]
  );

  // get tab access which is an array of group objects each of which is a container for their own tabs - got through role
  const assignedTabAccess = accountData.roleId.tabAccess;

  // get all uniquely assigned tabs for each user
  const uniqueTabs = accountData.uniqueTabAccess;

  // extract the groups of unique tabs
  const uniqueTabsGroups = uniqueTabs.map((tab: any) => tab.group);

  // extract the groups from tab access - got through role
  const assignedTabAccessGroups = assignedTabAccess?.map((group: any) => group.group);

  // get all unique groups from both
  const allUniqueTabsGroup = Array.from(new Set([...uniqueTabsGroups, ...assignedTabAccessGroups]));

  let mergedTabAccess = allUniqueTabsGroup.map((group) => {
    // find group object that matches string in assigned through role tab access
    const groupObject = assignedTabAccess.find((groupObj: any) => groupObj.group === group);

    // if group object does not exist in assigned through role tab access
    //  we return a group object with the tabs from unique tabs
    if (!groupObject) {
      return {
        group,
        tabs: uniqueTabs?.filter((tab: any) => tab.group === group)
      };
    }
    // if found we reconstruct a group object merging the tab objects from assigned through role tab access and unique tabs
    else {
      return {
        ...groupObject,
        tabs: [
          ...groupObject.tabs.filter((tab: any) => allowedTabsFromFeatures?.includes(tab.tab)),
          ...uniqueTabs.filter((tab: any) => tab.group === group && allowedTabsFromFeatures?.includes(tab.tab))
        ]
      };
    }
  });

  // filter out group that is not included in features
  mergedTabAccess = mergedTabAccess.filter((group: any) => allowedGroupsFromFeatures?.includes(group.group));

  // all tabs of each group with access of true
  const groupTabs = mergedTabAccess.flatMap((group: any) => group.tabs);

  const isAbsoluteAdmin = accountData.roleId.absoluteAdmin;

  const featuresFromQuery: any[] = queryClient.getQueryData(["features"]) ?? [];

  const accountPermittedActions = groupTabs
    .map((tab: any) => {
      return tab.actions.filter(({ permission }: any) => permission === true);
    })
    .map((tab: any) => tab.map(({ action }: any) => action))
    .flat();
  const getMergedTabAccess = () => {
    return mergedTabAccess;
  };
  const hasActionAccess = (action: string) => {
    if (isAbsoluteAdmin) return true;
    return accountPermittedActions.includes(action);
  };

  const isOwnerAccount = accountData.accountType === "Owner" && accountData._id === ownerMongoId;

  const useReusableQuery = (
    prefixKey: string,
    action: string,
    url: string,
    options: any = {},
    enable1: boolean = true,
    enable2: boolean = true,
    enable3: boolean = true
  ) => {
    return useQuery<any>({
      queryKey: [prefixKey],
      queryFn: () => tanFetchAny(accountData, accountPermittedActions, action, url),
      enabled: Boolean(
        accountData?.accountStatus && !queryClient.getQueryData([prefixKey]) && enable1 && enable2 && enable3
      ),
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...options
    });
  };

  const useReusableInfiniteQuery = (
    prefixKey: string,
    otherKey: any,
    limit: number,
    action: string,
    baseUrl: string,
    options: any = {}
  ) => {
    return useInfiniteQuery({
      queryKey: [prefixKey, otherKey],
      queryFn: ({ pageParam }) => {
        const queryParam = { ...(pageParam as Record<string, any>), ...otherKey };
        const searchUrl = new URLSearchParams({});
        Object.keys(queryParam).forEach((key) => searchUrl.set(key, queryParam[key]));
        const url = `${baseUrl}?${searchUrl.toString()}`;
        return tanFetchAny(accountData, accountPermittedActions, action, url);
      },
      initialPageParam: { search: "", limit, cursorType: "initial", nextCursor: "", prevCursor: "" },
      getNextPageParam: (lastPage: any, allPages: any) => {
        const newParam = {
          search: "",
          limit,
          cursorType: "next",
          nextCursor: lastPage.nextCursor,
          prevCursor: lastPage.prevCursor
        };
        return lastPage.hasNext ? newParam : null;
      },
      enabled: Boolean(accountData?.accountStatus && !queryClient.getQueryData([prefixKey, otherKey])),
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...options
    });
  };

  return {
    useReusableQuery,
    useReusableInfiniteQuery,
    hasActionAccess,
    getMergedTabAccess,
    featuresFromQuery,
    isOwnerAccount,
    isAbsoluteAdmin,
    orgFeatures: features
  };
};

export default reusableQueries;
