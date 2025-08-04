import { Navigate, useRoutes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import PermissionsPage from './pages/PermissionsPage.jsx';
import LogisticsPage from './pages/LogisticsPage.jsx';

export default function Routes() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Navigate to="clients" /> },
        { path: 'clients', element: <ClientsPage /> },
        { path: 'permissions', element: <PermissionsPage /> },
        { path: 'logistics', element: <LogisticsPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/" /> },
  ]);
}
