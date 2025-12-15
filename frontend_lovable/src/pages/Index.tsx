import { useState, useEffect, useCallback } from 'react';
import { Property, PropertyFilters } from '@/types';
import { getSavedProperties, saveProperty, unsaveProperty, searchProperties } from '@/services/api';
import { Header } from '@/components/Header';
import { Chat } from '@/components/Chat';
import { QuickFilters } from '@/components/QuickFilters';
import { PropertyGrid } from '@/components/PropertyGrid';
import { SavedList } from '@/components/SavedList';
import { CompareModal } from '@/components/CompareModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Search, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const USER_ID = localStorage.getItem('userId') || 'demo-user';

const Index = () => {
  const { toast } = useToast();
  
  // State
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Map<string, Property>>(new Map());
  const [isSearching, setIsSearching] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  // Derived state
  const savedPropertyIds = new Set(savedProperties.map((p) => p.id));
  const selectedPropertyIds = new Set(selectedProperties.keys());

  // Fetch saved properties on mount
  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const saved = await getSavedProperties(USER_ID);
      setSavedProperties(saved);
    } catch (error) {
      console.error('Failed to fetch saved properties:', error);
    }
  };

  const handleSelectProperty = useCallback((property: Property) => {
    setSelectedProperties((prev) => {
      const next = new Map(prev);
      if (next.has(property.id)) {
        next.delete(property.id);
      } else {
        next.set(property.id, property);
      }
      return next;
    });
  }, []);

  const handleSaveProperty = async (property: Property) => {
    try {
      await saveProperty(USER_ID, property.id);
      await fetchSavedProperties();
      toast({
        title: 'Property saved',
        description: `${property.title} has been added to your saved list.`,
      });
    } catch (error) {
      console.error('Failed to save property:', error);
      toast({
        title: 'Error',
        description: 'Failed to save property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnsaveProperty = async (property: Property) => {
    try {
      await unsaveProperty(USER_ID, property.id);
      await fetchSavedProperties();
      toast({
        title: 'Property removed',
        description: `${property.title} has been removed from your saved list.`,
      });
    } catch (error) {
      console.error('Failed to unsave property:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleQuickSearch = async (filters: PropertyFilters) => {
    setIsSearching(true);
    try {
      const response = await searchProperties(filters);
      setSearchResults(response.results);
      
      if (response.results.length === 0) {
        toast({
          title: 'No results',
          description: 'No properties found matching your criteria.',
        });
      } else {
        toast({
          title: 'Search complete',
          description: `Found ${response.total} properties.`,
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search properties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCompare = () => {
    if (selectedProperties.size >= 2) {
      setShowCompareModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedCount={selectedProperties.size}
        onCompare={handleCompare}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Chat & Filters */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="filters" className="gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                  {savedProperties.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {savedProperties.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <div className="h-[calc(100vh-220px)]">
                  <Chat
                    savedPropertyIds={savedPropertyIds}
                    selectedPropertyIds={selectedPropertyIds}
                    onSelectProperty={handleSelectProperty}
                    onSaveProperty={handleSaveProperty}
                    onUnsaveProperty={handleUnsaveProperty}
                  />
                </div>
              </TabsContent>

              <TabsContent value="filters" className="mt-4 space-y-4">
                <QuickFilters onSearch={handleQuickSearch} isLoading={isSearching} />
              </TabsContent>

              <TabsContent value="saved" className="mt-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <SavedList
                    properties={savedProperties}
                    selectedPropertyIds={selectedPropertyIds}
                    onSelectProperty={handleSelectProperty}
                    onUnsaveProperty={handleUnsaveProperty}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main content - Property Grid */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {searchResults.length > 0 ? 'Search Results' : 'Featured Properties'}
              </h2>
              {searchResults.length > 0 && (
                <button
                  onClick={() => setSearchResults([])}
                  className="text-sm text-primary hover:underline"
                >
                  Clear results
                </button>
              )}
            </div>

            <PropertyGrid
              properties={searchResults}
              selectedPropertyIds={selectedPropertyIds}
              savedPropertyIds={savedPropertyIds}
              onSelectProperty={handleSelectProperty}
              onSaveProperty={handleSaveProperty}
              onUnsaveProperty={handleUnsaveProperty}
              isLoading={isSearching}
              emptyMessage="Use the chat or filters to search for properties."
            />
          </div>
        </div>
      </main>

      {/* Compare Modal */}
      <CompareModal
        properties={Array.from(selectedProperties.values())}
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </div>
  );
};

export default Index;
