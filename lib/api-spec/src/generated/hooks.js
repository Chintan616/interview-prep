import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axios-instance.js";

// Auth
export const getMe = () => axiosInstance({ url: "/auth/me", method: "GET" });
export const useGetMe = (options) =>
  useQuery({ queryKey: ["me"], queryFn: getMe, ...options });

export const logout = () => axiosInstance({ url: "/auth/logout", method: "POST" });
export const useLogout = (options) =>
  useMutation({ mutationFn: logout, ...options });

// Health
export const getHealth = () => axiosInstance({ url: "/healthz", method: "GET" });
export const useGetHealth = (options) =>
  useQuery({ queryKey: ["health"], queryFn: getHealth, ...options });

// Parse Resume
export const parseResume = (data) =>
  axiosInstance({ url: "/parse-resume", method: "POST", data, headers: { "Content-Type": "multipart/form-data" } });
export const useParseResume = (options) =>
  useMutation({ mutationFn: parseResume, ...options });

// Sessions
export const listSessions = () =>
  axiosInstance({ url: "/sessions", method: "GET" });
export const useListSessions = (options) =>
  useQuery({ queryKey: ["sessions"], queryFn: listSessions, ...options });

export const deleteSession = (id) =>
  axiosInstance({ url: `/sessions/${id}`, method: "DELETE" });
export const useDeleteSession = (options) =>
  useMutation({ mutationFn: deleteSession, ...options });

export const createSession = (data) =>
  axiosInstance({ url: "/sessions", method: "POST", data });
export const useCreateSession = (options) =>
  useMutation({ mutationFn: createSession, ...options });

export const getSession = (id) =>
  axiosInstance({ url: `/sessions/${id}`, method: "GET" });
export const useGetSession = (id, options) =>
  useQuery({ queryKey: ["sessions", id], queryFn: () => getSession(id), enabled: !!id, ...options });

export const updateSession = ({ id, data }) =>
  axiosInstance({ url: `/sessions/${id}`, method: "PATCH", data });
export const useUpdateSession = (options) =>
  useMutation({ mutationFn: updateSession, ...options });

// Analysis
export const analyzeSession = (id) =>
  axiosInstance({ url: `/sessions/${id}/analyze`, method: "POST" });
export const useAnalyzeSession = (options) =>
  useMutation({ mutationFn: analyzeSession, ...options });

export const getAnalysis = (id) =>
  axiosInstance({ url: `/sessions/${id}/analysis`, method: "GET" });
export const useGetAnalysis = (id, options) =>
  useQuery({ queryKey: ["analysis", id], queryFn: () => getAnalysis(id), enabled: !!id, ...options });

// Questions
export const generateQuestions = (id) =>
  axiosInstance({ url: `/sessions/${id}/questions`, method: "POST" });
export const useGenerateQuestions = (options) =>
  useMutation({ mutationFn: generateQuestions, ...options });

export const getQuestions = (id) =>
  axiosInstance({ url: `/sessions/${id}/questions`, method: "GET" });
export const useGetQuestions = (id, options) =>
  useQuery({ queryKey: ["questions", id], queryFn: () => getQuestions(id), enabled: !!id, ...options });

export const markQuestion = ({ id, qid }) =>
  axiosInstance({ url: `/sessions/${id}/questions/${qid}/mark`, method: "PATCH" });
export const useMarkQuestion = (options) =>
  useMutation({ mutationFn: markQuestion, ...options });
