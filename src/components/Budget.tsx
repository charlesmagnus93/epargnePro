import { useState } from 'react';
import { Transaction, BudgetLimit, useApp } from '../App';
import { AlertTriangle, CheckCircle, Edit2, Save } from 'lucide-react';

interface BudgetProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit;
  onUpdateBudget: (limits: BudgetLimit) => void;
}

export function Budget({ transactions, budgetLimits, onUpdateBudget }: BudgetProps) {
  const { currency, t } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editLimits, setEditLimits] = useState(budgetLimits);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculer les dépenses journalières
  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculer les dépenses hebdomadaires (7 derniers jours)
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekExpenses = transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const tDate = new Date(t.date);
      return tDate >= weekAgo && tDate <= today;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculer les dépenses mensuelles
  const monthExpenses = transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSave = () => {
    onUpdateBudget(editLimits);
    setIsEditing(false);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage > 100) return { color: 'red', status: 'Dépassé', icon: AlertTriangle };
    if (percentage > 80) return { color: 'yellow', status: 'Attention', icon: AlertTriangle };
    return { color: 'green', status: 'Bon', icon: CheckCircle };
  };

  const renderBudgetCard = (
    title: string,
    spent: number,
    limit: number,
    period: 'daily' | 'weekly' | 'monthly'
  ) => {
    const percentage = Math.min((spent / limit) * 100, 100);
    const status = getBudgetStatus(spent, limit);
    const StatusIcon = status.icon;

    return (
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3>{title}</h3>
          <StatusIcon
            className={`${
              status.color === 'red'
                ? 'text-red-500'
                : status.color === 'yellow'
                ? 'text-yellow-500'
                : 'text-green-500'
            }`}
            size={24}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600">{t('spent')}</p>
              <p className="text-red-600">{spent.toLocaleString()} {currency}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Budget</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editLimits[period]}
                  onChange={(e) =>
                    setEditLimits({ ...editLimits, [period]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-32 px-2 py-1 border border-indigo-300 rounded text-right focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{limit.toLocaleString()} {currency}</p>
              )}
            </div>
          </div>

          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all ${
                status.color === 'red'
                  ? 'bg-red-500'
                  : status.color === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{percentage.toFixed(1)}% utilisé</span>
            <span
              className={`${
                spent > limit
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {spent > limit ? t('exceeded') : t('remaining')}: {Math.abs(limit - spent).toLocaleString()} {currency}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Analyse des dépenses par catégorie ce mois-ci
  const categoryExpenses: { [key: string]: number } = {};
  transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()
      );
    })
    .forEach((t) => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Gestion du Budget</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Edit2 size={18} />
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Save size={18} />
              Sauvegarder
            </button>
            <button
              onClick={() => {
                setEditLimits(budgetLimits);
                setIsEditing(false);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Cartes de budget - Grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {renderBudgetCard('Budget Journalier', todayExpenses, budgetLimits.daily, 'daily')}
        {renderBudgetCard('Budget Hebdomadaire', weekExpenses, budgetLimits.weekly, 'weekly')}
        {renderBudgetCard('Budget Mensuel', monthExpenses, budgetLimits.monthly, 'monthly')}
      </div>

      {/* Alertes */}
      {(todayExpenses > budgetLimits.daily ||
        weekExpenses > budgetLimits.weekly ||
        monthExpenses > budgetLimits.monthly) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-red-900 mb-2">⚠️ Alertes Budget</h3>
              <ul className="space-y-1 text-sm text-red-700">
                {todayExpenses > budgetLimits.daily && (
                  <li>
                    • Vous avez dépassé votre budget journalier de{' '}
                    {(todayExpenses - budgetLimits.daily).toLocaleString()} {currency}
                  </li>
                )}
                {weekExpenses > budgetLimits.weekly && (
                  <li>
                    • Vous avez dépassé votre budget hebdomadaire de{' '}
                    {(weekExpenses - budgetLimits.weekly).toLocaleString()} {currency}
                  </li>
                )}
                {monthExpenses > budgetLimits.monthly && (
                  <li>
                    • Vous avez dépassé votre budget mensuel de{' '}
                    {(monthExpenses - budgetLimits.monthly).toLocaleString()} {currency}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Dépenses par catégorie */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="mb-4">Dépenses par catégorie ce mois-ci</h3>
        {sortedCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune dépense ce mois-ci</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([category, amount]) => {
              const percentage = (amount / monthExpenses) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">{category}</span>
                    <span className="text-gray-900">
                      {amount.toLocaleString()} {currency} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-indigo-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="mb-3">💡 Conseils pour respecter votre budget</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Planifiez vos dépenses à l'avance</li>
          <li>✓ Évitez les achats impulsifs</li>
          <li>✓ Comparez les prix avant d'acheter</li>
          <li>✓ Cuisinez à la maison plutôt que manger à l'extérieur</li>
          <li>✓ Utilisez les transports en commun quand possible</li>
          <li>✓ Mettez de côté 10-15% de vos revenus dans la caisse de sécurité</li>
        </ul>
      </div>
    </div>
  );
}
