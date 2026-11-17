import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const init = async (socket) => (
  <MantineProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage socket={socket} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  </MantineProvider>
);

export default init;
