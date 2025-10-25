import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Play } from "lucide-react";
import { ApiService, categories, VideoTemplate } from "@/services/api";
import { adMobService } from "@/services/admob";
import { TemplateCard } from "@/components/TemplateCard";
import { CategoryChip } from "@/components/CategoryChip";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTemplates, setAllTemplates] = useState<VideoTemplate[]>([]);
  const [displayedCount, setDisplayedCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const categoryFromUrl = parseInt(searchParams.get('category') || '6001');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const TEMPLATES_PER_PAGE = 20;

  useEffect(() => {
    const categoryParam = parseInt(searchParams.get('category') || '6001');
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTemplates(selectedCategory);
  }, [selectedCategory]);

  const loadTemplates = async (categoryId: number) => {
    setLoading(true);
    setDisplayedCount(TEMPLATES_PER_PAGE);
    try {
      const response = await ApiService.getCollectionTemplates(categoryId, 200);
      setAllTemplates(response.data?.video_templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      setAllTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      await adMobService.showInterstitial();
    } catch (error) {
      console.error('Error showing ad:', error);
    }
    setDisplayedCount(prev => Math.min(prev + TEMPLATES_PER_PAGE, allTemplates.length));
  };

  const templates = allTemplates.slice(0, displayedCount);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Show rewarded ad before allowing search
      try {
        const result = await adMobService.showRewardedInterstitial();
        if (result) {
          // Only navigate to search if ad was watched
          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
      } catch (error) {
        console.error('Error showing rewarded ad:', error);
        // Still allow search if ad fails
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
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
              <Button type="submit" size="lg" variant="secondary" className="h-12 px-6">
                Watch Ad to Search
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
              {templates.map((template) => (
                <TemplateCard 
                  key={template.web_id} 
                  template={template} 
                  currentCategory={selectedCategory}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayedCount < allTemplates.length && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  Load More Templates...
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
