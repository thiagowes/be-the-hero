import axios from 'axios';

const api = axios.create({
  baseURL: '192.168.100.3:3333',
});

export default api;
