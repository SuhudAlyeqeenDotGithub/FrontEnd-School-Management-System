import axios from "axios";
import { BASE_API_URL, subscriptionErrors } from "@/lib/shortFunctions/shortFunctions";

export const handleApiRequest = async (method: "get" | "post" | "put" | "delete", url: string, data?: any) => {
  const refinedUrl = `${BASE_API_URL}/${url}`;
  try {
    const config = {
      method,
      url: refinedUrl,
      withCredentials: true,
      ...(method === "get" && data ? { params: data } : {}),
      ...(method !== "get" && data ? { data } : {})
    };

    const response = await axios.request(config);
    if (response.data) {
      return response;
    }
  } catch (err: any) {
    const message = err.response?.data?.message;
    const isUnauthenticated = message === "No Access Token Found" || message === "Invalid Access token";

    if (isUnauthenticated) {
      try {
        const refreshResponse = await axios.post(
          `${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/refreshaccesstoken`,
          {},
          {
            withCredentials: true
          }
        );
        if (refreshResponse.data) {
          const config = {
            method,
            url: refinedUrl,
            withCredentials: true,
            ...(method === "get" && data ? { params: data } : {}),
            ...(method !== "get" && data ? { data } : {})
          };
          const requestRetrial = await axios.request(config);
          if (requestRetrial.data) {
            return requestRetrial;
          }
        }
      } catch (refreshErr: any) {
        const message = refreshErr.response?.message;
        const unAuthorisedRefresh = message === "No Refresh Token Found" || message === "Invalid Refresh token";
        try {
          const response = await axios.get(`${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/signout`, {
            withCredentials: true
          });
          if (response) {
            if (unAuthorisedRefresh) window.location.href = "/signin";
            throw refreshErr;
          }
        } catch (error: any) {
          throw refreshErr;
        }
      }
    }

    if (subscriptionErrors.includes(err.response?.data.message)) window.location.href = "/invalidsubscription";
    throw err;
  }
};
