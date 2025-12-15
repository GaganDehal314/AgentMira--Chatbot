import { Property } from '@/types';
import { PropertyCard } from './PropertyCard';
import { Home } from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  selectedPropertyIds: Set<string>;
  savedPropertyIds: Set<string>;
  onSelectProperty: (property: Property) => void;
  onSaveProperty: (property: Property) => void;
  onUnsaveProperty: (property: Property) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function PropertyGrid({
  properties,
  selectedPropertyIds,
  savedPropertyIds,
  onSelectProperty,
  onSaveProperty,
  onUnsaveProperty,
  isLoading,
  emptyMessage = 'No properties found. Try adjusting your search.',
}: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-7 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Home className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No properties yet</h3>
        <p className="text-muted-foreground max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PropertyCard
            property={property}
            isSelected={selectedPropertyIds.has(property.id)}
            isSaved={savedPropertyIds.has(property.id)}
            onSelect={onSelectProperty}
            onSave={onSaveProperty}
            onUnsave={onUnsaveProperty}
          />
        </div>
      ))}
    </div>
  );
}
