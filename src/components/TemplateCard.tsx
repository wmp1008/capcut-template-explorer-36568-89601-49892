import { VideoTemplate } from "@/services/api";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { useState, useRef } from "react";

interface TemplateCardProps {
  template: VideoTemplate;
  currentCategory?: number;
  searchQuery?: string;
}

const formatUsage = (amount: number) => {
  return amount >= 1000 ? `${(amount / 1000).toFixed(1)}K` : amount;
};

export const TemplateCard = ({ template, currentCategory, searchQuery }: TemplateCardProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTouchDevice = 'ontouchstart' in window;

  const aspectRatio = template.cover_height / template.cover_width;
  const paddingBottom = aspectRatio > 0 ? `${aspectRatio * 100}%` : '177.78%';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isVideoLoaded && template.video_dynamic_cover?.url && videoRef.current) {
      videoRef.current.src = template.video_dynamic_cover.url;
      setIsVideoLoaded(true);
    }
    
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice && template.video_dynamic_cover?.url && videoRef.current) {
      if (!isVideoLoaded) {
        videoRef.current.src = template.video_dynamic_cover.url;
        setIsVideoLoaded(true);
      }
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
    }
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  // Construct the template link with the current context (category or search) as a 'from' parameter
  let templateLink = `/template/${template.web_id}`;
  if (searchQuery) {
    templateLink += `?from=${encodeURIComponent(`/search?q=${searchQuery}`)}`;
  } else if (currentCategory) {
    templateLink += `?from=${encodeURIComponent(`/?category=${currentCategory}`)}`;
  }

  return (
    <Link 
      to={templateLink}
      state={{ template }}
      className="group block"
    >
      <div 
        className="bg-card rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full overflow-hidden bg-muted" style={{ paddingBottom }}>
          <img
            src={template.cover_url}
            alt={template.short_title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
              isVideoPlaying ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {template.video_dynamic_cover?.url && (
            <video
              ref={videoRef}
              className={`absolute top-0 left-0 w-full h-full object-cover ${
                isVideoPlaying ? 'block' : 'hidden'
              }`}
              muted
              loop
              playsInline
              onPause={handleVideoPause}
            />
          )}
          {isTouchDevice && template.video_dynamic_cover?.url && (
            <button
              onClick={handlePlayClick}
              className="absolute bottom-2 right-2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 transition-all hover:bg-black/70"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate text-card-foreground group-hover:text-primary transition-colors">
            {template.short_title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {formatUsage(template.usage_amount)} uses
          </p>
        </div>
      </div>
    </Link>
  );
};
