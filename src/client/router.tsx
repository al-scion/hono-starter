import { createBrowserRouter } from 'react-router-dom';
import AppPage from './routes/app';
import { LoadingPage } from './components/loading-page';
import { ErrorBoundary } from './components/error-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppPage />,
    loader: () => <LoadingPage />,
    errorElement: <ErrorBoundary />,
  }
]); 