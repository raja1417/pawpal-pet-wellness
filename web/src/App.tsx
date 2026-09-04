import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { PetDetail } from './pages/PetDetail';
import { PetForm } from './pages/PetForm';
import { PetList } from './pages/PetList';
import { Vaccinations } from './pages/Vaccinations';
import { WellnessForm } from './pages/WellnessForm';

function Protected() {
  const { user } = useAuth();
  return user ? <Layout /> : <Navigate to="/login" replace />;
}

export function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route element={<Protected />}>
      <Route index element={<Dashboard />} />
      <Route path="/pets" element={<PetList />} />
      <Route path="/pets/new" element={<PetForm />} />
      <Route path="/pets/:id" element={<PetDetail />} />
      <Route path="/pets/:id/edit" element={<PetForm />} />
      <Route path="/pets/:id/wellness/new" element={<WellnessForm />} />
      <Route path="/pets/:id/vaccinations" element={<Vaccinations />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
