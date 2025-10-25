import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon, Play } from "lucide-react";
import { ApiService, VideoTemplate } from "@/services/api";
import { TemplateCard } from "@/components/TemplateCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adMobService } from "@/services/admob";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allTemplates, setAllTemplates] = useState<VideoTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<VideoTemplate[]>([]);
  const [displayedCount, setDisplayedCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const query = searchParams.get('q') || '';

  // Filter states
  const [sortBy, setSortBy] = useState('default');
  const [aspectRatio, setAspectRatio] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [maxClips, setMaxClips] = useState('');

  const TEMPLATES_PER_PAGE = 20;

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      searchTemplates(query);
    }
  }, [query]);

  useEffect(() => {
    applyFilters();
  }, [allTemplates, sortBy, aspectRatio, durationFilter, maxClips]);

  const searchTemplates = async (searchTerm: string) => {
    setLoading(true);
    
    try {
      const response = await ApiService.searchTemplates(searchTerm);
      const templates = response.data?.video_templates || [];
      setAllTemplates(templates);
      setDisplayedCount(TEMPLATES_PER_PAGE);
    } catch (error) {
      console.error('Error searching templates:', error);
      setAllTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let templatesToProcess = [...allTemplates];

    // Sort by
    if (sortBy === 'usage') {
      templatesToProcess.sort((a, b) => b.usage_amount - a.usage_amount);
    } else if (sortBy === 'newest') {
      templatesToProcess.sort((a, b) => b.create_time - a.create_time);
    }

    // Aspect Ratio filter
    if (aspectRatio !== 'all') {
      templatesToProcess = templatesToProcess.filter(t => {
        const ratio = t.cover_width / t.cover_height;
        if (aspectRatio === 'portrait') return ratio < 0.8;
        if (aspectRatio === 'landscape') return ratio > 1.2;
        if (aspectRatio === 'square') return ratio >= 0.8 && ratio <= 1.2;
        return true;
      });
    }

    // Duration filter
    if (durationFilter !== 'all') {
      templatesToProcess = templatesToProcess.filter(t => {
        const durationInSeconds = t.duration / 1000;
        if (durationFilter === '0-15') return durationInSeconds <= 15;
        if (durationFilter === '15-30') return durationInSeconds > 15 && durationInSeconds <= 30;
        if (durationFilter === '>30') return durationInSeconds > 30;
        return true;
      });
    }

    // Max Clips filter
    const maxClipsNum = parseInt(maxClips, 10);
    if (!isNaN(maxClipsNum) && maxClipsNum > 0) {
      templatesToProcess = templatesToProcess.filter(t => t.fragment_count <= maxClipsNum);
    }

    setFilteredTemplates(templatesToProcess);
    setDisplayedCount(TEMPLATES_PER_PAGE);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const result = await adMobService.showRewardedInterstitial();
        if (result) {
          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
      } catch (error) {
        console.error('Error showing rewarded ad:', error);
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleLoadMore = async () => {
    try {
      await adMobService.showInterstitial();
    } catch (error) {
      console.error('Error showing ad:', error);
    }
    setDisplayedCount(prev => Math.min(prev + TEMPLATES_PER_PAGE, filteredTemplates.length));
  };

  const templates = filteredTemplates.slice(0, displayedCount);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold">Search Results</h1>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search templates..."
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

      {/* Filters */}
      {!loading && allTemplates.length > 0 && (
        <section className="bg-card border-b py-6 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="usage">Most Used</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                    <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="0-15">0-15s</SelectItem>
                    <SelectItem value="15-30">15-30s</SelectItem>
                    <SelectItem value=">30">&gt;30s</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Clips</label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={maxClips}
                  onChange={(e) => setMaxClips(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <LoadingSpinner message="Searching templates..." />
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-muted-foreground mb-4">No templates found</p>
            <p className="text-muted-foreground">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Results for "{query}"
              </h2>
              <p className="text-muted-foreground">
                {filteredTemplates.length} templates found
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {templates.map((template) => (
                <TemplateCard 
                  key={template.web_id} 
                  template={template} 
                  searchQuery={query}
                  allTemplates={allTemplates}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayedCount < filteredTemplates.length && (
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

export default Search;
