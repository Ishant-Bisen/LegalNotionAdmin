import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appTheme } from './theme/appTheme';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import { AdminDataProviders } from './components/AdminDataProviders';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import PostEditor from './pages/PostEditor';
import AllPosts from './pages/AllPosts';
import Reviews from './pages/Reviews';
import Careers from './pages/Careers';
import Login from './pages/Login';

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <AdminDataProviders>
                    <Layout />
                  </AdminDataProviders>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/editor" element={<PostEditor />} />
                <Route path="/editor/:id" element={<PostEditor />} />
                <Route path="/posts" element={<AllPosts />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/careers" element={<Careers />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
