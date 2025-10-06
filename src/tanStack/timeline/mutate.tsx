"use client";
import { handleApiRequest } from "@/axios/axiosClient";
import { BaseAcademicYearType, BasePeriodType, ParamAcademicYearType, ParamPeriodType } from "@/interfaces/interfaces";
import { useMutation } from "@tanstack/react-query";

export const useTimelineMutation = () => {
  const useCreatePeriod = useMutation({
    mutationFn: (data: BasePeriodType) => {
      return handleApiRequest("post", `alyeqeenschoolapp/api/academicsession/period`, data);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating period");
    }
  });

  const useUpdatePeriod = useMutation({
    mutationFn: (data: ParamPeriodType) => {
      return handleApiRequest("put", `alyeqeenschoolapp/api/academicsession/period`, data);
    },

    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error updating period");
    }
  });

  const useDeletePeriod = useMutation({
    mutationFn: (data: { periodIdToDelete: string }) => {
      return handleApiRequest("delete", `alyeqeenschoolapp/api/academicsession/period`, data);
    },

    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error deleting period");
    }
  });

  const useCreateAcademicYear = useMutation({
    mutationFn: (data: BaseAcademicYearType) => {
      return handleApiRequest("post", `alyeqeenschoolapp/api/academicsession/academicYear`, data);
    },

    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating Academic Year");
    }
  });

  const useUpdateAcademicYear = useMutation({
    mutationFn: (data: ParamAcademicYearType) => {
      return handleApiRequest("put", `alyeqeenschoolapp/api/academicsession/academicYear`, data);
    },

    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating Academic Year");
    }
  });

  const useDeleteAcademicYear = useMutation({
    mutationFn: (data: { academicYearIdToDelete: string }) => {
      return handleApiRequest("delete", `alyeqeenschoolapp/api/academicsession/academicYear`, data);
    },

    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error deleting Academic Year");
    }
  });
  return {
    tanCreatePeriod: useCreatePeriod,
    tanUpdatePeriod: useUpdatePeriod,
    tanDeletePeriod: useDeletePeriod,
    tanCreateAcademicYear: useCreateAcademicYear,
    tanUpdateAcademicYear: useUpdateAcademicYear,
    tanDeleteAcademicYear: useDeleteAcademicYear
  };
};
