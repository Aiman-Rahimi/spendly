import axios from "axios";

const instance = axios.create({
  baseURL: "https://spendly-production-bfcb.up.railway.app",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
