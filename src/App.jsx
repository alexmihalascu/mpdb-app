import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { LoadingPage } from './components/ui/LoadingPage';
import { AuthProvider } from './context/AuthProvider';
import Home from './pages/Home';

// Everything past the landing page is split out so the first paint only ships
// what it needs.
const Fleet = lazy(() => import('./pages/Fleet'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const Compare = lazy(() => import('./pages/Compare'));
const Booking = lazy(() => import('./pages/Booking'));
const Team = lazy(() => import('./pages/Team'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <a className="skip-link" href="#main">
          Sari la continut
        </a>
        <Navbar />

        <main id="main">
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/flota" element={<Fleet />} />
              <Route path="/flota/:slug" element={<CarDetails />} />
              <Route path="/comparatie" element={<Compare />} />
              <Route path="/rezervare" element={<Booking />} />
              <Route path="/echipa" element={<Team />} />
              <Route path="/autentificare" element={<Login />} />
              <Route path="/cont-nou" element={<Register />} />
              <Route
                path="/contul-meu"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
