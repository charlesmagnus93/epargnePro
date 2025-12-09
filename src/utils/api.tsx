import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d9ca75f`;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Auth
export async function signup(email: string, password: string, name: string) {
  return fetchAPI('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

// Transactions
export async function getTransactions() {
  return fetchAPI('/transactions');
}

export async function createTransaction(transaction: any) {
  return fetchAPI('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}

export async function deleteTransaction(id: string) {
  return fetchAPI(`/transactions/${id}`, {
    method: 'DELETE',
  });
}

// Budget
export async function getBudget() {
  return fetchAPI('/budget');
}

export async function updateBudget(budget: any) {
  return fetchAPI('/budget', {
    method: 'PUT',
    body: JSON.stringify(budget),
  });
}

// Emergency Fund
export async function getEmergencyFund() {
  return fetchAPI('/emergency');
}

export async function updateEmergencyFund(emergency: any) {
  return fetchAPI('/emergency', {
    method: 'PUT',
    body: JSON.stringify(emergency),
  });
}

// Settings
export async function getSettings() {
  return fetchAPI('/settings');
}

export async function updateSettings(settings: any) {
  return fetchAPI('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
