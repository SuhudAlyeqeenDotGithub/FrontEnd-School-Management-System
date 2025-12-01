import { handleApiRequest } from "@/axios/axiosClient";
import { nanoid } from "@reduxjs/toolkit";
import parsePhoneNumberFromString from "libphonenumber-js";
import { customAlphabet } from "nanoid";

export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const getDollarNairaRate = Number(process.env.NEXT_PUBLIC_DOLLAR_NAIRA);
export const getDollarPoundsRate = Number(process.env.NEXT_PUBLIC_DOLLAR_POUNDS);
export const ownerMongoId = process.env.NEXT_PUBLIC_OWNER_MONGO_ID;

export const dollarToDollar = (dollar: number) => {
  if (!dollar) return 0;
  return Number(dollar.toFixed(2));
};
export const dollarToNaira = (dollar: number, rate: number) => {
  if (!dollar) return 0;
  return Number((dollar * rate).toFixed(2));
};
export const dollarToPounds = (dollar: number, rate: number) => {
  if (!dollar) return 0;
  return Number((dollar * rate).toFixed(2));
};

export const makeHumanReadable = (amount: number, currency: "USD" | "NGN" | "GBP") => {
  const nairaResult =
    "₦" +
    amount
      .toLocaleString(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      .split("NGN")[1];
  return currency === "NGN"
    ? nairaResult
    : amount.toLocaleString(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
};

export const checkDataType = (value: any) => {
  if (Array.isArray(value)) {
    return "array";
  } else if (!isNaN(value) && value.trim() !== "") {
    return "number";
  } else if (!isNaN(new Date(value).getTime())) {
    return "date";
  } else {
    return "string";
  }
};

export const subscriptionErrors = [
  "No Subscription Found",
  "Your subscription has expired",
  "Your freemium subscription has expired - visit billing/subscriptions to renew",
  "No Billing Found for last month",
  "Last month billing has not been paid - visit billing page to resolve this issue"
];

export const isExpired = (date: string | Date): boolean => {
  const expiry = new Date(date).getTime();
  const now = Date.now();

  return expiry < now;
};

export const safeText = (value: any, length?: number, returnType?: "string" | "number") => {
  if (value === null || value === undefined) return "null";
  const str = String(value);
  const safeStr = length && str.length ? str.slice(0, length) : str;
  return returnType === "number" ? Number(safeStr) : safeStr;
};

export const getDayDifferenceSafe = (dateA: string | Date, dateB: string | Date): string => {
  const d1 = new Date(dateA).getTime();
  const d2 = new Date(dateB).getTime();

  const diffMs = Math.abs(d2 - d1);
  return Number(diffMs / (1000 * 60 * 60 * 24)).toFixed(1);
};

export const formatDate = (dateStr: any) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export const generateCustomId = (prefix?: string, neat = false, type: string = "alphanumeric") => {
  if (neat) {
    const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numeric = "0123456789";
    const nanoid = customAlphabet(type === "alphanumeric" ? alphanumeric : type === "alphabet" ? alphabet : numeric, 7);
    return `${prefix ? prefix + "-" : ""}${nanoid()}`;
  }
  return `${prefix ? prefix + "-" : ""}${nanoid()}`;
};

export const generateSearchText = (fields: any[]) => {
  return fields.join("|");
};

export const handledDeleteImage = async (imageDestination?: string) => {
  // handle deleting current image on googlecloud
  try {
    const response = await handleApiRequest("delete", "alyeqeenschoolapp/api/staffimage", {
      staffImageDestination: imageDestination
    });
    // if image deletion was successful, start procedure to upload the new one
    if (response) {
      return true;
    }
  } catch (error: any) {
    console.log(error);
    throw new Error(error.response?.data.message || error.message || "Error deleting image");
  }
  return false;
};

export const validatePassword = (password: string) => {
  const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>~+\-]).{8,}$/;
  return passwordStrengthRegex.test(password.trim());
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhoneNumber = (phoneNumber: string) => {
  const trimmedPhoneNumber = phoneNumber.trim();
  const startsWithPlus = trimmedPhoneNumber.startsWith("+");
  const libParsed = parsePhoneNumberFromString(trimmedPhoneNumber);
  return startsWithPlus && libParsed?.isValid();
};
