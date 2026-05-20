import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import DashboardPage from './pages/DashboardPage';
import LabelPage from './pages/LabelPage';
import InvoicePage from './pages/InvoicePage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';

function Protected({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/auth" replace />;
}

function PublicOnly({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="relative h-full overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))] opacity-40 dark:opacity-100" />
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicOnly>
              <AuthPage />
            </PublicOnly>
          }
        />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="labels" element={<LabelPage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </motion.div>
  );
}