import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CarSearch from './components/CarSearch';

export default function App() {
  const maintenanceMode = true; // 🔧 Set to `true` to enable maintenance

  if (maintenanceMode) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h1>🚧 Site Under Maintenance 🚧</h1>
        <p>Under some issues. Please check back later.</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CarSearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
