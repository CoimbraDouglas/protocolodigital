import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

const STATUS_CORES = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  EM_TRAMITACAO: 'bg-vinho-100 text-vinho-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  ARQUIVADO: 'bg-gray-100 text-gray-600',
}
const STATUS_LABELS = { PENDENTE: 'Pendente', EM_TRAMITACAO: 'Em Tramitação', CONCLUIDO: 'Concluído', ARQUIVADO: 'Arquivado' }

export default function DetalheProtocolo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [protocolo, setProtocolo] = useState(null)
  const [setores, setSetores] = useState([])
  const [tramForm, setTramForm] = useState({ setorDestinoId: '', observacao: '' })
  const [statusForm, setStatusForm] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/protocolos/${id}`).then((r) => { setProtocolo(r.data); setStatusForm(r.data.status) })
    api.get('/setores').then((r) => setSetores(r.data.filter(s => s.ativo)))
  }, [id])

  async function handleTramitar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await api.post('/tramitacoes', { protocoloId: id, ...tramForm })
      const { data } = await api.get(`/protocolos/${id}`)
      setProtocolo(data)
      setStatusForm(data.status)
      setTramForm({ setorDestinoId: '', observacao: '' })
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao tramitar')
    } finally {
      setLoading(false)
    }
  }

  async function handleAtualizarStatus() {
    try {
      await api.patch(`/protocolos/${id}`, { status: statusForm })
      const { data } = await api.get(`/protocolos/${id}`)
      setProtocolo(data)
    } catch {
      setErro('Erro ao atualizar status')
    }
  }

  if (!protocolo) return <div className="text-center py-12 text-gray-400">Carregando...</div>

  const encerrado = protocolo.status === 'CONCLUIDO' || protocolo.status === 'ARQUIVADO'

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">← Voltar</button>
        <h2 className="text-2xl font-bold text-gray-800">Protocolo {protocolo.numero}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CORES[protocolo.status]}`}>
          {STATUS_LABELS[protocolo.status]}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Tipo documental</dt><dd className="font-medium">{protocolo.assunto}</dd></div>
          <div><dt className="text-gray-500">Tipo</dt><dd>{protocolo.tipo}</dd></div>
          <div><dt className="text-gray-500">Destinatário</dt><dd>{protocolo.remetente}</dd></div>
          <div><dt className="text-gray-500">Setor do Destinatário</dt><dd>{protocolo.setorDestinatario ? `${protocolo.setorDestinatario.nome} (${protocolo.setorDestinatario.sigla})` : '—'}</dd></div>
          <div><dt className="text-gray-500">Setor Atual</dt><dd>{protocolo.setor?.nome} ({protocolo.setor?.sigla})</dd></div>
          <div><dt className="text-gray-500">Cadastrado por</dt><dd>{protocolo.usuario?.nome}</dd></div>
          <div><dt className="text-gray-500">Data de Entrada</dt><dd>{new Date(protocolo.dataEntrada).toLocaleString('pt-BR')}</dd></div>
          {protocolo.descricao && <div className="col-span-2"><dt className="text-gray-500">Descrição</dt><dd>{protocolo.descricao}</dd></div>}
        </dl>

        <div className="mt-4 pt-4 border-t flex gap-3 items-center">
          <select value={statusForm} onChange={e => setStatusForm(e.target.value)} className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-vinho-500">
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={handleAtualizarStatus} className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors">
            Atualizar Status
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-4">Linha do Tempo de Tramitações</h3>
        {protocolo.tramitacoes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma tramitação registrada.</p>
        ) : (
          <ol className="relative border-l border-gray-200 ml-3">
            {protocolo.tramitacoes.map((t) => (
              <li key={t.id} className="mb-5 ml-5">
                <span className="absolute -left-2 w-4 h-4 rounded-full bg-vinho-600 border-2 border-white" />
                <p className="text-sm font-medium">
                  {t.setorOrigem.sigla} → {t.setorDestino.sigla}
                </p>
                <p className="text-xs text-gray-500">{new Date(t.dataHora).toLocaleString('pt-BR')} · {t.usuario.nome}</p>
                {t.observacao && <p className="text-sm text-gray-600 mt-1">{t.observacao}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>

      {!encerrado && (
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Tramitar Protocolo</h3>
          <form onSubmit={handleTramitar} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor de Destino</label>
              <select
                value={tramForm.setorDestinoId}
                onChange={e => setTramForm(f => ({ ...f, setorDestinoId: e.target.value }))}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
              >
                <option value="">Selecione o setor...</option>
                {setores.filter(s => s.id !== protocolo.setorId).map(s => (
                  <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
              <textarea
                value={tramForm.observacao}
                onChange={e => setTramForm(f => ({ ...f, observacao: e.target.value }))}
                rows={2}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
              />
            </div>
            {erro && <p className="text-red-600 text-sm">{erro}</p>}
            <button type="submit" disabled={loading} className="px-5 py-2 bg-vinho-700 text-white rounded hover:bg-vinho-800 disabled:opacity-50 transition-colors">
              {loading ? 'Tramitando...' : 'Tramitar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
