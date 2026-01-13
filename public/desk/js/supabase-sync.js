// =====================================================
// Supabase Sync Layer for Trading Desk
// Replaces localStorage with API calls to Supabase
// =====================================================

const SupabaseSync = {
  // Cache for loaded data
  _cache: {
    trades: null,
    accounts: null,
    symbols: null,
    settings: null,
  },

  // =====================================================
  // TRADES / JOURNAL
  // =====================================================
  
  async loadTrades() {
    try {
      const res = await fetch('/api/trades');
      if (!res.ok) {
        if (res.status === 401) {
          console.warn('Not authenticated, redirecting to sign-in');
          window.top.location.href = '/sign-in';
          return [];
        }
        throw new Error('Failed to load trades');
      }
      const trades = await res.json();
      // Transform from DB format to frontend format
      this._cache.trades = trades.map(t => ({
        id: t.id,
        supabaseId: t.id, // Mark as synced
        instrument: t.symbol,
        direction: t.direction,
        plan: {
          entry: t.entry_price,
          tp: t.exit_price,
          sl: 0,
          size: t.quantity,
        },
        pnl: t.pnl,
        fees: t.fees,
        notes: t.notes,
        tags: t.tags || [],
        date: t.trade_date,
        timestamp: t.trade_date ? `${t.trade_date}T00:00:00.000Z` : null,
        time: t.trade_date ? new Date(t.trade_date).toLocaleString() : '',
        accountId: t.account_id,
        accountName: t.accounts?.name,
        screenshot: t.screenshot_url,
        result: t.pnl > 0 ? 'win' : t.pnl < 0 ? 'loss' : 'breakeven',
      }));
      return this._cache.trades;
    } catch (e) {
      console.error('Failed to load trades from Supabase:', e);
      return [];
    }
  },

  async saveTrade(trade) {
    try {
      // Map frontend trade format to API format
      const tradeDate = trade.timestamp 
        ? trade.timestamp.slice(0, 10) 
        : trade.date || new Date().toISOString().slice(0, 10);
      
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: trade.instrument || trade.symbol || 'UNKNOWN',
          direction: trade.direction || 'long',
          entry_price: trade.plan?.entry || trade.entryPrice || 0,
          exit_price: trade.plan?.tp || trade.exitPrice || 0,
          quantity: trade.plan?.size || trade.size || trade.quantity || 1,
          pnl: trade.pnl || 0,
          fees: trade.fees || 0,
          notes: trade.notes || '',
          tags: trade.tags || [],
          trade_date: tradeDate,
          account_id: trade.accountId || null,
          screenshot_url: trade.screenshotUrl || trade.screenshot || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save trade');
      const saved = await res.json();
      // Invalidate cache
      this._cache.trades = null;
      return saved;
    } catch (e) {
      console.error('Failed to save trade to Supabase:', e);
      return null;
    }
  },

  async updateTrade(id, trade) {
    try {
      const tradeDate = trade.timestamp 
        ? trade.timestamp.slice(0, 10) 
        : trade.date || new Date().toISOString().slice(0, 10);

      const res = await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: trade.instrument || trade.symbol || 'UNKNOWN',
          direction: trade.direction || 'long',
          entry_price: trade.plan?.entry || trade.entryPrice || 0,
          exit_price: trade.plan?.tp || trade.exitPrice || 0,
          quantity: trade.plan?.size || trade.size || trade.quantity || 1,
          pnl: trade.pnl || 0,
          fees: trade.fees || 0,
          notes: trade.notes || '',
          tags: trade.tags || [],
          trade_date: tradeDate,
          account_id: trade.accountId || null,
          screenshot_url: trade.screenshotUrl || trade.screenshot || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update trade');
      this._cache.trades = null;
      return await res.json();
    } catch (e) {
      console.error('Failed to update trade in Supabase:', e);
      return null;
    }
  },

  async deleteTrade(id) {
    try {
      const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete trade');
      this._cache.trades = null;
      return true;
    } catch (e) {
      console.error('Failed to delete trade from Supabase:', e);
      return false;
    }
  },

  // =====================================================
  // ACCOUNTS
  // =====================================================

  async loadAccounts() {
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) {
        if (res.status === 401) {
          console.warn('Not authenticated, redirecting to sign-in');
          window.top.location.href = '/sign-in';
          return [];
        }
        throw new Error('Failed to load accounts');
      }
      const accounts = await res.json();
      this._cache.accounts = accounts.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category || 'default',
        balance: Number(a.current_balance) || 0,
        startingBalance: Number(a.starting_balance) || 0,
      }));
      return this._cache.accounts;
    } catch (e) {
      console.error('Failed to load accounts from Supabase:', e);
      return [];
    }
  },

  async saveAccount(account) {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: account.name,
          category: account.category || 'default',
          starting_balance: account.startingBalance || account.balance || 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to save account');
      this._cache.accounts = null;
      return await res.json();
    } catch (e) {
      console.error('Failed to save account to Supabase:', e);
      return null;
    }
  },

  async updateAccount(id, account) {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: account.name,
          category: account.category,
          starting_balance: account.startingBalance,
          current_balance: account.balance,
        }),
      });
      if (!res.ok) throw new Error('Failed to update account');
      this._cache.accounts = null;
      return await res.json();
    } catch (e) {
      console.error('Failed to update account in Supabase:', e);
      return null;
    }
  },

  async deleteAccount(id) {
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      this._cache.accounts = null;
      return true;
    } catch (e) {
      console.error('Failed to delete account from Supabase:', e);
      return false;
    }
  },

  // =====================================================
  // SETTINGS
  // =====================================================

  async loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        if (res.status === 401) {
          window.top.location.href = '/sign-in';
          return null;
        }
        throw new Error('Failed to load settings');
      }
      this._cache.settings = await res.json();
      return this._cache.settings;
    } catch (e) {
      console.error('Failed to load settings from Supabase:', e);
      return null;
    }
  },

  async saveSettings(settings) {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      this._cache.settings = null;
      return await res.json();
    } catch (e) {
      console.error('Failed to save settings to Supabase:', e);
      return null;
    }
  },

  // =====================================================
  // DAILY ARCHIVES (Prep, Checklist, Review)
  // =====================================================

  async loadDailyArchive(date) {
    try {
      const res = await fetch(`/api/daily-archives?date=${date}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.top.location.href = '/sign-in';
          return null;
        }
        throw new Error('Failed to load daily archive');
      }
      const archives = await res.json();
      return archives[0] || null;
    } catch (e) {
      console.error('Failed to load daily archive from Supabase:', e);
      return null;
    }
  },

  async saveDailyArchive(archive) {
    try {
      const res = await fetch('/api/daily-archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_date: archive.date,
          prep_data: archive.prep,
          checklist_data: archive.checklist,
          review_data: archive.review,
          screenshots: archive.screenshots,
        }),
      });
      if (!res.ok) throw new Error('Failed to save daily archive');
      return await res.json();
    } catch (e) {
      console.error('Failed to save daily archive to Supabase:', e);
      return null;
    }
  },

  // =====================================================
  // PLAYBOOK
  // =====================================================

  async loadPlaybook() {
    try {
      const res = await fetch('/api/playbook');
      if (!res.ok) {
        if (res.status === 401) {
          window.top.location.href = '/sign-in';
          return [];
        }
        throw new Error('Failed to load playbook');
      }
      return await res.json();
    } catch (e) {
      console.error('Failed to load playbook from Supabase:', e);
      return [];
    }
  },

  async savePlaybookSetup(setup) {
    try {
      const res = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setup.name,
          description: setup.description,
          rules: setup.rules || [],
          screenshot_url: setup.screenshot,
        }),
      });
      if (!res.ok) throw new Error('Failed to save playbook setup');
      return await res.json();
    } catch (e) {
      console.error('Failed to save playbook setup to Supabase:', e);
      return null;
    }
  },

  // =====================================================
  // UTILITY: Sync localStorage to Supabase
  // =====================================================

  async syncLocalStorageToSupabase() {
    console.log('Starting localStorage to Supabase sync...');
    
    const localTrades = JSON.parse(localStorage.getItem('tradingdesk:journals') || '[]');
    const localAccounts = JSON.parse(localStorage.getItem('tradingdesk:accounts') || '[]');
    
    let synced = { trades: 0, accounts: 0 };

    // Sync accounts first (trades may reference them)
    for (const account of localAccounts) {
      if (!account.syncedToSupabase) {
        const saved = await this.saveAccount(account);
        if (saved) {
          account.syncedToSupabase = true;
          account.supabaseId = saved.id;
          synced.accounts++;
        }
      }
    }

    // Sync trades
    for (const trade of localTrades) {
      if (!trade.syncedToSupabase) {
        const saved = await this.saveTrade(trade);
        if (saved) {
          trade.syncedToSupabase = true;
          trade.supabaseId = saved.id;
          synced.trades++;
        }
      }
    }

    // Save back to localStorage with sync flags
    localStorage.setItem('tradingdesk:journals', JSON.stringify(localTrades));
    localStorage.setItem('tradingdesk:accounts', JSON.stringify(localAccounts));

    console.log(`Sync complete: ${synced.accounts} accounts, ${synced.trades} trades`);
    return synced;
  }
};

// Make globally available
window.SupabaseSync = SupabaseSync;
