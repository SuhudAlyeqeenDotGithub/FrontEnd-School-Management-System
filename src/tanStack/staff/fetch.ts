import { handleApiRequest } from "@/axios/axiosClient";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

export const tanFetchStaffProfiles = async (
  accountData: any,
  permittedActions: string[],
  action: string,
  url: string
) => {
  if (!accountData) {
    const msg = "Account data not found.";
    // setError(msg);
    throw new Error(msg);
  }

  if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
    const msg = "Your account is no longer active - Please contact your admin";
    // setError(msg);
    throw new Error(msg);
  }

  if (!permittedActions.includes(action) && !accountData.roleId?.absoluteAdmin) {
    const msg = "Unauthorized: You do not have access to view staff profiles - Please contact your admin";
    // setError(msg);
    throw new Error(msg);
  }

  const res = await handleApiRequest("get", url);
  const responseData = res?.data;
  if (responseData) {
    return res?.data;
  }
};

export const tanFetchStaffContracts = async (
  accountData: any,
  permittedActions: string[],
  action: string,
  url: string
) => {
  if (!accountData) {
    const msg = "Account data not found.";
    // setError(msg);
    throw new Error(msg);
  }

  if (accountData.accountStatus === "Locked" || accountData.accountStatus !== "Active") {
    const msg = "Your account is no longer active - Please contact your admin";
    // setError(msg);
    throw new Error(msg);
  }

  if (!permittedActions.includes(action) && !accountData.roleId?.absoluteAdmin) {
    const msg = "Unauthorized: You do not have access to view staff contracts - Please contact your admin";
    // setError(msg);
    throw new Error(msg);
  }

  const res = await handleApiRequest("get", url);
  const responseData = res?.data;
  if (responseData) {
    return res?.data;
  }
};
