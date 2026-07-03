import { NavLink, useNavigate } from 'react-router-dom'

const icones = {
  protocolos: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
  dashboard: <path d="M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z" />,
  setores: <path d="M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4" />,
  usuarios: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />,
  conta: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />,
}

const links = [
  { to: '/protocolos', label: 'Protocolos', icon: icones.protocolos },
  { to: '/dashboard', label: 'Dashboard', icon: icones.dashboard },
  { to: '/setores', label: 'Setores', icon: icones.setores },
  { to: '/usuarios', label: 'Usuários', icon: icones.usuarios },
  { to: '/minha-conta', label: 'Minha Conta', icon: icones.conta },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <>
      <div onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      <aside className={`fixed top-0 left-0 h-full w-64 bg-vinho-800 text-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-white px-4 py-4 flex items-center justify-between">
          <img src="/logo.png" alt="Província Santa Cruz" className="h-12 object-contain" />
          <button onClick={onClose} aria-label="Fechar menu" className="text-vinho-700 p-1 rounded-lg hover:bg-vinho-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-4 border-b border-vinho-700">
          <h1 className="font-bold text-lg leading-tight">Protocolo Digital</h1>
          <p className="text-xs text-vinho-300 mt-2">{usuario.nome}</p>
          <span className="inline-block mt-1 text-xs bg-vinho-600 px-2 py-0.5 rounded">{usuario.perfil}</span>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${isActive ? 'bg-vinho-600 shadow-sm' : 'text-vinho-100 hover:bg-vinho-700'}`
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {l.icon}
              </svg>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={sair} className="m-3 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-vinho-700 hover:bg-vinho-600 rounded-lg transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Sair
        </button>
      </aside>
    </>
  )
}
