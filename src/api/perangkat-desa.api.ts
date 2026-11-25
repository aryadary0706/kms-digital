import { api } from "./client";

export const KelurahanApi = {
  list: () => api.get('/api/perangkat-desa'),
  search: (id) => api.get(`/api/perangkat-desa/${id}`),
  register: (payload) => api.post('/api/perangkat-desa', payload),
  update: (id, payload) => api.put(`/api/perangkat-desa/${id}`, payload),
  remove: (id) => api.delete(`/api/perangkat-desa/${id}`),
};