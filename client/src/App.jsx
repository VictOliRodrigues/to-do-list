import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Tasks } from './pages/Tasks.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route
        path="/tarefas"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/tarefas" replace />} />
    </Routes>
  );
}
