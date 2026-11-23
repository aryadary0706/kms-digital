import { api } from './client';

export const desaApi = {
  list: () => api.get('/api/desa'),
  create: (payload) => api.post('/api/desa', payload),
  remove: (id) => api.delete(`/api/desa/${id}`),
  register: (payload) => api.post('api/auth/desa/register', payload)
};
