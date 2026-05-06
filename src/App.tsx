import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ReviewList } from './pages/ReviewList';
import { ReviewDetail } from './pages/ReviewDetail';
import { Approval } from './pages/Approval';
import { NewReviewRequest } from './pages/NewReviewRequest';
import { PolicyManagement } from './pages/PolicyManagement';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reviews" element={<ReviewList />} />
          <Route path="reviews/my" element={<ReviewList />} />
          <Route path="reviews/:id" element={<ReviewDetail />} />
          <Route path="reviews/:id/approval" element={<Approval />} />
          <Route path="requests/new" element={<NewReviewRequest />} />
          <Route path="policies" element={<Navigate to="/policies/laws" replace />} />
          <Route path="policies/laws" element={<PolicyManagement />} />
          <Route path="policies/guides" element={<PolicyManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
