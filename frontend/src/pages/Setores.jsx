import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Setores() {
  const [setores, setSetores] = useState([])
  const [form, setForm] = useState({ nome: '', sigla: '' })
  const [erro, setErro] = useState('')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const isAdmin = usuario.perfil === 'ADMIN'

  function carregar() {
    api.get('/setores').then(r => setSetores(r.data))
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/setores', form)
      setForm({ nome: '', sigla: '' })
      carregar()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar')
    }
  }

  async function toggleAtivo(setor) {
    await api.patch(`/setores/${setor.id}`, { nome: setor.nome, sigla: setor.sigla, ativo: !setor.ativo })
    carregar()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Setores</h2>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Novo Setor</h3>
          <div className="flex gap-3">
            <input placeholder="Nome do setor" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Sigla" value={form.sigla} onChange={e => setForm(f => ({ ...f, sigla: e.target.value }))} required
              className="w-28 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={10} />
            <button type="submit" className="px-5 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors">Cadastrar</button>
          </div>
          {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Sigla</th>
              <th className="text-left px-4 py-3">Situação</th>
              {isAdmin && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {setores.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{s.nome}</td>
                <td className="px-4 py-3 font-mono">{s.sigla}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleAtivo(s)} className="text-xs text-blue-600 hover:underline">
                      {s.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
