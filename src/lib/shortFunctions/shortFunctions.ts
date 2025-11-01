import { handleApiRequest } from "@/axios/axiosClient";
import { nanoid } from "@reduxjs/toolkit";
import parsePhoneNumberFromString from "libphonenumber-js";
import { customAlphabet } from "nanoid";

export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const safeText = (value: any, length?: number) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return length ? str.slice(0, length) : str;
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
