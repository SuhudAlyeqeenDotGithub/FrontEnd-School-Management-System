"use client";
import { handleApiRequest } from "@/axios/axiosClient";
import { BaseAcademicYearType, BasePeriodType, ParamAcademicYearType, ParamPeriodType } from "@/interfaces/interfaces";
import { useMutation } from "@tanstack/react-query";

export const useReusableMutations = () => {
  const tanMutateAny = (requestType: "post" | "put" | "delete", url: string) => {
    return useMutation({
      mutationFn: (data: any) => {
        return handleApiRequest(requestType, url, data);
      },
      onError: (error: any) => {
        throw new Error(error.response?.data.message || error.message || "Error performing update");
      }
    });
  };
  return { tanMutateAny };
};
