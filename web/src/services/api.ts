import axios from 'axios';
import Router from 'next/router'
import { getToken } from './auth';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/',
});

api.interceptors.response.use(response => response, error => {
  if (error.response.status === 401) {
    Router.push('/auth');

    toast.warning('Autenticação expirada. Conecte-se novamente.', {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
    return;
  }
  return Promise.reject(error);
})

api.interceptors.request.use(config => {
  const token = getToken();
  if (!token) return config;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
})

export const fetcher = (url: string) => api.get(url).then(res => res.data);

export default api;