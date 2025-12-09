import { useState } from 'react';
import { AppSettings } from '../App';
import { useApp } from '../App';
import { Globe, DollarSign, User, LogOut } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onLogout: () => void;
  userName?: string;
}

const CURRENCIES = [
  { code: 'FCFA', name: 'Franc CFA (FCFA)', symbol: 'FCFA' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
  { code: 'NGN', name: 'Nigerian Naira (₦)', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi (₵)', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand (R)', symbol: 'R' },
  { code: 'MAD', name: 'Moroccan Dirham (MAD)', symbol: 'MAD' },
];

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function Settings({ settings, onUpdateSettings, onLogout, userName }: SettingsProps) {
  const { t } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    alert('Paramètres sauvegardés avec succès!');
  };

  const hasChanges =
    localSettings.currency !== settings.currency || localSettings.language !== settings.language;

  return (
    <div className="space-y-6">
      <h2>{t('settingsTitle')}</h2>

      {/* Compte */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <User className="text-indigo-600" size={24} />
          <h3>{t('account')}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">{t('name')}</p>
              <p className="text-gray-900">{userName || 'Utilisateur'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Grid 2 colonnes pour desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Langue */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-indigo-600" size={24} />
            <h3>{t('language')}</h3>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocalSettings({ ...localSettings, language: lang.code as any })}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                  localSettings.language === lang.code
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-gray-900">{lang.name}</span>
                </div>
                {localSettings.language === lang.code && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Devise */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-indigo-600" size={24} />
            <h3>{t('currency')}</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setLocalSettings({ ...localSettings, currency: currency.code })}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                  localSettings.currency === currency.code
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-gray-900">{currency.name}</span>
                  <span className="text-sm text-gray-500">{currency.symbol}</span>
                </div>
                {localSettings.currency === currency.code && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      {hasChanges && (
        <div className="lg:sticky lg:bottom-6">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      )}

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="mb-3">ℹ️ Information</h3>
        <p className="text-sm text-gray-700">
          {localSettings.language === 'fr'
            ? "Les modifications de langue et de devise s'appliquent immédiatement après la sauvegarde. Vos données financières seront automatiquement converties pour l'affichage."
            : 'Language and currency changes take effect immediately after saving. Your financial data will be automatically converted for display.'}
        </p>
      </div>
    </div>
  );
}
