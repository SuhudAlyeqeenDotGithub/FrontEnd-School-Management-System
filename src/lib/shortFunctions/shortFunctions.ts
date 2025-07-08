import { handleApiRequest } from "@/axios/axiosClient";

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

export const formatDate = (dateStr: any) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const handledDeleteImage = async (imageDestination?: string) => {
  // handle deleting current image on googlecloud
  try {
    const response = await handleApiRequest("delete", "http://localhost:5000/alyeqeenschoolapp/api/staffimage", {
      staffImageDestination: imageDestination
    });
    // if image deletion was successful, start procedure to upload the new one
    if (response) {
      return true;
    }
  } catch (error: any) {
    throw new Error(error.response?.data.message || error.message || "Error deleting image");
  }
  return false;
};
