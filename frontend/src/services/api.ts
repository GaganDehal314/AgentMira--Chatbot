import axios from "axios";
import { Property, PropertySearchResponse, ComparePredictionResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

export async function searchProperties(params: Record<string, any>): Promise<PropertySearchResponse> {
  // Handle location arrays - FastAPI expects repeated query params for arrays
  const processedParams: Record<string, any> = { ...params };
  
  // If location is an array, convert it to repeated query parameters
  if (Array.isArray(params.location)) {
    // axios will handle this correctly with paramsSerializer
    // But we need to ensure it's sent as location=value1&location=value2
    processedParams.location = params.location;
  }
  
  const res = await api.get<PropertySearchResponse>("/properties/search", { 
    params: processedParams,
    paramsSerializer: {
      indexes: null, // Send arrays as repeated params: location=NY&location=Boston
    }
  });
  return res.data;
}

export async function saveProperty(userId: string, propertyId: string) {
  await api.post(`/users/${userId}/saved`, { property_id: propertyId });
}

export async function deleteSaved(userId: string, propertyId: string) {
  await api.delete(`/users/${userId}/saved/${propertyId}`);
}

export async function getSaved(userId: string): Promise<Property[]> {
  const res = await api.get<Property[]>(`/users/${userId}/saved`);
  return res.data;
}

export async function nlpParse(text: string): Promise<{ filters?: Record<string, any>; text?: string }> {
  const res = await api.post<{ filters?: Record<string, any>; text?: string; provider: string }>("/nlp/parse", { text });
  return { filters: res.data.filters, text: res.data.text };
}

export async function predictComparison(addressA: string, addressB: string): Promise<ComparePredictionResponse> {
  const res = await api.post<ComparePredictionResponse>("/compare/predict", {
    address_a: addressA,
    address_b: addressB,
  });
  return res.data;
}

