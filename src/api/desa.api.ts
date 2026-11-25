import { api } from './client';

export const desaApi = {
  list: () => api.get('/api/desa'),
  create: (payload) => api.post('/api/desa', payload),
  edit: (payload) => api.put('/api/perangkat-desa'),
  remove: (id) => api.delete(`/api/perangkat-desa/${id}`),
  register: (payload) => api.post('api/auth/desa/register', payload)
};
