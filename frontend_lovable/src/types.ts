export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  size_sqft?: number;
  amenities: string[];
  images: string[];
}

export interface PropertySearchResponse {
  total: number;
  page: number;
  page_size: number;
  results: Property[];
}

export interface NLPParseResponse {
  filters?: Record<string, unknown>;
  text?: string;
  provider: string;
}

export interface PredictedProperty extends Property {
  predicted_price: number;
  features: Record<string, unknown>;
}

export interface ComparePredictionResponse {
  properties: PredictedProperty[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
  timestamp: Date;
}

export interface PropertyFilters {
  location?: string[];
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  amenities?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
