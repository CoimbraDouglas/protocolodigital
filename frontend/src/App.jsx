import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Protocolos from './pages/Protocolos'
import NovoProtocolo from './pages/NovoProtocolo'
import DetalheProtocolo from './pages/DetalheProtocolo'
import Setores from './pages/Setores'
import Usuarios from './pages/Usuarios'
import MinhaConta from './pages/MinhaConta'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/protocolos" element={<Protocolos />} />
            <Route path="/protocolos/novo" element={<NovoProtocolo />} />
            <Route path="/protocolos/:id" element={<DetalheProtocolo />} />
            <Route path="/setores" element={<Setores />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/minha-conta" element={<MinhaConta />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
