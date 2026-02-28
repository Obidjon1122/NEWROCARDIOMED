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
    <ConfigProvider locale={ruRU} theme={{ token: { colorPrimary: '#1a5276' } }}>
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
