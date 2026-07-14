const getBaseApiUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  return window.location.origin;
};


export const BASE_API = getBaseApiUrl();
const BASE_URL = `${BASE_API}/api/v1/auth`;

// Token helpers
export const tokenStore = {
  get: () => localStorage.getItem('pb_access_token'),
  set: (t) => localStorage.setItem('pb_access_token', t),
  clear: () => localStorage.removeItem('pb_access_token'),
};

async function request(url, options = {}, isAuthEndpoint = true) {
  const token = tokenStore.get();
  const headers = { ...options.headers };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fullUrl = isAuthEndpoint ? `${BASE_URL}${url}` : `${BASE_API}${url}`;

  let res = await fetch(fullUrl, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (res.status === 401 && token && url !== '/refresh' && url !== '/login') {
    try {
      const refreshRes = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.access_token) {
          tokenStore.set(refreshData.access_token);
          headers.Authorization = `Bearer ${refreshData.access_token}`;
          res = await fetch(fullUrl, {
            credentials: 'include',
            ...options,
            headers,
          });
        }
      } else {
        tokenStore.clear();
      }
    } catch (e) {
      console.error('Failed to auto-refresh token:', e);
    }
  }

  if (options.responseType === 'blob') {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let detail = 'File download failed';
      try {
        const errJson = JSON.parse(text);
        detail = errJson.detail || errJson.message || detail;
      } catch (_) { }
      throw new Error(detail);
    }
    return await res.blob();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Something went wrong');
  }
  return data;
}

export const authApi = {
  register: (email, password) =>
    request('/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  verifyOtp: (email, otp_code) =>
    request('/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp_code }) }),

  resendOtp: (email) =>
    request('/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  login: (email, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getProfile: (token) =>
    request('/me', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),

  logout: () =>
    request('/logout', { method: 'POST' }),

  contact: (name, email, subject, message) =>
    request('/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) }),
};

export const profileApi = {
  getCompany: () =>
    request('/api/v1/profile/company', { method: 'GET' }, false),

  upsertCompany: (data) =>
    request('/api/v1/profile/company', { method: 'POST', body: JSON.stringify(data) }, false),

  getSignatory: () =>
    request('/api/v1/profile/signatory', { method: 'GET' }, false),

  upsertSignatory: (data) =>
    request('/api/v1/profile/signatory', { method: 'POST', body: JSON.stringify(data) }, false),

  uploadLetterhead: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/v1/profile/company/letterhead', {
      method: 'POST',
      body: formData,
    }, false);
  },

  listLetterheads: () =>
    request('/api/v1/profile/company/letterheads', { method: 'GET' }, false),

  activateLetterhead: (id) =>
    request(`/api/v1/profile/company/letterheads/${id}/activate`, { method: 'PUT' }, false),
};

export const offerLetterApi = {
  generateServer: (letterheadId) =>
    request('/api/v1/offer-letters/generate', {
      method: 'POST',
      body: letterheadId ? JSON.stringify({ letterhead_id: letterheadId }) : undefined
    }, false),

  getStatus: () =>
    request('/api/v1/offer-letters/status', { method: 'GET' }, false),

  downloadFile: (employeeId, format) =>
    request(`/api/v1/offer-letters/download/${employeeId}/${format}`, {
      method: 'GET',
      responseType: 'blob',
    }, false),

  logGeneration: (logs) =>
    request('/api/v1/offer-letters/log-generation', {
      method: 'POST',
      body: JSON.stringify({ logs })
    }, false),

  markDownloaded: (logId) =>
    request(`/api/v1/offer-letters/log/${logId}/download`, { method: 'POST' }, false),

  getGenerationHistory: () =>
    request('/api/v1/offer-letters/generation-history', { method: 'GET' }, false),
};

export async function validateExcelApi(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/validate-excel', {
    method: 'POST',
    body: formData,
  }, false);
}

export const billingApi = {
  getBalance: () =>
    request('/api/v1/billing/balance', { method: 'GET' }, false),
  pay: (amount, type) =>
    request('/api/v1/billing/pay', { method: 'POST', body: JSON.stringify({ amount, type }) }, false),
  getConfig: () =>
    request('/api/v1/billing/config', { method: 'GET' }, false),
  updateConfig: (data) =>
    request('/api/v1/billing/config', { method: 'POST', body: JSON.stringify(data) }, false),
};

export const wagesApi = {
  validateExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/v1/wages/validate-excel', {
      method: 'POST',
      body: formData,
    }, false);
  },
  getHistory: () =>
    request('/api/v1/wages/history', { method: 'GET' }, false),
  downloadPdf: (wageId) =>
    request(`/api/v1/wages/download/${wageId}/pdf`, {
      method: 'GET',
      responseType: 'blob',
    }, false),
};


