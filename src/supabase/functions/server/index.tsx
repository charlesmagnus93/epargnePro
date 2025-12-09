import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Middleware pour vérifier l'authentification
const authMiddleware = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('userId', user.id);
  await next();
};

// Routes d'authentification
app.post('/make-server-4d9ca75f/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Error during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Créer les paramètres par défaut
    await kv.set(`user:${data.user.id}:settings`, {
      currency: 'FCFA',
      language: 'fr',
    });

    // Créer les limites de budget par défaut
    await kv.set(`user:${data.user.id}:budget`, {
      daily: 5000,
      weekly: 30000,
      monthly: 100000,
    });

    // Créer la caisse de sécurité par défaut
    await kv.set(`user:${data.user.id}:emergency`, {
      balance: 0,
      goal: 50000,
      transactions: [],
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Routes protégées
app.use('/make-server-4d9ca75f/transactions/*', authMiddleware);
app.use('/make-server-4d9ca75f/budget/*', authMiddleware);
app.use('/make-server-4d9ca75f/emergency/*', authMiddleware);
app.use('/make-server-4d9ca75f/settings/*', authMiddleware);

// Transactions
app.get('/make-server-4d9ca75f/transactions', async (c) => {
  try {
    const userId = c.get('userId');
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    return c.json({ transactions });
  } catch (error) {
    console.log(`Error fetching transactions: ${error}`);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

app.post('/make-server-4d9ca75f/transactions', async (c) => {
  try {
    const userId = c.get('userId');
    const transaction = await c.req.json();

    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    transactions.unshift(newTransaction);
    await kv.set(`user:${userId}:transactions`, transactions);

    return c.json({ transaction: newTransaction });
  } catch (error) {
    console.log(`Error creating transaction: ${error}`);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

app.delete('/make-server-4d9ca75f/transactions/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const transactionId = c.req.param('id');

    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const filteredTransactions = transactions.filter((t: any) => t.id !== transactionId);
    
    await kv.set(`user:${userId}:transactions`, filteredTransactions);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting transaction: ${error}`);
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// Budget
app.get('/make-server-4d9ca75f/budget', async (c) => {
  try {
    const userId = c.get('userId');
    const budget = await kv.get(`user:${userId}:budget`) || {
      daily: 5000,
      weekly: 30000,
      monthly: 100000,
    };
    return c.json({ budget });
  } catch (error) {
    console.log(`Error fetching budget: ${error}`);
    return c.json({ error: 'Failed to fetch budget' }, 500);
  }
});

app.put('/make-server-4d9ca75f/budget', async (c) => {
  try {
    const userId = c.get('userId');
    const budget = await c.req.json();

    await kv.set(`user:${userId}:budget`, budget);

    return c.json({ budget });
  } catch (error) {
    console.log(`Error updating budget: ${error}`);
    return c.json({ error: 'Failed to update budget' }, 500);
  }
});

// Caisse de sécurité
app.get('/make-server-4d9ca75f/emergency', async (c) => {
  try {
    const userId = c.get('userId');
    const emergency = await kv.get(`user:${userId}:emergency`) || {
      balance: 0,
      goal: 50000,
      transactions: [],
    };
    return c.json({ emergency });
  } catch (error) {
    console.log(`Error fetching emergency fund: ${error}`);
    return c.json({ error: 'Failed to fetch emergency fund' }, 500);
  }
});

app.put('/make-server-4d9ca75f/emergency', async (c) => {
  try {
    const userId = c.get('userId');
    const emergency = await c.req.json();

    await kv.set(`user:${userId}:emergency`, emergency);

    return c.json({ emergency });
  } catch (error) {
    console.log(`Error updating emergency fund: ${error}`);
    return c.json({ error: 'Failed to update emergency fund' }, 500);
  }
});

// Paramètres
app.get('/make-server-4d9ca75f/settings', async (c) => {
  try {
    const userId = c.get('userId');
    const settings = await kv.get(`user:${userId}:settings`) || {
      currency: 'FCFA',
      language: 'fr',
    };
    return c.json({ settings });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.put('/make-server-4d9ca75f/settings', async (c) => {
  try {
    const userId = c.get('userId');
    const settings = await c.req.json();

    await kv.set(`user:${userId}:settings`, settings);

    return c.json({ settings });
  } catch (error) {
    console.log(`Error updating settings: ${error}`);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

Deno.serve(app.fetch);
