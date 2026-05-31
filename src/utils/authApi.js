const BASE_URL = 'https://paperlessboss.com/api/v1/auth';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
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
};

// Token helpers
export const tokenStore = {
  get: () => localStorage.getItem('pb_access_token'),
  set: (t) => localStorage.setItem('pb_access_token', t),
  clear: () => localStorage.removeItem('pb_access_token'),
};
