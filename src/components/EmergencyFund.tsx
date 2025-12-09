import { useState } from 'react';
import { EmergencyFundData, useApp } from '../App';
import { Shield, TrendingUp, TrendingDown, Plus, Minus, AlertCircle } from 'lucide-react';

interface EmergencyFundProps {
  emergencyFund: EmergencyFundData;
  onUpdateEmergencyFund: (fund: EmergencyFundData) => void;
}

export function EmergencyFund({ emergencyFund, onUpdateEmergencyFund }: EmergencyFundProps) {
  const { currency, t } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    reason: '',
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(emergencyFund.goal.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.reason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const amount = parseFloat(formData.amount);

    if (formData.type === 'withdrawal' && amount > emergencyFund.balance) {
      alert('Solde insuffisant dans la caisse de sécurité');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount,
      reason: formData.reason,
      date: new Date().toISOString(),
    };

    const newBalance =
      formData.type === 'deposit'
        ? emergencyFund.balance + amount
        : emergencyFund.balance - amount;

    onUpdateEmergencyFund({
      ...emergencyFund,
      balance: newBalance,
      transactions: [newTransaction, ...emergencyFund.transactions],
    });

    setFormData({ type: 'deposit', amount: '', reason: '' });
    setShowForm(false);
  };

  const handleUpdateGoal = () => {
    const goal = parseFloat(newGoal);
    if (goal > 0) {
      onUpdateEmergencyFund({ ...emergencyFund, goal });
      setEditingGoal(false);
    }
  };

  const percentage = Math.min((emergencyFund.balance / emergencyFund.goal) * 100, 100);
  const remaining = emergencyFund.goal - emergencyFund.balance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Caisse de Sécurité</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Opération
        </button>
      </div>

      {/* Carte principale */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={32} />
          <h3>Votre Protection Financière</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-sm opacity-90 mb-2">{t('currentBalance')}</p>
          <p className="text-white">{emergencyFund.balance.toLocaleString()} {currency}</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-90">Objectif</span>
            {editingGoal ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-32 px-2 py-1 rounded text-gray-900 text-sm"
                />
                <button
                  onClick={handleUpdateGoal}
                  className="bg-white text-emerald-600 px-3 py-1 rounded text-sm hover:bg-emerald-50"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingGoal(true)}
                className="text-sm underline hover:opacity-80"
              >
                {emergencyFund.goal.toLocaleString()} {currency}
              </button>
            )}
          </div>
          <div className="relative w-full h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-white transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm opacity-90 mt-2">
            {percentage.toFixed(1)}% {t('reached')}
            {remaining > 0 && ` • Reste ${remaining.toLocaleString()} ${currency}`}
          </p>
        </div>

        {percentage < 30 && (
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Votre caisse de sécurité est faible. Essayez d'épargner régulièrement pour atteindre votre objectif.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="mb-4">Nouvelle opération</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'deposit' })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'deposit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Plus className="mx-auto mb-1" size={24} />
                Dépôt
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'withdrawal' })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'withdrawal'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Minus className="mx-auto mb-1" size={24} />
                Retrait
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">{t('amount')} ({currency})</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="10000"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                {formData.type === 'deposit' ? 'Raison du dépôt' : 'Raison du retrait'}
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={
                  formData.type === 'deposit'
                    ? 'Ex: Épargne mensuelle'
                    : 'Ex: Urgence médicale'
                }
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historique */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="mb-4">Historique des opérations</h3>
        {emergencyFund.transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune opération enregistrée</p>
        ) : (
          <div className="space-y-3">
            {emergencyFund.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'deposit' ? (
                      <TrendingUp className="text-green-600" size={20} />
                    ) : (
                      <TrendingDown className="text-red-600" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900">{transaction.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <p
                  className={`${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {transaction.amount.toLocaleString()} {currency}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <h3 className="mb-3">💡 Pourquoi une caisse de sécurité?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Protection contre les imprévus (maladie, accident, perte d'emploi)</li>
          <li>✓ Évite de s'endetter en cas d'urgence</li>
          <li>✓ Apporte une tranquillité d'esprit</li>
          <li>✓ Recommandation: Épargner 3 à 6 mois de dépenses</li>
          <li>✓ Commencez petit: Même 500 {currency} par jour font une différence!</li>
        </ul>
      </div>
    </div>
  );
}
