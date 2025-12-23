import { create } from 'zustand';
import { taskAPI } from '../services/api';

const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  stats: null,
  isLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    status: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  fetchTasks: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await taskAPI.getTasks({
        ...get().filters,
        ...params,
        page: params.page || get().pagination.page,
        limit: params.limit || get().pagination.limit,
      });

      const { docs, ...pagination } = response.data.data;
      set({
        tasks: docs || response.data.data.users || [],
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: pagination.totalDocs || pagination.total || 0,
          pages: pagination.totalPages || pagination.pages || 0,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true });
    try {
      const response = await taskAPI.getTask(id);
      set({ currentTask: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createTask: async (data) => {
    const response = await taskAPI.createTask(data);
    await get().fetchTasks();
    await get().fetchStats();
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await taskAPI.updateTask(id, data);
    await get().fetchTasks();
    await get().fetchStats();
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await taskAPI.updateTaskStatus(id, status);
    await get().fetchTasks();
    await get().fetchStats();
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await taskAPI.deleteTask(id);
    await get().fetchTasks();
    await get().fetchStats();
    return response.data;
  },

  fetchStats: async () => {
    try {
      const response = await taskAPI.getTaskStats();
      set({ stats: response.data.data });
    } catch (error) {
      throw error;
    }
  },

  resetFilters: () => {
    set({
      filters: {
        status: '',
        priority: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });
  },
}));

export default useTaskStore;
