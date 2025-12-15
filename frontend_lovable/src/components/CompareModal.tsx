import { Property } from '@/types';
import { X, MapPin, Bed, Bath, Square, Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompareModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
}

export function CompareModal({ properties, isOpen, onClose }: CompareModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get all unique amenities across all properties
  const allAmenities = [...new Set(properties.flatMap((p) => p.amenities || []))];

  const CompareRow = ({
    label,
    values,
    highlight = false,
  }: {
    label: string;
    values: (string | number | undefined)[];
    highlight?: boolean;
  }) => (
    <div className={`grid gap-4 py-3 border-b border-border ${highlight ? 'bg-secondary/30' : ''}`} style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
      <div className="font-medium text-foreground px-4">{label}</div>
      {values.map((value, i) => (
        <div key={i} className="text-muted-foreground text-center">
          {value ?? '-'}
        </div>
      ))}
    </div>
  );

  const AmenityRow = ({ amenity }: { amenity: string }) => (
    <div className="grid gap-4 py-2 border-b border-border/50" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
      <div className="text-sm text-muted-foreground px-4">{amenity}</div>
      {properties.map((property, i) => (
        <div key={i} className="flex justify-center">
          {property.amenities?.includes(amenity) ? (
            <Check className="w-5 h-5 text-success" />
          ) : (
            <Minus className="w-5 h-5 text-muted-foreground/30" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-2xl">
              Compare Properties
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-6">
            {/* Property headers with images */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div />
              {properties.map((property) => (
                <div key={property.id} className="space-y-3">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-center line-clamp-2">
                    {property.title}
                  </h3>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <div className="space-y-0 rounded-lg border border-border overflow-hidden">
              <CompareRow
                label="Price"
                values={properties.map((p) => formatPrice(p.price))}
                highlight
              />
              <CompareRow
                label="Location"
                values={properties.map((p) => p.location)}
              />
              <CompareRow
                label="Bedrooms"
                values={properties.map((p) => p.bedrooms)}
                highlight
              />
              <CompareRow
                label="Bathrooms"
                values={properties.map((p) => p.bathrooms)}
              />
              <CompareRow
                label="Size (sqft)"
                values={properties.map((p) => p.size || p.size_sqft)}
                highlight
              />
            </div>

            {/* Amenities section */}
            {allAmenities.length > 0 && (
              <div className="mt-6">
                <h4 className="font-display font-semibold text-foreground mb-3">
                  Amenities
                </h4>
                <div className="rounded-lg border border-border overflow-hidden">
                  {allAmenities.map((amenity) => (
                    <AmenityRow key={amenity} amenity={amenity} />
                  ))}
                </div>
              </div>
            )}

            {/* Image galleries */}
            <div className="mt-6">
              <h4 className="font-display font-semibold text-foreground mb-3">
                Photo Gallery
              </h4>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
                {properties.map((property) => (
                  <div key={property.id} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {(property.images || []).slice(0, 4).map((image, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${property.title} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {(property.images?.length || 0) > 4 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{property.images!.length - 4} more photos
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
