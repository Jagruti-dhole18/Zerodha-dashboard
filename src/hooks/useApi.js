import { useState, useCallback } from "react";
import axios from "axios";

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (method, url, data = null, onSuccess = null, onError = null) => {
      setIsLoading(true);
      setError(null);

      try {
        const config = {
          method,
          url: `${import.meta.env.VITE_BACKEND_URL}${url}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };

        if (data && (method === "post" || method === "patch" || method === "put")) {
          config.data = data;
        }

        const response = await axios(config);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return { success: true, data: response.data };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";

        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        return { success: false, message: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    (url, onSuccess, onError) => request("get", url, null, onSuccess, onError),
    [request]
  );

  const post = useCallback(
    (url, data, onSuccess, onError) =>
      request("post", url, data, onSuccess, onError),
    [request]
  );

  const patch = useCallback(
    (url, data, onSuccess, onError) =>
      request("patch", url, data, onSuccess, onError),
    [request]
  );

  const delete_ = useCallback(
    (url, onSuccess, onError) => request("delete", url, null, onSuccess, onError),
    [request]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    get,
    post,
    patch,
    delete: delete_,
    clearError,
  };
};
