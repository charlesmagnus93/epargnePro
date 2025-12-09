import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import * as api from '../utils/api';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          alert(`Erreur de connexion: ${error.message}`);
          setLoading(false);
          return;
        }

        if (data.session) {
          api.setAccessToken(data.session.access_token);
          onAuthSuccess();
        }
      } else {
        // Inscription
        if (!formData.name) {
          alert('Veuillez entrer votre nom');
          setLoading(false);
          return;
        }

        const result = await api.signup(formData.email, formData.password, formData.name);

        if (result.success) {
          // Se connecter automatiquement après l'inscription
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) {
            alert(`Erreur de connexion après inscription: ${error.message}`);
            setLoading(false);
            return;
          }

          if (data.session) {
            api.setAccessToken(data.session.access_token);
            onAuthSuccess();
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💰</div>
          <h1 className="text-indigo-600 mb-2">MonÉpargne Pro</h1>
          <p className="text-gray-600">Gérez vos finances en toute simplicité</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Votre nom"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Chargement...' : isLogin ? 'Connexion' : 'Inscription'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:underline text-sm"
          >
            {isLogin
              ? "Vous n'avez pas de compte? Inscrivez-vous"
              : 'Vous avez déjà un compte? Connectez-vous'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Vos données financières sont stockées de manière sécurisée avec Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
