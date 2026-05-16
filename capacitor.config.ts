import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wardosen.app',
  appName: 'WarDosen',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
