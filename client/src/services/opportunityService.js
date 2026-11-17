import api from './api';

export const opportunityService = {
  async getAll(params = {}) {
    const res = await api.get('/opportunities', { params });
    return res.data;
  },

  async getRecommended() {
    const res = await api.get('/opportunities/recommended');
    return res.data;
  },

  async getSaved() {
    const res = await api.get('/opportunities/saved');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/opportunities/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/opportunities/categories');
    return res.data;
  },

  async save(id) {
    const res = await api.post(`/opportunities/${id}/save`);
    return res.data;
  },

  async unsave(id) {
    const res = await api.delete(`/opportunities/${id}/save`);
    return res.data;
  },

  // Admin CRUD
  async create(data) {
    const res = await api.post('/opportunities', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/opportunities/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/opportunities/${id}`);
    return res.data;
  }
};

