import { useEffect, useState } from 'react'
import api from '../services/api'

const PERFIL_CORES = { ADMIN: 'bg-red-100 text-red-800', OPERADOR: 'bg-blue-100 text-blue-800', VISUALIZADOR: 'bg-gray-100 text-gray-600' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [setores, setSetores] = useState([])
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'OPERADOR', setorId: '' })
  const [erro, setErro] = useState('')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const isAdmin = usuario.perfil === 'ADMIN'

  function carregar() {
    api.get('/usuarios').then(r => setUsuarios(r.data))
  }

  useEffect(() => {
    carregar()
    api.get('/setores').then(r => setSetores(r.data.filter(s => s.ativo)))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/usuarios', form)
      setForm({ nome: '', email: '', senha: '', perfil: 'OPERADOR', setorId: '' })
      carregar()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar')
    }
  }

  async function toggleAtivo(u) {
    await api.patch(`/usuarios/${u.id}`, { ativo: !u.ativo })
    carregar()
  }

  if (!isAdmin) return <div className="text-center py-12 text-gray-400">Acesso restrito ao administrador.</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuários</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Novo Usuário</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Senha" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="OPERADOR">Operador</option>
            <option value="VISUALIZADOR">Visualizador</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <select value={form.setorId} onChange={e => setForm(f => ({ ...f, setorId: e.target.value }))}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Setor (opcional)</option>
            {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <button type="submit" className="px-5 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors">Cadastrar</button>
        </div>
        {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">E-mail</th>
              <th className="text-left px-4 py-3">Perfil</th>
              <th className="text-left px-4 py-3">Setor</th>
              <th className="text-left px-4 py-3">Situação</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{u.nome}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PERFIL_CORES[u.perfil]}`}>{u.perfil}</span>
                </td>
                <td className="px-4 py-3">{u.setor?.sigla || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleAtivo(u)} className="text-xs text-blue-600 hover:underline">
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
