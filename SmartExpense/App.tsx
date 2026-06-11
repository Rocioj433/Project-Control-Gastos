import AppNavigator from './src/navigation/AppNavigator';
import { GastosProvider } from './src/context/GastosContext';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <GastosProvider>
        <AppNavigator />
      </GastosProvider>
    </ThemeProvider>
  );
}