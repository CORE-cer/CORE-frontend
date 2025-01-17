import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { Helmet } from 'react-helmet';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from 'react-router';
import Navbar from './components/Navbar.jsx';
import DarkModeProvider from './context/DarkModeContext.jsx';
import './monaco/setup';
import Query from './pages/query.jsx';
import Watch from './pages/watch.jsx';
import './style.scss';

export const Main = () => {
  const router = createBrowserRouter([
    {
      path: '*',
      element: <Navigate to="/" />,
    },
    {
      path: '/',
      element: (
        <>
          <ScrollRestoration />
          <Navbar>
            <Outlet />
          </Navbar>
        </>
      ),
      children: [
        {
          path: '/',
          element: <div>TODO: Home</div>,
        },
        {
          path: '/query',
          element: <Query />,
        },
        {
          path: '/watch',
          element: <Watch />,
        },
        {
          path: '/about',
          element: <div>TODO: About</div>,
        },
      ],
    },
  ]);

  return (
    <>
      <Helmet
        title="CORE"
        htmlAttributes={{ lang: 'en' }}
        meta={[
          {
            name: 'description',
            content: 'CORE',
          },
          {
            charSet: 'utf-8',
          },
        ]}
      />
      <DarkModeProvider>
        <CssBaseline />
        <RouterProvider router={router}>
          <Navbar />
          <Outlet />
        </RouterProvider>
      </DarkModeProvider>
    </>
  );
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<Main />);
