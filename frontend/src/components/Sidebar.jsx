import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/protocolos', label: 'Protocolos' },
  { to: '/setores', label: 'Setores' },
  { to: '/usuarios', label: 'Usuários' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <aside className="w-56 bg-blue-800 text-white flex flex-col">
      <div className="p-4 border-b border-blue-700">
        <h1 className="font-bold text-lg leading-tight">Protocolo Digital</h1>
        <p className="text-xs text-blue-300 mt-1">{usuario.nome}</p>
        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">{usuario.perfil}</span>
      </div>
      <nav className="flex-1 p-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded mb-1 text-sm transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={sair} className="m-3 py-2 text-sm bg-blue-700 hover:bg-blue-600 rounded transition-colors">
        Sair
      </button>
    </aside>
  )
}
