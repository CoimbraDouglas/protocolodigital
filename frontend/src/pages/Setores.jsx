import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Setores() {
  const [setores, setSetores] = useState([])
  const [form, setForm] = useState({ nome: '', sigla: '' })
  const [erro, setErro] = useState('')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const isAdmin = usuario.perfil === 'ADMIN'

  // Modal de funcionários
  const [setorAberto, setSetorAberto] = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [novoFunc, setNovoFunc] = useState({ nome: '', email: '' })
  const [erroFunc, setErroFunc] = useState('')

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

  function abrirSetor(setor) {
    setSetorAberto(setor)
    setNovoFunc({ nome: '', email: '' })
    setErroFunc('')
    carregarFuncionarios(setor.id)
  }

  function carregarFuncionarios(setorId) {
    api.get(`/setores/${setorId}/funcionarios`).then(r => setFuncionarios(r.data))
  }

  function fechar() {
    setSetorAberto(null)
    setFuncionarios([])
  }

  async function adicionarFunc(e) {
    e.preventDefault()
    setErroFunc('')
    try {
      await api.post(`/setores/${setorAberto.id}/funcionarios`, novoFunc)
      setNovoFunc({ nome: '', email: '' })
      carregarFuncionarios(setorAberto.id)
    } catch (err) {
      setErroFunc(err.response?.data?.erro || 'Erro ao adicionar funcionário')
    }
  }

  function alterarFunc(id, campo, valor) {
    setFuncionarios(fs => fs.map(f => f.id === id ? { ...f, [campo]: valor } : f))
  }

  async function salvarFunc(func) {
    setErroFunc('')
    try {
      await api.patch(`/setores/${setorAberto.id}/funcionarios/${func.id}`, { nome: func.nome, email: func.email })
      carregarFuncionarios(setorAberto.id)
    } catch (err) {
      setErroFunc(err.response?.data?.erro || 'Erro ao salvar funcionário')
    }
  }

  async function removerFunc(func) {
    if (!confirm(`Remover o funcionário "${func.nome}"?`)) return
    await api.delete(`/setores/${setorAberto.id}/funcionarios/${func.id}`)
    carregarFuncionarios(setorAberto.id)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Setores</h2>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Novo Setor</h3>
          <div className="flex gap-3">
            <input placeholder="Nome do setor" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
            <input placeholder="Sigla" value={form.sigla} onChange={e => setForm(f => ({ ...f, sigla: e.target.value }))} required
              className="w-28 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" maxLength={10} />
            <button type="submit" className="px-5 py-2 bg-vinho-700 text-white rounded hover:bg-vinho-800 transition-colors">Cadastrar</button>
          </div>
          {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
        </form>
      )}

      <p className="text-sm text-gray-500 mb-2">Clique em um setor para ver os funcionários.</p>
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
              <tr key={s.id} onClick={() => abrirSetor(s)} className="border-t hover:bg-vinho-50 cursor-pointer transition-colors">
                <td className="px-4 py-3">{s.nome}</td>
                <td className="px-4 py-3 font-mono">{s.sigla}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); toggleAtivo(s) }} className="text-xs text-vinho-600 hover:underline">
                      {s.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {setorAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={fechar}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Funcionários · {setorAberto.nome} <span className="font-mono text-gray-500">({setorAberto.sigla})</span>
              </h3>
              <button onClick={fechar} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            <div className="p-6">
              {funcionarios.length === 0 && (
                <p className="text-gray-400 text-sm mb-4">Nenhum funcionário cadastrado neste setor.</p>
              )}

              {funcionarios.length > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-gray-500 px-1">
                    <span>Nome</span><span>E-mail de contato</span><span></span>
                  </div>
                  {funcionarios.map(f => (
                    <div key={f.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      {isAdmin ? (
                        <>
                          <input value={f.nome} onChange={e => alterarFunc(f.id, 'nome', e.target.value)}
                            className="border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
                          <input value={f.email || ''} onChange={e => alterarFunc(f.id, 'email', e.target.value)} placeholder="email@exemplo.com"
                            className="border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
                          <div className="flex gap-1">
                            <button onClick={() => salvarFunc(f)} className="px-2 py-1.5 text-xs bg-vinho-700 text-white rounded hover:bg-vinho-800">Salvar</button>
                            <button onClick={() => removerFunc(f)} className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded">Remover</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="px-1 py-1.5">{f.nome}</span>
                          <span className="px-1 py-1.5 text-gray-600">{f.email || '—'}</span>
                          <span></span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && (
                <form onSubmit={adicionarFunc} className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Adicionar funcionário</h4>
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input placeholder="Nome" value={novoFunc.nome} onChange={e => setNovoFunc(n => ({ ...n, nome: e.target.value }))} required
                      className="border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
                    <input placeholder="E-mail de contato" value={novoFunc.email} onChange={e => setNovoFunc(n => ({ ...n, email: e.target.value }))}
                      className="border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
                    <button type="submit" className="px-4 py-1.5 text-sm bg-vinho-700 text-white rounded hover:bg-vinho-800">Adicionar</button>
                  </div>
                  {erroFunc && <p className="text-red-600 text-sm mt-2">{erroFunc}</p>}
                </form>
              )}

              {!isAdmin && erroFunc && <p className="text-red-600 text-sm">{erroFunc}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
