/* Utility functions for date handling */
console.log("dateUtils.js loaded");

/* Sorts an array of objects by createdAt */
export function sortByCreatedAt(arr) {
  console.log("sortByCreatedAt called with", arr.length, "items");
  return arr.sort((a, b) => {
    const dateA = toDate(a.createdAt);
    const dateB = toDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

/* Converts a Firebase timestamp or date string to a Date object */
export function toDate(timestamp) {
  if (!timestamp) return null;

  // If it's already a Date
  if (timestamp instanceof Date) return timestamp;

  // If it's a Firebase Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  // If it's a string or number
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? null : date;
}

/* Formats a date to a readable string */
export function formatDate(date, options = {}) {
  const d = toDate(date);
  if (!d) return "N/A";
  const {
    includeTime = false,
    includeWeekday = false,
    dateStyle = "medium",
  } = options;

  const dateOptions = {
    year: "numeric",
    month:
      dateStyle === "short"
        ? "numeric"
        : dateStyle === "medium"
        ? "short"
        : "long",
    day: "numeric",
  };

  if (includeWeekday) {
    dateOptions.weekday = dateStyle === "full" ? "long" : "short";
  }

  if (includeTime) {
    dateOptions.hour = "2-digit";
    dateOptions.minute = "2-digit";
  }

  return d.toLocaleDateString("en-US", dateOptions);
}

/* Formats a date for input fields */
export function formatDateForInput(date) {
  const d = toDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
