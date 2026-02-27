import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",  // must match backend
});

export default api;
