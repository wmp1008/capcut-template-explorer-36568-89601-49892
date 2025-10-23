import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { ApiService, categories, VideoTemplate } from "@/services/api";
import { TemplateCard } from "@/components/TemplateCard";
import { CategoryChip } from "@/components/CategoryChip";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adMobService } from "@/services/admob";
import { InlineBannerAd } from "@/components/InlineBannerAd";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryFromUrl = parseInt(searchParams.get('category') || '6001');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const categoryParam = parseInt(searchParams.get('category') || '6001');
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTemplates(selectedCategory);
    
    // Show banner ad when home page loads
    adMobService.showBanner().catch(console.error);
    
    // Clean up banner when component unmounts
    return () => {
      adMobService.hideBanner().catch(console.error);
    };
  }, [selectedCategory]);

  const loadTemplates = async (categoryId: number) => {
    setLoading(true);
    try {
      const response = await ApiService.getCollectionTemplates(categoryId, 200);
      setTemplates(response.data?.video_templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-gradient-hero text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in">
            CapCut Template Finder
          </h1>
          <p className="text-center text-lg opacity-90 mb-8 animate-slide-up">
            Discover thousands of trending templates for your videos
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-scale-in">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search templates... (e.g., love, travel, summer)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button type="submit" size="lg" variant="secondary" className="h-12">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </header>

      {/* Categories */}
      <section className="py-6 px-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.display_name}
                emoji={category.emoji}
                isActive={selectedCategory === category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSearchParams({ category: category.id.toString() });
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <LoadingSpinner message="Loading templates..." />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {categories.find(c => c.id === selectedCategory)?.display_name || 'Templates'}
              </h2>
              <p className="text-muted-foreground">
                {templates.length} templates
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {templates.map((template, index) => {
                // Show inline banner ad randomly after every 3-4 templates
                const shouldShowAd = (index + 1) % (Math.random() > 0.5 ? 3 : 4) === 0 && index !== templates.length - 1;
                
                return (
                  <>
                    <TemplateCard 
                      key={template.web_id} 
                      template={template} 
                      currentCategory={selectedCategory}
                    />
                    {shouldShowAd && (
                      <InlineBannerAd key={`ad-${index}`} adId={`inline-banner-${index}`} />
                    )}
                  </>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
