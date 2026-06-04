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


// ── Excel Validation API ───────────────────────────────────────────────────
const BASE_API = 'https://paperlessboss.com';

export async function validateExcelApi(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_API}/validate-excel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    // Note: Do NOT set Content-Type — browser sets multipart boundary automatically
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // The API returns validation errors as a 4xx with body:
    // { detail: { message: "...", validation_result: { success, totalRecords, ... } } }
    // Extract and return the validation_result so the UI can display errors in a table.
    const validationResult = data?.detail?.validation_result;
    if (validationResult) {
      return validationResult;
    }
    // For non-validation errors (auth, network, etc.), surface a readable message
    const message =
      (typeof data?.detail === 'string' ? data.detail : null) ||
      data?.detail?.message ||
      data?.message ||
      `Validation failed (${res.status})`;
    throw new Error(message);
  }

  // Success: { message, validation_result: {...} } → normalise to flat shape
  return data.validation_result ?? data;
  // Shape: { success, totalRecords, validRecords, invalidRecords, errors[] }
}
