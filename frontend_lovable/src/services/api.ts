import { Property, PropertySearchResponse, NLPParseResponse, PropertyFilters, ComparePredictionResponse } from '@/types';

// Use localhost in development, and the Render backend URL in production.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://agentmira-chatbot-backend.onrender.com");

// Serialize array params as repeated keys
function buildSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });
  
  return params;
}

export async function searchProperties(filters: PropertyFilters): Promise<PropertySearchResponse> {
  const params = buildSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/properties/search?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to search properties');
  }
  
  return response.json();
}

export async function parseNLP(text: string): Promise<NLPParseResponse> {
  const response = await fetch(`${API_BASE_URL}/nlp/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to parse input');
  }
  
  return response.json();
}

export async function getSavedProperties(userId: string): Promise<Property[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/saved`);
  
  if (!response.ok) {
    throw new Error('Failed to get saved properties');
  }
  
  return response.json();
}

export async function saveProperty(userId: string, propertyId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/saved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property_id: propertyId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save property');
  }
}

export async function unsaveProperty(userId: string, propertyId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/saved/${propertyId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to unsave property');
  }
}

export async function predictComparison(addressA: string, addressB: string): Promise<ComparePredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/compare/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address_a: addressA,
      address_b: addressB,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get comparison prediction');
  }

  return response.json();
}
