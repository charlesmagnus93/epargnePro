import { useState, useEffect, createContext, useContext } from 'react';
import { Home, TrendingUp, Calendar, PiggyBank, Settings as SettingsIcon, Wallet } from 'lucide-react';
import { createClient } from './utils/supabase/client';
import * as api from './utils/api';
import { translations, Language, TranslationKey, getTranslation } from './utils/translations';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Budget } from './components/Budget';
import { EmergencyFund } from './components/EmergencyFund';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  time: string;
}

export interface BudgetLimit {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface EmergencyFundData {
  balance: number;
  goal: number;
  transactions: Array<{
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    reason: string;
    date: string;
  }>;
}

export interface AppSettings {
  currency: string;
  language: Language;
}

interface AppContextType {
  currency: string;
  language: Language;
  t: (key: TranslationKey) => string;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType>({
  currency: 'FCFA',
  language: 'fr',
  t: (key) => key,
  updateSettings: () => {},
});

export const useApp = () => useContext(AppContext);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit>({
    daily: 5000,
    weekly: 30000,
    monthly: 100000,
  });
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFundData>({
    balance: 0,
    goal: 50000,
    transactions: [],
  });
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'FCFA',
    language: 'fr',
  });

  const supabase = createClient();

  // Vérifier la session au chargement
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        api.setAccessToken(session.access_token);
        loadUserData();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        api.setAccessToken(session.access_token);
        loadUserData();
      } else {
        setUser(null);
        api.setAccessToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async () => {
    try {
      const [transactionsRes, budgetRes, emergencyRes, settingsRes] = await Promise.all([
        api.getTransactions(),
        api.getBudget(),
        api.getEmergencyFund(),
        api.getSettings(),
      ]);

      setTransactions(transactionsRes.transactions || []);
      setBudgetLimits(budgetRes.budget);
      setEmergencyFund(emergencyRes.emergency);
      setSettings(settingsRes.settings);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const result = await api.createTransaction(transaction);
      setTransactions([result.transaction, ...transactions]);

      // Vérifier le budget journalier
      checkDailyBudget(transaction.date, result.transaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Erreur lors de l\'ajout de la transaction');
    }
  };

  const checkDailyBudget = (date: string, newTransaction: Transaction) => {
    if (newTransaction.type !== 'expense') return;

    const dayTransactions = transactions.filter(
      (t) => t.type === 'expense' && t.date === date
    );
    const dailyExpenses = dayTransactions.reduce((sum, t) => sum + t.amount, 0) + newTransaction.amount;

    if (dailyExpenses > budgetLimits.daily) {
      alert(
        `⚠️ ${t('budgetExceeded')} ${dailyExpenses - budgetLimits.daily} ${settings.currency}!`
      );
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const updateBudget = async (budget: BudgetLimit) => {
    try {
      await api.updateBudget(budget);
      setBudgetLimits(budget);
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Erreur lors de la mise à jour du budget');
    }
  };

  const updateEmergencyFund = async (fund: EmergencyFundData) => {
    try {
      await api.updateEmergencyFund(fund);
      setEmergencyFund(fund);
    } catch (error) {
      console.error('Error updating emergency fund:', error);
      alert('Erreur lors de la mise à jour de la caisse de sécurité');
    }
  };

  const updateAppSettings = async (newSettings: AppSettings) => {
    try {
      await api.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Erreur lors de la mise à jour des paramètres');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    setBudgetLimits({ daily: 5000, weekly: 30000, monthly: 100000 });
    setEmergencyFund({ balance: 0, goal: 50000, transactions: [] });
    setSettings({ currency: 'FCFA', language: 'fr' });
  };

  const t = (key: TranslationKey) => getTranslation(settings.language, key);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            budgetLimits={budgetLimits}
            emergencyFund={emergencyFund}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case 'budget':
        return (
          <Budget
            transactions={transactions}
            budgetLimits={budgetLimits}
            onUpdateBudget={updateBudget}
          />
        );
      case 'emergency':
        return (
          <EmergencyFund emergencyFund={emergencyFund} onUpdateEmergencyFund={updateEmergencyFund} />
        );
      case 'analytics':
        return <Analytics transactions={transactions} budgetLimits={budgetLimits} />;
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={updateAppSettings}
            onLogout={handleLogout}
            userName={user?.user_metadata?.name || user?.email}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => loadUserData()} />;
  }

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('home') },
    { id: 'transactions', icon: Calendar, label: t('operations') },
    { id: 'budget', icon: TrendingUp, label: t('budget') },
    { id: 'emergency', icon: PiggyBank, label: t('emergency') },
    { id: 'analytics', icon: TrendingUp, label: t('analytics') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <AppContext.Provider
      value={{
        currency: settings.currency,
        language: settings.language,
        t,
        updateSettings: updateAppSettings,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
              <div>
                <h1 className="text-indigo-600 flex items-center gap-2">
                  <Wallet className="w-8 h-8" />
                  <span>{t('appTitle')}</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">{t('appSubtitle')}</p>
              </div>
            </div>
            {/* <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
              <div>
                <h1 className="text-indigo-600">💰 {t('appTitle')}</h1>
                <p className="text-sm text-gray-600 mt-1">{t('appSubtitle')}</p>
              </div>
            </div> */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={22} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-gray-900">
                    {user?.user_metadata?.name || user?.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-4 py-4">
              <h1 className="text-indigo-600 flex items-center gap-2">
                <Wallet className="w-8 h-8" />
                <span>{t('appTitle')}</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">{t('appSubtitle')}</p>
              {/* <h1 className="text-indigo-600">💰 {t('appTitle')}</h1>
              <p className="text-gray-600 mt-1 text-sm">{t('appSubtitle')}</p> */}
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900">
                  {navItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-600">{t('currency')}</p>
                  <p className="text-indigo-900">{settings.currency}</p>
                </div>
                <div className="px-4 py-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">{t('language')}</p>
                  <p className="text-green-900">{settings.language.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600'
              }`}
            >
              <SettingsIcon size={22} />
              <span className="text-xs">{t('settings')}</span>
            </button>
          </div>
        </nav>
      </div>
    </AppContext.Provider>
  );
}
