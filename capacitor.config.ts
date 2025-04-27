import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'oi-lingo',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '713664442464-roefdllbga88raq3d2skrkngmtb9tnuu.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      
    }
  }
};

export default config;
