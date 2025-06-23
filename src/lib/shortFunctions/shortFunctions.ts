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
