import { NavLink, useNavigate } from 'react-router-dom'

const atalhos = [
  { to: '/protocolos', label: 'Protocolos' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/setores', label: 'Setores' },
]

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const inicial = (usuario.nome || '?').charAt(0).toUpperCase()

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-30 bg-white/85 backdrop-blur border-b border-vinho-100 shadow-sm">
      <div className="h-full px-3 sm:px-5 flex items-center gap-3">
        <button onClick={onToggleSidebar} aria-label="Abrir menu"
          className="p-2 rounded-lg text-vinho-700 hover:bg-vinho-50 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <img src="/logo.png" alt="Província Santa Cruz" className="h-9 object-contain" />
          <span className="font-bold text-vinho-800 hidden sm:block">Protocolo Digital</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 ml-3">
          {atalhos.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-vinho-700 text-white shadow-sm' : 'text-vinho-700 hover:bg-vinho-50'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => navigate('/protocolos/novo')}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-vinho-700 text-white hover:bg-vinho-800 transition-colors shadow-sm">
            + Novo Protocolo
          </button>

          <div className="hidden lg:flex flex-col items-end leading-tight mr-1">
            <span className="text-sm font-medium text-gray-700">{usuario.nome}</span>
            <span className="text-[11px] text-vinho-500">{usuario.perfil}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-vinho-700 text-white grid place-items-center text-sm font-semibold shadow-sm">
            {inicial}
          </div>

          <button onClick={sair} title="Sair"
            className="p-2 rounded-lg text-gray-500 hover:bg-vinho-50 hover:text-vinho-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
