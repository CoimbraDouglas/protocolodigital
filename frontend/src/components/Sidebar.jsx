import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/protocolos', label: 'Protocolos' },
  { to: '/setores', label: 'Setores' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/minha-conta', label: 'Minha Conta' },
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
    <aside className="w-60 bg-vinho-800 text-white flex flex-col shadow-xl">
      <div className="bg-white px-4 py-4 flex justify-center">
        <img src="/logo.png" alt="Província Santa Cruz" className="h-14 object-contain" />
      </div>
      <div className="p-4 border-b border-vinho-700">
        <h1 className="font-bold text-lg leading-tight">Protocolo Digital</h1>
        <p className="text-xs text-vinho-300 mt-2">{usuario.nome}</p>
        <span className="inline-block mt-1 text-xs bg-vinho-600 px-2 py-0.5 rounded">{usuario.perfil}</span>
      </div>
      <nav className="flex-1 p-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors ${isActive ? 'bg-vinho-600 shadow-sm' : 'text-vinho-100 hover:bg-vinho-700'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={sair} className="m-3 py-2 text-sm font-medium bg-vinho-700 hover:bg-vinho-600 rounded-md transition-colors">
        Sair
      </button>
    </aside>
  )
}
