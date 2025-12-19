import { BleScanner } from 'components/BleScanner';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <BleScanner />
      <StatusBar style="light" backgroundColor="#06b6d4" />
    </SafeAreaProvider>
  );
}
