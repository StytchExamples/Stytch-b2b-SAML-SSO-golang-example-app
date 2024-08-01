import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
const axiosConfig: AxiosRequestConfig = {
  baseURL: "http://localhost:3002/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    authorization: `Bearer ${Cookies.get("stytch_session_jwt")}`,
  },
};

export const axiosInstance: AxiosInstance = axios.create(axiosConfig);
