import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Card({ label, valor, cor }) {
  return (
    <div className={`rounded-lg p-5 text-white ${cor}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-4xl font-bold mt-1">{valor}</p>
    </div>
  )
}

export default function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [porSetor, setPorSetor] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/relatorios/resumo').then((r) => setResumo(r.data))
    api.get('/relatorios/por-setor').then((r) => setPorSetor(r.data))
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={() => navigate('/protocolos/novo')}
          className="bg-vinho-700 text-white px-4 py-2 rounded hover:bg-vinho-800 transition-colors"
        >
          + Novo Protocolo
        </button>
      </div>

      {resumo && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card label="Total" valor={resumo.total} cor="bg-gray-600" />
          <Card label="Pendentes" valor={resumo.pendente} cor="bg-yellow-500" />
          <Card label="Em Tramitação" valor={resumo.em_tramitacao} cor="bg-vinho-600" />
          <Card label="Concluídos" valor={resumo.concluido} cor="bg-green-600" />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Protocolos por Setor</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Setor</th>
              <th className="pb-2 text-right">Pendentes</th>
              <th className="pb-2 text-right">Em Tram.</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {porSetor.map((s) => (
              <tr key={s.sigla} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2">{s.setor} <span className="text-gray-400 text-xs">({s.sigla})</span></td>
                <td className="py-2 text-right text-yellow-600">{s.pendente}</td>
                <td className="py-2 text-right text-vinho-600">{s.em_tramitacao}</td>
                <td className="py-2 text-right font-medium">{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
