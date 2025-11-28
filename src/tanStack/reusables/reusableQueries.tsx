import { useAppSelector } from "@/redux/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { tanFetchAny } from "./fetch";
import { ownerMongoId } from "@/lib/shortFunctions/shortFunctions";

const reusableQueries = () => {
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const queryClient = useQueryClient();

  // return group with access of true
  const assignedTabAccess = accountData.roleId.tabAccess;

  const uniqueTabs = accountData.uniqueTabAccess;

  const uniqueTabsGroups = uniqueTabs.map((tab: any) => tab.group);

  const assignedTabAccessGroups = assignedTabAccess.map((group: any) => group.group);

  const allUniqueTabsGroup = Array.from(new Set([...uniqueTabsGroups, ...assignedTabAccessGroups]));

  const mergedTabAccess = allUniqueTabsGroup.map((group) => {
    const groupObject = assignedTabAccess.find((groupObj: any) => groupObj.group === group);
    if (!groupObject) {
      return {
        group,
        tabs: uniqueTabs.filter((tab: any) => tab.group === group)
      };
    } else {
      return { ...groupObject, tabs: [...groupObject.tabs, ...uniqueTabs.filter((tab: any) => tab.group === group)] };
    }
  });

  // all tabs of each group with access of true
  const groupTabs = mergedTabAccess.flatMap((group: any) => group.tabs);

  const isAbsoluteAdmin = accountData.roleId.absoluteAdmin;

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
    isOwnerAccount,
    isAbsoluteAdmin
  };
};

export default reusableQueries;
