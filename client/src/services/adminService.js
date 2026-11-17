import api from './api';

export const adminService = {
  async getOverview() {
    const res = await api.get('/admin/overview');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(id, status) {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  async createDepartment(data) {
    const res = await api.post('/admin/departments', data);
    return res.data;
  },

  async updateDepartment(id, data) {
    const res = await api.put(`/admin/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id) {
    const res = await api.delete(`/admin/departments/${id}`);
    return res.data;
  },

  async updateIssueCategory(id, data) {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  }
};

