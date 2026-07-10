import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { RunsPage } from './pages/RunsPage';
import { ScenarioDetailPage } from './pages/ScenarioDetailPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { SubscriberCreatePage } from './pages/SubscriberCreatePage';
import { SubscriberDetailPage } from './pages/SubscriberDetailPage';
import { SubscriberEditPage } from './pages/SubscriberEditPage';
import { SubscribersPage } from './pages/SubscribersPage';
import { ValidationPage } from './pages/ValidationPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'validation', element: <ValidationPage /> },
      { path: 'logs', element: <LogsPage /> },
      { path: 'scenarios', element: <ScenariosPage /> },
      { path: 'scenarios/:scenarioId', element: <ScenarioDetailPage /> },
      { path: 'subscribers', element: <SubscribersPage /> },
      { path: 'subscribers/new', element: <SubscriberCreatePage /> },
      { path: 'subscribers/:imsi', element: <SubscriberDetailPage /> },
      { path: 'subscribers/:imsi/edit', element: <SubscriberEditPage /> },
      { path: 'runs', element: <RunsPage /> },
      { path: 'runs/:runId', element: <RunDetailPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
