import { createBrowserRouter } from 'react-router-dom';
import AppPage from './routes/app';
import { LoadingPage } from './components/loading-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppPage />,
    loader: () => <LoadingPage />,
  }
]); 