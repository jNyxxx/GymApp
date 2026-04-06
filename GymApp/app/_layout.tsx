import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              flex: 1,
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
