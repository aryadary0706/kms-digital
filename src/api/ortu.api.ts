import { api } from './client';

export const ortuApi = {
  list: () => api.get('/api/posyandu/orang-tua/list'),
  forKader: () => api.get('/api/posyandu/orang-tua'),
  register: (payload) => api.post('/api/auth/orang-tua/register', payload),
  remove: (id) => api.delete(`/api/orang-tua/${id}`),
  update: (id, payload) => api.patch(`/api/orang-tua/${id}`, payload)
};
