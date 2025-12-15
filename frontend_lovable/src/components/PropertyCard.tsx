import React from 'react';
import { Property } from '@/types';
import { Heart, MapPin, Bed, Bath, Square, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  isSaved?: boolean;
  onSelect?: (property: Property) => void;
  onSave?: (property: Property) => void;
  onUnsave?: (property: Property) => void;
}

export function PropertyCard({
  property,
  isSelected = false,
  isSaved = false,
  onSelect,
  onSave,
  onUnsave,
}: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCardClick = () => {
    onSelect?.(property);
  };

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave?.(property);
    } else {
      onSave?.(property);
    }
  };

  const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop';

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative bg-card rounded-lg overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected && 'ring-2 ring-selection shadow-lg'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-10 bg-selection rounded-full p-1.5 shadow-md animate-scale-in">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSaveClick}
        className={cn(
          'absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200',
          'bg-card/80 backdrop-blur-sm hover:bg-card',
          isSaved ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
        )}
      >
        <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
      </button>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
            {property.title}
          </h3>
        </div>

        <p className="text-2xl font-semibold text-primary">
          {formatPrice(property.price)}
        </p>

        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 pt-2 border-t border-border text-sm text-muted-foreground">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {(property.size || property.size_sqft) && (
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4" />
              <span>{property.size || property.size_sqft} sqft</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-0.5 text-muted-foreground text-xs">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
