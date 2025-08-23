import { handleApiRequest } from "@/axios/axiosClient";

export const tanFetchAny = async (accountData: any, permittedActions: string[], action: string, url: string) => {
  if (!accountData) {
    const msg = "Account data not found.";
    throw new Error(msg);
  }

  if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
    const msg = "Your account is no longer active - Please contact your admin";
    throw new Error(msg);
  }

  if (!permittedActions.includes(action) && !accountData.roleId?.absoluteAdmin) {
    const msg = `Unauthorized: You do not have access to ${action} - Please contact your admin`;
    throw new Error(msg);
  }
  const res = await handleApiRequest("get", url);
  const responseData = res?.data;
  if (responseData) {
    return res?.data;
  }
};
