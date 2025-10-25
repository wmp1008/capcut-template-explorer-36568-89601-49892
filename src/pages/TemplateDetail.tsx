import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, Users, FileText, ExternalLink, Smartphone, Play, MessageSquare } from "lucide-react";
import { ApiService, VideoTemplate, categories } from "@/services/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adMobService } from "@/services/admob";


const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [template, setTemplate] = useState<VideoTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isButtonUnlocked, setIsButtonUnlocked] = useState(false);
  const [relatedTemplates, setRelatedTemplates] = useState<VideoTemplate[]>([]);
  const [displayedRelatedCount, setDisplayedRelatedCount] = useState(10);
  
  const fromPath = searchParams.get('from') || '/';
  const RELATED_PER_PAGE = 10;

  useEffect(() => {
    // Scroll to top when template changes
    window.scrollTo(0, 0);
    
    if (id) {
      findTemplate(id);
    }
  }, [id]);

  useEffect(() => {
    // Get allTemplates from location state if available
    const allTemplates = (location.state as { allTemplates?: VideoTemplate[] })?.allTemplates || [];
    if (allTemplates.length > 0 && template) {
      // Filter out current template and shuffle
      const filtered = allTemplates.filter(t => t.web_id !== template.web_id);
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setRelatedTemplates(shuffled);
      setDisplayedRelatedCount(RELATED_PER_PAGE);
    }
  }, [template, location.state]);

  const findTemplate = async (webId: string) => {
    setLoading(true);
    try {
      // First check if there's template data in location state (passed from search results)
      const stateTemplate = (window.history.state?.usr as { template?: VideoTemplate })?.template;
      if (stateTemplate && stateTemplate.web_id === webId) {
        setTemplate(stateTemplate);
        setLoading(false);
        return;
      }

      // Try to find in cached collections
      for (const category of categories) {
        try {
          const response = await ApiService.getCollectionTemplates(category.id, 200);
          const found = response.data?.video_templates?.find(t => t.web_id === webId);
          if (found) {
            setTemplate(found);
            setLoading(false);
            return;
          }
        } catch (err) {
          // Continue to next category if this one fails
          console.warn(`Failed to load category ${category.id}:`, err);
        }
      }
      setTemplate(null);
    } catch (error) {
      console.error('Error finding template:', error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUsage = (amount: number) => {
    return amount >= 1000 ? `${(amount / 1000).toFixed(1)}K` : amount;
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleUnlockButton = async () => {
    try {
      const result = await adMobService.showRewardedInterstitial();
      if (result) {
        setIsButtonUnlocked(true);
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
    }
  };

  const handleUseTemplate = async () => {
    if (!isButtonUnlocked) {
      await handleUnlockButton();
      return;
    }
    
    try {
      await adMobService.showInterstitial();
    } catch (error) {
      console.error('Error showing ad:', error);
    }
  };

  const handleLoadMoreRelated = async () => {
    try {
      await adMobService.showInterstitial();
    } catch (error) {
      console.error('Error showing ad:', error);
    }
    setDisplayedRelatedCount(prev => Math.min(prev + RELATED_PER_PAGE, relatedTemplates.length));
  };

  const visibleRelatedTemplates = relatedTemplates.slice(0, displayedRelatedCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingSpinner message="Loading template..." />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground mb-4">Template not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const capcutAppUrl = `https://www.capcut.com/t/${template.web_id}`;
  const capcutWebUrl = `https://www.capcut.com/template-detail/${template.web_id}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(fromPath)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[9/16] max-w-md mx-auto">
              <video
                src={template.video_url}
                controls
                poster={template.cover_url}
                className="w-full h-full object-cover"
                playsInline
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{template.short_title}</h1>
              <p className="text-muted-foreground">{template.title}</p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <img
                src={template.author.avatar_url}
                alt={template.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{template.author.name}</p>
                <p className="text-sm text-muted-foreground">@{template.author.unique_id}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                  <p className="font-semibold text-lg">{formatUsage(template.usage_amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Segments</p>
                  <p className="font-semibold text-lg">{template.fragment_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Text Segments</p>
                  <p className="font-semibold text-lg">{template.draft_seg_info?.text_seg_len || 0}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Badge variant="outline" className="text-sm">
                Duration: {formatDuration(template.duration)}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isButtonUnlocked ? (
                <Button
                  size="lg"
                  onClick={handleUnlockButton}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch an Ad to Unlock the Button
                </Button>
              ) : (
                <a
                  href={capcutAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                  onClick={handleUseTemplate}
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    Use Template in CapCut App
                  </Button>
                </a>
              )}
              <a
                href={capcutWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open in CapCut Web
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedTemplates.length > 0 && (
          <div className="container mx-auto max-w-6xl px-4 mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {visibleRelatedTemplates.map((relatedTemplate) => (
                <TemplateCard
                  key={relatedTemplate.web_id}
                  template={relatedTemplate}
                  allTemplates={relatedTemplates}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayedRelatedCount < relatedTemplates.length && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMoreRelated}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  Load More Templates...
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TemplateDetail;
