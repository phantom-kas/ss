import { toast } from 'sonner';

export function showError(error: any) {
  console.log('Laravel Error:', error);

  console.log('Laravel Error:', error);

  console.log(1)
  // Handle network errors (no response from server)
  if (!error.response) {
    if (error.request) {

      toast.error("Network error. Please check your connection.", {
        className: "bg-red-600 text-white"
      });
    } else {
      // alert('e')
      errorObj(error)
      // toast.error(error.message || "Something went wrong", {
      // className: "bg-red-600 text-white"
      // });
    }
    return;
  } else if (typeof error?.message == 'string') {
    toast.error(error.message || "Too many requests. Please slow down.", {
      className: "bg-red-600 text-white"
    });
  }
  else if (typeof error?.error == 'string') {
    toast.error(error.message || "Too many requests. Please slow down.", {
      className: "bg-red-600 text-white"
    });
  }
  console.log(2)

  const { status, data } = error.response;

  console.log('---------------', data)
  console.log('---------------', status)

  // Handle different HTTP status codes
  // alert('s')
  switch (status) {
    // case 400:
    case 400: // Validation errors
      handleGenericError(data);
      break;

    case 409: // 🔥 IMPORTANT for business logic errors
      if (data?.message) {
        toast.error(data.message, {
          className: "bg-red-600 text-white"
        });
      } if (data?.error) {
        toast.error(data.error, {
          className: "bg-red-600 text-white"
        });
      } else {
        toast.error("Bad request.", {
          className: "bg-red-600 text-white"
        });
      }
      break;

    case 422: // Validation errors
      handleValidationErrors(data);
      break;

    case 401: // Unauthorized
      toast.error(data.message || "Unauthorized. Please login.", {
        className: "bg-red-600 text-white"
      });
      break;

    case 403: // Forbidden
    // alert(data.message)
      toast.error(data.message || "You don't have permission to do this.", {
        className: "bg-red-600 text-white"
      });
      break;

    case 404: // Not found
      toast.error(data.message || "Resource not found.", {
        className: "bg-red-600 text-white"
      });
      break;

    case 419: // CSRF token mismatch
      toast.error("Session expired. Please refresh the page.", {
        className: "bg-red-600 text-white"
      });
      break;

    case 429: // Too many requests
      toast.error(data.message || "Too many requests. Please slow down.", {
        className: "bg-red-600 text-white"
      });
      break;

    case 500: // Server error
      toast.error(data.message || "Server error. Please try again later.", {
        className: "bg-red-600 text-white"
      });
      break;

    case 503: // Service unavailable
      toast.error("Service temporarily unavailable. Please try again later.", {
        className: "bg-red-600 text-white"
      });
      break;

    default:
      // Handle any other errors with data
      handleGenericError(data);
      break;
  }
}

function handleValidationErrors(data: any) {
  // Laravel validation errors format: { "errors": { "field": ["error1", "error2"] } }
  console.log(data)
  console.log(44444444444444444444444444444444444444)
  if (data.errors && typeof data.errors === 'object') {
    Object.values(data.errors).forEach((messages: any) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg: string) => {
          toast.error(msg, { className: "bg-red-600 text-white" });
        });
      } else if (typeof messages === 'string') {
        toast.error(messages, { className: "bg-red-600 text-white" });
      }
    });
  } else if (data.message) {
    // Sometimes Laravel sends a single message for validation
    toast.error(data.message, { className: "bg-red-600 text-white" });
  } else {
    toast.error("Validation failed. Please check your input.", {
      className: "bg-red-600 text-white"
    });
  }
}

function handleGenericError(data: any) {
  // Handle custom error formats like { "error": "Not enough tickets available" }
  if (data.error) {
    if (typeof data.error === 'string') {
      toast.error(data.error, { className: "bg-red-600 text-white" });
    } else if (typeof data.error === 'object') {
      // Handle nested error objects
      Object.values(data.error).forEach((msg: any) => {
        toast.error(String(msg), { className: "bg-red-600 text-white" });
      });
    }
  }
  // Handle { "message": "Some error" }
  else if (data.message) {
    toast.error(data.message, { className: "bg-red-600 text-white" });
  }
  // Handle { "errors": { "field": "error" } } without array
  else if (data.errors && typeof data.errors === 'object') {
    Object.values(data.errors).forEach((msg: any) => {
      if (Array.isArray(msg)) {
        msg.forEach((m: string) => toast.error(m, { className: "bg-red-600 text-white" }));
      } else {
        toast.error(String(msg), { className: "bg-red-600 text-white" });
      }
    });
  }
  // Fallback
  else {
    toast.error("An error occurred. Please try again.", {
      className: "bg-red-600 text-white"
    });
  }
}

const errorObj = (error: any) => {
  if (typeof error?.message == 'string') {
    toast.error(error.message || "Something went wrong", {
      className: "bg-red-600 text-white"
    });
  }
  else if (typeof error?.error == 'string') {
    toast.error(error.error || "Something went wrong", {
      className: "bg-red-600 text-white"
    });
  }
  else
    toast.error(error.message || "SOmething went wrong", {
      className: "bg-red-600 text-white"
    });
}