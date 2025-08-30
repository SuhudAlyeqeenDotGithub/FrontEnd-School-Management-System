import { useAppSelector } from "@/redux/hooks";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { tanFetchAny } from "../timeline/fetch";

const reusableQueries = () => {
  const { accountData } = useAppSelector((state) => state.accountData);
  const queryClient = useQueryClient();

  const accountPermittedActions = accountData.roleId.tabAccess.flatMap((tab: any) =>
    tab.actions.filter((action: any) => action.permission).map((action: any) => action.name)
  );
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

  return { useReusableQuery };
};

export default reusableQueries;
