import { useState } from 'react'
import api from '../services/api'

export default function MinhaConta() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres')
      return
    }
    if (novaSenha !== confirmaSenha) {
      setErro('A confirmação não confere com a nova senha')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/alterar-senha', { senhaAtual, novaSenha })
      setSucesso('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmaSenha('')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao alterar a senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Minha Conta</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-sm text-gray-500">Nome</p>
        <p className="font-medium text-gray-800 mb-3">{usuario.nome}</p>
        <p className="text-sm text-gray-500">E-mail</p>
        <p className="font-medium text-gray-800 mb-3">{usuario.email}</p>
        <p className="text-sm text-gray-500">Perfil</p>
        <p className="font-medium text-gray-800">{usuario.perfil}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alterar senha</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo de 6 caracteres.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vinho-500"
              required
            />
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-vinho-700 text-white py-2 px-4 rounded hover:bg-vinho-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
