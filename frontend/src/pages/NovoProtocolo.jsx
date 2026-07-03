import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const hoje = new Date().toISOString().slice(0, 10)

export default function NovoProtocolo() {
  const [form, setForm] = useState({ assunto: '', tipo: 'ENTRADA', remetente: '', descricao: '', setorId: '', setorDestinatarioId: '', dataRemetido: hoje, nomeDestinatario: '', lembreteData: '', lembreteNota: '' })
  const [setores, setSetores] = useState([])
  const [funcionariosDest, setFuncionariosDest] = useState([])
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/setores').then((r) => {
      const ativos = r.data.filter(s => s.ativo)
      setSetores(ativos)
      // Setor responsável padrão: Arquivo Administrativo (usuário pode alterar)
      const padrao = ativos.find(s => s.nome === 'Arquivo Administrativo')
      if (padrao) setForm(f => ({ ...f, setorId: f.setorId || String(padrao.id) }))
    })
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleDestinatario(e) {
    const id = e.target.value
    const setor = setores.find(s => String(s.id) === id)
    setForm(f => ({ ...f, setorDestinatarioId: id, remetente: setor ? `${setor.nome} (${setor.sigla})` : '', nomeDestinatario: '' }))
    if (!id) { setFuncionariosDest([]); return }
    try {
      const { data } = await api.get(`/setores/${id}/funcionarios`)
      setFuncionariosDest(data)
    } catch {
      setFuncionariosDest([])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.post('/protocolos', form)
      navigate(`/protocolos/${data.id}`)
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar protocolo')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">← Voltar</button>
        <h2 className="text-2xl font-bold text-gray-800">Novo Protocolo</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
              <option value="INTERNO">Interno</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor Responsável</label>
            <select name="setorId" value={form.setorId} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" required>
              <option value="">Selecione...</option>
              {setores.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data remetido</label>
            <input type="date" name="dataRemetido" value={form.dataRemetido} onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo documental *</label>
          <select name="assunto" value={form.assunto} onChange={handleChange} required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500">
            <option value="">Selecione...</option>
            <option value="Pasta">Pasta</option>
            <option value="Documento">Documento</option>
            <option value="Caixa">Caixa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destinatário (setor) *</label>
          <select name="setorDestinatarioId" value={form.setorDestinatarioId} onChange={handleDestinatario} required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500">
            <option value="">Selecione o setor...</option>
            {setores.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Destinatário</label>
          <select name="nomeDestinatario" value={form.nomeDestinatario} onChange={handleChange}
            disabled={!form.setorDestinatarioId}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500 disabled:bg-gray-100 disabled:text-gray-400">
            <option value="">
              {!form.setorDestinatarioId ? 'Escolha o setor primeiro' : (funcionariosDest.length ? 'Selecione...' : 'Nenhum funcionário no setor')}
            </option>
            {funcionariosDest.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Observações</label>
          <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
        </div>

        <div className="border border-vinho-100 rounded-lg p-4 bg-vinho-50/40">
          <h3 className="text-sm font-semibold text-vinho-800 mb-3">Lembrete do trâmite</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lembrar em</label>
              <input type="date" name="lembreteData" value={form.lembreteData} onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota do lembrete</label>
            <textarea name="lembreteNota" value={form.lembreteNota} onChange={handleChange} rows={2}
              placeholder="Ex.: cobrar retorno do setor de destino"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500" />
          </div>
        </div>

        {erro && <p className="text-red-600 text-sm">{erro}</p>}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-vinho-700 text-white rounded hover:bg-vinho-800 disabled:opacity-50 transition-colors">
            {loading ? 'Cadastrando...' : 'Cadastrar Protocolo'}
          </button>
        </div>
      </form>
    </div>
  )
}
