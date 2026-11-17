import api from './api';

export const complaintService = {
  async submit(formData) {
    // formData is FormData instance for Multer image upload
    const res = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async getMyComplaints() {
    const res = await api.get('/complaints/my');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  async getAll(params = {}) {
    const res = await api.get('/complaints', { params });
    return res.data;
  },

  async updateStatus(id, status, resolutionNotes, comment) {
    const res = await api.put(`/complaints/${id}/status`, {
      status,
      resolution_notes: resolutionNotes,
      comment
    });
    return res.data;
  },

  async updatePriority(id, priority, reason) {
    const res = await api.put(`/complaints/${id}/priority`, { priority, reason });
    return res.data;
  },

  async assignDepartment(id, departmentId, comment) {
    const res = await api.put(`/complaints/${id}/assign`, {
      department_id: departmentId,
      comment
    });
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/complaints/categories');
    return res.data;
  },

  async getDepartments() {
    const res = await api.get('/complaints/departments');
    return res.data;
  }
};

