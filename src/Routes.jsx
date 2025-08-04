import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ClientsPage from './pages/ClientsPage';
import LoginForm from './pages/LoginForm';
import PrivateRoute from './components/PrivateRoute';

export default function AppRoutes({ themeName, setThemeName }) {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout themeName={themeName} setThemeName={setThemeName} />
          </PrivateRoute>
        }
      >
        <Route path="clients" element={<ClientsPage />} />
        {/* Otras rutas aquí */}
      </Route>
    </Routes>
  );
}
