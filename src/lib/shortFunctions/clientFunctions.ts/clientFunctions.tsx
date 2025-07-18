"use client";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setHasBeforeUnloadListener, setTriggerUnsavedDialog } from "@/redux/features/general/generalSlice";
import { useRouter } from "next/navigation";
import { setProceedUrl } from "@/redux/features/general/generalSlice";
import { useEffect } from "react";

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
