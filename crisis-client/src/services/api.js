const API_URL ='https://crisis-management-server.vercel.app/';
//committed

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  alerts: {
    getAll: () => fetch(`${API_URL}/alerts`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id, data) => fetch(`${API_URL}/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id) => fetch(`${API_URL}/alerts/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
  broadcasts: {
    getAll: () => fetch(`${API_URL}/broadcasts`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id) => fetch(`${API_URL}/broadcasts/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
  families: {
    getAll: () => fetch(`${API_URL}/families`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/families`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id) => fetch(`${API_URL}/families/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
  resources: {
    getAll: () => fetch(`${API_URL}/resources`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id) => fetch(`${API_URL}/resources/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
  shelters: {
    getAll: () => fetch(`${API_URL}/shelters`).then(handleResponse),
    getNearby: (lat, lng, radius = 10000) => fetch(`${API_URL}/shelters/nearby?lat=${lat}&lng=${lng}&radius=${radius}`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/shelters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id) => fetch(`${API_URL}/shelters/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
  volunteers: {
    getAll: () => fetch(`${API_URL}/volunteers`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id) => fetch(`${API_URL}/volunteers/${id}`, {
      method: 'DELETE',
    }).then(handleResponse),
  },
  issues: {
    getAll: () => fetch(`${API_URL}/client/alerts`).then(handleResponse),
    create: (data) => fetch(`${API_URL}/client/report-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  },
  auth: {
    login: (credentials) => fetch(`${API_URL}/client/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),
    register: (data) => fetch(`${API_URL}/client/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  },
  sos: {
    trigger: (data) => fetch(`${API_URL}/client/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    getAll: () => fetch(`${API_URL}/admin/sos-alerts`).then(handleResponse), // This might need protection later
  },
  heatmap: {
    getLocations: () => fetch(`${API_URL}/heatmap/data`).then(handleResponse),
  }
};
