import { Transaction, BudgetLimit, useApp } from '../App';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
  budgetLimits: BudgetLimit;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function Analytics({ transactions, budgetLimits }: AnalyticsProps) {
  const { currency, t } = useApp();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Données par catégorie
  const categoryData: { [key: string]: { income: number; expense: number } } = {};
  transactions.forEach((t) => {
    if (!categoryData[t.category]) {
      categoryData[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categoryData[t.category].income += t.amount;
    } else {
      categoryData[t.category].expense += t.amount;
    }
  });

  const categoryChartData = Object.entries(categoryData).map(([name, data]) => ({
    name,
    Revenus: data.income,
    Dépenses: data.expense,
  }));

  // Données pour le pie chart (dépenses par catégorie)
  const expensesByCategory = Object.entries(categoryData)
    .filter(([_, data]) => data.expense > 0)
    .map(([name, data]) => ({
      name,
      value: data.expense,
    }));

  // Données des 30 derniers jours
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last30Days.map((date) => {
    const dayTransactions = transactions.filter((t) => t.date === date);
    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      Revenus: income,
      Dépenses: expenses,
      Solde: income - expenses,
    };
  });

  // Statistiques globales
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Statistiques du mois en cours
  const monthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Moyenne journalière
  const avgDailyIncome = transactions.length > 0 ? totalIncome / last30Days.length : 0;
  const avgDailyExpense = transactions.length > 0 ? totalExpenses / last30Days.length : 0;

  // Recommandations intelligentes basées sur les données
  const getSmartRecommendations = () => {
    const recommendations = [];

    // Analyse des tendances
    if (monthExpenses > monthIncome) {
      recommendations.push({
        title: 'Attention au déficit',
        message: `Vos dépenses (${monthExpenses.toLocaleString()} ${currency}) dépassent vos revenus (${monthIncome.toLocaleString()} ${currency}) ce mois-ci. Identifiez les dépenses non essentielles.`,
        type: 'warning',
      });
    }

    // Analyse par catégorie
    const topExpenseCategory = expensesByCategory.reduce(
      (max, cat) => (cat.value > max.value ? cat : max),
      { name: '', value: 0 }
    );
    if (topExpenseCategory.value > 0) {
      const percentage = (topExpenseCategory.value / totalExpenses) * 100;
      if (percentage > 40) {
        recommendations.push({
          title: `Dépenses élevées en ${topExpenseCategory.name}`,
          message: `${percentage.toFixed(1)}% de vos dépenses vont vers ${topExpenseCategory.name}. Explorez des alternatives pour réduire ces coûts.`,
          type: 'info',
        });
      }
    }

    // Comparaison budget
    if (avgDailyExpense > budgetLimits.daily) {
      recommendations.push({
        title: 'Budget journalier à ajuster',
        message: `Votre moyenne de dépenses journalières (${avgDailyExpense.toLocaleString()} ${currency}) dépasse votre budget (${budgetLimits.daily.toLocaleString()} ${currency}).`,
        type: 'warning',
      });
    }

    // Recommandation d'épargne
    if (totalBalance > 0 && totalBalance > budgetLimits.monthly * 0.15) {
      recommendations.push({
        title: 'Opportunité d\'épargne',
        message: `Vous avez un excédent de ${totalBalance.toLocaleString()} ${currency}. Pensez à alimenter votre caisse de sécurité!`,
        type: 'success',
      });
    }

    return recommendations;
  };

  const recommendations = getSmartRecommendations();

  return (
    <div className="space-y-6">
      <h2>Analyses et Feedback</h2>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalIncome')}</p>
              <p className="text-green-600 mt-1">{totalIncome.toLocaleString()} {currency}</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalExpenses')}</p>
              <p className="text-red-600 mt-1">{totalExpenses.toLocaleString()} {currency}</p>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalBalance')}</p>
              <p className={`mt-1 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance.toLocaleString()} {currency}
              </p>
            </div>
            <DollarSign className={totalBalance >= 0 ? 'text-green-500' : 'text-red-500'} size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-indigo-600 mt-1">{transactions.length}</p>
            </div>
            <Calendar className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>

      {/* Layout responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommandations intelligentes */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 lg:col-span-3">
          <h3 className="mb-4">🤖 Analyse Intelligente</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  rec.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : rec.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className="text-gray-900 mb-1">{rec.title}</p>
                <p className="text-sm text-gray-700">{rec.message}</p>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Graphique des 30 derniers jours */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 lg:col-span-3">
        <h3 className="mb-4">Évolution sur 30 jours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Revenus" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Dépenses" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        </div>

        {/* Graphiques côte à côte - Maintenant dans la grid principale */}
        {/* Revenus vs Dépenses par catégorie */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="mb-4">Par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Revenus" fill="#10b981" />
              <Bar dataKey="Dépenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition des dépenses */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="mb-4">Répartition des dépenses</h3>
          {expensesByCategory.length === 0 ? (
            <p className="text-gray-500 text-center py-20">Aucune dépense enregistrée</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Moyennes */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="mb-4">Moyennes journalières (30 derniers jours)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-700">{t('averageIncome')}</p>
            <p className="text-green-600 mt-1">{avgDailyIncome.toLocaleString()} {currency}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-gray-700">{t('averageExpenses')}</p>
            <p className="text-red-600 mt-1">{avgDailyExpense.toLocaleString()} {currency}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-700">{t('potentialSavings')}</p>
            <p className={`mt-1 ${avgDailyIncome - avgDailyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(avgDailyIncome - avgDailyExpense).toLocaleString()} {currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
