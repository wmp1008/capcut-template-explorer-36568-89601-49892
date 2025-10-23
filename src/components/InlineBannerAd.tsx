import { useEffect, useRef, useState } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

interface InlineBannerAdProps {
  adId: string;
}

const BANNER_TEST_ID = 'ca-app-pub-3940256099942544/9214589741';

export const InlineBannerAd = ({ adId }: InlineBannerAdProps) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adHeight, setAdHeight] = useState(250);
  
  useEffect(() => {
    let isMounted = true;

    const loadInlineBanner = async () => {
      try {
        // Calculate width based on container
        const containerWidth = adContainerRef.current?.offsetWidth || 300;
        
        // Show inline adaptive banner
        await AdMob.showBanner({
          adId: BANNER_TEST_ID,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.TOP_CENTER,
          margin: 0,
        });

        if (isMounted) {
          // Estimate height based on width (inline adaptive banners are typically 50-250px tall)
          const estimatedHeight = Math.min(250, Math.floor(containerWidth * 0.3));
          setAdHeight(estimatedHeight);
        }
      } catch (error) {
        console.error('Error loading inline banner ad:', error);
      }
    };

    loadInlineBanner();

    return () => {
      isMounted = false;
      AdMob.hideBanner().catch(console.error);
    };
  }, [adId]);

  return (
    <div 
      ref={adContainerRef}
      className="bg-muted/10 rounded-xl overflow-hidden flex items-center justify-center"
      style={{ height: `${adHeight}px` }}
    >
      {/* AdMob banner will render here */}
    </div>
  );
};
