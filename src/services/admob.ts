import { AdMob, BannerAdSize, BannerAdPosition, AdmobConsentStatus } from '@capacitor-community/admob';

// Test Ad Unit IDs - these are safe to use and won't affect your AdMob account
const AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/9214589741',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
};

class AdMobService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await AdMob.initialize({
        testingDevices: [], // Add device IDs here for testing if needed
        initializeForTesting: true,
      });
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  }

  async showBanner() {
    try {
      await this.initialize();
      await AdMob.showBanner({
        adId: AD_UNITS.banner,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Error showing banner:', error);
    }
  }

  async hideBanner() {
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Error hiding banner:', error);
    }
  }

  async showInterstitial() {
    try {
      await this.initialize();
      
      // Prepare the interstitial ad
      await AdMob.prepareInterstitial({
        adId: AD_UNITS.interstitial,
      });

      // Show the interstitial ad
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown');
    } catch (error) {
      console.error('Error showing interstitial:', error);
    }
  }

  async showRewardedInterstitial() {
    try {
      await this.initialize();
      
      // Prepare the rewarded interstitial ad
      await AdMob.prepareRewardInterstitialAd({
        adId: AD_UNITS.rewardedInterstitial,
      });

      // Show the rewarded interstitial ad
      const result = await AdMob.showRewardInterstitialAd();
      console.log('Rewarded interstitial ad shown, reward:', result);
      return result;
    } catch (error) {
      console.error('Error showing rewarded interstitial:', error);
      return null;
    }
  }

  async removeBanner() {
    try {
      await AdMob.removeBanner();
      console.log('Banner ad removed');
    } catch (error) {
      console.error('Error removing banner:', error);
    }
  }
}

export const adMobService = new AdMobService();
