import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import LoginPage from './pages/LoginPage';
import ClientsPage from './pages/ClientsPage';
import { authStore } from './store/auth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authStore.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#1574b3',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: 14,
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBgLayout: '#f0f4f8',
          colorBorder: '#e2e8f0',
          colorBorderSecondary: '#f1f5f9',
          controlHeight: 38,
          wireframe: false,
        },
        components: {
          Button: {
            primaryShadow: '0 2px 6px rgba(21, 116, 179, 0.25)',
            fontWeight: 500,
          },
          Input: {
            activeShadow: '0 0 0 3px rgba(21, 116, 179, 0.1)',
          },
          Select: {
            optionSelectedBg: '#e8f4fd',
          },
          Card: {
            paddingLG: 20,
          },
          Modal: {
            paddingContentHorizontalLG: 0,
          },
          Notification: {
            width: 360,
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <ClientsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/clients" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
