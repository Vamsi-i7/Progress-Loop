const API_URL = 'http://localhost:5001/api';

export const api = {
    setToken(token: string) {
        localStorage.setItem('pl_token', token);
    },

    getToken() {
        return localStorage.getItem('pl_token');
    },

    logout() {
        localStorage.removeItem('pl_token');
    },

    async request(endpoint: string, method: string = 'GET', body?: any) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (response.status === 401) {
            // Token expired or invalid
            this.logout();
            // window.location.href = '/login'; // Optional: Redirect
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'API Error');
        }

        return response.json();
    },

    // Auth
    async login(email: string, password?: string) {
        return this.request('/auth/login', 'POST', { email, password });
    },

    async signup(name: string, email: string, password?: string) {
        return this.request('/auth/register', 'POST', { name, email, password });
    },

    async getMe() {
        return this.request('/auth/me');
    },

    async updateUser(updates: any) {
        return this.request('/auth/me', 'PUT', updates);
    },

    async verifyEmail(token: string) {
        return this.request('/auth/verify', 'POST', { token });
    },

    // Data
    async getInitialState() {
        return this.request('/data/sync');
    },

    async createGoal(goalData: any) {
        return this.request('/data/goals', 'POST', goalData);
    },

    async toggleHabit(goalId: string, habitId: string) {
        return this.request('/data/goals/habit', 'POST', { goalId, habitId });
    },

    async createPlan(planData: any) {
        return this.request('/data/plans', 'POST', planData);
    },

    // Groups
    async getGroups() {
        return this.request('/groups');
    },

    async createGroup(data: any) {
        return this.request('/groups/create', 'POST', data);
    },

    async sendMessage(groupId: string, text: string) {
        return this.request('/groups/message', 'POST', { groupId, text });
    },

    async getMessages(groupId: string) {
        return this.request(`/groups/${groupId}/messages`);
    },

    // AI
    async chatWithAI(message: string, history: any[]) {
        return this.request('/ai/chat', 'POST', { message, history });
    },

    // Users / Social
    async getFriends() {
        return this.request('/users/friends');
    },

    async sendFriendRequest(userId: string) {
        return this.request('/users/friends/request', 'POST', { toUserId: userId });
    },

    // --- PHASE 1: STRICT DATA LAYER ---

    // Tasks (Master Grid)
    async getTasks() {
        return this.request('/tasks');
    },
    async createTask(taskData: any) {
        return this.request('/tasks', 'POST', taskData);
    },
    async updateTask(id: string, updates: any) {
        return this.request(`/tasks/${id}`, 'PUT', updates);
    },
    async deleteTask(id: string) {
        return this.request(`/tasks/${id}`, 'DELETE');
    },

    // Habits
    async getHabits() {
        return this.request('/habits');
    },
    async createHabit(habitData: any) {
        return this.request('/habits', 'POST', habitData);
    },
    async logHabit(habitId: string, date: string, status: boolean) {
        return this.request('/habits/log', 'POST', { habitId, date, status });
    },
    async getHabitLogs() {
        return this.request('/habits/logs');
    }
};
