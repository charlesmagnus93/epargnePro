import { Transaction, BudgetLimit, EmergencyFundData, useApp } from '../App';
import { TrendingUp, TrendingDown, AlertCircle, Shield } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit;
  emergencyFund: EmergencyFundData;
}

export function Dashboard({ transactions, budgetLimits, emergencyFund }: DashboardProps) {
  const { currency, t } = useApp();
  const today = new Date().toISOString().split('T')[0];
  
  // Calculs pour aujourd'hui
  const todayTransactions = transactions.filter((t) => t.date === today);
  const todayIncome = todayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpenses = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculs pour le mois
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthTransactions = transactions.filter((t) => {
    const transDate = new Date(t.date);
    return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
  });
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = monthIncome - monthExpenses;
  const budgetRemaining = budgetLimits.daily - todayExpenses;
  const budgetPercentage = (todayExpenses / budgetLimits.daily) * 100;

  // Recommandations intelligentes
  const getRecommendations = () => {
    const recommendations = [];
    
    if (todayExpenses > budgetLimits.daily) {
      recommendations.push({
        type: 'warning',
        message: 'Vous avez dépassé votre budget journalier. Essayez de limiter les dépenses non essentielles.',
      });
    }
    
    if (emergencyFund.balance < emergencyFund.goal * 0.3) {
      recommendations.push({
        type: 'info',
        message: `Votre caisse de sécurité est à ${Math.round((emergencyFund.balance / emergencyFund.goal) * 100)}%. Essayez d'épargner régulièrement.`,
      });
    }
    
    if (balance > budgetLimits.monthly * 0.2) {
      recommendations.push({
        type: 'success',
        message: 'Excellent! Vous avez un bon excédent ce mois-ci. Pensez à alimenter votre caisse de sécurité.',
      });
    }
    
    if (monthExpenses > monthIncome) {
      recommendations.push({
        type: 'warning',
        message: 'Attention: Vos dépenses dépassent vos revenus ce mois-ci.',
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Carte de bienvenue */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
        <h2>{t('hello')} 👋</h2>
        <p className="mt-2 opacity-90">{t('financialOverview')}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">{t('monthBalance')}</p>
            <p className={`mt-1 ${balance >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {balance.toLocaleString()} {currency}
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">{t('securityFund')}</p>
            <p className="mt-1">{emergencyFund.balance.toLocaleString()} {currency}</p>
          </div>
        </div>
      </div>

      {/* Statistiques d'aujourd'hui */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">{t('todayIncome')}</p>
              <p className="text-green-600 mt-1">{todayIncome.toLocaleString()} {currency}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">{t('todayExpenses')}</p>
              <p className="text-red-600 mt-1">{todayExpenses.toLocaleString()} {currency}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">{t('monthBalance')}</p>
              <p className={`mt-1 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balance.toLocaleString()} {currency}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={balance >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">{t('securityFund')}</p>
              <p className="text-indigo-600 mt-1">{emergencyFund.balance.toLocaleString()} {currency}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Shield className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Budget journalier */}
      <div className="bg-white rounded-xl p-6 lg:p-8 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3>{t('dailyBudget')}</h3>
          <span className={`text-sm ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {budgetRemaining >= 0 ? t('remaining') : t('exceeded')}: {Math.abs(budgetRemaining).toLocaleString()} {currency}
          </span>
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full transition-all ${
              budgetPercentage > 100 ? 'bg-red-500' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {budgetPercentage.toFixed(1)}% {t('used')} {t('on')} {budgetLimits.daily.toLocaleString()} {currency}
        </p>
      </div>

      {/* Layout 2 colonnes pour desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommandations personnalisées */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 lg:col-span-2">
          <h3 className="mb-4">📊 {t('personalizedRecommendations')}</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`flex gap-3 p-4 rounded-lg ${
                  rec.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : rec.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {rec.type === 'warning' ? (
                  <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                ) : rec.type === 'success' ? (
                  <TrendingUp className="text-green-600 flex-shrink-0" size={20} />
                ) : (
                  <Shield className="text-blue-600 flex-shrink-0" size={20} />
                )}
                <p className="text-sm text-gray-700">{rec.message}</p>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Transactions récentes */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 lg:col-span-2">
          <h3 className="mb-4">{t('recentTransactions')}</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noTransactions')}</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <p
                    className={`${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toLocaleString()} {currency}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
