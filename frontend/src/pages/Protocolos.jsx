import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const STATUS_CORES = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  EM_TRAMITACAO: 'bg-vinho-100 text-vinho-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  ARQUIVADO: 'bg-gray-100 text-gray-600',
}
const STATUS_LABELS = { PENDENTE: 'Pendente', EM_TRAMITACAO: 'Em Tramitação', CONCLUIDO: 'Concluído', ARQUIVADO: 'Arquivado' }
const TIPO_LABELS = { ENTRADA: 'Entrada', SAIDA: 'Saída', INTERNO: 'Interno' }

export default function Protocolos() {
  const [dados, setDados] = useState({ protocolos: [], total: 0 })
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [pagina, setPagina] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams({ pagina })
    if (busca) params.set('busca', busca)
    if (status) params.set('status', status)
    api.get(`/protocolos?${params}`).then((r) => setDados(r.data))
  }, [busca, status, pagina])

  function handleBusca(e) {
    setBusca(e.target.value)
    setPagina(1)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Protocolos</h2>
        <button
          onClick={() => navigate('/protocolos/novo')}
          className="bg-vinho-700 text-white px-4 py-2 rounded hover:bg-vinho-800 transition-colors"
        >
          + Novo Protocolo
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="Buscar por número, assunto ou remetente..."
          value={busca}
          onChange={handleBusca}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPagina(1) }}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Número</th>
              <th className="text-left px-4 py-3">Assunto</th>
              <th className="text-left px-4 py-3">Remetente</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Setor Atual</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {dados.protocolos.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/protocolos/${p.id}`)}
                className="border-t hover:bg-vinho-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono font-medium text-vinho-700">{p.numero}</td>
                <td className="px-4 py-3">{p.assunto}</td>
                <td className="px-4 py-3">{p.remetente}</td>
                <td className="px-4 py-3">{TIPO_LABELS[p.tipo]}</td>
                <td className="px-4 py-3">{p.setor?.sigla}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CORES[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.dataEntrada).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {dados.protocolos.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nenhum protocolo encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>{dados.total} registro(s)</span>
        <div className="flex gap-2">
          <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">
            Anterior
          </button>
          <span className="px-3 py-1">Página {pagina} de {dados.paginas || 1}</span>
          <button disabled={pagina >= (dados.paginas || 1)} onClick={() => setPagina(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}
