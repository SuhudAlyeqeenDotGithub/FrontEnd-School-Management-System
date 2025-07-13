"use client";
import { handleApiRequest } from "@/axios/axiosClient";
import { ParamStaffContractType, ParamStaffType } from "@/interfaces/interfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useStaffMutation = () => {
  const queryClient = useQueryClient();

  const useCreateStaffProfile = useMutation({
    mutationFn: (data: ParamStaffType) => {
      return handleApiRequest("post", `alyeqeenschoolapp/api/staff/profiles`, data);
    },
    onSuccess: (returnedData) => {
      const updatedData = returnedData?.data;
      queryClient.setQueryData(["staffProfiles"], updatedData);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating staff profile");
    }
  });

  const useUpdateStaffProfile = useMutation({
    mutationFn: (data: ParamStaffType) => {
      return handleApiRequest("put", `alyeqeenschoolapp/api/staff/profiles`, data);
    },
    onSuccess: (returnedData) => {
      const updatedData = returnedData?.data;
      queryClient.setQueryData(["staffProfiles"], updatedData);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating updating profile");
    }
  });

  const useDeleteStaffProfile = useMutation({
    mutationFn: (data: { staffIDToDelete: string }) => {
      return handleApiRequest("delete", `alyeqeenschoolapp/api/staff/profiles`, data);
    },
    onSuccess: (returnedData) => {
      const updatedData = returnedData?.data;
      queryClient.setQueryData(["staffProfiles"], updatedData);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error deleting staff profile");
    }
  });

  const useCreateStaffContract = useMutation({
    mutationFn: (data: ParamStaffContractType) => {
      return handleApiRequest("post", `alyeqeenschoolapp/api/staff/contracts`, data);
    },
    onSuccess: (returnedData) => {
      const updatedData = returnedData?.data;
      queryClient.setQueryData(["staffContracts"], updatedData);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating staff contract");
    }
  });

  const useUpdateStaffContract = useMutation({
    mutationFn: (data: ParamStaffContractType) => {
      return handleApiRequest("put", `alyeqeenschoolapp/api/staff/contracts`, data);
    },
    onSuccess: (returnedData) => {
      const updatedData = returnedData?.data;
      queryClient.setQueryData(["staffContracts"], updatedData);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error creating updating contract");
    }
  });

  const useDeleteStaffContract = useMutation({
    mutationFn: (data: { staffContractIdToDelete: string }) => {
      return handleApiRequest("delete", `alyeqeenschoolapp/api/staff/contracts`, data);
    },
    onSuccess: (returnedData) => {
      const updatedData = returnedData?.data;
      queryClient.setQueryData(["staffContracts"], updatedData);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data.message || error.message || "Error deleting staff contract");
    }
  });
  return {
    tanCreateStaffProfile: useCreateStaffProfile,
    tanUpdateStaffProfile: useUpdateStaffProfile,
    tanDeleteStaffProfile: useDeleteStaffProfile,
    tanCreateStaffContract: useCreateStaffContract,
    tanUpdateStaffContract: useUpdateStaffContract,
    tanDeleteStaffContract: useDeleteStaffContract
  };
};
