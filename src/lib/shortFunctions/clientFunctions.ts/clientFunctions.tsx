"use client";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setHasBeforeUnloadListener, setTriggerUnsavedDialog } from "@/redux/features/general/generalSlice";
import { useRouter } from "next/navigation";
import { setProceedUrl } from "@/redux/features/general/generalSlice";
import { useEffect } from "react";
import { handleApiRequest } from "@/axios/axiosClient";

export const useNavigationHandler = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { hasBeforeUnloadListener, triggerUnsavedDialog } = useAppSelector((state) => state.generalState);
  const handleWindowClose = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };
  const handleUnload = (action: string) => {
    if (action === "remove") {
      window.removeEventListener("beforeunload", handleWindowClose);
      dispatch(setHasBeforeUnloadListener(false));
    } else {
      window.addEventListener("beforeunload", handleWindowClose);

      dispatch(setHasBeforeUnloadListener(true));
    }
  };

  const handleNavigation = (path: string, proceed = false) => {
    dispatch(setProceedUrl(path));
    if (hasBeforeUnloadListener) {
      if (proceed) {
        handleUnload("remove");
        dispatch(setTriggerUnsavedDialog(false));
        dispatch(setProceedUrl(""));
        document.body.style.overflow = "";
        router.push(path);
      } else if (!proceed && triggerUnsavedDialog) {
        dispatch(setTriggerUnsavedDialog(false));
      } else {
        document.body.style.overflow = "hidden";
        dispatch(setTriggerUnsavedDialog(true));
      }
    } else {
      handleUnload("remove");
      dispatch(setProceedUrl(""));
      document.body.style.overflow = "";
      router.push(path);
    }
  };

  return { handleNavigation, handleUnload };
};

export const useGeneralClientFunctions = () => {
  const getStaffImageViewSignedUrl = async (staffId: string, imageLocalDestination: string) => {
    let signedUrl = "";

    const existingUrlStr = sessionStorage.getItem(`staffImageSignedUrl_${staffId}`);
    let existingUrl: { url: string; expiresAt: number } | null = null;
    if (existingUrlStr) {
      try {
        existingUrl = JSON.parse(existingUrlStr);
      } catch (e) {
        existingUrl = null;
      }
    }

    if (existingUrl && existingUrl.expiresAt > Date.now()) {
      signedUrl = existingUrl.url;
    } else {
      const gotSignedUrl = await handleApiRequest("post", "alyeqeenschoolapp/api/staffimageviewsignedurl", {
        imageLocalDestination
      });

      if (gotSignedUrl) {
        signedUrl = gotSignedUrl.data.url;
        sessionStorage.setItem(
          `staffImageSignedUrl_${staffId}`,
          JSON.stringify({ url: signedUrl, expiresAt: Date.now() + 1000 * 60 * 60 })
        );
      }
    }
    return signedUrl;
  };

  const getStudentImageViewSignedUrl = async (studentId: string, imageLocalDestination: string) => {
    let signedUrl = "";

    const existingUrlStr = sessionStorage.getItem(`studentImageSignedUrl_${studentId}`);
    let existingUrl: { url: string; expiresAt: number } | null = null;
    if (existingUrlStr) {
      try {
        existingUrl = JSON.parse(existingUrlStr);
      } catch (e) {
        existingUrl = null;
      }
    }

    if (existingUrl && existingUrl.expiresAt > Date.now()) {
      signedUrl = existingUrl.url;
    } else {
      const gotSignedUrl = await handleApiRequest("post", "alyeqeenschoolapp/api/studentimageviewsignedurl", {
        imageLocalDestination
      });

      if (gotSignedUrl) {
        signedUrl = gotSignedUrl.data.url;
        sessionStorage.setItem(
          `studentImageSignedUrl_${studentId}`,
          JSON.stringify({ url: signedUrl, expiresAt: Date.now() + 1000 * 60 * 60 })
        );
      }
    }
    return signedUrl;
  };
  return { getStaffImageViewSignedUrl, getStudentImageViewSignedUrl };
};
