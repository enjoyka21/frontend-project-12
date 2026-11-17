import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { Notifications } from '@mantine/notifications';
import * as Sentry from '@sentry/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorFallback from './components/ErrorFallback.jsx';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import { createI18n, initI18n } from './i18n.js';
import { createAuthStore } from './store/authStore.js';
import { createChatStore } from './store/chatStore.js';
import { StoreProvider } from './store/StoreProvider.jsx';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
  });
}

const init = async (socket) => {
  const i18n = createI18n();
  await initI18n(i18n);
  const queryClient = new QueryClient();
  const authStore = createAuthStore();
  const chatStore = createChatStore();

  return (
    <I18nextProvider i18n={i18n}>
      <Sentry.ErrorBoundary fallback={ErrorFallback}>
        <StoreProvider authStore={authStore} chatStore={chatStore}>
          <MantineProvider>
            <Notifications position="top-right" />
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <Header />
                <Routes>
                  <Route
                    path="/"
                    element={(
                      <ProtectedRoute>
                        <HomePage socket={socket} />
                      </ProtectedRoute>
                    )}
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </BrowserRouter>
            </QueryClientProvider>
          </MantineProvider>
        </StoreProvider>
      </Sentry.ErrorBoundary>
    </I18nextProvider>
  );
};

export default init;
