const API_BASE_URL = 'http://localhost:5001/api';

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('spendquest_access_token');
    this.refreshToken = localStorage.getItem('spendquest_refresh_token');
  }

  setTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (access) localStorage.setItem('spendquest_access_token', access);
    else localStorage.removeItem('spendquest_access_token');

    if (refresh) localStorage.setItem('spendquest_refresh_token', refresh);
    else localStorage.removeItem('spendquest_refresh_token');
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('spendquest_access_token');
    localStorage.removeItem('spendquest_refresh_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...options.headers };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token expiration & automatic refresh per FR-1.4
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/token/refresh')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: this.refreshToken })
        });

        if (refreshRes.ok) {
          const tokens = await refreshRes.json();
          this.setTokens(tokens.access, tokens.refresh);
          headers['Authorization'] = `Bearer ${tokens.access}`;
          response = await fetch(url, { ...options, headers });
        } else {
          this.clearTokens();
          window.location.href = '/login';
        }
      } catch (e) {
        this.clearTokens();
      }
    }

    return response;
  }

  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    const res = await this.request(url, { method: 'GET' });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  async post(endpoint, data, isFormData = false) {
    const res = await this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  async patch(endpoint, data, isFormData = false) {
    const res = await this.request(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }

  async delete(endpoint) {
    const res = await this.request(endpoint, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw await res.json();
    return true;
  }

  async download(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    const res = await this.request(url, { method: 'GET' });
    if (!res.ok) throw await res.json();
    return res.blob();
  }
}

export const api = new ApiClient();
