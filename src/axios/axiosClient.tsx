import axios from "axios";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

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
    const status = err.response?.status;
    const isUnauthenticated = status === 401 || status === 403;

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
        const status = refreshErr.response?.status;
        const unAuthorisedRefresh = status === 401 || status === 403;
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

    throw err;
  }
};
