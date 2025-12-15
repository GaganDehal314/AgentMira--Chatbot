export type Property = {
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
};

export type PropertySearchResponse = {
  total: number;
  page: number;
  page_size: number;
  results: Property[];
};

export type PredictedProperty = Property & {
  predicted_price: number;
  features: Record<string, any>;
};

export type ComparePredictionResponse = {
  properties: PredictedProperty[];
};

