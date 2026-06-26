import axios from "axios";

const AXIOS_INSTANCE = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const axiosInstance = (config) => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default axiosInstance;
