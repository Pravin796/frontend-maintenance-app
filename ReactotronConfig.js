import { NativeModules, Platform } from 'react-native';
import Reactotron from 'reactotron-react-native';

let reactotron = null;

if (__DEV__) {
  let host = 'localhost';

  if (Platform.OS !== 'web') {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      // Extract IP address from Metro scriptURL (e.g. "http://192.168.1.48:8082/index.bundle...")
      const address = scriptURL.split('://')[1]?.split('/')[0];
      const hostname = address?.split(':')[0];
      if (hostname) {
        host = hostname;
      }
    } else if (process.env.EXPO_PUBLIC_API_URL) {
      // Fallback: extract host from EXPO_PUBLIC_API_URL
      try {
        const url = new URL(process.env.EXPO_PUBLIC_API_URL);
        if (url.hostname && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
          host = url.hostname;
        }
      } catch {
        // Ignore URL parsing errors
      }
    }
  }

  reactotron = Reactotron.configure({
    name: 'Maintenance App',
    host,
    port: 9090,
  })
    .useReactNative({
      asyncStorage: false,
      networking: {
        ignoreUrls: /symbolicate|generate_204/,
      },
      editor: false,
      errors: { veto: () => false },
      overlay: false,
    })
    .connect();

  // Clear previous session logs upon connecting for clean inspection
  reactotron.clear();

  // Attach to console for quick manual debugging (e.g. console.tron.log("hello"))
  console.tron = reactotron;
}

export default reactotron;