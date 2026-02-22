import './globals.css';
import { CustomThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { APICounterProvider } from '@/context/APICounterContext';
import CssBaseline from '@mui/material/CssBaseline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EquaityWaves.ai',
  description: 'Your modern AI-powered equity analysis platform with advanced market insights and predictions',
  icons: {
    icon: '/Gemini_Generated_Image_o5gli0o5gli0o5gl.svg',
    shortcut: '/Gemini_Generated_Image_o5gli0o5gli0o5gl.svg',
    apple: '/Gemini_Generated_Image_o5gli0o5gli0o5gl.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <CustomThemeProvider>
          <AuthProvider>
            <APICounterProvider>
              <CssBaseline />
        {children}
            </APICounterProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
