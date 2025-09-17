import { useAppSelector } from "@/redux/hooks";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { tanFetchAny } from "./fetch";

const reusableQueries = () => {
  const { accountData } = useAppSelector((state: any) => state.accountData);
  const queryClient = useQueryClient();

  // return group with access of true
  const assignedTabAccess = accountData.roleId.tabAccess;

  const uniqueTabs = accountData.uniqueTabAccess;

  const uniqueTabsGroups = new Set(uniqueTabs.map((tab: any) => tab.group));

  const assignedTabAccessGroups = assignedTabAccess.map((group: any) => group.group);

  const allUniqueTabsGroup = [...uniqueTabsGroups, ...assignedTabAccessGroups];

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

  const useReusableQuery = (
    prefixKey: string,
    permission: string,
    url: string,
    options: any = {},
    enable1: boolean = true,
    enable2: boolean = true,
    enable3: boolean = true
  ) => {
    return useQuery({
      queryKey: [prefixKey],
      queryFn: () => tanFetchAny(accountData, accountPermittedActions, permission, url),
      enabled: Boolean(
        accountData?.accountStatus && !queryClient.getQueryData([prefixKey]) && enable1 && enable2 && enable3
      ),
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...options
    });
  };

  return { useReusableQuery, hasActionAccess, getMergedTabAccess, isAbsoluteAdmin };
};

export default reusableQueries;
