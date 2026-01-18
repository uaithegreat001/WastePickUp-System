export const ErrorTypes = {
  // error types 
  NETWORK: "network",
  // authentication errors
  AUTH: "auth",
  // validation errors
  VALIDATION: "validation",
  // firestore errors
  FIRESTORE: "firestore",
  // indexeddb errors
  INDEXEDDB: "indexeddb",
  // unknown errors
  UNKNOWN: "unknown",
};

// get error type from error object
export const getErrorType = (error) => {
  if (!navigator.onLine) return ErrorTypes.NETWORK;
  if (error.code === "permission-denied" || error.code === "unauthenticated")
    return ErrorTypes.AUTH;
  if (
    error.code?.startsWith("invalid-") ||
    error.message?.includes("validation")
  )
    return ErrorTypes.VALIDATION;
  if (error.name === "FirebaseError") return ErrorTypes.FIRESTORE;
  if (error.name === "DOMException" && error.message?.includes("IndexedDB"))
    return ErrorTypes.INDEXEDDB;
  return ErrorTypes.UNKNOWN;
};

export const getUserFriendlyMessage = (error, context = "") => {
  const type = getErrorType(error);

  const messages = {
    // network errors
    [ErrorTypes.NETWORK]: {
      user: "Connection lost. Your request has been saved and will sync when you're back online",
      tech: `Network error in ${context}: ${error.message}`,
    },
    // authentication errors
    [ErrorTypes.AUTH]: {
      user: "Please log in again to continue",
      tech: `Authentication error in ${context}: ${error.code} - ${error.message}`,
    },
    // validation errors
    [ErrorTypes.VALIDATION]: {
      user: "Please check your input and try again",
      tech: `Validation error in ${context}: ${error.message}`,
    },
    // firestore errors
    [ErrorTypes.FIRESTORE]: {
      user: "Server error occurred. Please try again later",
      tech: `Firestore error in ${context}: ${error.code} - ${error.message}`,
    },
    // indexeddb errors
    [ErrorTypes.INDEXEDDB]: {
      user: "Local storage issue. Please refresh the page",
      tech: `IndexedDB error in ${context}: ${error.name} - ${error.message}`,
    },
    // unknown errors
    [ErrorTypes.UNKNOWN]: {
      user: "Something went wrong. Please try again",
      tech: `Unknown error in ${context}: ${error.message || error}`,
    },
  };

  return messages[type] || messages[ErrorTypes.UNKNOWN];
};

export const handleError = (
  error,
  context = "",
  showToast = true,
  isTechUser = false,
) => {
  const { user, tech } = getUserFriendlyMessage(error, context);
  const message = isTechUser ? tech : user;

  if (showToast) {
    import("react-hot-toast").then(({ toast }) => {
      toast.error(message);
    });
  }

  console.error(`[${context}] Error:`, {
    type: getErrorType(error),
    message: error.message || error,
    stack: error.stack,
    context,
  });

  return { userMessage: user, techMessage: tech, type: getErrorType(error) };
};

export const withErrorHandling = (fn, context = "", showToast = true) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context, showToast);
      throw error;
    }
  };
};
