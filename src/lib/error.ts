import { toast } from "sonner";

/**
 * Display API error as toast
 * @param error - API error response (object or string)
 */
export function showApiError(error: any) {
  if (!error) {
    toast.error("An unknown error occurred");
    return;
  }

  // Check if error has the expected structure
  const data = error?.data || error?.response?.data;

  if (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    // Display each error
    data.errors.forEach((err: string) => {
      toast.error(err);
    });
    return;
  }

  // If there is a message
  if (data?.message || error?.message) {
    toast.error(data?.message || error.message);
    return;
  }

  // Fallback: stringify error
  toast.error(typeof error === "string" ? error : "Something went wrong");
}
