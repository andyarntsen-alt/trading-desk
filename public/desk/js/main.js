// ------- Security: HTML Sanitization -------
function sanitizeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // ------- Theme System -------
  const THEME_STORAGE_KEY = "tradingdesk:theme";
  
  const ACCENT_NAMES = {
    emerald: "Emerald (Default)",
    blue: "Blue",
    purple: "Purple",
    amber: "Amber",
    rose: "Rose",
    warm: "Warm Linen"
  };
  
  // Theme color definitions for preview
  const THEME_COLORS = {
    emerald: {
      primary: "#10b981",
      light: "#34d399",
      dark: "#059669",
      glow: "rgba(16, 185, 129, 0.2)",
      border: "rgba(16, 185, 129, 0.3)"
    },
    blue: {
      primary: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      glow: "rgba(59, 130, 246, 0.2)",
      border: "rgba(59, 130, 246, 0.3)"
    },
    purple: {
      primary: "#8b5cf6",
      light: "#a78bfa",
      dark: "#7c3aed",
      glow: "rgba(139, 92, 246, 0.2)",
      border: "rgba(139, 92, 246, 0.3)"
    },
    amber: {
      primary: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
      glow: "rgba(245, 158, 11, 0.2)",
      border: "rgba(245, 158, 11, 0.3)"
    },
    rose: {
      primary: "#f43f5e",
      light: "#fb7185",
      dark: "#e11d48",
      glow: "rgba(244, 63, 94, 0.2)",
      border: "rgba(244, 63, 94, 0.3)"
    },
    warm: {
      primary: "#1F4E79",
      light: "#9AA8B5",
      dark: "#163a5c",
      glow: "rgba(31, 78, 121, 0.15)",
      border: "rgba(31, 78, 121, 0.3)"
    }
  };
  
  const MODE_COLORS = {
    dark: {
      bgBase: "#050505",
      bgCard: "#0a0a0a",
      bgElevated: "#0d0d0d",
      borderColor: "#161616",
      textPrimary: "#f1f5f9",
      textSecondary: "#94a3b8"
    },
    light: {
      bgBase: "#f8fafc",
      bgCard: "#ffffff",
      bgElevated: "#f1f5f9",
      borderColor: "#e2e8f0",
      textPrimary: "#0f172a",
      textSecondary: "#475569"
    },
    // Special warm light mode
    warmLight: {
      bgBase: "#EEE5D6",
      bgCard: "#F5EDE0",
      bgElevated: "#D6C3A8",
      borderColor: "#D6C3A8",
      textPrimary: "#2E3440",
      textSecondary: "#4A5568"
    }
  };
  
  // Special themes that should auto-switch to light mode
  const LIGHT_MODE_THEMES = ["warm"];
  
  // Pending theme selection (not yet applied) - must be defined before initTheme
  let pendingTheme = null;
  
  // Load and apply theme immediately (before DOM is ready)
  (function initTheme() {
    try {
      const savedTheme = loadTheme();
      applyTheme(savedTheme.accent, savedTheme.mode);
    } catch (e) {
      console.error("Theme init error:", e);
      // Reset to default theme if there's an error
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  })();
  
  function loadTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY));
      // Validate the saved theme
      const validAccents = ["emerald", "blue", "purple", "amber", "rose", "warm"];
      const validModes = ["dark", "light"];
      
      const accent = validAccents.includes(saved?.accent) ? saved.accent : "emerald";
      const mode = validModes.includes(saved?.mode) ? saved.mode : "dark";
      
      return { accent, mode };
    } catch (e) {
      return { accent: "emerald", mode: "dark" };
    }
  }
  
  function saveTheme(accent, mode) {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ accent, mode }));
  }
  
  function applyTheme(accent, mode) {
    const root = document.documentElement;
    
    // Remove all accent classes (including warm)
    root.classList.remove("accent-emerald", "accent-blue", "accent-purple", "accent-amber", "accent-rose", "accent-warm");
    
    // Add the selected accent class (emerald is default, no class needed)
    if (accent && accent !== "emerald") {
      root.classList.add(`accent-${accent}`);
    }
    
    // Apply mode
    if (mode === "light") {
      root.classList.add("light-mode");
      // Fix checkboxes by adding inline styles (Tailwind override)
      applyLightModeFixups(accent);
    } else {
      root.classList.remove("light-mode");
      // Restore dark mode styles
      removeLightModeFixups();
    }
    
    // Update UI elements (only if function context is ready)
    if (typeof updateThemeUI === 'function') {
      updateThemeUI(accent, mode);
    }
  }
  
  function applyLightModeFixups(accent) {
    // Get colors based on accent
    const isWarm = accent === "warm";
    const accentColor = THEME_COLORS[accent]?.primary || "#10b981";
    const cardBg = isWarm ? "#F5EDE0" : "#ffffff";
    const borderColor = isWarm ? "#A8745F" : "#94a3b8";  // Terracotta for warm
    
    // Fix all checkboxes - remove bg-black and apply light styles
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
      // Store original class
      if (!el.dataset.originalClass) {
        el.dataset.originalClass = el.className;
      }
      
      // Remove bg-black class and add light mode styles
      el.classList.remove('bg-black');
      el.style.accentColor = accentColor;
      el.style.backgroundColor = cardBg;
      el.style.borderColor = borderColor;
      el.style.borderWidth = "2px";
      el.dataset.lightModeApplied = "true";
    });
    
    // Fix header gradient
    document.querySelectorAll('.from-black, [class*="from-black"]').forEach(el => {
      el.style.background = isWarm ? "#F5EDE0" : "#ffffff";
      el.dataset.lightModeApplied = "true";
    });
    
    // Fix sidebar badges
    document.querySelectorAll('.bg-slate-800, .bg-slate-900').forEach(el => {
      el.style.backgroundColor = isWarm ? "#D6C3A8" : "#e2e8f0";
      el.dataset.lightModeApplied = "true";
    });
  }
  
  function removeLightModeFixups() {
    // Restore checkboxes
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
      // Restore original class (including bg-black)
      if (el.dataset.originalClass) {
        el.className = el.dataset.originalClass;
        delete el.dataset.originalClass;
      }
      // Clear all inline styles
      el.style.accentColor = "";
      el.style.backgroundColor = "";
      el.style.borderColor = "";
      el.style.borderWidth = "";
      delete el.dataset.lightModeApplied;
      delete el.dataset.originalBg;
    });
    
    // Restore header - remove inline style completely to let CSS take over
    document.querySelectorAll('.from-black, [class*="from-black"]').forEach(el => {
      el.style.background = "";
      el.style.removeProperty("background");
      delete el.dataset.lightModeApplied;
      delete el.dataset.originalBg;
    });
    
    // Restore sidebar badges
    document.querySelectorAll('.bg-slate-800, .bg-slate-900').forEach(el => {
      el.style.backgroundColor = "";
      el.style.removeProperty("background-color");
      delete el.dataset.lightModeApplied;
      delete el.dataset.originalBg;
    });
    
    // Also clean up any elements with lingering style overrides from light mode
    document.querySelectorAll('[data-original-bg]').forEach(el => {
      el.style.background = "";
      el.style.backgroundColor = "";
      el.style.removeProperty("background");
      el.style.removeProperty("background-color");
      delete el.dataset.originalBg;
    });
  }
  
  function updateThemeUI(accent, mode) {
    // Update pending theme to match applied theme
    if (pendingTheme) {
      pendingTheme.accent = accent;
      pendingTheme.mode = mode;
      updateThemeSelectionUI();
    }
  }
  
  function initThemeSelector() {
    const savedTheme = loadTheme();
    pendingTheme = { ...savedTheme };
    
    // Accent color selection buttons
    document.querySelectorAll("[data-accent-select]").forEach(btn => {
      btn.addEventListener("click", () => {
        const accent = btn.dataset.accentSelect;
        pendingTheme.accent = accent;
        
        // Auto-suggest light mode for warm theme
        if (LIGHT_MODE_THEMES.includes(accent) && pendingTheme.mode === "dark") {
          pendingTheme.mode = "light";
        }
        
        updateThemeSelectionUI();
        checkForChanges();
      });
    });
    
    // Mode selection buttons
    document.querySelectorAll("[data-mode-select]").forEach(btn => {
      btn.addEventListener("click", () => {
        pendingTheme.mode = btn.dataset.modeSelect;
        updateThemeSelectionUI();
        checkForChanges();
      });
    });
    
    // Apply button
    const applyBtn = document.getElementById("apply-theme-btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        applyTheme(pendingTheme.accent, pendingTheme.mode);
        saveTheme(pendingTheme.accent, pendingTheme.mode);
        checkForChanges();
      });
    }
    
    // Initialize UI
    updateThemeSelectionUI();
  }
  
  function updateThemeSelectionUI() {
    // Safety check - don't run if pendingTheme isn't set yet
    if (!pendingTheme) return;
    
    // Update accent selection buttons
    document.querySelectorAll("[data-accent-select]").forEach(btn => {
      if (btn.dataset.accentSelect === pendingTheme.accent) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    
    // Update mode selection buttons
    document.querySelectorAll("[data-mode-select]").forEach(btn => {
      if (btn.dataset.modeSelect === pendingTheme.mode) {
        btn.classList.remove("bg-black/60", "border-[#262626]", "text-slate-400");
        btn.classList.add("bg-emerald-500/20", "border-emerald-500/30", "text-emerald-300");
      } else {
        btn.classList.remove("bg-emerald-500/20", "border-emerald-500/30", "text-emerald-300");
        btn.classList.add("bg-black/60", "border-[#262626]", "text-slate-400");
      }
    });
    
    // Update accent name
    const accentNameEl = document.getElementById("accent-name");
    if (accentNameEl) {
      accentNameEl.textContent = ACCENT_NAMES[pendingTheme.accent] || pendingTheme.accent;
    }
    
    // Update mode hint
    const modeHintEl = document.getElementById("mode-hint");
    if (modeHintEl) {
      if (pendingTheme.accent === "warm" && pendingTheme.mode === "dark") {
        modeHintEl.textContent = "💡 Warm Linen ser best ut i Light mode";
        modeHintEl.classList.add("text-amber-400");
      } else {
        modeHintEl.textContent = "";
        modeHintEl.classList.remove("text-amber-400");
      }
    }
    
    // Update live preview
    updateThemePreview();
  }
  
  function updateThemePreview() {
    const previewBox = document.getElementById("theme-preview-box");
    if (!previewBox || !pendingTheme) return;
    
    // Get colors for pending theme
    const accent = THEME_COLORS[pendingTheme.accent] || THEME_COLORS.emerald;
    
    // Determine mode colors - special handling for warm + light
    let mode;
    if (pendingTheme.accent === "warm" && pendingTheme.mode === "light") {
      mode = MODE_COLORS.warmLight;
    } else {
      mode = MODE_COLORS[pendingTheme.mode] || MODE_COLORS.dark;
    }
    
    // Update preview box
    previewBox.style.backgroundColor = mode.bgCard;
    previewBox.style.borderColor = mode.borderColor;
    
    // Update elements inside preview
    const iconBox = previewBox.querySelector(".rounded-lg");
    if (iconBox) {
      iconBox.style.backgroundColor = accent.glow;
      iconBox.style.borderColor = accent.border;
    }
    
    const icon = previewBox.querySelector("svg");
    if (icon) {
      icon.style.color = accent.primary;
    }
    
    const title = previewBox.querySelector(".font-medium");
    if (title) {
      title.style.color = mode.textPrimary;
    }
    
    const subtitle = previewBox.querySelector(".text-\\[10px\\]");
    if (subtitle) {
      subtitle.style.color = mode.textSecondary;
    }
    
    const pnl = previewBox.querySelector(".font-bold");
    if (pnl) {
      pnl.style.color = accent.primary;
    }
    
    // Update badges
    const badges = previewBox.querySelectorAll(".flex.gap-2 span");
    if (badges.length >= 2) {
      // Win badge
      badges[0].style.backgroundColor = accent.glow;
      badges[0].style.borderColor = accent.border;
      badges[0].style.color = accent.primary;
      
      // WR badge
      badges[1].style.backgroundColor = mode.bgElevated;
      badges[1].style.borderColor = mode.borderColor;
      badges[1].style.color = mode.textSecondary;
    }
  }
  
  function checkForChanges() {
    // Safety check
    if (!pendingTheme) return;
    
    const savedTheme = loadTheme();
    const hasChanges = pendingTheme.accent !== savedTheme.accent || pendingTheme.mode !== savedTheme.mode;
    
    const applyBtn = document.getElementById("apply-theme-btn");
    const indicator = document.getElementById("theme-change-indicator");
    
    if (applyBtn) {
      applyBtn.disabled = !hasChanges;
    }
    if (indicator) {
      indicator.classList.toggle("hidden", !hasChanges);
    }
  }
  
  // Expose functions globally
  window.loadTheme = loadTheme;
  window.saveTheme = saveTheme;
  window.applyTheme = applyTheme;
  
  // ------- Input Validation -------
  function validateNumber(value, options = {}) {
    const { min = -Infinity, max = Infinity, allowEmpty = false, defaultValue = 0 } = options;
    
    if (value === null || value === undefined || value === '') {
      return allowEmpty ? null : defaultValue;
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return defaultValue;
    }
    
    if (num < min) return min;
    if (num > max) return max;
    
    return num;
  }
  
  function validateText(str, options = {}) {
    const { maxLength = 1000, allowEmpty = true, trim = true } = options;
    
    if (str === null || str === undefined) {
      return allowEmpty ? '' : null;
    }
    
    let result = String(str);
    if (trim) result = result.trim();
    
    if (result.length > maxLength) {
      result = result.substring(0, maxLength);
    }
    
    if (!allowEmpty && result === '') {
      return null;
    }
    
    return result;
  }
  
  // ------- Date Utility for Trade Objects -------
  // Standardized function to get a Date object from trade entries
  // Handles different date formats: timestamp (ISO), date (YYYY-MM-DD), time (locale string)
  function getTradeDate(trade) {
    if (!trade) return null;
    
    // First priority: ISO timestamp string
    if (trade.timestamp) {
      const date = new Date(trade.timestamp);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Second priority: date field (YYYY-MM-DD format)
    if (trade.date) {
      const dateStr = trade.date.split("T")[0];
      const date = new Date(dateStr + "T12:00:00");
      if (!isNaN(date.getTime())) return date;
    }
    
    // Third priority: time field (locale string format)
    if (trade.time) {
      const date = new Date(trade.time);
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  }
  
  // ------- DOM Cache for Performance -------
  const domCache = {
    _cache: new Map(),
    
    get(id) {
      if (!this._cache.has(id)) {
        this._cache.set(id, document.getElementById(id));
      }
      return this._cache.get(id);
    },
    
    clear(id) {
      if (id) {
        this._cache.delete(id);
      } else {
        this._cache.clear();
      }
    },
    
    // Invalidate cache for elements that might be dynamically created
    refresh(id) {
      this._cache.set(id, document.getElementById(id));
      return this._cache.get(id);
    }
  };
  
  // ------- Global Account Filter System -------
  const GLOBAL_FILTER_KEY = 'tradingdesk:globalFilter';
  
  // Get the current global filter value
  function getGlobalFilter() {
    return localStorage.getItem(GLOBAL_FILTER_KEY) || 'all';
  }
  
  // Set the global filter value
  function setGlobalFilter(value) {
    localStorage.setItem(GLOBAL_FILTER_KEY, value);
  }
  
  // Get filtered journal based on global filter
  function getFilteredJournal() {
    const filter = getGlobalFilter();
    const journal = loadJournal();
    
    // If "all", return everything
    if (filter === 'all') return journal;
    
    // If category filter (e.g., "cat:crypto")
    if (filter.startsWith('cat:')) {
      const category = filter.replace('cat:', '');
      const accounts = loadAccounts();
      const categoryAccountIds = accounts
        .filter(a => a.category === category)
        .map(a => a.id);
      
      // Return trades that belong to accounts in this category
      return journal.filter(t => categoryAccountIds.includes(t.accountId));
    }
    
    // Specific account filter
    return journal.filter(t => t.accountId === filter);
  }
  
  // Get filtered accounts based on category
  function getFilteredAccounts() {
    const filter = getGlobalFilter();
    const accounts = loadAccounts();
    
    if (filter === 'all') return accounts;
    
    if (filter.startsWith('cat:')) {
      const category = filter.replace('cat:', '');
      return accounts.filter(a => a.category === category);
    }
    
    // Specific account
    return accounts.filter(a => a.id === filter);
  }
  
  // Update global filter dropdown - simplified to only show categories
  function updateGlobalFilterDropdown() {
    const desktopSelect = document.getElementById('global-account-filter');
    const mobileSelect = document.getElementById('global-account-filter-mobile');
    const accounts = loadAccounts();
    const currentFilter = getGlobalFilter();
    
    // Count accounts per category for display
    const categoryCounts = {};
    accounts.forEach(a => {
      const cat = a.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const categories = [
      { key: 'crypto', name: 'Crypto', icon: '₿' },
      { key: 'forex', name: 'Forex', icon: '💱' },
      { key: 'stocks', name: 'Stocks', icon: '📈' },
      { key: 'futures', name: 'Futures', icon: '📊' },
      { key: 'options', name: 'Options', icon: '⚡' }
    ];
    
    // Build category options - only show categories that have accounts or always show main ones
    let categoryOptions = categories.map(cat => {
      const count = categoryCounts[cat.key] || 0;
      const countText = count > 0 ? ` (${count})` : '';
      return `<option value="cat:${cat.key}">${cat.icon} ${cat.name}${countText}</option>`;
    }).join('');
    
    // Update desktop dropdown
    if (desktopSelect) {
      desktopSelect.innerHTML = `
        <option value="all">📁 All Categories</option>
        ${categoryOptions}
      `;
      // Validate current filter - if it's an old account ID, reset to 'all'
      if (currentFilter && !currentFilter.startsWith('cat:') && currentFilter !== 'all') {
        setGlobalFilter('all');
        desktopSelect.value = 'all';
      } else {
        desktopSelect.value = currentFilter;
      }
    }
    
    // Update mobile dropdown (same as desktop now)
    if (mobileSelect) {
      mobileSelect.innerHTML = `
        <option value="all">📁 All</option>
        ${categoryOptions}
      `;
      if (currentFilter && !currentFilter.startsWith('cat:') && currentFilter !== 'all') {
        mobileSelect.value = 'all';
      } else {
        mobileSelect.value = currentFilter;
      }
    }
  }
  
  // Refresh all views when filter changes
  function refreshAllViews() {
    console.log('Refreshing all views for filter:', getGlobalFilter());
    
    // Statistics & Analytics (all exposed on window)
    if (window.renderStatisticsDashboard) window.renderStatisticsDashboard();
    if (window.renderAdvancedStats) window.renderAdvancedStats();
    if (window.renderTradingHeatmap) window.renderTradingHeatmap();
    if (window.renderStrategyPerformance) window.renderStrategyPerformance();
    
    // Charts
    if (window.updateAccountBalanceChart) window.updateAccountBalanceChart();
    
    // Risk Management
    if (window.renderDailyLossTracker) window.renderDailyLossTracker();
    if (window.renderDrawdownTracker) window.renderDrawdownTracker();
    if (window.updateHeaderStatusBarIndependent) window.updateHeaderStatusBarIndependent();
    
    // Goals
    if (window.renderGoals) window.renderGoals();
    
    // Trading Insights (analyzeTradingEnhanced calls renderTradingAnalysis internally)
    if (window.analyzeTradingEnhanced) {
      window.analyzeTradingEnhanced();
    }
    
    // Journal list
    if (window.renderJournal) {
      const journal = getFilteredJournal();
      window.renderJournal(journal);
    }
    
    // Trade reviews
    if (window.renderTradeReviews) window.renderTradeReviews();
    
    // Daily archives
    if (window.renderDailyArchives) window.renderDailyArchives();
  }
  
  // Initialize global filter event listeners
  function initGlobalFilter() {
    const desktopSelect = document.getElementById('global-account-filter');
    const mobileSelect = document.getElementById('global-account-filter-mobile');
    
    function handleFilterChange(e) {
      const newValue = e.target.value;
      setGlobalFilter(newValue);
      
      // Sync both selectors
      if (desktopSelect && desktopSelect !== e.target) desktopSelect.value = newValue;
      if (mobileSelect && mobileSelect !== e.target) mobileSelect.value = newValue;
      
      // Sync import account selector if a specific account is selected
      if (typeof populateImportAccountSelector === 'function') {
        populateImportAccountSelector();
      }
      
      // Update Trade Plan account dropdown to show accounts from selected category
      if (typeof window.updateAccountDropdown === 'function') {
        window.updateAccountDropdown();
      }
      
      // Update Trade Plan fields based on category (even for category filters)
      if (typeof window.updateFieldsForAccountCategory === 'function') {
        window.updateFieldsForAccountCategory();
      }
      
      // Refresh all views
      refreshAllViews();
    }
    
    if (desktopSelect) {
      desktopSelect.addEventListener('change', handleFilterChange);
    }
    
    if (mobileSelect) {
      mobileSelect.addEventListener('change', handleFilterChange);
    }
    
    // Initial population
    updateGlobalFilterDropdown();
  }
  
  // ------- Configuration System -------
  const DEFAULT_PREP_CONFIG = {
    groups: [
      {
        id: 'market-htf',
        title: 'Market & HTF',
        fields: [
          { id: 'instrument', label: 'Instrument', type: 'input', placeholder: 'BTCUSDT, ES, NQ …', autocomplete: true },
          { id: 'trend', label: 'HTF trend', type: 'select', options: ['–', 'Bull', 'Bear', 'Range'] },
          { id: 'levels', label: 'Key levels', type: 'textarea', placeholder: 'Weekly/Daily open, prior high/low, key liquidity …', rows: 3 }
        ]
      },
      {
        id: 'session-news',
        title: 'Session & news',
        fields: [
          { id: 'session', label: 'Session', type: 'select', options: ['–', 'Asia', 'London', 'New York', 'London/NY overlap'] },
          { id: 'news', label: 'News risk', type: 'select', options: ['–', 'Low', 'Medium', 'High'] },
          { id: 'vol', label: 'Volatility', type: 'select', options: ['–', 'Low', 'Normal', 'High'] }
        ]
      },
      {
        id: 'psychology-risk',
        title: 'Psychology & risk',
        fields: [
          { id: 'sleep', label: 'Slept OK / not exhausted', type: 'checkbox' },
          { id: 'emotions', label: 'No revenge / FOMO from earlier', type: 'checkbox' },
          { id: 'risklimit', label: 'Within daily/weekly loss limit', type: 'checkbox' },
          { id: 'notes', label: 'Focus for today', type: 'textarea', placeholder: 'Short note on what to do / avoid today.', rows: 3 }
        ]
      }
    ],
    notes: [
      { id: 'market-profile', title: 'Market Profile', placeholder: 'TPO type, value areas, POC, single prints...' },
      { id: 'support-resistance', title: 'Support/Resistance', placeholder: 'Key support and resistance levels, prior highs/lows...' },
      { id: 'vwap', title: 'Rolling VWAP', placeholder: 'VWAP levels, deviations, price action around VWAP...' },
      { id: 'narrative', title: 'Daily Narrative', placeholder: 'What happened yesterday, what to watch today...' },
      { id: 'ltvw', title: 'LTVW', placeholder: 'Long-term volume weighted levels, context...' },
      { id: 'summary', title: 'SUMMARY', placeholder: 'Overall plan summary, key takeaways...' }
    ]
  };
  
  const DEFAULT_CHECKLIST_CONFIG = {
    categories: [
      {
        id: 'ms',
        number: '1',
        title: 'Market structure',
        subtitle: 'Trend, structure, liquidity',
        description: 'HTF + LTF tell the same story and you have a clean invalidation.',
        items: [
          { text: 'HTF direction supports the idea (trend or range play).', weight: 2 },
          { text: 'Clear break of structure / shift in structure.', weight: 2 },
          { text: 'Liquidity was taken (sweep/stop hunt) before your entry.', weight: 1 },
          { text: 'Clear invalidation – one level where the idea is dead, not "feeling".', weight: 2 }
        ]
      },
      {
        id: 'of',
        number: '2',
        title: 'Orderflow',
        subtitle: 'Aggression, absorption, delta',
        description: 'Flow should confirm your idea, not fight it.',
        items: [
          { text: 'Aggressive buyers/sellers in your direction around the level.', weight: 2 },
          { text: 'Absorption / trap on the opposite side where you do not want to be.', weight: 1 },
          { text: 'Delta/CVD makes sense versus price (no clean divergence against you).', weight: 1 }
        ]
      },
      {
        id: 'tpo',
        number: '3',
        title: 'TPO / profile',
        subtitle: 'Value, POC, single prints',
        description: 'Know where you are in the day\'s profile – edge comes from context, not one bar.',
        items: [
          { text: 'Setup matches today\'s TPO/volume type (trend/normal/neutral).', weight: 1 },
          { text: 'You know if you are at VAH/VAL/POC or a low‑volume node.', weight: 1 },
          { text: 'You are not entering randomly mid‑value.', weight: 1 }
        ]
      },
      {
        id: 'pa',
        number: '4',
        title: 'PA & orderblocks',
        subtitle: 'OB, demand/supply, entry',
        description: 'Clean zones with few tests beat random candles every time.',
        items: [
          { text: 'Fresh orderblock / demand/supply with clear origin.', weight: 2 },
          { text: 'First or second test, not overtested zone.', weight: 1 },
          { text: 'Entry trigger (candle pattern, M1/M5 structure shift, divergence, etc.).', weight: 1 }
        ]
      },
      {
        id: 'exec',
        number: '5',
        title: 'Execution & psychology',
        subtitle: 'R:R, size, headspace',
        description: 'This is where most nonsense stops if you are honest. Good journals weight this heavily.',
        items: [
          { text: 'Defined SL and realistic 2R/3R target.', weight: 2 },
          { text: 'Position size in line with plan (risk %).', weight: 2 },
          { text: 'Not a revenge / FOMO / boredom trade (brutal honesty).', weight: 2 }
        ]
      }
    ],
    settings: {
      minScore: 70,
      qualityLabels: 'default'
    }
  };
  
  // Load configuration from localStorage or use defaults
  function loadPrepConfig() {
    try {
      const saved = localStorage.getItem('tradedesk-prep-config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading prep config:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PREP_CONFIG));
  }
  
  function savePrepConfig(config) {
    try {
      localStorage.setItem('tradedesk-prep-config', JSON.stringify(config));
    } catch (e) {
      console.error('Error saving prep config:', e);
    }
  }
  
  function loadChecklistConfig() {
    try {
      const saved = localStorage.getItem('tradedesk-checklist-config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading checklist config:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_CONFIG));
  }
  
  function saveChecklistConfig(config) {
    try {
      localStorage.setItem('tradedesk-checklist-config', JSON.stringify(config));
    } catch (e) {
      console.error('Error saving checklist config:', e);
    }
  }
  
  // Generate unique ID
  function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  // ------- Trade-score / checklist -------
  const critInputs = document.querySelectorAll(".crit");
  const gradeScoreEl = document.getElementById("grade-score");
  const gradeLabelEl = document.getElementById("grade-label");
  const gradeAllowedEl = document.getElementById("grade-allowed");
  const gradeTextEl = document.getElementById("grade-text");
  const summaryTextEl = document.getElementById("summary-text");
  
  function calcGrade() {
    let maxScore = 0;
    let score = 0;
  
    critInputs.forEach((el) => {
      const w = Number(el.dataset.weight || 1);
      maxScore += w;
      if (el.checked) score += w;
    });
  
    if (maxScore === 0) {
      gradeScoreEl.textContent = "0";
      gradeLabelEl.textContent = "Not rated";
      gradeAllowedEl.textContent = "Set rules first";
      gradeAllowedEl.className =
        "mt-1 inline-flex items-center justify-center px-2 py-1 rounded-full border text-[10px] grade-badge-low";
      gradeTextEl.textContent =
        "Fill the checklist to get an objective view of how strong the setup is.";
      summaryTextEl.textContent =
        "When you tick the checklist, you get a short text here about what is strong and weak in the setup.";
      return;
    }
  
    const pct = Math.round((score / maxScore) * 100);
    gradeScoreEl.textContent = pct;
  
    let label = "";
    let allowedLabel = "";
    let badgeClass = "";
  
    if (pct < 40) {
      label = "Weak setup";
      allowedLabel = "Not allowed to take";
      badgeClass = "grade-badge-high";
    } else if (pct < 70) {
      label = "OK, but not A+";
      allowedLabel = "Only with A+ context";
      badgeClass = "grade-badge-mid";
    } else {
      label = "Strong setup";
      allowedLabel = "Within rule set";
      badgeClass = "grade-badge-low";
    }
  
    gradeLabelEl.textContent = label;
    gradeAllowedEl.textContent = allowedLabel;
    gradeAllowedEl.className =
      "mt-1 inline-flex items-center justify-center px-2 py-1 rounded-full border text-[10px] " +
      badgeClass;
  
    const strong = [];
    const weak = [];
  
    document.querySelectorAll("[data-group]").forEach((group) => {
      const groupCrit = group.querySelectorAll(".crit");
      let groupMax = 0;
      let groupScore = 0;
      groupCrit.forEach((el) => {
        const w = Number(el.dataset.weight || 1);
        groupMax += w;
        if (el.checked) groupScore += w;
      });
      if (!groupMax) return;
      const gpct = groupScore / groupMax;
      const name = group.getAttribute("data-group");
      let pretty = "";
      if (name === "ms") pretty = "Market structure";
      if (name === "of") pretty = "Orderflow";
      if (name === "tpo") pretty = "TPO/profile";
      if (name === "pa") pretty = "PA/orderblocks";
      if (name === "exec") pretty = "Execution/psychology";
      if (gpct >= 0.7) strong.push(pretty);
      else if (gpct <= 0.4) weak.push(pretty);
    });
  
    let txt = "Based on the checklist this trade scores about " + pct + "/100.\n\n";
    if (strong.length) {
      txt += "Strong parts: " + strong.join(", ") + ".\n";
    }
    if (weak.length) {
      txt +=
        "Weak or unclear parts: " +
        weak.join(", ") +
        " – be extra critical here.\n";
    }
    if (!strong.length && !weak.length) {
      txt +=
        "You have ticked a mixed set of boxes; consider if the idea is really mature or just halfway.";
    }
  
    summaryTextEl.textContent = txt;
  }
  
  critInputs.forEach((el) => {
    el.addEventListener("change", calcGrade);
  });
  
  // Function to capture checklist data
  function captureChecklistData() {
    const checklistData = {
      score: parseInt(document.getElementById("grade-score")?.textContent || "0"),
      groups: {},
      checkedItems: [],
    };
  
    document.querySelectorAll("[data-group]").forEach((group) => {
      const groupName = group.getAttribute("data-group");
      const groupCrit = group.querySelectorAll(".crit");
      let groupMax = 0;
      let groupScore = 0;
      const checked = [];
  
      groupCrit.forEach((el) => {
        const w = Number(el.dataset.weight || 1);
        groupMax += w;
        if (el.checked) {
          groupScore += w;
          checked.push({
            text: el.parentElement.querySelector("span")?.textContent || "",
            weight: w,
          });
        }
      });
  
      if (groupMax > 0) {
        checklistData.groups[groupName] = {
          score: groupScore,
          max: groupMax,
          percentage: (groupScore / groupMax) * 100,
          checked: checked,
        };
      }
    });
  
    return checklistData;
  }
  
  // ------- Symbol Database -------
  const SYMBOLS_STORAGE_KEY = "tradingdesk:symbols";
  
  function initializeSymbols() {
    const existing = loadSymbols();
    if (existing && existing.length > 0) {
      return; // Already initialized
    }
  
    const symbols = [
      // Futures - Stock Indices
      { symbol: "ES", name: "E-mini S&P 500", market: "futures", category: "index_future" },
      { symbol: "NQ", name: "E-mini NASDAQ-100", market: "futures", category: "index_future" },
      { symbol: "YM", name: "E-mini Dow", market: "futures", category: "index_future" },
      { symbol: "RTY", name: "E-mini Russell 2000", market: "futures", category: "index_future" },
      { symbol: "MES", name: "Micro E-mini S&P 500", market: "futures", category: "index_future" },
      { symbol: "MNQ", name: "Micro E-mini NASDAQ-100", market: "futures", category: "index_future" },
      { symbol: "MYM", name: "Micro E-mini Dow", market: "futures", category: "index_future" },
      { symbol: "M2K", name: "Micro E-mini Russell 2000", market: "futures", category: "index_future" },
      
      // Stocks - Major Indices ETFs
      { symbol: "SPY", name: "SPDR S&P 500 ETF", market: "stocks", category: "etf" },
      { symbol: "QQQ", name: "Invesco QQQ Trust", market: "stocks", category: "etf" },
      { symbol: "DIA", name: "SPDR Dow Jones Industrial Average", market: "stocks", category: "etf" },
      { symbol: "IWM", name: "iShares Russell 2000 ETF", market: "stocks", category: "etf" },
      { symbol: "VTI", name: "Vanguard Total Stock Market ETF", market: "stocks", category: "etf" },
      { symbol: "VOO", name: "Vanguard S&P 500 ETF", market: "stocks", category: "etf" },
      { symbol: "SPXU", name: "ProShares UltraPro Short S&P500", market: "stocks", category: "etf" },
      { symbol: "TQQQ", name: "ProShares UltraPro QQQ", market: "stocks", category: "etf" },
      { symbol: "SQQQ", name: "ProShares UltraPro Short QQQ", market: "stocks", category: "etf" },
      
      // Stocks - Technology
      { symbol: "AAPL", name: "Apple Inc.", market: "stocks", category: "stock" },
      { symbol: "MSFT", name: "Microsoft Corporation", market: "stocks", category: "stock" },
      { symbol: "GOOGL", name: "Alphabet Inc. Class A", market: "stocks", category: "stock" },
      { symbol: "GOOG", name: "Alphabet Inc. Class C", market: "stocks", category: "stock" },
      { symbol: "AMZN", name: "Amazon.com Inc.", market: "stocks", category: "stock" },
      { symbol: "TSLA", name: "Tesla Inc.", market: "stocks", category: "stock" },
      { symbol: "META", name: "Meta Platforms Inc.", market: "stocks", category: "stock" },
      { symbol: "NVDA", name: "NVIDIA Corporation", market: "stocks", category: "stock" },
      { symbol: "NFLX", name: "Netflix Inc.", market: "stocks", category: "stock" },
      { symbol: "AMD", name: "Advanced Micro Devices", market: "stocks", category: "stock" },
      { symbol: "INTC", name: "Intel Corporation", market: "stocks", category: "stock" },
      { symbol: "CRM", name: "Salesforce Inc.", market: "stocks", category: "stock" },
      { symbol: "ORCL", name: "Oracle Corporation", market: "stocks", category: "stock" },
      { symbol: "ADBE", name: "Adobe Inc.", market: "stocks", category: "stock" },
      { symbol: "CSCO", name: "Cisco Systems Inc.", market: "stocks", category: "stock" },
      { symbol: "IBM", name: "International Business Machines", market: "stocks", category: "stock" },
      { symbol: "NOW", name: "ServiceNow Inc.", market: "stocks", category: "stock" },
      { symbol: "SNOW", name: "Snowflake Inc.", market: "stocks", category: "stock" },
      { symbol: "CRWD", name: "CrowdStrike Holdings Inc.", market: "stocks", category: "stock" },
      { symbol: "PANW", name: "Palo Alto Networks Inc.", market: "stocks", category: "stock" },
      { symbol: "ZM", name: "Zoom Video Communications", market: "stocks", category: "stock" },
      { symbol: "DOCN", name: "DigitalOcean Holdings", market: "stocks", category: "stock" },
      { symbol: "PLTR", name: "Palantir Technologies", market: "stocks", category: "stock" },
      { symbol: "RBLX", name: "Roblox Corporation", market: "stocks", category: "stock" },
      { symbol: "COIN", name: "Coinbase Global Inc.", market: "stocks", category: "stock" },
      
      // Stocks - Finance
      { symbol: "JPM", name: "JPMorgan Chase & Co.", market: "stocks", category: "stock" },
      { symbol: "BAC", name: "Bank of America Corp", market: "stocks", category: "stock" },
      { symbol: "WFC", name: "Wells Fargo & Company", market: "stocks", category: "stock" },
      { symbol: "C", name: "Citigroup Inc.", market: "stocks", category: "stock" },
      { symbol: "GS", name: "Goldman Sachs Group Inc.", market: "stocks", category: "stock" },
      { symbol: "MS", name: "Morgan Stanley", market: "stocks", category: "stock" },
      { symbol: "V", name: "Visa Inc.", market: "stocks", category: "stock" },
      { symbol: "MA", name: "Mastercard Inc.", market: "stocks", category: "stock" },
      { symbol: "AXP", name: "American Express Company", market: "stocks", category: "stock" },
      { symbol: "PYPL", name: "PayPal Holdings Inc.", market: "stocks", category: "stock" },
      { symbol: "SQ", name: "Block Inc.", market: "stocks", category: "stock" },
      { symbol: "SOFI", name: "SoFi Technologies Inc.", market: "stocks", category: "stock" },
      { symbol: "HOOD", name: "Robinhood Markets Inc.", market: "stocks", category: "stock" },
      
      // Stocks - Healthcare
      { symbol: "JNJ", name: "Johnson & Johnson", market: "stocks", category: "stock" },
      { symbol: "UNH", name: "UnitedHealth Group Inc.", market: "stocks", category: "stock" },
      { symbol: "PFE", name: "Pfizer Inc.", market: "stocks", category: "stock" },
      { symbol: "ABBV", name: "AbbVie Inc.", market: "stocks", category: "stock" },
      { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", market: "stocks", category: "stock" },
      { symbol: "ABT", name: "Abbott Laboratories", market: "stocks", category: "stock" },
      { symbol: "DHR", name: "Danaher Corporation", market: "stocks", category: "stock" },
      { symbol: "BMY", name: "Bristol-Myers Squibb Company", market: "stocks", category: "stock" },
      { symbol: "AMGN", name: "Amgen Inc.", market: "stocks", category: "stock" },
      { symbol: "GILD", name: "Gilead Sciences Inc.", market: "stocks", category: "stock" },
      { symbol: "MRNA", name: "Moderna Inc.", market: "stocks", category: "stock" },
      { symbol: "BIIB", name: "Biogen Inc.", market: "stocks", category: "stock" },
      
      // Stocks - Consumer
      { symbol: "DIS", name: "The Walt Disney Company", market: "stocks", category: "stock" },
      { symbol: "NKE", name: "Nike Inc.", market: "stocks", category: "stock" },
      { symbol: "SBUX", name: "Starbucks Corporation", market: "stocks", category: "stock" },
      { symbol: "MCD", name: "McDonald's Corporation", market: "stocks", category: "stock" },
      { symbol: "WMT", name: "Walmart Inc.", market: "stocks", category: "stock" },
      { symbol: "TGT", name: "Target Corporation", market: "stocks", category: "stock" },
      { symbol: "HD", name: "The Home Depot Inc.", market: "stocks", category: "stock" },
      { symbol: "LOW", name: "Lowe's Companies Inc.", market: "stocks", category: "stock" },
      { symbol: "COST", name: "Costco Wholesale Corporation", market: "stocks", category: "stock" },
      { symbol: "CMCSA", name: "Comcast Corporation", market: "stocks", category: "stock" },
      
      // Stocks - Energy
      { symbol: "XOM", name: "Exxon Mobil Corporation", market: "stocks", category: "stock" },
      { symbol: "CVX", name: "Chevron Corporation", market: "stocks", category: "stock" },
      { symbol: "COP", name: "ConocoPhillips", market: "stocks", category: "stock" },
      { symbol: "SLB", name: "Schlumberger Limited", market: "stocks", category: "stock" },
      { symbol: "EOG", name: "EOG Resources Inc.", market: "stocks", category: "stock" },
      { symbol: "MPC", name: "Marathon Petroleum Corporation", market: "stocks", category: "stock" },
      { symbol: "VLO", name: "Valero Energy Corporation", market: "stocks", category: "stock" },
      
      // Stocks - Industrial
      { symbol: "BA", name: "The Boeing Company", market: "stocks", category: "stock" },
      { symbol: "CAT", name: "Caterpillar Inc.", market: "stocks", category: "stock" },
      { symbol: "GE", name: "General Electric Company", market: "stocks", category: "stock" },
      { symbol: "HON", name: "Honeywell International Inc.", market: "stocks", category: "stock" },
      { symbol: "LMT", name: "Lockheed Martin Corporation", market: "stocks", category: "stock" },
      { symbol: "RTX", name: "Raytheon Technologies Corporation", market: "stocks", category: "stock" },
      { symbol: "DE", name: "Deere & Company", market: "stocks", category: "stock" },
      { symbol: "UPS", name: "United Parcel Service Inc.", market: "stocks", category: "stock" },
      { symbol: "FDX", name: "FedEx Corporation", market: "stocks", category: "stock" },
      
      // Forex - Major Pairs
      { symbol: "EURUSD", name: "Euro / US Dollar", market: "forex", category: "major" },
      { symbol: "GBPUSD", name: "British Pound / US Dollar", market: "forex", category: "major" },
      { symbol: "USDJPY", name: "US Dollar / Japanese Yen", market: "forex", category: "major" },
      { symbol: "USDCHF", name: "US Dollar / Swiss Franc", market: "forex", category: "major" },
      { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", market: "forex", category: "major" },
      { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", market: "forex", category: "major" },
      { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", market: "forex", category: "major" },
      { symbol: "USDCNH", name: "US Dollar / Chinese Yuan", market: "forex", category: "major" },
      { symbol: "USDSEK", name: "US Dollar / Swedish Krona", market: "forex", category: "major" },
      { symbol: "USDNOK", name: "US Dollar / Norwegian Krone", market: "forex", category: "major" },
      { symbol: "USDDKK", name: "US Dollar / Danish Krone", market: "forex", category: "major" },
      { symbol: "USDZAR", name: "US Dollar / South African Rand", market: "forex", category: "major" },
      { symbol: "USDMXN", name: "US Dollar / Mexican Peso", market: "forex", category: "major" },
      { symbol: "USDBRL", name: "US Dollar / Brazilian Real", market: "forex", category: "major" },
      { symbol: "USDTRY", name: "US Dollar / Turkish Lira", market: "forex", category: "major" },
      { symbol: "USDRUB", name: "US Dollar / Russian Ruble", market: "forex", category: "major" },
      { symbol: "USDINR", name: "US Dollar / Indian Rupee", market: "forex", category: "major" },
      { symbol: "USDKRW", name: "US Dollar / South Korean Won", market: "forex", category: "major" },
      { symbol: "USDSGD", name: "US Dollar / Singapore Dollar", market: "forex", category: "major" },
      { symbol: "USDHKD", name: "US Dollar / Hong Kong Dollar", market: "forex", category: "major" },
      
      // Forex - Crosses
      { symbol: "EURGBP", name: "Euro / British Pound", market: "forex", category: "cross" },
      { symbol: "EURJPY", name: "Euro / Japanese Yen", market: "forex", category: "cross" },
      { symbol: "EURCHF", name: "Euro / Swiss Franc", market: "forex", category: "cross" },
      { symbol: "EURAUD", name: "Euro / Australian Dollar", market: "forex", category: "cross" },
      { symbol: "EURCAD", name: "Euro / Canadian Dollar", market: "forex", category: "cross" },
      { symbol: "EURNZD", name: "Euro / New Zealand Dollar", market: "forex", category: "cross" },
      { symbol: "GBPJPY", name: "British Pound / Japanese Yen", market: "forex", category: "cross" },
      { symbol: "GBPCHF", name: "British Pound / Swiss Franc", market: "forex", category: "cross" },
      { symbol: "GBPAUD", name: "British Pound / Australian Dollar", market: "forex", category: "cross" },
      { symbol: "GBPCAD", name: "British Pound / Canadian Dollar", market: "forex", category: "cross" },
      { symbol: "GBPNZD", name: "British Pound / New Zealand Dollar", market: "forex", category: "cross" },
      { symbol: "AUDJPY", name: "Australian Dollar / Japanese Yen", market: "forex", category: "cross" },
      { symbol: "AUDCHF", name: "Australian Dollar / Swiss Franc", market: "forex", category: "cross" },
      { symbol: "AUDCAD", name: "Australian Dollar / Canadian Dollar", market: "forex", category: "cross" },
      { symbol: "AUDNZD", name: "Australian Dollar / New Zealand Dollar", market: "forex", category: "cross" },
      { symbol: "CADJPY", name: "Canadian Dollar / Japanese Yen", market: "forex", category: "cross" },
      { symbol: "CADCHF", name: "Canadian Dollar / Swiss Franc", market: "forex", category: "cross" },
      { symbol: "NZDJPY", name: "New Zealand Dollar / Japanese Yen", market: "forex", category: "cross" },
      { symbol: "NZDCHF", name: "New Zealand Dollar / Swiss Franc", market: "forex", category: "cross" },
      { symbol: "CHFJPY", name: "Swiss Franc / Japanese Yen", market: "forex", category: "cross" },
      { symbol: "EURSEK", name: "Euro / Swedish Krona", market: "forex", category: "cross" },
      { symbol: "EURNOK", name: "Euro / Norwegian Krone", market: "forex", category: "cross" },
      { symbol: "GBPSEK", name: "British Pound / Swedish Krona", market: "forex", category: "cross" },
      { symbol: "GBPNOK", name: "British Pound / Norwegian Krone", market: "forex", category: "cross" },
      
      // Forex - Exotic Pairs
      { symbol: "EURTRY", name: "Euro / Turkish Lira", market: "forex", category: "exotic" },
      { symbol: "EURZAR", name: "Euro / South African Rand", market: "forex", category: "exotic" },
      { symbol: "GBPTRY", name: "British Pound / Turkish Lira", market: "forex", category: "exotic" },
      { symbol: "GBPZAR", name: "British Pound / South African Rand", market: "forex", category: "exotic" },
      { symbol: "USDTHB", name: "US Dollar / Thai Baht", market: "forex", category: "exotic" },
      { symbol: "USDPLN", name: "US Dollar / Polish Zloty", market: "forex", category: "exotic" },
      { symbol: "USDCZK", name: "US Dollar / Czech Koruna", market: "forex", category: "exotic" },
      { symbol: "USDHUF", name: "US Dollar / Hungarian Forint", market: "forex", category: "exotic" },
      
      // Crypto - Major USDT Pairs
      { symbol: "BTCUSDT", name: "Bitcoin / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ETHUSDT", name: "Ethereum / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "BNBUSDT", name: "BNB / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "SOLUSDT", name: "Solana / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ADAUSDT", name: "Cardano / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "XRPUSDT", name: "Ripple / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "DOGEUSDT", name: "Dogecoin / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "DOTUSDT", name: "Polkadot / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "MATICUSDT", name: "Polygon / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "AVAXUSDT", name: "Avalanche / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "LINKUSDT", name: "Chainlink / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "UNIUSDT", name: "Uniswap / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "LTCUSDT", name: "Litecoin / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ATOMUSDT", name: "Cosmos / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ETCUSDT", name: "Ethereum Classic / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "XLMUSDT", name: "Stellar / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ALGOUSDT", name: "Algorand / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "VETUSDT", name: "VeChain / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "FILUSDT", name: "Filecoin / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "TRXUSDT", name: "TRON / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "EOSUSDT", name: "EOS / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "AAVEUSDT", name: "Aave / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "MKRUSDT", name: "Maker / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "COMPUSDT", name: "Compound / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "SUSHIUSDT", name: "SushiSwap / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "CRVUSDT", name: "Curve DAO Token / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "1INCHUSDT", name: "1inch Network / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "YFIUSDT", name: "yearn.finance / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "SNXUSDT", name: "Synthetix / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "GRTUSDT", name: "The Graph / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "THETAUSDT", name: "Theta Network / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ICPUSDT", name: "Internet Computer / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "FTMUSDT", name: "Fantom / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "NEARUSDT", name: "NEAR Protocol / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "APTUSDT", name: "Aptos / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ARBUSDT", name: "Arbitrum / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "OPUSDT", name: "Optimism / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "SUIUSDT", name: "Sui / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "SEIUSDT", name: "Sei / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "TIAUSDT", name: "Celestia / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "INJUSDT", name: "Injective / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "RENDERUSDT", name: "Render Token / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "RNDRUSDT", name: "Render / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "FETUSDT", name: "Fetch.ai / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "AGIXUSDT", name: "SingularityNET / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "OCEANUSDT", name: "Ocean Protocol / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "HBARUSDT", name: "Hedera / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "QNTUSDT", name: "Quant / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "EGLDUSDT", name: "MultiversX / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "ZECUSDT", name: "Zcash / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "DASHUSDT", name: "Dash / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "XMRUSDT", name: "Monero / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "BCHUSDT", name: "Bitcoin Cash / Tether", market: "crypto", category: "cryptocurrency" },
      { symbol: "BSVUSDT", name: "Bitcoin SV / Tether", market: "crypto", category: "cryptocurrency" },
      
      // Crypto - BTC Pairs
      { symbol: "ETHBTC", name: "Ethereum / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "BNBBTC", name: "BNB / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "SOLBTC", name: "Solana / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "ADABTC", name: "Cardano / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "XRPBTC", name: "Ripple / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "DOGEBTC", name: "Dogecoin / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "DOTBTC", name: "Polkadot / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "LINKBTC", name: "Chainlink / Bitcoin", market: "crypto", category: "cryptocurrency" },
      { symbol: "LTCBTC", name: "Litecoin / Bitcoin", market: "crypto", category: "cryptocurrency" },
      
      // Crypto - ETH Pairs
      { symbol: "BNBETH", name: "BNB / Ethereum", market: "crypto", category: "cryptocurrency" },
      { symbol: "SOLETH", name: "Solana / Ethereum", market: "crypto", category: "cryptocurrency" },
      { symbol: "ADAETH", name: "Cardano / Ethereum", market: "crypto", category: "cryptocurrency" },
      
      // Commodities - Precious Metals
      { symbol: "GOLD", name: "Gold", market: "commodities", category: "precious_metal" },
      { symbol: "XAUUSD", name: "Gold / US Dollar", market: "commodities", category: "precious_metal" },
      { symbol: "XAU", name: "Gold Spot", market: "commodities", category: "precious_metal" },
      { symbol: "SILVER", name: "Silver", market: "commodities", category: "precious_metal" },
      { symbol: "XAGUSD", name: "Silver / US Dollar", market: "commodities", category: "precious_metal" },
      { symbol: "XAG", name: "Silver Spot", market: "commodities", category: "precious_metal" },
      { symbol: "PLATINUM", name: "Platinum", market: "commodities", category: "precious_metal" },
      { symbol: "XPTUSD", name: "Platinum / US Dollar", market: "commodities", category: "precious_metal" },
      { symbol: "PALLADIUM", name: "Palladium", market: "commodities", category: "precious_metal" },
      { symbol: "XPDUSD", name: "Palladium / US Dollar", market: "commodities", category: "precious_metal" },
      
      // Commodities - Energy
      { symbol: "OIL", name: "Crude Oil", market: "commodities", category: "energy" },
      { symbol: "WTI", name: "West Texas Intermediate", market: "commodities", category: "energy" },
      { symbol: "CL", name: "Crude Oil Futures", market: "commodities", category: "energy" },
      { symbol: "BRENT", name: "Brent Crude", market: "commodities", category: "energy" },
      { symbol: "BZ", name: "Brent Crude Futures", market: "commodities", category: "energy" },
      { symbol: "NATGAS", name: "Natural Gas", market: "commodities", category: "energy" },
      { symbol: "NG", name: "Natural Gas Futures", market: "commodities", category: "energy" },
      { symbol: "GASOLINE", name: "Gasoline", market: "commodities", category: "energy" },
      { symbol: "RB", name: "Gasoline Futures", market: "commodities", category: "energy" },
      { symbol: "HEATINGOIL", name: "Heating Oil", market: "commodities", category: "energy" },
      { symbol: "HO", name: "Heating Oil Futures", market: "commodities", category: "energy" },
      
      // Commodities - Metals
      { symbol: "COPPER", name: "Copper", market: "commodities", category: "metal" },
      { symbol: "HG", name: "Copper Futures", market: "commodities", category: "metal" },
      { symbol: "ALUMINUM", name: "Aluminum", market: "commodities", category: "metal" },
      { symbol: "ALI", name: "Aluminum Futures", market: "commodities", category: "metal" },
      { symbol: "ZINC", name: "Zinc", market: "commodities", category: "metal" },
      { symbol: "NICKEL", name: "Nickel", market: "commodities", category: "metal" },
      { symbol: "LEAD", name: "Lead", market: "commodities", category: "metal" },
      { symbol: "TIN", name: "Tin", market: "commodities", category: "metal" },
      
      // Commodities - Agricultural
      { symbol: "WHEAT", name: "Wheat", market: "commodities", category: "agricultural" },
      { symbol: "ZW", name: "Wheat Futures", market: "commodities", category: "agricultural" },
      { symbol: "CORN", name: "Corn", market: "commodities", category: "agricultural" },
      { symbol: "ZC", name: "Corn Futures", market: "commodities", category: "agricultural" },
      { symbol: "SOYBEAN", name: "Soybean", market: "commodities", category: "agricultural" },
      { symbol: "ZS", name: "Soybean Futures", market: "commodities", category: "agricultural" },
      { symbol: "SUGAR", name: "Sugar", market: "commodities", category: "agricultural" },
      { symbol: "SB", name: "Sugar Futures", market: "commodities", category: "agricultural" },
      { symbol: "COFFEE", name: "Coffee", market: "commodities", category: "agricultural" },
      { symbol: "KC", name: "Coffee Futures", market: "commodities", category: "agricultural" },
      { symbol: "COTTON", name: "Cotton", market: "commodities", category: "agricultural" },
      { symbol: "CT", name: "Cotton Futures", market: "commodities", category: "agricultural" },
      { symbol: "CATTLE", name: "Live Cattle", market: "commodities", category: "agricultural" },
      { symbol: "LC", name: "Live Cattle Futures", market: "commodities", category: "agricultural" },
      { symbol: "HOGS", name: "Lean Hogs", market: "commodities", category: "agricultural" },
      { symbol: "LH", name: "Lean Hogs Futures", market: "commodities", category: "agricultural" },
      
      // Indices - US
      { symbol: "SPX", name: "S&P 500 Index", market: "indices", category: "index" },
      { symbol: "SPX500", name: "S&P 500", market: "indices", category: "index" },
      { symbol: "NDX", name: "NASDAQ 100 Index", market: "indices", category: "index" },
      { symbol: "DJI", name: "Dow Jones Industrial Average", market: "indices", category: "index" },
      { symbol: "DOW", name: "Dow Jones", market: "indices", category: "index" },
      { symbol: "RUT", name: "Russell 2000 Index", market: "indices", category: "index" },
      { symbol: "VIX", name: "CBOE Volatility Index", market: "indices", category: "index" },
      { symbol: "VIX9D", name: "CBOE 9-Day Volatility Index", market: "indices", category: "index" },
      { symbol: "VIX3M", name: "CBOE 3-Month Volatility Index", market: "indices", category: "index" },
      { symbol: "NDX100", name: "NASDAQ 100", market: "indices", category: "index" },
      { symbol: "RUT2000", name: "Russell 2000", market: "indices", category: "index" },
      
      // Indices - Europe
      { symbol: "FTSE", name: "FTSE 100 Index", market: "indices", category: "index" },
      { symbol: "FTSE100", name: "FTSE 100", market: "indices", category: "index" },
      { symbol: "DAX", name: "DAX Index", market: "indices", category: "index" },
      { symbol: "DAX40", name: "DAX 40", market: "indices", category: "index" },
      { symbol: "CAC", name: "CAC 40 Index", market: "indices", category: "index" },
      { symbol: "CAC40", name: "CAC 40", market: "indices", category: "index" },
      { symbol: "IBEX", name: "IBEX 35 Index", market: "indices", category: "index" },
      { symbol: "IBEX35", name: "IBEX 35", market: "indices", category: "index" },
      { symbol: "AEX", name: "AEX Index", market: "indices", category: "index" },
      { symbol: "SMI", name: "Swiss Market Index", market: "indices", category: "index" },
      { symbol: "MIB", name: "FTSE MIB Index", market: "indices", category: "index" },
      { symbol: "OMX", name: "OMX Stockholm 30", market: "indices", category: "index" },
      
      // Indices - Asia Pacific
      { symbol: "NIKKEI", name: "Nikkei 225 Index", market: "indices", category: "index" },
      { symbol: "N225", name: "Nikkei 225", market: "indices", category: "index" },
      { symbol: "ASX", name: "ASX 200 Index", market: "indices", category: "index" },
      { symbol: "ASX200", name: "ASX 200", market: "indices", category: "index" },
      { symbol: "HSI", name: "Hang Seng Index", market: "indices", category: "index" },
      { symbol: "HANG SENG", name: "Hang Seng", market: "indices", category: "index" },
      { symbol: "SSE", name: "Shanghai Composite Index", market: "indices", category: "index" },
      { symbol: "SZSE", name: "Shenzhen Composite Index", market: "indices", category: "index" },
      { symbol: "KOSPI", name: "KOSPI Index", market: "indices", category: "index" },
      { symbol: "TWII", name: "Taiwan Weighted Index", market: "indices", category: "index" },
      { symbol: "SENSEX", name: "S&P BSE Sensex", market: "indices", category: "index" },
      { symbol: "NIFTY", name: "Nifty 50", market: "indices", category: "index" },
      
      // Indices - Americas
      { symbol: "TSX", name: "S&P/TSX Composite Index", market: "indices", category: "index" },
      { symbol: "BOVESPA", name: "Bovespa Index", market: "indices", category: "index" },
      { symbol: "MEXBOL", name: "Mexican Bolsa IPC", market: "indices", category: "index" },
      
      // Bonds - US Treasury
      { symbol: "US10Y", name: "US 10-Year Treasury", market: "bonds", category: "government_bond" },
      { symbol: "US30Y", name: "US 30-Year Treasury", market: "bonds", category: "government_bond" },
      { symbol: "US2Y", name: "US 2-Year Treasury", market: "bonds", category: "government_bond" },
      { symbol: "US5Y", name: "US 5-Year Treasury", market: "bonds", category: "government_bond" },
      { symbol: "US7Y", name: "US 7-Year Treasury", market: "bonds", category: "government_bond" },
      { symbol: "US20Y", name: "US 20-Year Treasury", market: "bonds", category: "government_bond" },
      { symbol: "TNOTE", name: "10-Year T-Note Futures", market: "bonds", category: "government_bond" },
      { symbol: "ZB", name: "30-Year T-Bond Futures", market: "bonds", category: "government_bond" },
      { symbol: "ZT", name: "2-Year T-Note Futures", market: "bonds", category: "government_bond" },
      { symbol: "ZF", name: "5-Year T-Note Futures", market: "bonds", category: "government_bond" },
      
      // Bonds - International
      { symbol: "BUND", name: "German 10-Year Bund", market: "bonds", category: "government_bond" },
      { symbol: "GILT", name: "UK 10-Year Gilt", market: "bonds", category: "government_bond" },
      { symbol: "BTP", name: "Italian 10-Year BTP", market: "bonds", category: "government_bond" },
      { symbol: "OAT", name: "French 10-Year OAT", market: "bonds", category: "government_bond" },
      { symbol: "JGB", name: "Japanese Government Bond", market: "bonds", category: "government_bond" },
      { symbol: "ACGB", name: "Australian 10-Year Government Bond", market: "bonds", category: "government_bond" },
      { symbol: "CGB", name: "Canadian Government Bond", market: "bonds", category: "government_bond" },
    ];
  
    saveSymbols(symbols);
  }
  
  function loadSymbols() {
    try {
      return JSON.parse(localStorage.getItem(SYMBOLS_STORAGE_KEY) || "[]");
    } catch (e) {
      console.error("Failed to parse symbols from localStorage", e);
      return [];
    }
  }
  
  function saveSymbols(symbols) {
    localStorage.setItem(SYMBOLS_STORAGE_KEY, JSON.stringify(symbols));
  }
  
  function searchSymbols(query) {
    if (!query || query.trim() === "") {
      return [];
    }
    
    const symbols = loadSymbols();
    const lowerQuery = query.toLowerCase().trim();
    
    return symbols.filter(s => 
      s.symbol.toLowerCase().includes(lowerQuery) ||
      s.name.toLowerCase().includes(lowerQuery) ||
      s.market.toLowerCase().includes(lowerQuery)
    ).slice(0, 20); // Limit to 20 results
  }
  
  // Initialize symbols on load
  initializeSymbols();
  
  // ------- Journal with Supabase + localStorage fallback -------
  const JOURNAL_STORAGE_KEY = "tradingdesk:journals";
  let _journalCache = null;
  let _journalLoaded = false;
  
  function loadJournal() {
    // Return cache if available
    if (_journalCache !== null) {
      return _journalCache;
    }
    // Fall back to localStorage for immediate load
    try {
      _journalCache = JSON.parse(localStorage.getItem(JOURNAL_STORAGE_KEY) || "[]");
      return _journalCache;
    } catch (e) {
      console.error("Failed to parse journal from localStorage", e);
      return [];
    }
  }
  
  function saveJournal(list) {
    _journalCache = list;
    // Save to localStorage immediately
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(list));
    
    // Sync new trades to Supabase in background
    if (window.SupabaseSync) {
      // Find trades that don't have a Supabase ID yet
      list.forEach(async (trade) => {
        if (!trade.supabaseId && !trade._syncing) {
          trade._syncing = true;
          try {
            const saved = await window.SupabaseSync.saveTrade(trade);
            if (saved && saved.id) {
              trade.supabaseId = saved.id;
              trade._syncing = false;
              // Update localStorage with supabaseId
              localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(_journalCache));
              console.log(`✓ Trade synced to Supabase: ${trade.symbol}`);
            }
          } catch (e) {
            trade._syncing = false;
            console.warn('Failed to sync trade to Supabase:', e);
          }
        }
      });
    }
  }

  // Async function to sync with Supabase (called on init)
  async function loadJournalFromSupabase() {
    if (window.SupabaseSync && !_journalLoaded) {
      try {
        const trades = await window.SupabaseSync.loadTrades();
        if (trades && trades.length > 0) {
          _journalCache = trades;
          _journalLoaded = true;
          // Also update localStorage as backup
          localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(trades));
          console.log(`✓ Loaded ${trades.length} trades from Supabase`);
          return true;
        }
      } catch (e) {
        console.warn('Could not load from Supabase, using localStorage:', e);
      }
    }
    return false;
  }
  
  // ------- Accounts Storage with Supabase + localStorage fallback -------
  const ACCOUNTS_STORAGE_KEY = "tradingdesk:accounts";
  let _accountsCache = null;
  let _accountsLoaded = false;
  
  function loadAccounts() {
    // Return cache if available
    if (_accountsCache !== null) {
      return _accountsCache;
    }
    // Fall back to localStorage for immediate load
    try {
      _accountsCache = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]");
      return _accountsCache;
    } catch (e) {
      console.error("Failed to parse accounts from localStorage", e);
      return [];
    }
  }
  
  function saveAccounts(accounts) {
    _accountsCache = accounts;
    // Save to localStorage immediately
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    
    // Sync new accounts to Supabase in background
    if (window.SupabaseSync) {
      accounts.forEach(async (account) => {
        if (!account.supabaseId && !account._syncing) {
          account._syncing = true;
          try {
            const saved = await window.SupabaseSync.saveAccount(account);
            if (saved && saved.id) {
              account.supabaseId = saved.id;
              account._syncing = false;
              localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(_accountsCache));
              console.log(`✓ Account synced to Supabase: ${account.name}`);
            }
          } catch (e) {
            account._syncing = false;
            console.warn('Failed to sync account to Supabase:', e);
          }
        }
      });
    }
  }

  // Async function to sync with Supabase (called on init)
  async function loadAccountsFromSupabase() {
    if (window.SupabaseSync && !_accountsLoaded) {
      try {
        const accounts = await window.SupabaseSync.loadAccounts();
        if (accounts && accounts.length > 0) {
          _accountsCache = accounts;
          _accountsLoaded = true;
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
          console.log(`✓ Loaded ${accounts.length} accounts from Supabase`);
          return true;
        }
      } catch (e) {
        console.warn('Could not load accounts from Supabase, using localStorage:', e);
      }
    }
    return false;
  }
  
  // ------- Category Balances Storage -------
  const CATEGORY_BALANCES_KEY = "tradingdesk:category-balances";
  
  function loadCategoryBalances() {
    try {
      return JSON.parse(localStorage.getItem(CATEGORY_BALANCES_KEY) || "{}");
    } catch (e) {
      console.error("Failed to parse category balances from localStorage", e);
      return {};
    }
  }
  
  function saveCategoryBalances(balances) {
    localStorage.setItem(CATEGORY_BALANCES_KEY, JSON.stringify(balances));
  }
  
  function getCategoryBalance(category) {
    const balances = loadCategoryBalances();
    return balances[category] || { initial: 0 };
  }
  
  function setCategoryBalance(category, initialBalance) {
    const balances = loadCategoryBalances();
    balances[category] = { initial: initialBalance };
    saveCategoryBalances(balances);
  }
  
  // Event delegation handler for journal list - set up once
  let journalListHandlerAttached = false;
  
  function renderJournal(list) {
    const listEl = domCache.get("journal-list");
    const emptyEl = domCache.get("journal-empty");
    const countEl = domCache.get("journal-count");
    
    if (listEl) listEl.innerHTML = "";
  
    // Update trade count
    if (countEl) {
      const count = list.length;
      countEl.textContent = `${count} ${count === 1 ? 'trade' : 'trades'}`;
    }
  
    if (!listEl || !emptyEl) return;
    
    // Set up event delegation once (not on every render)
    if (!journalListHandlerAttached && listEl) {
      listEl.addEventListener("click", handleJournalListClick);
      journalListHandlerAttached = true;
    }
  
    if (!list.length) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";
  
    // Load accounts to get account names
    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem("tradingdesk:accounts") || "[]");
    } catch (e) {
      // Ignore
    }
  
    list.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className =
        "rounded-xl bg-black/40 border border-[#38304d] px-3 py-2 flex flex-col gap-1";
  
      const accountName = item.accountId 
        ? (accounts.find(a => a.id === item.accountId)?.name || "Unknown")
        : "";
  
      // Direction indicator
      let directionIndicator = "";
      if (item.direction === "long") {
        directionIndicator = `
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            <span class="text-[9px] text-emerald-400 font-medium">Long</span>
          </div>
        `;
      } else if (item.direction === "short") {
        directionIndicator = `
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            <span class="text-[9px] text-rose-400 font-medium">Short</span>
          </div>
        `;
      }
  
      // Result indicator
      let resultIndicator = "";
      if (item.result === "win") {
        resultIndicator = `
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-300">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="text-[10px] text-emerald-300 font-medium">Win</span>
          </div>
        `;
      } else if (item.result === "loss") {
        resultIndicator = `
          <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-rose-300">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="text-[10px] text-rose-300 font-medium">Loss</span>
          </div>
        `;
      }
  
      row.innerHTML = `
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-200 font-medium">${sanitizeHTML(item.instrument)}</span>
            ${directionIndicator}
            ${resultIndicator}
          </div>
          <span class="text-[10px] text-slate-500">${sanitizeHTML(item.time)}</span>
        </div>
        <div class="text-[11px] text-slate-300">
          Entry: ${sanitizeHTML(item.plan.entry || "-")} · SL: ${sanitizeHTML(item.plan.sl || "-")} · TP: ${
        sanitizeHTML(item.plan.tp || "-")
      }${item.pnl !== undefined && typeof item.pnl === 'number' ? ` · P&L: <span class="${item.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${item.pnl.toFixed(2)}</span>` : ""}
        </div>
        ${(item.plan.leverage || item.plan.lots) ? `<div class="text-[10px] text-slate-400">${item.plan.leverage ? `Leverage: ${sanitizeHTML(item.plan.leverage)}` : ""}${item.plan.leverage && item.plan.lots ? " · " : ""}${item.plan.lots ? `Lots: ${sanitizeHTML(item.plan.lots)}` : ""}</div>` : ""}
        ${item.accountId ? `<div class="text-[10px] text-slate-500">Account: ${sanitizeHTML(accountName)}</div>` : ""}
        <div class="text-[11px] text-slate-400 whitespace-pre-line">${
          sanitizeHTML(item.notes || "")
        }</div>
        <div class="flex justify-end gap-2 mt-1">
          <button
            data-index="${idx}"
            data-action="edit"
            class="text-[10px] text-sky-300 hover:text-sky-400"
          >
            edit
          </button>
          <button
            data-index="${idx}"
            data-action="delete"
            class="text-[10px] text-rose-300 hover:text-rose-400"
          >
            delete
          </button>
        </div>
      `;
  
      listEl.appendChild(row);
    });
  
  }
  
  // Event delegation handler for journal list
  function handleJournalListClick(e) {
    const btn = e.target.closest("button[data-index]");
    if (!btn) return;
    
    const i = Number(btn.dataset.index);
    const action = btn.dataset.action;
    const list = loadJournal();
    
    if (action === "delete") {
      if (!confirm("Delete this trade?")) return;
      const updated = [...list.slice(0, i), ...list.slice(i + 1)];
      saveJournal(updated);
      renderJournal(updated);
      return;
    }
    if (action === "edit") {
      const updatedEntry = { ...list[i] };
      const newNotes = prompt(
        "Edit journal notes:",
        updatedEntry.notes || ""
      );
      if (newNotes === null) return;
      updatedEntry.notes = newNotes;
      const updated = [...list];
      updated[i] = updatedEntry;
      saveJournal(updated);
      renderJournal(updated);
    }
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    // ------- Initialize Supabase Sync -------
    console.log('🔄 Initializing Supabase sync...');
    
    // Load data from Supabase in background
    if (window.SupabaseSync) {
      try {
        const [accountsLoaded, tradesLoaded] = await Promise.all([
          loadAccountsFromSupabase(),
          loadJournalFromSupabase()
        ]);
        
        if (accountsLoaded || tradesLoaded) {
          console.log('✅ Supabase sync complete - refreshing UI');
          // Refresh UI with loaded data
          setTimeout(() => {
            if (typeof renderJournalTable === 'function') renderJournalTable();
            if (typeof populateAccountDropdowns === 'function') populateAccountDropdowns();
            if (typeof renderAccountManager === 'function') renderAccountManager();
            if (typeof renderFinanceDashboard === 'function') renderFinanceDashboard();
          }, 100);
        }
      } catch (e) {
        console.warn('Supabase sync failed, using localStorage:', e);
      }
    }
    
    // ------- Section navigation (sidebar -> "pages") -------
    const sectionLinks = document.querySelectorAll("[data-section-nav]");
    const sectionPanels = document.querySelectorAll("[data-section-panel]");
  
    let previousSection = "prep"; // Track previous section for Daily Prep auto-save
    let currentStatsPeriod = "all"; // Track current statistics period
  
    function setActiveSection(name) {
      // No auto-save - user controls when to save via Done button
      previousSection = name;
  
      sectionPanels.forEach((panel) => {
        const id = panel.getAttribute("data-section-panel");
        if (id === name) {
          panel.classList.remove("hidden");
        } else {
          panel.classList.add("hidden");
        }
      });
  
      sectionLinks.forEach((link) => {
        const target = link.getAttribute("data-section-nav");
        const dot = link.querySelector(".section-dot");
        const stepNumber = link.querySelector("span[class*='rounded-md']");
        
        if (target === name) {
          link.classList.add("bg-[#181818]", "text-slate-100");
          if (dot) {
            dot.classList.remove("bg-slate-600");
            dot.classList.add("bg-emerald-400");
          }
          // Highlight numbered workflow steps
          if (stepNumber) {
            stepNumber.classList.remove("bg-slate-800", "text-slate-500");
            stepNumber.classList.add("bg-emerald-500/20", "text-emerald-400");
          }
        } else {
          link.classList.remove("bg-[#181818]", "text-slate-100");
          if (dot) {
            dot.classList.remove("bg-emerald-400");
            dot.classList.add("bg-slate-600");
          }
          // Reset numbered workflow steps
          if (stepNumber) {
            stepNumber.classList.remove("bg-emerald-500/20", "text-emerald-400");
            stepNumber.classList.add("bg-slate-800", "text-slate-500");
          }
        }
      });
      
      // Render analysis when analysis section is shown
      if (name === "analysis") {
        setTimeout(() => {
          if (typeof renderTradingHeatmap === 'function') renderTradingHeatmap();
          if (typeof renderAdvancedStats === 'function') renderAdvancedStats();
          if (typeof renderStrategyPerformance === 'function') renderStrategyPerformance();
          if (typeof updateAccountBalanceChart === 'function') updateAccountBalanceChart();
        }, 100);
      }
      
      // Render calendar when screenshots section is shown
      if (name === "screenshots") {
        setTimeout(() => {
          renderCalendar();
        }, 100);
      }
      
      // Render statistics dashboard when review section is shown
      if (name === "review" && window.renderStatisticsDashboard) {
        setTimeout(() => {
          window.renderStatisticsDashboard(currentStatsPeriod);
        }, 100);
      }
      
      // Initialize risk management tools and goals when finance section is shown
      if (name === "finance") {
        setTimeout(() => {
          if (window.populateRiskAccountSelector) {
            window.populateRiskAccountSelector();
          }
          if (window.renderDrawdownTracker) {
            window.renderDrawdownTracker();
          }
          if (window.renderDailyLossTracker) {
            window.renderDailyLossTracker();
          }
          if (window.renderGoals) {
            window.renderGoals();
          }
        }, 100);
      }
    }
  
    sectionLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("data-section-nav");
        if (target) setActiveSection(target);
      });
    });
  
    // How to section navigation - clickable cards that navigate to sections
    const howtoNavItems = document.querySelectorAll("[data-howto-nav]");
    howtoNavItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const target = item.getAttribute("data-howto-nav");
        if (target) {
          setActiveSection(target);
          // Scroll to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  
    // ensure initial state is Daily Prep
    setActiveSection("prep");
  
    // Journal init - use filtered journal to respect stored global filter
    let journal = getFilteredJournal();
    renderJournal(journal);
  
    // ------- Instrument Autocomplete -------
    const instrumentInput = document.getElementById("trade-instrument");
    const autocompleteDropdown = document.getElementById("instrument-autocomplete");
    let selectedIndex = -1;
    let currentSuggestions = [];
  
    function renderAutocompleteSuggestions(suggestions) {
      if (!suggestions || suggestions.length === 0) {
        autocompleteDropdown.classList.add("hidden");
        return;
      }
  
      autocompleteDropdown.innerHTML = "";
      currentSuggestions = suggestions;
  
      suggestions.forEach((symbol, index) => {
        const item = document.createElement("div");
        item.className = `px-3 py-2 text-[12px] cursor-pointer hover:bg-[#181818] border-b border-[#161616] last:border-b-0 ${
          index === selectedIndex ? "bg-[#181818]" : ""
        }`;
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <div class="text-slate-200 font-medium">${sanitizeHTML(symbol.symbol)}</div>
              <div class="text-[10px] text-slate-400">${sanitizeHTML(symbol.name)}</div>
            </div>
            <span class="text-[10px] text-slate-500 uppercase">${sanitizeHTML(symbol.market)}</span>
          </div>
        `;
        item.addEventListener("click", () => {
          instrumentInput.value = symbol.symbol;
          autocompleteDropdown.classList.add("hidden");
          selectedIndex = -1;
          instrumentInput.focus();
        });
        autocompleteDropdown.appendChild(item);
      });
  
      autocompleteDropdown.classList.remove("hidden");
    }
  
    instrumentInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (query.length < 1) {
        autocompleteDropdown.classList.add("hidden");
        selectedIndex = -1;
        return;
      }
  
      const suggestions = searchSymbols(query);
      renderAutocompleteSuggestions(suggestions);
      selectedIndex = -1;
    });
  
    instrumentInput.addEventListener("keydown", (e) => {
      if (!autocompleteDropdown.classList.contains("hidden") && currentSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
          renderAutocompleteSuggestions(currentSuggestions);
          const items = autocompleteDropdown.querySelectorAll("div");
          if (items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ block: "nearest" });
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          renderAutocompleteSuggestions(currentSuggestions);
        } else if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault();
          instrumentInput.value = currentSuggestions[selectedIndex].symbol;
          autocompleteDropdown.classList.add("hidden");
          selectedIndex = -1;
        } else if (e.key === "Escape") {
          autocompleteDropdown.classList.add("hidden");
          selectedIndex = -1;
        }
      }
    });
  
    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!instrumentInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
        autocompleteDropdown.classList.add("hidden");
        selectedIndex = -1;
      }
    });
  
    // ------- Prep Instrument Autocomplete -------
    const prepInstrumentInput = document.getElementById("prep-instrument");
    const prepAutocompleteDropdown = document.getElementById("prep-instrument-autocomplete");
    let prepSelectedIndex = -1;
    let prepCurrentSuggestions = [];
  
    function renderPrepAutocompleteSuggestions(suggestions) {
      if (!prepAutocompleteDropdown) return;
      
      if (!suggestions || suggestions.length === 0) {
        prepAutocompleteDropdown.classList.add("hidden");
        return;
      }
  
      prepAutocompleteDropdown.innerHTML = "";
      prepCurrentSuggestions = suggestions;
  
      suggestions.forEach((symbol, index) => {
        const item = document.createElement("div");
        item.className = `px-3 py-2 text-[12px] cursor-pointer hover:bg-[#181818] border-b border-[#161616] last:border-b-0 ${
          index === prepSelectedIndex ? "bg-[#181818]" : ""
        }`;
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <div class="text-slate-200 font-medium">${sanitizeHTML(symbol.symbol)}</div>
              <div class="text-[10px] text-slate-400">${sanitizeHTML(symbol.name)}</div>
            </div>
            <span class="text-[10px] text-slate-500 uppercase">${sanitizeHTML(symbol.market)}</span>
          </div>
        `;
        item.addEventListener("click", () => {
          prepInstrumentInput.value = symbol.symbol;
          prepAutocompleteDropdown.classList.add("hidden");
          prepSelectedIndex = -1;
          prepInstrumentInput.focus();
        });
        prepAutocompleteDropdown.appendChild(item);
      });
  
      prepAutocompleteDropdown.classList.remove("hidden");
    }
  
    if (prepInstrumentInput && prepAutocompleteDropdown) {
      prepInstrumentInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        if (query.length < 1) {
          prepAutocompleteDropdown.classList.add("hidden");
          prepSelectedIndex = -1;
          return;
        }
  
        const suggestions = searchSymbols(query);
        renderPrepAutocompleteSuggestions(suggestions);
        prepSelectedIndex = -1;
      });
  
      prepInstrumentInput.addEventListener("keydown", (e) => {
        if (!prepAutocompleteDropdown.classList.contains("hidden") && prepCurrentSuggestions.length > 0) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            prepSelectedIndex = Math.min(prepSelectedIndex + 1, prepCurrentSuggestions.length - 1);
            renderPrepAutocompleteSuggestions(prepCurrentSuggestions);
            const items = prepAutocompleteDropdown.querySelectorAll("div");
            if (items[prepSelectedIndex]) {
              items[prepSelectedIndex].scrollIntoView({ block: "nearest" });
            }
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            prepSelectedIndex = Math.max(prepSelectedIndex - 1, -1);
            renderPrepAutocompleteSuggestions(prepCurrentSuggestions);
          } else if (e.key === "Enter" && prepSelectedIndex >= 0) {
            e.preventDefault();
            prepInstrumentInput.value = prepCurrentSuggestions[prepSelectedIndex].symbol;
            prepAutocompleteDropdown.classList.add("hidden");
            prepSelectedIndex = -1;
          } else if (e.key === "Escape") {
            prepAutocompleteDropdown.classList.add("hidden");
            prepSelectedIndex = -1;
          }
        }
      });
  
      // Hide dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!prepInstrumentInput.contains(e.target) && !prepAutocompleteDropdown.contains(e.target)) {
          prepAutocompleteDropdown.classList.add("hidden");
          prepSelectedIndex = -1;
        }
      });
    }
  
    const btnSave = document.getElementById("btn-save-trade");
    const btnClear = document.getElementById("btn-clear-journal");
    const btnDownload = document.getElementById("btn-download-journal");
    const btnDownloadImage = document.getElementById(
      "btn-download-journal-image"
    );
    const btnDownloadDayImage = document.getElementById(
      "btn-download-day-image"
    );
  
    // helper to capture the full page as an image
    function captureFullDayScreenshot() {
      if (!window.html2canvas) return;
      const target = document.body;
      if (!target) return;
  
      // Wait for fonts to load before capturing
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          captureScreenshot();
        });
      } else {
        // Fallback: wait a bit for fonts to load
        setTimeout(captureScreenshot, 500);
      }
  
      function captureScreenshot() {
        window.html2canvas(target, {
          backgroundColor: "#000000",
          scale: window.devicePixelRatio || 2,
          scrollY: -window.scrollY,
          useCORS: true,
          allowTaint: false,
          logging: false,
          foreignObjectRendering: true,
          onclone: (clonedDoc) => {
            // Ensure fonts are applied in cloned document
            const clonedBody = clonedDoc.body;
            clonedBody.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            
            // Fix all input fields to ensure text is visible
            const inputs = clonedDoc.querySelectorAll('input[type="text"], input:not([type]), textarea, select');
            inputs.forEach((input) => {
              // Force explicit color for text visibility
              input.style.color = '#f1f5f9'; // text-slate-100 equivalent
              input.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
              input.style.fontSize = '12px';
              input.style.webkitTextFillColor = '#f1f5f9';
              input.style.webkitTextStrokeColor = 'transparent';
              
              // Make inputs readonly temporarily so html2canvas can capture their values
              if (input.tagName !== 'SELECT' && input.tagName !== 'TEXTAREA') {
                input.setAttribute('readonly', 'readonly');
              }
              
              // For textareas, also make readonly
              if (input.tagName === 'TEXTAREA') {
                input.setAttribute('readonly', 'readonly');
              }
              
              // Create a visible overlay div with the input value for better capture
              if (input.value && input.value.trim()) {
                // Hide the original input to prevent overlap
                input.style.color = 'transparent';
                input.style.webkitTextFillColor = 'transparent';
                input.style.caretColor = 'transparent';
                
                const overlay = clonedDoc.createElement('div');
                overlay.textContent = input.value;
                overlay.style.position = 'absolute';
                overlay.style.left = '0';
                overlay.style.top = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.color = '#f1f5f9';
                overlay.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                overlay.style.fontSize = '12px';
                overlay.style.padding = '8px 12px';
                overlay.style.display = 'flex';
                overlay.style.alignItems = input.tagName === 'TEXTAREA' ? 'flex-start' : 'center';
                overlay.style.pointerEvents = 'none';
                overlay.style.zIndex = '9999';
                overlay.style.backgroundColor = 'transparent';
                overlay.style.whiteSpace = input.tagName === 'TEXTAREA' ? 'pre-wrap' : 'nowrap';
                overlay.style.overflow = 'hidden';
                overlay.style.textOverflow = 'ellipsis';
                
                const parent = input.parentElement;
                if (parent) {
                  parent.style.position = 'relative';
                  parent.appendChild(overlay);
                }
              }
              
              // For select elements, ensure options are visible
              if (input.tagName === 'SELECT') {
                const options = input.querySelectorAll('option');
                options.forEach((opt) => {
                  opt.style.color = '#f1f5f9';
                  opt.style.backgroundColor = '#000000';
                });
              }
            });
            
            // Also ensure all text elements have proper color
            const allTextElements = clonedDoc.querySelectorAll('span, p, div, label, h1, h2, h3, h4, h5, h6');
            allTextElements.forEach((el) => {
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.color === 'rgb(241, 245, 249)' || el.classList.contains('text-slate-100') || el.classList.contains('text-white')) {
                el.style.color = '#f1f5f9';
              }
            });
          },
        }).then((canvas) => {
          const link = document.createElement("a");
          const ts = new Date().toISOString().slice(0, 10);
          const imageData = canvas.toDataURL("image/png");
          link.href = imageData;
          link.download = `trading-desk-day-${ts}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Save to vault
          saveScreenshotToVault(imageData, ts, "full-day", { label: `Full Day - ${ts}` });
        }).catch((err) => {
          console.error("Screenshot failed:", err);
          alert("Failed to capture screenshot. Please try again.");
        });
      }
    }
  
    // Calculate P&L based on Win/Loss and Direction
    const btnTradeWin = document.getElementById("btn-trade-win");
    const btnTradeLoss = document.getElementById("btn-trade-loss");
    const btnDirectionLong = document.getElementById("btn-direction-long");
    const btnDirectionShort = document.getElementById("btn-direction-short");
    const planPnlInput = document.getElementById("plan-pnl");
    const planEntryInput = document.getElementById("plan-entry");
    const planSlInput = document.getElementById("plan-sl");
    const planTpInput = document.getElementById("plan-tp");
    const planSizeInput = document.getElementById("plan-size");
    
    // Track selected direction
    let selectedDirection = null; // 'long' or 'short'
    
    // Direction button handlers
    function setDirection(direction) {
      selectedDirection = direction;
      
      // Update button styles
      if (btnDirectionLong && btnDirectionShort) {
        // Reset both buttons
        btnDirectionLong.classList.remove("bg-emerald-500/20", "text-emerald-300", "border-emerald-500/50");
        btnDirectionLong.classList.add("bg-black/40", "text-slate-400", "border-emerald-500/30");
        btnDirectionShort.classList.remove("bg-rose-500/20", "text-rose-300", "border-rose-500/50");
        btnDirectionShort.classList.add("bg-black/40", "text-slate-400", "border-rose-500/30");
        
        // Highlight selected
        if (direction === 'long') {
          btnDirectionLong.classList.remove("bg-black/40", "text-slate-400", "border-emerald-500/30");
          btnDirectionLong.classList.add("bg-emerald-500/20", "text-emerald-300", "border-emerald-500/50");
        } else if (direction === 'short') {
          btnDirectionShort.classList.remove("bg-black/40", "text-slate-400", "border-rose-500/30");
          btnDirectionShort.classList.add("bg-rose-500/20", "text-rose-300", "border-rose-500/50");
        }
      }
    }
    
    if (btnDirectionLong) {
      btnDirectionLong.addEventListener("click", () => setDirection('long'));
    }
    if (btnDirectionShort) {
      btnDirectionShort.addEventListener("click", () => setDirection('short'));
    }
  
    function calculateTradePnL(isWin) {
      try {
        if (!planEntryInput || !planSlInput || !planTpInput || !planPnlInput) {
          return false;
        }
        
        if (!selectedDirection) {
          return false;
        }
        
        const entry = validateNumber(planEntryInput.value, { min: 0.00000001 });
        const sl = validateNumber(planSlInput.value, { min: 0, allowEmpty: true });
        const tp = validateNumber(planTpInput.value, { min: 0, allowEmpty: true });
        const size = validateNumber(planSizeInput?.value, { min: 0, defaultValue: 0 });
        
        // Get lots (for Forex)
        const lotsInput = document.getElementById("plan-lots");
        const lots = lotsInput ? parseFloat(lotsInput.value) || 0 : 0;
        
        // Get leverage - parse from formats like "1:100", "100x", "100", or just a number
        const leverageInput = document.getElementById("plan-leverage");
        let leverage = 1;
        if (leverageInput && leverageInput.value) {
          const leverageText = leverageInput.value.trim();
          // Handle formats: "1:100", "100x", "100"
          if (leverageText.includes(':')) {
            const parts = leverageText.split(':');
            leverage = parseFloat(parts[1]) || 1;
          } else if (leverageText.toLowerCase().endsWith('x')) {
            leverage = parseFloat(leverageText.slice(0, -1)) || 1;
          } else {
            leverage = parseFloat(leverageText) || 1;
          }
        }
        
        if (!entry || entry <= 0) {
          return false;
        }
  
        let pnl = 0;
        const isLong = selectedDirection === 'long';
        const exitPrice = isWin ? tp : sl;
        
        if (!exitPrice || exitPrice <= 0) {
          return false;
        }
        
        // Determine calculation method based on available inputs
        const instrument = document.getElementById("trade-instrument")?.value?.trim().toUpperCase() || "";
        const isForex = isForexPair(instrument);
        const isJPYPair = instrument.includes("JPY");
        
        if (lots > 0 && isForex) {
          // FOREX calculation with lots
          // Standard lot = 100,000 units
          // 1 pip = 0.0001 for most pairs, 0.01 for JPY pairs
          const contractSize = 100000; // Standard lot size
          const priceDiff = isLong ? (exitPrice - entry) : (entry - exitPrice);
          
          if (isJPYPair) {
            // JPY pairs: pip = 0.01, pip value different
            // P&L = price_diff * lots * contract_size / exit_price (for USD account)
            pnl = priceDiff * lots * contractSize / exitPrice;
          } else {
            // Standard pairs (EUR/USD, GBP/USD, etc.)
            // P&L = price_diff * lots * contract_size
            pnl = priceDiff * lots * contractSize;
          }
          
          // Apply leverage if provided (some brokers apply leverage differently)
          // For Forex, leverage usually affects margin, not P&L directly
          // But if user wants to factor it in, we can do so
        } else if (lots > 0) {
          // Non-Forex with lots (futures, etc.)
          // Simple calculation: P&L = price_diff * lots * multiplier
          // For simplicity, using lots as contract multiplier
          const priceDiff = isLong ? (exitPrice - entry) : (entry - exitPrice);
          pnl = priceDiff * lots * 100; // Default multiplier for futures-style
        } else if (size > 0) {
          // Crypto/Stock style calculation with position size and leverage
          // P&L = Price Change % × Position Size × Leverage
          const priceChangePercent = isLong 
            ? (exitPrice - entry) / entry 
            : (entry - exitPrice) / entry;
          pnl = priceChangePercent * size * leverage;
        } else {
          return false;
        }
  
        planPnlInput.value = pnl.toFixed(2);
        
        // Visual feedback - update input styling
        planPnlInput.classList.remove("border-emerald-500", "border-rose-500", "text-emerald-300", "text-rose-300");
        if (pnl > 0) {
          planPnlInput.classList.add("border-emerald-500", "text-emerald-300");
        } else if (pnl < 0) {
          planPnlInput.classList.add("border-rose-500", "text-rose-300");
        }
        
        return true;
      } catch (err) {
        console.error("Error in calculateTradePnL:", err);
        return false;
      }
    }
    
    // Helper function to check if instrument is a Forex pair
    function isForexPair(instrument) {
      if (!instrument) return false;
      const forexPairs = [
        'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
        'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'AUDJPY', 'CADJPY', 'CHFJPY',
        'EURAUD', 'EURCAD', 'EURNZD', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
        'AUDCAD', 'AUDCHF', 'AUDNZD', 'CADCHF', 'NZDCAD', 'NZDCHF', 'NZDJPY',
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
        'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY'
      ];
      const normalizedInstrument = instrument.replace(/[^A-Z]/gi, '').toUpperCase();
      return forexPairs.some(pair => pair.replace('/', '') === normalizedInstrument);
    }
    
    // Function to get selected direction
    function getSelectedDirection() {
      return selectedDirection;
    }
    
    // Function to reset direction (for clearing form)
    function resetDirection() {
      selectedDirection = null;
      if (btnDirectionLong && btnDirectionShort) {
        btnDirectionLong.classList.remove("bg-emerald-500/20", "text-emerald-300", "border-emerald-500/50");
        btnDirectionLong.classList.add("bg-black/40", "text-slate-400", "border-emerald-500/30");
        btnDirectionShort.classList.remove("bg-rose-500/20", "text-rose-300", "border-rose-500/50");
        btnDirectionShort.classList.add("bg-black/40", "text-slate-400", "border-rose-500/30");
      }
    }
  
    // Function to automatically journalize trade when Win/Loss is clicked
    function autoJournalizeTrade(isWin) {
      const instrumentInput = document.getElementById("trade-instrument");
      const instrument = instrumentInput?.value.trim();
      if (!instrument) {
        // Highlight the instrument field and scroll to it
        if (instrumentInput) {
          instrumentInput.classList.add("border-rose-500", "animate-pulse");
          instrumentInput.focus();
          instrumentInput.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            instrumentInput.classList.remove("border-rose-500", "animate-pulse");
          }, 3000);
        }
        alert("Fyll inn instrument/setup først (f.eks. 'BTCUSDT')");
        return;
      }
      
      // Check if direction is selected
      const direction = getSelectedDirection();
      if (!direction) {
        // Highlight direction buttons
        const directionSection = document.querySelector('[data-param="direction"]');
        if (directionSection) {
          directionSection.classList.add("ring-2", "ring-rose-500", "ring-opacity-50", "rounded-lg");
          directionSection.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            directionSection.classList.remove("ring-2", "ring-rose-500", "ring-opacity-50", "rounded-lg");
          }, 3000);
        }
        alert("Velg retning (Long eller Short) først");
        return;
      }
  
      const ideaNotes = validateText(document.getElementById("trade-notes")?.value, { maxLength: 5000 }) || "";
      const journalNotes = validateText(document.getElementById("journal-notes")?.value, { maxLength: 5000 }) || "";
      const entry = validateText(document.getElementById("plan-entry")?.value, { maxLength: 50 }) || "";
      const sl = validateText(document.getElementById("plan-sl")?.value, { maxLength: 50 }) || "";
      const tp = validateText(document.getElementById("plan-tp")?.value, { maxLength: 50 }) || "";
      const accountId = validateText(document.getElementById("plan-account")?.value, { maxLength: 100 }) || "";
      const pnl = validateNumber(document.getElementById("plan-pnl")?.value, { defaultValue: 0 });
      const size = validateNumber(document.getElementById("plan-size")?.value, { min: 0, defaultValue: 0 });
      const leverage = validateText(document.getElementById("plan-leverage")?.value, { maxLength: 20 }) || "";
      const lotsValue = document.getElementById("plan-lots")?.value?.trim();
      const lots = lotsValue ? validateNumber(lotsValue, { min: 0 }) : null;
  
      // Skip screenshot capture - user can download manually via Done button
      const today = new Date().toISOString().slice(0, 10);
      const screenshotId = null; // No screenshot saved to storage
      
      // Proceed with saving the trade
      // Get the latest P&L value from the input (calculatePnL was already called in click handler)
      const finalPnl = parseFloat(document.getElementById("plan-pnl")?.value) || pnl || 0;
      
      saveTradeToJournal(instrument, ideaNotes, journalNotes, entry, sl, tp, accountId, finalPnl, size, isWin ? "win" : "loss", leverage, lots, screenshotId, direction);
      
      // Show success feedback
      showTradeSuccessToast(isWin, instrument, finalPnl);
    }
    
    // Show success toast when trade is logged
    function showTradeSuccessToast(isWin, instrument, pnl) {
      // Remove existing toast if any
      const existingToast = document.getElementById("trade-success-toast");
      if (existingToast) existingToast.remove();
      
      const toast = document.createElement("div");
      toast.id = "trade-success-toast";
      toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-4 opacity-0 ${
        isWin 
          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" 
          : "bg-rose-500/20 border-rose-500/30 text-rose-300"
      }`;
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full ${isWin ? 'bg-emerald-500/30' : 'bg-rose-500/30'} flex items-center justify-center">
            ${isWin 
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
            }
          </div>
          <div>
            <div class="font-medium text-[13px]">${isWin ? 'Trade Won!' : 'Trade Lost'}</div>
            <div class="text-[11px] opacity-80">${instrument} • ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</div>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      
      // Animate in
      requestAnimationFrame(() => {
        toast.classList.remove("translate-y-4", "opacity-0");
      });
      
      // Remove after 4 seconds
      setTimeout(() => {
        toast.classList.add("translate-y-4", "opacity-0");
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  
    // Function to capture screenshot of Trade Checklist section
    function captureChecklistScreenshot(callback) {
      if (!window.html2canvas) {
        if (callback) callback(null);
        return;
      }
  
      const checklistSection = document.getElementById("checklist");
      if (!checklistSection) {
        if (callback) callback(null);
        return;
      }
  
      // Wait a moment for any UI updates
      setTimeout(() => {
        window.html2canvas(checklistSection, {
          backgroundColor: "#050505",
          scale: window.devicePixelRatio || 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          foreignObjectRendering: true,
          onclone: (clonedDoc) => {
            // Ensure fonts are applied
            const clonedSection = clonedDoc.getElementById("checklist");
            if (clonedSection) {
              clonedSection.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            }
            
            // Fix input fields visibility
            const inputs = clonedDoc.querySelectorAll('input, textarea, select');
            inputs.forEach((input) => {
              input.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
              input.style.fontSize = '12px';
              
              if (input.tagName !== 'SELECT') {
                input.setAttribute('readonly', 'readonly');
              }
              
              if (input.value && input.value.trim()) {
                input.style.color = '#f1f5f9';
                input.style.webkitTextFillColor = '#f1f5f9';
              }
            });
          },
        }).then((canvas) => {
          // Use JPEG with compression to save storage space
          const imageData = canvas.toDataURL("image/jpeg", 0.8);
          if (callback) callback(imageData);
        }).catch((err) => {
          console.error("Checklist screenshot failed:", err);
          if (callback) callback(null);
        });
      }, 200);
    }
  
    // Function to capture and save Daily Prep - DISABLED to prevent storage
    // Screenshots are now only downloaded locally via Done button
    function captureAndSaveDailyPrep() {
      // Do nothing - no longer saving to storage
      return;
    }
  
    // Function to save trade to journal
    function saveTradeToJournal(instrument, ideaNotes, journalNotes, entry, sl, tp, categoryOrAccountId, pnl, size, tradeResult, leverage, lots, checklistScreenshotId = null, direction = null, setupId = null) {
      // Capture checklist data
      const checklistData = captureChecklistData();
      
      // Get setup ID if not provided
      const selectedSetupId = setupId || window.getSelectedSetupId?.() || null;
  
      // Determine if this is a category or an old accountId
      const validCategories = ['crypto', 'forex', 'stocks', 'futures', 'options'];
      let category = null;
      let accountId = null;
      
      if (validCategories.includes(categoryOrAccountId)) {
        category = categoryOrAccountId;
      } else {
        // Backwards compatibility: it's an accountId
        accountId = categoryOrAccountId;
        // Try to get category from account
        const account = accounts.find(a => a.id === accountId);
        if (account) category = account.category;
      }
  
      const item = {
        id: Date.now().toString(),
        instrument,
        time: new Date().toLocaleString(),
        timestamp: new Date().toISOString(),
        direction: direction || null, // 'long' or 'short'
        plan: { entry, sl, tp, size, leverage: leverage || null, lots: lots || null },
        notes: [ideaNotes, journalNotes].filter(Boolean).join("\n\n"),
        category: category || null, // New: category-based tracking
        accountId: accountId || null, // Backwards compatibility
        pnl: pnl || 0,
        result: tradeResult,
        checklist: checklistData,
        setupId: selectedSetupId, // Link to Playbook setup
      };
  
      let journal = loadJournal();
      journal = [item, ...journal];
      saveJournal(journal);
      renderJournal(journal);
      renderAccounts(); // Update account balances
      updateAccountBalanceDisplay(); // Update balance display
      
      // Clear setup selection after saving trade
      if (window.clearSetupSelection) window.clearSetupSelection();
  
      // Save journal entry to vault archive
      saveJournalToVault(item);
      
      // Link trade to daily archive
      const today = new Date().toISOString().slice(0, 10);
      const archive = getOrCreateDailyArchive(today);
      
      // Update screenshot with tradeId if checklist screenshot was captured
      if (checklistScreenshotId) {
        const screenshotIndex = archive.screenshots.findIndex(s => s.id === checklistScreenshotId);
        if (screenshotIndex !== -1) {
          archive.screenshots[screenshotIndex].tradeId = item.id;
        }
      }
      
      // Add trade to archive (avoid duplicates)
      const tradeExists = archive.trades.some(t => t.id === item.id);
      if (!tradeExists) {
        archive.trades.push(item);
        archive.summary = calculateDailySummary(archive.trades);
        updateDailyArchive(today, archive);
      } else {
        // Just update the screenshot tradeId if needed
        if (checklistScreenshotId) {
          updateDailyArchive(today, archive);
        }
      }
      
      // Update trade reviews to show new trade
      if (window.renderTradeReviews && typeof window.renderTradeReviews === 'function') {
        window.renderTradeReviews();
      }
      
      // Update daily archives
      if (window.renderDailyArchives) {
        window.renderDailyArchives();
      }
      
      // Update statistics dashboard
      if (window.renderStatisticsDashboard) {
        window.renderStatisticsDashboard();
      }
      
      // Update goals progress
      if (window.renderGoals) {
        window.renderGoals();
      }
      
      // Update risk management tools
      if (window.renderDrawdownTracker) {
        window.renderDrawdownTracker();
      }
      if (window.renderDailyLossTracker) {
        window.renderDailyLossTracker();
      }
      
      // Update calendar if screenshots section is visible
      const screenshotsSection = document.getElementById("screenshots");
      if (screenshotsSection && !screenshotsSection.classList.contains("hidden")) {
        setTimeout(() => renderCalendar(), 200);
      }
  
      // Show confirmation
      const resultText = tradeResult === "win" ? "Win" : "Loss";
      const pnlText = pnl !== 0 ? ` (P&L: $${pnl.toFixed(2)})` : "";
      // Trade journalized successfully
  
      // Reset form after a short delay
      setTimeout(() => {
        // Clear form fields but keep account selection
        document.getElementById("trade-instrument").value = "";
        document.getElementById("trade-notes").value = "";
        document.getElementById("journal-notes").value = "";
        document.getElementById("plan-entry").value = "";
        document.getElementById("plan-sl").value = "";
        document.getElementById("plan-tp").value = "";
        document.getElementById("plan-size").value = "";
        document.getElementById("plan-leverage").value = "";
        document.getElementById("plan-lots").value = "";
        document.getElementById("plan-pnl").value = "";
        document.getElementById("plan-notes").value = "";
        
        // Reset Win/Loss buttons
        if (btnTradeWin) {
          btnTradeWin.dataset.selected = "false";
          btnTradeWin.classList.remove("bg-emerald-500/30");
        }
        if (btnTradeLoss) {
          btnTradeLoss.dataset.selected = "false";
          btnTradeLoss.classList.remove("bg-rose-500/30");
        }
        
        // Reset P&L input styling
        planPnlInput.classList.remove("border-emerald-500", "border-rose-500", "text-emerald-300", "text-rose-300");
        
        // Uncheck all checklist items
        document.querySelectorAll(".crit").forEach(cb => cb.checked = false);
        calcGrade(); // Recalculate grade
      }, 500);
    }
  
    // --- Margin/Position Size Calculator ---
    const planLeverageInput = document.getElementById("plan-leverage");
    const planLotsInput = document.getElementById("plan-lots");
    const marginDisplay = document.getElementById("margin-display");
    
    function updateMarginDisplay() {
      if (!marginDisplay) return;
      
      const leverageText = planLeverageInput?.value?.trim() || "";
      const lots = parseFloat(planLotsInput?.value) || 0;
      const positionSize = parseFloat(planSizeInput?.value) || 0;
      
      // Parse leverage (formats: "1:100", "100", "100x", "x100")
      // Look for the larger number after colon or the main number
      let leverageRatio = 1;
      if (leverageText) {
        // Try to match "1:X" format first
        const colonMatch = leverageText.match(/1:(\d+)/);
        if (colonMatch) {
          leverageRatio = parseInt(colonMatch[1]) || 1;
        } else {
          // Try to match just a number (e.g., "100", "50x", "x50")
          const numMatch = leverageText.match(/(\d+)/);
          if (numMatch) {
            leverageRatio = parseInt(numMatch[1]) || 1;
          }
        }
      }
      
      let displayParts = [];
      
      // Calculate margin required (Position Size / Leverage)
      if (positionSize > 0 && leverageRatio > 1) {
        const margin = positionSize / leverageRatio;
        displayParts.push(`Margin: $${margin.toFixed(2)}`);
      }
      
      // Calculate notional value from lots (1 lot = 100,000 units typically for forex)
      if (lots > 0 && leverageRatio > 1) {
        const lotSize = 100000; // Standard forex lot
        const notional = lots * lotSize;
        const lotsMargin = notional / leverageRatio;
        displayParts.push(`Lots: $${lotsMargin.toFixed(0)}`);
      }
      
      marginDisplay.textContent = displayParts.join(' • ');
    }
  
    // Add event listeners for margin calculation
    if (planLeverageInput) {
      planLeverageInput.addEventListener("input", updateMarginDisplay);
      planLeverageInput.addEventListener("change", updateMarginDisplay);
    }
    if (planLotsInput) {
      planLotsInput.addEventListener("input", updateMarginDisplay);
      planLotsInput.addEventListener("change", updateMarginDisplay);
    }
    if (planSizeInput) {
      planSizeInput.addEventListener("input", updateMarginDisplay);
      planSizeInput.addEventListener("change", updateMarginDisplay);
    }
    
    // Initial margin display update
    updateMarginDisplay();
  
    if (btnTradeWin) {
      btnTradeWin.addEventListener("click", () => {
        // Calculate P&L FIRST and wait for it to complete
        const pnlCalculated = calculateTradePnL(true);
        
        // Store result for later use
        btnTradeWin.dataset.selected = "true";
        btnTradeWin.classList.add("bg-emerald-500/30");
        if (btnTradeLoss) {
          btnTradeLoss.dataset.selected = "false";
          btnTradeLoss.classList.remove("bg-rose-500/30");
        }
        
        // Automatically journalize the trade - use a small delay to ensure P&L is set
        setTimeout(() => {
          autoJournalizeTrade(true);
        }, 50);
      });
    }
  
    if (btnTradeLoss) {
      btnTradeLoss.addEventListener("click", () => {
        // Calculate P&L FIRST
        const pnlCalculated = calculateTradePnL(false);
        
        // Store result for later use
        btnTradeLoss.dataset.selected = "true";
        btnTradeLoss.classList.add("bg-rose-500/30");
        if (btnTradeWin) {
          btnTradeWin.dataset.selected = "false";
          btnTradeWin.classList.remove("bg-emerald-500/30");
        }
        
        // Automatically journalize the trade - use a small delay to ensure P&L is set
        setTimeout(() => {
          autoJournalizeTrade(false);
        }, 50);
      });
    }
  
    if (btnSave) {
      btnSave.addEventListener("click", () => {
        const instrument = document
          .getElementById("trade-instrument")
          .value.trim();
        const ideaNotes = document.getElementById("trade-notes").value.trim();
        const journalNotes = document
          .getElementById("journal-notes")
          .value.trim();
        const entry = document.getElementById("plan-entry").value.trim();
        const sl = document.getElementById("plan-sl").value.trim();
        const tp = document.getElementById("plan-tp").value.trim();
        const accountId = document.getElementById("plan-account").value;
        const pnl = parseFloat(document.getElementById("plan-pnl").value) || 0;
        const size = parseFloat(document.getElementById("plan-size").value) || 0;
        const leverage = document.getElementById("plan-leverage")?.value.trim() || "";
        const lots = document.getElementById("plan-lots")?.value.trim() ? parseFloat(document.getElementById("plan-lots")?.value) : null;
  
        if (!instrument) return;
  
        // Determine if win or loss
        let tradeResult = null;
        if (btnTradeWin && btnTradeWin.dataset.selected === "true") {
          tradeResult = "win";
        } else if (btnTradeLoss && btnTradeLoss.dataset.selected === "true") {
          tradeResult = "loss";
        }
  
        // Validate that P&L is set if account is selected and result is chosen
        if (accountId && tradeResult && pnl === 0) {
          alert("Please calculate P&L by clicking 'Win / TP Hit' or 'Loss / SL Hit' before journaling the trade.");
          return;
        }
  
        // Capture checklist data
        const checklistData = captureChecklistData();
        
        // Get setup ID from selector
        const selectedSetupId = window.getSelectedSetupId?.() || null;
  
        const item = {
          id: Date.now().toString(),
          instrument,
          time: new Date().toLocaleString(),
          timestamp: new Date().toISOString(),
          plan: { entry, sl, tp, size, leverage: leverage || null, lots: lots || null },
          notes: [ideaNotes, journalNotes].filter(Boolean).join("\n\n"),
          accountId: accountId || null,
          // Always save P&L if account is selected (even if 0, for tracking purposes)
          pnl: accountId ? pnl : undefined,
          result: tradeResult,
          checklist: checklistData,
          setupId: selectedSetupId, // Link to Playbook setup
        };
  
        journal = [item, ...journal];
        saveJournal(journal);
        renderJournal(journal);
        renderAccounts(); // Update account balances
        updateAccountBalanceDisplay(); // Update balance display
        
        // Clear setup selection after saving trade
        if (window.clearSetupSelection) window.clearSetupSelection();
  
        // Save journal entry to vault archive
        saveJournalToVault(item);
        
        // Update trade reviews to show new trade
        // Call renderTradeReviews directly - it should be available by now
        if (typeof window.renderTradeReviews === 'function') {
          window.renderTradeReviews();
        } else if (typeof renderTradeReviews === 'function') {
          renderTradeReviews();
        } else {
          // Fallback: try again after a short delay
          setTimeout(() => {
            if (typeof window.renderTradeReviews === 'function') {
              window.renderTradeReviews();
            }
          }, 200);
        }
  
        // Reset form
        if (btnTradeWin) btnTradeWin.dataset.selected = "false";
        if (btnTradeLoss) btnTradeLoss.dataset.selected = "false";
        planPnlInput.classList.remove("border-emerald-500", "border-rose-500");
        planPnlInput.value = "";
  
        // also capture a full-page screenshot for the day
        captureFullDayScreenshot();
        
        // Update daily archives
        if (window.renderDailyArchives) {
          setTimeout(() => {
            window.renderDailyArchives();
          }, 500);
        }
      });
    }
  
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        if (!confirm("Clear all local journal entries?")) return;
        journal = [];
        saveJournal(journal);
        renderJournal(journal);
      });
    }
  
    // Download journal as a local file
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        const data = loadJournal();
        if (!data.length) {
          alert("No journal entries to download yet.");
          return;
        }
  
        const blob = new Blob(
          [JSON.stringify(data, null, 2)],
          { type: "application/json" }
        );
  
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const ts = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `trading-journal-${ts}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  
    // Download visible journal panel as an image (screenshot)
    if (btnDownloadImage && window.html2canvas) {
      btnDownloadImage.addEventListener("click", () => {
        const panel = document.getElementById("journal-panel");
        if (!panel) return;
  
        // Make sure the full list is visible for the screenshot
        const list = document.getElementById("journal-list");
        let oldMaxHeight;
        let oldOverflow;
        if (list) {
          oldMaxHeight = list.style.maxHeight;
          oldOverflow = list.style.overflowY;
          list.style.maxHeight = "none";
          list.style.overflowY = "visible";
        }
  
        // Wait for fonts to load before capturing
        const capturePanel = () => {
          window.html2canvas(panel, {
            backgroundColor: "#050505",
            scale: window.devicePixelRatio || 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            foreignObjectRendering: true,
            onclone: (clonedDoc) => {
              // Ensure fonts are applied in cloned document
              const clonedPanel = clonedDoc.getElementById("journal-panel");
              if (clonedPanel) {
                clonedPanel.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
              }
              
              // Fix all input fields to ensure text is visible
              const inputs = clonedDoc.querySelectorAll('input[type="text"], input:not([type]), textarea, select');
              inputs.forEach((input) => {
                input.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                input.style.fontSize = '12px';
                
                // Make inputs readonly temporarily so html2canvas can capture their values
                if (input.tagName !== 'SELECT') {
                  input.setAttribute('readonly', 'readonly');
                }
                
                // Create overlay for inputs with values
                if (input.value && input.value.trim()) {
                  input.style.color = 'transparent';
                  input.style.webkitTextFillColor = 'transparent';
                  
                  const overlay = clonedDoc.createElement('div');
                  overlay.textContent = input.value;
                  overlay.style.position = 'absolute';
                  overlay.style.left = '0';
                  overlay.style.top = '0';
                  overlay.style.width = '100%';
                  overlay.style.height = '100%';
                  overlay.style.color = '#f1f5f9';
                  overlay.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                  overlay.style.fontSize = '12px';
                  overlay.style.padding = '8px 12px';
                  overlay.style.display = 'flex';
                  overlay.style.alignItems = input.tagName === 'TEXTAREA' ? 'flex-start' : 'center';
                  overlay.style.pointerEvents = 'none';
                  overlay.style.zIndex = '9999';
                  overlay.style.whiteSpace = input.tagName === 'TEXTAREA' ? 'pre-wrap' : 'nowrap';
                  overlay.style.overflow = 'hidden';
                  
                  const parent = input.parentElement;
                  if (parent) {
                    parent.style.position = 'relative';
                    parent.appendChild(overlay);
                  }
                }
              });
            },
          }).then((canvas) => {
            if (list) {
              list.style.maxHeight = oldMaxHeight || "14rem";
              list.style.overflowY = oldOverflow || "auto";
            }
  
            const link = document.createElement("a");
            const ts = new Date().toISOString().slice(0, 10);
            const imageData = canvas.toDataURL("image/png");
            link.href = imageData;
            link.download = `trading-journal-${ts}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Save to vault
            saveScreenshotToVault(imageData, `journal-${ts}`, "journal", { label: `Journal - ${ts}` });
          }).catch((err) => {
            console.error("Screenshot failed:", err);
            alert("Failed to capture screenshot. Please try again.");
          });
        };
  
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(capturePanel);
        } else {
          setTimeout(capturePanel, 500);
        }
      });
    }
  
    // Download the full page (all sections) as an image (legacy - button removed)
    if (btnDownloadDayImage && window.html2canvas) {
      btnDownloadDayImage.addEventListener("click", () => {
        captureFullDayScreenshot();
      });
    }
  
    // Helper function to download image locally
    function downloadScreenshot(imageData, filename) {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // Screenshot function - same approach as the working Screenshot button
    function captureAndDownloadScreenshot(filename) {
      if (!window.html2canvas) {
        alert("Screenshot funksjon ikke tilgjengelig. Bruk Cmd+Shift+4 på Mac for manuelt screenshot.");
        return;
      }
  
      const target = document.body;
      window.scrollTo(0, 0);
  
      // Wait for fonts to load before capturing
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          doCapture();
        });
      } else {
        setTimeout(doCapture, 500);
      }
  
      function doCapture() {
        window.html2canvas(target, {
          backgroundColor: "#000000",
          scale: window.devicePixelRatio || 2,
          scrollY: -window.scrollY,
          useCORS: true,
          allowTaint: false,
          logging: false,
          foreignObjectRendering: true,
          onclone: (clonedDoc) => {
            // Ensure fonts are applied in cloned document
            const clonedBody = clonedDoc.body;
            clonedBody.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            
            // Fix all input fields to ensure text is visible
            const inputs = clonedDoc.querySelectorAll('input[type="text"], input[type="number"], input:not([type]), textarea, select');
            inputs.forEach((input) => {
              // Force explicit color for text visibility
              input.style.color = '#f1f5f9';
              input.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
              input.style.fontSize = '12px';
              input.style.webkitTextFillColor = '#f1f5f9';
              input.style.webkitTextStrokeColor = 'transparent';
              
              // Make inputs readonly temporarily
              if (input.tagName !== 'SELECT' && input.tagName !== 'TEXTAREA') {
                input.setAttribute('readonly', 'readonly');
              }
              if (input.tagName === 'TEXTAREA') {
                input.setAttribute('readonly', 'readonly');
              }
              
              // Create overlay div with the input value for better capture
              if (input.value && input.value.trim()) {
                // Hide the original input text to prevent overlap
                input.style.color = 'transparent';
                input.style.webkitTextFillColor = 'transparent';
                input.style.caretColor = 'transparent';
                
                const overlay = clonedDoc.createElement('div');
                overlay.textContent = input.value;
                overlay.style.position = 'absolute';
                overlay.style.left = '0';
                overlay.style.top = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.color = '#f1f5f9';
                overlay.style.fontFamily = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                overlay.style.fontSize = '12px';
                overlay.style.padding = '8px 12px';
                overlay.style.display = 'flex';
                overlay.style.alignItems = input.tagName === 'TEXTAREA' ? 'flex-start' : 'center';
                overlay.style.pointerEvents = 'none';
                overlay.style.zIndex = '9999';
                overlay.style.backgroundColor = 'transparent';
                overlay.style.whiteSpace = input.tagName === 'TEXTAREA' ? 'pre-wrap' : 'nowrap';
                overlay.style.overflow = 'hidden';
                overlay.style.textOverflow = 'ellipsis';
                
                const parent = input.parentElement;
                if (parent) {
                  parent.style.position = 'relative';
                  parent.appendChild(overlay);
                }
              }
              
              // For select elements
              if (input.tagName === 'SELECT') {
                const options = input.querySelectorAll('option');
                options.forEach((opt) => {
                  opt.style.color = '#f1f5f9';
                  opt.style.backgroundColor = '#000000';
                });
              }
            });
            
            // Ensure all text elements have proper color
            const allTextElements = clonedDoc.querySelectorAll('span, p, div, label, h1, h2, h3, h4, h5, h6');
            allTextElements.forEach((el) => {
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.color === 'rgb(241, 245, 249)' || el.classList.contains('text-slate-100') || el.classList.contains('text-white')) {
                el.style.color = '#f1f5f9';
              }
            });
          },
        }).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }).catch((err) => {
          console.error("Screenshot failed:", err);
          alert("Screenshot feilet. Prøv igjen.");
        });
      }
    }
  
    // Daily Prep "Done" button - just downloads screenshot locally, no storage
    const btnDailyPrepDone = document.getElementById("btn-daily-prep-done");
    if (btnDailyPrepDone) {
      btnDailyPrepDone.addEventListener("click", () => {
        // Visual feedback
        btnDailyPrepDone.classList.add("scale-95", "opacity-70");
        const originalHTML = btnDailyPrepDone.innerHTML;
        btnDailyPrepDone.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
          </svg>
          Saving...
        `;
        
        const today = new Date().toISOString().slice(0, 10);
        const timestamp = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
        
        // Just download screenshot - no storage anywhere
        captureAndDownloadScreenshot(`DailyPrep_${today}_${timestamp}.png`);
        
        // Reset button after delay
        setTimeout(() => {
          btnDailyPrepDone.classList.remove("scale-95", "opacity-70");
          btnDailyPrepDone.innerHTML = originalHTML;
          // Brief success indication
          btnDailyPrepDone.classList.add("border-emerald-400", "text-emerald-300");
          setTimeout(() => {
            btnDailyPrepDone.classList.remove("border-emerald-400", "text-emerald-300");
          }, 1500);
        }, 1000);
      });
    }
  
    // Trade Checklist "Done" button - just downloads screenshot locally, no storage
    const btnChecklistDone = document.getElementById("btn-checklist-done");
    if (btnChecklistDone) {
      btnChecklistDone.addEventListener("click", () => {
        // Visual feedback
        btnChecklistDone.classList.add("scale-95", "opacity-70");
        const originalHTML = btnChecklistDone.innerHTML;
        btnChecklistDone.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
          </svg>
          Saving...
        `;
        
        const today = new Date().toISOString().slice(0, 10);
        const timestamp = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
        
        // Just download screenshot - no storage anywhere
        captureAndDownloadScreenshot(`Checklist_${today}_${timestamp}.png`);
        
        // Reset button after delay
        setTimeout(() => {
          btnChecklistDone.classList.remove("scale-95", "opacity-70");
          btnChecklistDone.innerHTML = originalHTML;
          // Brief success indication
          btnChecklistDone.classList.add("border-emerald-400", "text-emerald-300");
          setTimeout(() => {
            btnChecklistDone.classList.remove("border-emerald-400", "text-emerald-300");
          }, 1500);
        }, 1000);
      });
    }
  
    // ------- Routine level check parameters (editable) -------
    const ROUTINE_STORAGE_KEY = "tradingdesk:routine-parameters";
  
    const defaultRoutineItems = [
      "HTF levels",
      "Previous day/week/month levels",
      "NPOCs",
      "Pivots",
      "Poor highs/lows",
      "Single prints",
      "nSPOCs",
      "Daily high/low indicator",
      "Liquidity",
      "Session-specific routine",
      "Alerts set",
    ];
  
    function loadRoutineParameters() {
      try {
        const stored = JSON.parse(
          localStorage.getItem(ROUTINE_STORAGE_KEY) || "null"
        );
        if (!stored || !Array.isArray(stored) || !stored.length) {
          return [...defaultRoutineItems];
        }
        return stored;
      } catch (e) {
        console.error("Failed to parse routine parameters", e);
        return [...defaultRoutineItems];
      }
    }
  
    function saveRoutineParameters(list) {
      localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(list));
    }
  
    function renderRoutineList(params) {
      const container = document.getElementById("routine-list");
      container.innerHTML = "";
      params.forEach((label, idx) => {
        if (!label.trim()) return;
        const row = document.createElement("label");
        row.className = "flex items-center gap-2";
        const id = "routine-item-" + idx;
        row.innerHTML = `
          <input
            id="${id}"
            type="checkbox"
            class="rounded border-[#234] bg-black"
          />
          <span>${sanitizeHTML(label)}</span>
        `;
        container.appendChild(row);
      });
    }
  
    function openParametersModal(params) {
      const modal = document.getElementById("parameters-modal");
      const textarea = document.getElementById("parameters-input");
      textarea.value = params.join("\n");
      modal.classList.remove("hidden");
    }
  
    function closeParametersModal() {
      const modal = document.getElementById("parameters-modal");
      modal.classList.add("hidden");
    }
  
    let routineParams = loadRoutineParameters();
    renderRoutineList(routineParams);
  
    const btnEdit = document.getElementById("btn-edit-parameters");
    const btnClose = document.getElementById("btn-close-parameters");
    const btnSaveParams = document.getElementById("btn-save-parameters");
    const btnReset = document.getElementById("btn-reset-parameters");
    const textarea = document.getElementById("parameters-input");
  
    if (btnEdit) {
      btnEdit.addEventListener("click", () => {
        routineParams = loadRoutineParameters();
        openParametersModal(routineParams);
      });
    }
  
    if (btnClose) {
      btnClose.addEventListener("click", () => {
        closeParametersModal();
      });
    }
  
    if (btnSaveParams) {
      btnSaveParams.addEventListener("click", () => {
        const lines = textarea.value
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length);
        if (!lines.length) return;
        routineParams = lines;
        saveRoutineParameters(routineParams);
        renderRoutineList(routineParams);
        closeParametersModal();
      });
    }
  
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        routineParams = [...defaultRoutineItems];
        saveRoutineParameters(routineParams);
        renderRoutineList(routineParams);
        textarea.value = routineParams.join("\n");
      });
    }
  
    const paramsModal = document.getElementById("parameters-modal");
    if (paramsModal) {
      paramsModal.addEventListener("click", (e) => {
        if (e.target.id === "parameters-modal") closeParametersModal();
      });
    }
  
    // ------- Monte Carlo simulation (equity in R) -------
    function percentile(arr, p) {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = (p / 100) * (sorted.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      if (lo === hi) return sorted[lo];
      const w = idx - lo;
      return sorted[lo] * (1 - w) + sorted[hi] * w;
    }
  
    function runMonteCarlo(winRate, rMultiple, trades, runs) {
      const finalEquities = [];
      const maxDrawdowns = [];
      const samplePath = [];
  
      for (let run = 0; run < runs; run++) {
        let equity = 0; // in R
        let peak = 0;
        let maxDD = 0;
        const path = [];
  
        for (let t = 0; t < trades; t++) {
          const win = Math.random() * 100 < winRate;
          const r = win ? rMultiple : -1;
          equity += r;
          peak = Math.max(peak, equity);
          maxDD = Math.min(maxDD, equity - peak);
          if (run === 0) path.push(equity);
        }
  
        finalEquities.push(equity);
        maxDrawdowns.push(maxDD);
        if (run === 0) {
          samplePath.push(...path);
        }
      }
  
      return {
        finalEquities,
        maxDrawdowns,
        samplePath,
      };
    }
  
    function drawSamplePathOnCanvas(values) {
      const canvas = document.getElementById("mc-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.offsetWidth || 300;
      const height = canvas.offsetHeight || 160;
  
      canvas.width = width;
      canvas.height = height;
  
      ctx.clearRect(0, 0, width, height);
  
      if (!values.length) return;
  
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;
  
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
  
      values.forEach((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * width;
        const y = height - ((v - minVal) / range) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
  
      ctx.stroke();
    }
  
    const winEl = document.getElementById("mc-winrate");
    const rEl = document.getElementById("mc-rmultiple");
    const tradesEl = document.getElementById("mc-trades");
    const runsEl = document.getElementById("mc-runs");
    const riskEl = document.getElementById("mc-riskpct");
    const balanceEl = document.getElementById("mc-balance");
    const btnRun = document.getElementById("mc-run");
    const statusEl = document.getElementById("mc-status");
  
    const medianEl = document.getElementById("mc-median");
    const p5El = document.getElementById("mc-p5");
    const p95El = document.getElementById("mc-p95");
    const ddEl = document.getElementById("mc-dd");
  
    if (btnRun) {
      btnRun.addEventListener("click", () => {
        const winRate = Number(winEl.value) || 0;
        const rMultiple = Number(rEl.value) || 0;
        const trades = Math.max(1, Number(tradesEl.value) || 0);
        const runs = Math.max(100, Number(runsEl.value) || 0);
        const riskPct = Number(riskEl.value) || 1;
        const startBalance = Number(balanceEl.value) || 10000;
  
        statusEl.textContent = "Running simulation…";
        setTimeout(() => {
          const res = runMonteCarlo(winRate, rMultiple, trades, runs);
  
          const med = percentile(res.finalEquities, 50);
          const p5 = percentile(res.finalEquities, 5);
          const p95 = percentile(res.finalEquities, 95);
          const medDD = percentile(res.maxDrawdowns, 50);
  
          // Calculate dollar amounts
          // Each R = riskPct% of starting balance
          const riskPerTrade = startBalance * (riskPct / 100);
          
          // Final balance = start + (R profit * risk per trade)
          const medBalance = startBalance + (med * riskPerTrade);
          const p5Balance = startBalance + (p5 * riskPerTrade);
          const p95Balance = startBalance + (p95 * riskPerTrade);
          const ddDollars = medDD * riskPerTrade;
          const ddPercent = (ddDollars / startBalance) * 100;
  
          function fmtMoney(x) {
            return "$" + x.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          }
  
          function fmtR(x) {
            return x.toFixed(1) + "R";
          }
  
          medianEl.textContent = fmtMoney(medBalance) + "  (" + fmtR(med) + ")";
          p5El.textContent = fmtMoney(p5Balance) + "  (" + fmtR(p5) + ")";
          p95El.textContent = fmtMoney(p95Balance) + "  (" + fmtR(p95) + ")";
          ddEl.textContent = fmtMoney(ddDollars) + "  (" + ddPercent.toFixed(1) + "%)";
  
          // Convert sample path from R to dollars for the chart
          const samplePathDollars = res.samplePath.map(r => startBalance + (r * riskPerTrade));
          drawSamplePathOnCanvas(samplePathDollars);
  
          statusEl.textContent =
            "Simulated " +
            runs +
            " paths of " +
            trades +
            " trades. Risk per trade: " + fmtMoney(riskPerTrade) + " (" + riskPct + "%)";
        }, 10);
      });
    }
  
    // ------- Accounts Management -------
    // Note: loadAccounts() and saveAccounts() are defined globally for use by global filter
  
    function calculateAccountBalance(accountId, journalEntries) {
      // Reload accounts to get latest data
      const currentAccounts = loadAccounts();
      const account = currentAccounts.find((a) => a.id === accountId);
      if (!account) return 0;
  
      let balance = validateNumber(account.initialBalance, { defaultValue: 0 });
      journalEntries.forEach((entry) => {
        if (entry.accountId === accountId && entry.pnl !== undefined && entry.pnl !== null) {
          // Validate P&L before adding
          const pnl = validateNumber(entry.pnl, { defaultValue: 0 });
          if (!isNaN(pnl)) {
            balance += pnl;
          }
        }
      });
      // Ensure we don't return NaN
      return isNaN(balance) ? 0 : balance;
    }
  
    function updateAccountDropdown() {
      const select = document.getElementById("plan-account");
      if (!select) return;
      
      const globalFilter = getGlobalFilter();
      
      // Categories with icons
      const categories = [
        { key: 'crypto', name: '₿ Crypto' },
        { key: 'forex', name: '💱 Forex' },
        { key: 'stocks', name: '📈 Stocks' },
        { key: 'futures', name: '📊 Futures' },
        { key: 'options', name: '⚡ Options' }
      ];
      
      // If a category is selected in global filter, auto-select it
      if (globalFilter && globalFilter.startsWith('cat:')) {
        const category = globalFilter.replace('cat:', '');
        const cat = categories.find(c => c.key === category);
        if (cat) {
          select.innerHTML = `<option value="${category}">${cat.name}</option>`;
          select.value = category;
          return;
        }
      }
      
      // Otherwise show all categories
      select.innerHTML = '<option value="">Select category...</option>';
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.key;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    }
  
    // Expose updateAccountDropdown globally for filter change handling
    window.updateAccountDropdown = updateAccountDropdown;
  
    function renderAccounts() {
      const containerEl = document.getElementById("accounts-by-category");
      const emptyEl = domCache.get("accounts-empty");
      if (!containerEl) return;
      containerEl.innerHTML = "";
  
      updateAccountDropdown(); // Always update dropdown
      
      if (emptyEl) emptyEl.classList.add("hidden");
  
      // Category definitions with icons
      const categories = [
        { key: 'crypto', name: 'Crypto', icon: '₿' },
        { key: 'forex', name: 'Forex', icon: '💱' },
        { key: 'stocks', name: 'Stocks', icon: '📈' },
        { key: 'futures', name: 'Futures', icon: '📊' },
        { key: 'options', name: 'Options', icon: '⚡' }
      ];
      
      // Calculate P&L for each category from journal trades
      categories.forEach(cat => {
        // Get category balance
        const catBalance = getCategoryBalance(cat.key);
        const initialBalance = catBalance.initial || 0;
        
        // Get trades for this category (check both category and accountId for backwards compatibility)
        const categoryTrades = journal.filter(t => {
          if (t.category === cat.key) return true;
          // Backwards compatibility: check if accountId matches an account in this category
          const account = accounts.find(a => a.id === t.accountId);
          return account && account.category === cat.key;
        });
        
        const tradeCount = categoryTrades.length;
        const totalPnL = categoryTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const currentBalance = initialBalance + totalPnL;
        const wins = categoryTrades.filter(t => t.result === 'win').length;
        const losses = categoryTrades.filter(t => t.result === 'loss').length;
        const winRate = tradeCount > 0 ? ((wins / tradeCount) * 100).toFixed(0) : 0;
        
        const categorySection = document.createElement("div");
        categorySection.className = "category-row flex items-center justify-between px-4 py-3 rounded-xl border border-[#1a1a1a] bg-black/30 hover:bg-black/50 hover:border-slate-700 transition-all cursor-pointer";
        categorySection.dataset.category = cat.key;
        categorySection.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-lg">${cat.icon}</span>
            <div>
              <span class="text-[12px] font-medium text-slate-200">${cat.name}</span>
              <div class="text-[10px] text-slate-500">
                ${initialBalance > 0 ? `$${initialBalance.toLocaleString("en-US", { minimumFractionDigits: 0 })} start` : 'Click to set balance'}
                ${tradeCount > 0 ? ` • ${tradeCount} trades • ${winRate}% WR` : ''}
              </div>
            </div>
          </div>
          <div class="text-right">
            ${initialBalance > 0 ? `
              <div class="text-[12px] font-medium ${currentBalance >= initialBalance ? 'text-emerald-400' : 'text-rose-400'}">
                $${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div class="text-[9px] ${totalPnL >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}">
                ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            ` : `
              <div class="text-[11px] text-slate-500">
                ${totalPnL !== 0 ? `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : 'No balance set'}
              </div>
            `}
          </div>
        `;
        
        containerEl.appendChild(categorySection);
      });
  
      // Set up event delegation for category clicks
      if (!containerEl._accountsHandlerAttached) {
        containerEl.addEventListener("click", (e) => {
          // Handle category row click - open balance modal
          const categoryRow = e.target.closest(".category-row");
          if (categoryRow) {
            const category = categoryRow.dataset.category;
            openCategoryBalanceModal(category);
            return;
          }
          
          // Handle account actions (backwards compatibility)
          handleAccountsListClick(e);
        });
        containerEl._accountsHandlerAttached = true;
      }
    }
    
    // Event delegation handler for accounts list
    function handleAccountsListClick(e) {
      const btn = e.target.closest("button[data-account-id]");
      if (!btn) return;
      
      const accountId = btn.dataset.accountId;
      const action = btn.dataset.action;
      
      if (action === "delete") {
        if (!confirm("Delete this account?")) return;
        accounts = accounts.filter((a) => a.id !== accountId);
        saveAccounts(accounts);
        renderAccounts();
        updateGlobalFilterDropdown();
        return;
      }
      if (action === "edit") {
        openAccountModal(accountId);
      }
    }
  
    let accounts = loadAccounts();
    renderAccounts();
  
    // Account modal handlers
    const accountModal = document.getElementById("account-modal");
    const btnAddAccount = document.getElementById("btn-add-account");
    const btnCloseAccount = document.getElementById("btn-close-account");
    const btnCancelAccount = document.getElementById("btn-cancel-account");
    const btnSaveAccount = document.getElementById("btn-save-account");
  
    // Helper to update category button selection
    function updateCategoryButtons(selectedCategory) {
      const buttons = document.querySelectorAll("#category-buttons .category-btn");
      buttons.forEach(btn => {
        if (btn.dataset.category === selectedCategory) {
          btn.classList.add("border-emerald-500/50", "bg-emerald-500/10", "text-emerald-300");
          btn.classList.remove("border-[#222]", "bg-black/40", "text-slate-400");
        } else {
          btn.classList.remove("border-emerald-500/50", "bg-emerald-500/10", "text-emerald-300");
          btn.classList.add("border-[#222]", "bg-black/40", "text-slate-400");
        }
      });
      const categoryInput = document.getElementById("account-category-input");
      if (categoryInput) categoryInput.value = selectedCategory;
    }
    
    // Set up category button click handlers
    const categoryButtonsContainer = document.getElementById("category-buttons");
    if (categoryButtonsContainer) {
      categoryButtonsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-btn");
        if (btn) {
          updateCategoryButtons(btn.dataset.category);
        }
      });
    }
  
    function openAccountModal(editingId = null, preselectedCategory = null) {
      if (editingId) {
        const account = accounts.find((a) => a.id === editingId);
        if (account) {
          document.getElementById("account-name-input").value = account.name || "";
          document.getElementById("account-balance-input").value = account.initialBalance || 0;
          updateCategoryButtons(account.category || "crypto");
          accountModal.dataset.editingId = editingId;
          document.getElementById("account-modal-title").textContent = "Edit Account";
        }
      } else {
        document.getElementById("account-name-input").value = "";
        document.getElementById("account-balance-input").value = "";
        // Use preselected category if provided, otherwise default to crypto
        updateCategoryButtons(preselectedCategory || "crypto");
        delete accountModal.dataset.editingId;
        document.getElementById("account-modal-title").textContent = preselectedCategory 
          ? `Add ${preselectedCategory.charAt(0).toUpperCase() + preselectedCategory.slice(1)} Account`
          : "Add Account";
      }
      accountModal.classList.remove("hidden");
    }
  
    function closeAccountModal() {
      accountModal.classList.add("hidden");
      document.getElementById("account-name-input").value = "";
      document.getElementById("account-balance-input").value = "";
      updateCategoryButtons("crypto");
      delete accountModal.dataset.editingId;
    }
  
    // Category balance modal
    const categoryNames = {
      crypto: { name: 'Crypto', icon: '₿' },
      forex: { name: 'Forex', icon: '💱' },
      stocks: { name: 'Stocks', icon: '📈' },
      futures: { name: 'Futures', icon: '📊' },
      options: { name: 'Options', icon: '⚡' }
    };
  
    function openCategoryBalanceModal(category) {
      const catInfo = categoryNames[category];
      if (!catInfo) return;
      
      const currentBalance = getCategoryBalance(category);
      
      // Create modal if it doesn't exist
      let modal = document.getElementById("category-balance-modal");
      if (!modal) {
        modal = document.createElement("div");
        modal.id = "category-balance-modal";
        modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4";
        document.body.appendChild(modal);
      }
      
      modal.innerHTML = `
        <div class="w-full max-w-sm rounded-2xl bg-[#0a0a0a] border border-[#222] p-5">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">${catInfo.icon}</span>
            <div>
              <h3 class="text-[14px] font-semibold text-slate-200">${catInfo.name}</h3>
              <p class="text-[11px] text-slate-500">Set your starting balance</p>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-[11px] text-slate-500 mb-1.5">Starting Balance</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[12px]">$</span>
              <input
                id="category-balance-input"
                type="number"
                step="0.01"
                min="0"
                value="${currentBalance.initial || ''}"
                class="w-full pl-7 pr-3 py-2.5 rounded-lg border border-[#222] bg-black text-[12px] text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="10,000.00"
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-2">
            <button
              id="btn-cancel-category-balance"
              class="px-4 py-2 rounded-lg border border-[#222] bg-black/40 text-[11px] text-slate-300 hover:bg-black transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-category-balance"
              class="px-5 py-2 rounded-lg bg-emerald-500 text-[11px] font-medium text-black hover:bg-emerald-400 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      `;
      
      modal.classList.remove("hidden");
      modal.dataset.category = category;
      
      // Focus input
      setTimeout(() => {
        document.getElementById("category-balance-input")?.focus();
      }, 100);
      
      // Event listeners
      document.getElementById("btn-cancel-category-balance").onclick = closeCategoryBalanceModal;
      document.getElementById("btn-save-category-balance").onclick = saveCategoryBalanceFromModal;
      modal.onclick = (e) => {
        if (e.target === modal) closeCategoryBalanceModal();
      };
    }
  
    function closeCategoryBalanceModal() {
      const modal = document.getElementById("category-balance-modal");
      if (modal) modal.classList.add("hidden");
    }
  
    function saveCategoryBalanceFromModal() {
      const modal = document.getElementById("category-balance-modal");
      const input = document.getElementById("category-balance-input");
      const category = modal?.dataset.category;
      
      if (!category || !input) return;
      
      const balance = parseFloat(input.value) || 0;
      setCategoryBalance(category, balance);
      
      closeCategoryBalanceModal();
      renderAccounts();
      updateGlobalFilterDropdown();
      refreshAllViews();
    }
  
    if (btnAddAccount) {
      btnAddAccount.addEventListener("click", () => openAccountModal());
    }
  
    if (btnCloseAccount) {
      btnCloseAccount.addEventListener("click", closeAccountModal);
    }
  
    if (btnCancelAccount) {
      btnCancelAccount.addEventListener("click", closeAccountModal);
    }
  
    if (btnSaveAccount) {
      btnSaveAccount.addEventListener("click", () => {
        const name = validateText(document.getElementById("account-name-input").value, { maxLength: 100, allowEmpty: false });
        const balance = validateNumber(document.getElementById("account-balance-input").value, { min: 0, defaultValue: 0 });
        const category = document.getElementById("account-category-input")?.value || "other";
  
        if (!name) {
          alert("Please enter an account name.");
          return;
        }
  
        const editingId = accountModal.dataset.editingId;
        if (editingId) {
          const idx = accounts.findIndex((a) => a.id === editingId);
          if (idx >= 0) {
            accounts[idx] = { ...accounts[idx], name, initialBalance: balance, category };
          }
        } else {
          accounts.push({
            id: Date.now().toString(),
            name,
            initialBalance: balance,
            category,
          });
        }
  
        saveAccounts(accounts);
        renderAccounts();
        updateAccountDropdown();
        updateAccountBalanceDisplay(); // Update balance display if account is selected
        updateGlobalFilterDropdown(); // Update global filter dropdown
        closeAccountModal();
      });
    }
  
    // Update account dropdown when accounts change
    updateAccountDropdown();
  
    if (accountModal) {
      accountModal.addEventListener("click", (e) => {
        if (e.target.id === "account-modal") closeAccountModal();
      });
    }
  
    // Show account balance when account is selected
    const planAccountSelect = document.getElementById("plan-account");
    const accountBalanceDisplay = document.getElementById("account-balance-display");
  
    function updateAccountBalanceDisplay() {
      if (!planAccountSelect || !accountBalanceDisplay) return;
      
      const selectedCategory = planAccountSelect.value;
      if (!selectedCategory) {
        accountBalanceDisplay.classList.add("hidden");
        return;
      }
  
      // Get category balance
      const catBalance = getCategoryBalance(selectedCategory);
      const initialBalance = catBalance.initial || 0;
      
      if (initialBalance === 0) {
        accountBalanceDisplay.innerHTML = `
          <span class="text-slate-500 text-[10px]">No balance set</span>
        `;
        accountBalanceDisplay.classList.remove("hidden");
        return;
      }
  
      // Calculate P&L from trades in this category
      const currentJournal = loadJournal();
      const currentAccounts = loadAccounts();
      
      const categoryTrades = currentJournal.filter(t => {
        if (t.category === selectedCategory) return true;
        // Backwards compatibility
        const account = currentAccounts.find(a => a.id === t.accountId);
        return account && account.category === selectedCategory;
      });
      
      const totalPnL = categoryTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const currentBalance = initialBalance + totalPnL;
      
      const balanceColor = currentBalance >= initialBalance ? "text-emerald-400" : "text-rose-400";
      const pnlColor = totalPnL >= 0 ? "text-emerald-400/70" : "text-rose-400/70";
      
      accountBalanceDisplay.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="${balanceColor} font-medium">$${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span class="${pnlColor} text-[10px]">(${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)})</span>
        </div>
      `;
      accountBalanceDisplay.classList.remove("hidden");
    }
  
    // Update trade plan fields based on account category
    function updateFieldsForAccountCategory() {
      const selectedAccountId = planAccountSelect?.value;
      const lotsContainer = document.querySelector('[data-param="lots"]');
      const leverageContainer = document.querySelector('[data-param="leverage"]');
      const currentAccounts = loadAccounts();
      
      let category = null;
      
      // First check if a specific account is selected in Trade Plan
      if (selectedAccountId) {
        const account = currentAccounts.find((a) => a.id === selectedAccountId);
        if (account) {
          category = account.category || 'other';
        }
      }
      
      // If no account selected, check the global filter for category
      if (!category) {
        const globalFilter = getGlobalFilter();
        if (globalFilter && globalFilter.startsWith('cat:')) {
          // Category filter like "cat:crypto", "cat:forex"
          category = globalFilter.replace('cat:', '');
        } else if (globalFilter && globalFilter !== 'all') {
          // Specific account selected in global filter
          const account = currentAccounts.find((a) => a.id === globalFilter);
          if (account) {
            category = account.category || 'other';
          }
        }
      }
      
      // Apply field visibility based on category
      // Crypto accounts: Hide Lots, show Leverage
      // Forex accounts: Show Lots, show Leverage
      // Options accounts: Hide Lots, hide Leverage (options use contracts)
      // Commodities: Show Lots, show Leverage
      
      if (category === 'crypto') {
        // Crypto doesn't use Lots
        if (lotsContainer) lotsContainer.classList.add("hidden");
        if (leverageContainer) leverageContainer.classList.remove("hidden");
      } else if (category === 'forex') {
        // Forex uses Lots and Leverage
        if (lotsContainer) lotsContainer.classList.remove("hidden");
        if (leverageContainer) leverageContainer.classList.remove("hidden");
      } else if (category === 'options') {
        // Options use contracts, not lots/leverage in the traditional sense
        if (lotsContainer) lotsContainer.classList.add("hidden");
        if (leverageContainer) leverageContainer.classList.add("hidden");
      } else {
        // Default (including 'all' or commodities): show both
        if (lotsContainer) lotsContainer.classList.remove("hidden");
        if (leverageContainer) leverageContainer.classList.remove("hidden");
      }
    }
  
    if (planAccountSelect) {
      planAccountSelect.addEventListener("change", () => {
        updateAccountBalanceDisplay();
        updateFieldsForAccountCategory();
      });
    }
    
    // Expose updateFieldsForAccountCategory globally so it can be called from handleFilterChange
    window.updateFieldsForAccountCategory = updateFieldsForAccountCategory;
    
    // Update balance display and fields on initial load if account is selected
    updateAccountBalanceDisplay();
    updateFieldsForAccountCategory();
  
    // ------- Vault Management -------
    const VAULT_SCREENSHOTS_KEY = "tradingdesk:vault:screenshots";
    const VAULT_JOURNALS_KEY = "tradingdesk:vault:journals";
    const DAILY_ARCHIVES_KEY = "tradingdesk:daily-archives";
  
    // ------- Storage Optimization -------
    function getStorageUsage() {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage.getItem(key).length * 2; // UTF-16 = 2 bytes per char
        }
      }
      return {
        used: total,
        usedMB: (total / (1024 * 1024)).toFixed(2),
        estimatedMax: 5 * 1024 * 1024, // 5MB typical
        percentUsed: ((total / (5 * 1024 * 1024)) * 100).toFixed(1)
      };
    }
  
    function compressScreenshot(dataUrl, quality = 0.7, maxWidth = 1200) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if too large
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use JPEG for better compression
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = function() {
          resolve(dataUrl); // Return original if compression fails
        };
        img.src = dataUrl;
      });
    }
  
    function cleanupOldScreenshots(daysToKeep = 30) {
      const archives = loadDailyArchives();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffStr = cutoffDate.toISOString().slice(0, 10);
      
      let cleaned = false;
      archives.forEach(archive => {
        if (archive.date < cutoffStr) {
          // Remove screenshots from old archives but keep trade data
          if (archive.screenshots && archive.screenshots.length > 0) {
            archive.screenshots = [];
            cleaned = true;
          }
          if (archive.dailyPrep && archive.dailyPrep.screenshot) {
            archive.dailyPrep.screenshot = null;
            cleaned = true;
          }
        }
      });
      
      if (cleaned) {
        saveDailyArchives(archives);
        console.log(`Cleaned up screenshots older than ${daysToKeep} days`);
      }
      
      return cleaned;
    }
  
    // Clear vault screenshots (they take too much space)
    function clearVaultScreenshots() {
      localStorage.removeItem(VAULT_SCREENSHOTS_KEY);
      console.log("Cleared vault screenshots to free up storage");
    }
  
    // More aggressive cleanup when storage is critical
    function emergencyStorageCleanup() {
      // 1. Clear vault screenshots entirely
      clearVaultScreenshots();
      
      // 2. Remove all screenshots from daily archives
      const archives = loadDailyArchives();
      archives.forEach(archive => {
        archive.screenshots = [];
        if (archive.dailyPrep) {
          archive.dailyPrep.screenshot = null;
        }
      });
      saveDailyArchives(archives);
      
      console.log("Emergency cleanup completed");
    }
  
    // Auto-cleanup on load if storage is getting full
    (function autoCleanupStorage() {
      const usage = getStorageUsage();
      if (parseFloat(usage.percentUsed) > 150) {
        console.error(`Storage at ${usage.percentUsed}% - running emergency cleanup`);
        emergencyStorageCleanup();
      } else if (parseFloat(usage.percentUsed) > 70) {
        console.warn(`Storage at ${usage.percentUsed}% - running cleanup`);
        cleanupOldScreenshots(7);
        clearVaultScreenshots();
        // Also clear screenshots from daily archives since we don't show them anymore
        clearDailyArchivesScreenshots();
      }
      
      // Log final storage after cleanup
      const finalUsage = getStorageUsage();
      console.log(`Storage after cleanup: ${finalUsage.percentUsed}% (${finalUsage.usedMB}MB)`);
    })();
    
    // Clear all screenshots from daily archives (keeps prep data and trades)
    function clearDailyArchivesScreenshots() {
      try {
        const archives = loadDailyArchives();
        let cleared = 0;
        archives.forEach(archive => {
          if (archive.screenshots && archive.screenshots.length > 0) {
            cleared += archive.screenshots.length;
            archive.screenshots = [];
          }
          if (archive.dailyPrep && archive.dailyPrep.screenshot) {
            archive.dailyPrep.screenshot = null;
            cleared++;
          }
        });
        if (cleared > 0) {
          saveDailyArchives(archives);
          console.log(`Cleared ${cleared} screenshots from daily archives`);
        }
      } catch (e) {
        console.error("Error clearing daily archives screenshots:", e);
      }
    }
  
    // ------- Daily Archives -------
    function loadDailyArchives() {
      try {
        const data = localStorage.getItem(DAILY_ARCHIVES_KEY);
        if (!data) return [];
        
        const archives = JSON.parse(data);
        const today = new Date().toISOString().slice(0, 10);
        
        // Filter out future dates and validate archives
        return archives.filter(archive => {
          // Skip future dates
          if (archive.date > today) {
            console.warn("Removing future-dated archive:", archive.date);
            return false;
          }
          return true;
        }).map(archive => {
          // Validate dailyPrep screenshot
          if (archive.dailyPrep && archive.dailyPrep.screenshot) {
            if (typeof archive.dailyPrep.screenshot !== 'string' || !archive.dailyPrep.screenshot.startsWith('data:image')) {
              console.warn("Invalid dailyPrep screenshot for", archive.date, "- removing");
              archive.dailyPrep.screenshot = null;
            }
          }
          
          // Validate screenshots array
          if (archive.screenshots && Array.isArray(archive.screenshots)) {
            archive.screenshots = archive.screenshots.filter(s => {
              if (!s || !s.data) return false;
              if (typeof s.data !== 'string' || !s.data.startsWith('data:image')) {
                console.warn("Invalid screenshot data for", archive.date, "- removing");
                return false;
              }
              return true;
            });
          }
          
          return archive;
        });
      } catch (e) {
        console.error("Failed to parse daily archives:", e);
        return [];
      }
    }
  
    function saveDailyArchives(archives) {
      try {
        localStorage.setItem(DAILY_ARCHIVES_KEY, JSON.stringify(archives));
      } catch (e) {
        console.error("Failed to save daily archives:", e);
      }
    }
  
    // Cleanup future-dated archives from localStorage
    function cleanupFutureDatedArchives() {
      try {
        const data = localStorage.getItem(DAILY_ARCHIVES_KEY);
        if (!data) return;
        
        const archives = JSON.parse(data);
        const today = new Date().toISOString().slice(0, 10);
        const validArchives = archives.filter(a => a.date <= today);
        
        if (validArchives.length < archives.length) {
          console.log(`Cleaned up ${archives.length - validArchives.length} future-dated archive(s)`);
          saveDailyArchives(validArchives);
        }
      } catch (e) {
        console.error("Failed to cleanup future-dated archives:", e);
      }
    }
    
    // Run cleanup on load
    cleanupFutureDatedArchives();
  
    function getOrCreateDailyArchive(date) {
      const archives = loadDailyArchives();
      const dateStr = date || new Date().toISOString().slice(0, 10);
      
      let archive = archives.find(a => a.date === dateStr);
      
      if (!archive) {
        archive = {
          date: dateStr,
          dailyPrep: null,
          trades: [],
          screenshots: [],
          summary: {
            totalTrades: 0,
            wins: 0,
            losses: 0,
            totalPnl: 0,
            winRate: 0
          }
        };
        archives.push(archive);
        saveDailyArchives(archives);
      }
      
      return archive;
    }
  
    function updateDailyArchive(date, updates) {
      const archives = loadDailyArchives();
      const dateStr = date || new Date().toISOString().slice(0, 10);
      
      let archive = archives.find(a => a.date === dateStr);
      
      if (!archive) {
        archive = getOrCreateDailyArchive(dateStr);
      }
      
      // Merge updates carefully - preserve existing screenshot data if new one is invalid
      if (updates.dailyPrep && updates.dailyPrep.screenshot) {
        // Validate screenshot data
        if (typeof updates.dailyPrep.screenshot === 'string' && updates.dailyPrep.screenshot.startsWith('data:image')) {
          archive.dailyPrep = updates.dailyPrep;
        } else {
          console.warn("Invalid screenshot data for daily prep:", typeof updates.dailyPrep.screenshot);
          if (archive.dailyPrep) {
            // Keep existing if new is invalid
            updates.dailyPrep = archive.dailyPrep;
          }
        }
      } else if (updates.dailyPrep) {
        archive.dailyPrep = updates.dailyPrep;
      }
      
      // Merge other updates
      if (updates.trades !== undefined) {
        archive.trades = updates.trades;
        archive.summary = calculateDailySummary(archive.trades);
      }
      
      if (updates.screenshots !== undefined) {
        // Validate screenshot data
        archive.screenshots = updates.screenshots.filter(s => 
          s && s.data && typeof s.data === 'string' && s.data.startsWith('data:image')
        );
      }
      
      // Save updated archives
      const index = archives.findIndex(a => a.date === dateStr);
      if (index !== -1) {
        archives[index] = archive;
      } else {
        archives.push(archive);
      }
      
      try {
        saveDailyArchives(archives);
      } catch (e) {
        console.error("Failed to save daily archive - possibly too large:", e);
        // Try to save without screenshots if storage is full
        if (e.name === 'QuotaExceededError') {
          console.warn("Storage quota exceeded, attempting to save without screenshots");
          archive.dailyPrep = archive.dailyPrep ? { ...archive.dailyPrep, screenshot: null } : null;
          archive.screenshots = [];
          archives[index] = archive;
          saveDailyArchives(archives);
        }
      }
      
      return archive;
    }
  
    function calculateDailySummary(trades) {
      const totalTrades = trades.length;
      const wins = trades.filter(t => t.result === "win").length;
      const losses = trades.filter(t => t.result === "loss").length;
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      
      return {
        totalTrades,
        wins,
        losses,
        totalPnl,
        winRate: Math.round(winRate * 10) / 10
      };
    }
  
    // ------- Statistics Dashboard Functions -------
    
    // Get date range for period filter
    function getDateRange(period) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (period === "week") {
        const startOfWeek = new Date(today);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return { start: startOfWeek, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      } else if (period === "month") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return { start: startOfMonth, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      } else {
        // All time
        return { start: null, end: null };
      }
    }
  
    // Filter trades by date range
    function filterTradesByDate(trades, startDate, endDate) {
      if (!startDate && !endDate) return trades;
      
      return trades.filter(trade => {
        const tradeDate = getTradeDate(trade);
        if (!tradeDate) return false;
        if (startDate && tradeDate < startDate) return false;
        if (endDate && tradeDate >= endDate) return false;
        return true;
      });
    }
  
    // Calculate profit factor
    function calculateProfitFactor(wins, losses) {
      if (!losses || losses.length === 0) return wins && wins.length > 0 ? Infinity : 0;
      const totalWins = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
      if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
      return totalWins / totalLosses;
    }
  
    // Get best and worst trading days
    function getBestWorstDays(archives, startDate, endDate) {
      let filteredArchives = archives;
      
      if (startDate || endDate) {
        filteredArchives = archives.filter(archive => {
          const archiveDate = new Date(archive.date + "T00:00:00");
          if (startDate && archiveDate < startDate) return false;
          if (endDate && archiveDate >= endDate) return false;
          return true;
        });
      }
  
      if (filteredArchives.length === 0) {
        return { bestDay: null, worstDay: null };
      }
  
      let bestDay = null;
      let worstDay = null;
      let bestPnl = -Infinity;
      let worstPnl = Infinity;
  
      filteredArchives.forEach(archive => {
        const summary = archive.summary || calculateDailySummary(archive.trades);
        if (summary.totalPnl > bestPnl) {
          bestPnl = summary.totalPnl;
          bestDay = {
            date: archive.date,
            pnl: summary.totalPnl,
            trades: summary.totalTrades
          };
        }
        if (summary.totalPnl < worstPnl) {
          worstPnl = summary.totalPnl;
          worstDay = {
            date: archive.date,
            pnl: summary.totalPnl,
            trades: summary.totalTrades
          };
        }
      });
  
      return { bestDay, worstDay };
    }
  
    // Get top instruments by P&L
    function getTopInstruments(trades, startDate, endDate) {
      const filteredTrades = filterTradesByDate(trades, startDate, endDate);
      const instrumentMap = {};
  
      filteredTrades.forEach(trade => {
        if (!trade.instrument) return;
        const inst = trade.instrument;
        if (!instrumentMap[inst]) {
          instrumentMap[inst] = {
            instrument: inst,
            totalPnl: 0,
            trades: 0,
            wins: 0,
            losses: 0
          };
        }
        instrumentMap[inst].totalPnl += trade.pnl || 0;
        instrumentMap[inst].trades += 1;
        if (trade.result === "win") instrumentMap[inst].wins += 1;
        if (trade.result === "loss") instrumentMap[inst].losses += 1;
      });
  
      const instruments = Object.values(instrumentMap);
      instruments.sort((a, b) => b.totalPnl - a.totalPnl);
      
      return instruments.slice(0, 3).map(inst => ({
        instrument: inst.instrument,
        totalPnl: inst.totalPnl,
        trades: inst.trades,
        winRate: inst.trades > 0 ? (inst.wins / inst.trades) * 100 : 0
      }));
    }
  
    // Calculate win/loss streaks
    function calculateStreaks(trades) {
      if (trades.length === 0) {
        return {
          currentStreak: { type: null, count: 0 },
          longestWinStreak: 0,
          longestLossStreak: 0
        };
      }
  
      // Sort trades by timestamp (oldest first)
      const sortedTrades = [...trades].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateA - dateB;
      });
  
      let currentStreak = { type: null, count: 0 };
      let longestWinStreak = 0;
      let longestLossStreak = 0;
      let currentWinStreak = 0;
      let currentLossStreak = 0;
  
      sortedTrades.forEach(trade => {
        if (trade.result === "win") {
          currentWinStreak++;
          currentLossStreak = 0;
          longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
        } else if (trade.result === "loss") {
          currentLossStreak++;
          currentWinStreak = 0;
          longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
        }
      });
  
      // Get current streak (from most recent trade)
      const mostRecent = sortedTrades[sortedTrades.length - 1];
      if (mostRecent) {
        if (mostRecent.result === "win") {
          currentStreak = { type: "win", count: currentWinStreak };
        } else if (mostRecent.result === "loss") {
          currentStreak = { type: "loss", count: currentLossStreak };
        }
      }
  
      return {
        currentStreak,
        longestWinStreak,
        longestLossStreak
      };
    }
  
    // Main statistics calculation function
    function calculateStatistics(trades, archives, period) {
      const { start, end } = getDateRange(period);
      const filteredTrades = filterTradesByDate(trades, start, end);
  
      if (filteredTrades.length === 0) {
        return null;
      }
  
      const wins = filteredTrades.filter(t => t.result === "win" && t.pnl > 0);
      const losses = filteredTrades.filter(t => t.result === "loss" && t.pnl < 0);
      const totalTrades = filteredTrades.length;
      const winCount = filteredTrades.filter(t => t.result === "win").length;
      const lossCount = filteredTrades.filter(t => t.result === "loss").length;
      
      const totalPnl = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
      const lossRate = totalTrades > 0 ? (lossCount / totalTrades) * 100 : 0;
      
      const avgWin = wins.length > 0 
        ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length 
        : 0;
      const avgLoss = losses.length > 0 
        ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length)
        : 0;
  
      // Calculate Expectancy: (Win Rate x Avg Win) - (Loss Rate x Avg Loss)
      const expectancy = ((winRate / 100) * avgWin) - ((lossRate / 100) * avgLoss);
  
      // Calculate R-Multiple Average (if we have risk data, otherwise use avg win/loss ratio)
      const rMultiple = avgLoss > 0 ? avgWin / avgLoss : 0;
  
      // Calculate Trading Days (unique dates with trades)
      const tradingDays = new Set();
      filteredTrades.forEach(t => {
        if (t.date) {
          tradingDays.add(t.date.split("T")[0]);
        } else if (t.timestamp) {
          tradingDays.add(new Date(t.timestamp).toISOString().split("T")[0]);
        }
      });
      const tradingDaysCount = tradingDays.size;
  
      // Average trades per day
      const avgTradesPerDay = tradingDaysCount > 0 ? totalTrades / tradingDaysCount : 0;
  
      // Best performing day of week
      const dayOfWeekStats = { 0: { pnl: 0, trades: 0 }, 1: { pnl: 0, trades: 0 }, 2: { pnl: 0, trades: 0 }, 3: { pnl: 0, trades: 0 }, 4: { pnl: 0, trades: 0 }, 5: { pnl: 0, trades: 0 }, 6: { pnl: 0, trades: 0 } };
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      filteredTrades.forEach(t => {
        let tradeDate;
        if (t.date) {
          tradeDate = new Date(t.date + "T00:00:00");
        } else if (t.timestamp) {
          tradeDate = new Date(t.timestamp);
        }
        if (tradeDate) {
          const dayOfWeek = tradeDate.getDay();
          dayOfWeekStats[dayOfWeek].pnl += t.pnl || 0;
          dayOfWeekStats[dayOfWeek].trades += 1;
        }
      });
  
      // Find best day of week (by P&L, only if at least 3 trades on that day)
      let bestDayOfWeek = null;
      let bestDayOfWeekPnl = -Infinity;
      for (let i = 0; i < 7; i++) {
        if (dayOfWeekStats[i].trades >= 3 && dayOfWeekStats[i].pnl > bestDayOfWeekPnl) {
          bestDayOfWeekPnl = dayOfWeekStats[i].pnl;
          bestDayOfWeek = {
            day: dayNames[i],
            pnl: dayOfWeekStats[i].pnl,
            trades: dayOfWeekStats[i].trades
          };
        }
      }
  
      const profitFactor = calculateProfitFactor(wins, losses);
      const { bestDay, worstDay } = getBestWorstDays(archives, start, end);
      const topInstruments = getTopInstruments(trades, start, end);
      const streaks = calculateStreaks(filteredTrades);
  
      return {
        totalTrades,
        wins: winCount,
        losses: lossCount,
        winRate: Math.round(winRate * 10) / 10,
        totalPnl,
        avgWin,
        avgLoss,
        expectancy: Math.round(expectancy * 100) / 100,
        rMultiple: Math.round(rMultiple * 100) / 100,
        tradingDays: tradingDaysCount,
        avgTradesPerDay: Math.round(avgTradesPerDay * 10) / 10,
        bestDayOfWeek,
        profitFactor: profitFactor === Infinity ? "∞" : Math.round(profitFactor * 100) / 100,
        bestDay,
        worstDay,
        topInstruments,
        currentStreak: streaks.currentStreak,
        longestWinStreak: streaks.longestWinStreak,
        longestLossStreak: streaks.longestLossStreak
      };
    }
  
    // Render Statistics Dashboard
    window.renderStatisticsDashboard = function renderStatisticsDashboard(period = "all") {
      const contentEl = domCache.get("statistics-content");
      const emptyEl = domCache.get("statistics-empty");
      
      if (!contentEl || !emptyEl) return;
  
      const trades = getFilteredJournal();
      const archives = loadDailyArchives();
      const stats = calculateStatistics(trades, archives, period);
  
      if (!stats) {
        contentEl.innerHTML = "";
        emptyEl.style.display = "block";
        return;
      }
  
      emptyEl.style.display = "none";
  
      // Format date for display
      function formatDate(dateStr) {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
  
      // Color helpers
      const winRateColor = stats.winRate >= 50 ? "text-emerald-300" : "text-rose-300";
      const pnlColor = stats.totalPnl >= 0 ? "text-emerald-300" : "text-rose-300";
      const profitFactorColor = stats.profitFactor === "∞" || stats.profitFactor >= 1.5 
        ? "text-emerald-300" 
        : stats.profitFactor >= 1.0 
        ? "text-amber-300" 
        : "text-rose-300";
  
      const currentStreakColor = stats.currentStreak.type === "win" 
        ? "text-emerald-300" 
        : stats.currentStreak.type === "loss" 
        ? "text-rose-300" 
        : "text-slate-400";
  
      const expectancyColor = stats.expectancy >= 0 ? "text-emerald-300" : "text-rose-300";
      const rMultipleColor = stats.rMultiple >= 2 ? "text-emerald-300" : stats.rMultiple >= 1 ? "text-amber-300" : "text-rose-300";
  
      // Build HTML
      contentEl.innerHTML = `
        <!-- Key Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Total Trades</div>
            <div class="text-[16px] font-semibold text-slate-200">${stats.totalTrades}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Win Rate</div>
            <div class="text-[16px] font-semibold ${winRateColor}">${stats.winRate.toFixed(1)}%</div>
            <div class="mt-1 h-1.5 rounded-full bg-black/40 border border-[#262626] overflow-hidden">
              <div class="h-full ${stats.winRate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'} transition-all" style="width: ${Math.min(stats.winRate, 100)}%"></div>
            </div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Total P&L</div>
            <div class="text-[16px] font-semibold ${pnlColor}">
              ${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}
            </div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Profit Factor</div>
            <div class="text-[16px] font-semibold ${profitFactorColor}">${stats.profitFactor}</div>
          </div>
        </div>
  
        <!-- Advanced Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Expectancy</div>
            <div class="text-[14px] font-semibold ${expectancyColor}">
              ${stats.expectancy >= 0 ? '+' : ''}$${stats.expectancy.toFixed(2)}
            </div>
            <div class="text-[9px] text-slate-500">per trade</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">R-Multiple</div>
            <div class="text-[14px] font-semibold ${rMultipleColor}">${stats.rMultiple.toFixed(2)}R</div>
            <div class="text-[9px] text-slate-500">avg win/loss</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Trading Days</div>
            <div class="text-[14px] font-semibold text-slate-200">${stats.tradingDays}</div>
            <div class="text-[9px] text-slate-500">${stats.avgTradesPerDay} trades/day</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Best Day of Week</div>
            <div class="text-[14px] font-semibold ${stats.bestDayOfWeek ? 'text-emerald-300' : 'text-slate-400'}">
              ${stats.bestDayOfWeek ? stats.bestDayOfWeek.day : 'N/A'}
            </div>
            <div class="text-[9px] text-slate-500">
              ${stats.bestDayOfWeek ? `+$${stats.bestDayOfWeek.pnl.toFixed(2)}` : 'Need more data'}
            </div>
          </div>
        </div>
  
        <!-- Performance Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Avg Win</div>
            <div class="text-[14px] font-semibold text-emerald-300">$${stats.avgWin.toFixed(2)}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Avg Loss</div>
            <div class="text-[14px] font-semibold text-rose-300">$${stats.avgLoss.toFixed(2)}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Best Day</div>
            <div class="text-[12px] font-semibold text-emerald-300">
              ${stats.bestDay ? formatDate(stats.bestDay.date) : "N/A"}
            </div>
            <div class="text-[11px] text-slate-400">
              ${stats.bestDay ? `+$${stats.bestDay.pnl.toFixed(2)}` : ""}
            </div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Worst Day</div>
            <div class="text-[12px] font-semibold text-rose-300">
              ${stats.worstDay ? formatDate(stats.worstDay.date) : "N/A"}
            </div>
            <div class="text-[11px] text-slate-400">
              ${stats.worstDay ? `$${stats.worstDay.pnl.toFixed(2)}` : ""}
            </div>
          </div>
        </div>
  
        <!-- Streak Tracking -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Current Streak</div>
            <div class="text-[14px] font-semibold ${currentStreakColor}">
              ${stats.currentStreak.count > 0 
                ? `${stats.currentStreak.count} ${stats.currentStreak.type === "win" ? "W" : "L"}`
                : "None"}
            </div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Longest Win Streak</div>
            <div class="text-[14px] font-semibold text-emerald-300">${stats.longestWinStreak}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Longest Loss Streak</div>
            <div class="text-[14px] font-semibold text-rose-300">${stats.longestLossStreak}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Wins / Losses</div>
            <div class="text-[14px] font-semibold text-slate-200">
              ${stats.wins}W / ${stats.losses}L
            </div>
          </div>
        </div>
  
        <!-- Top Instruments -->
        ${stats.topInstruments.length > 0 ? `
          <div class="mb-4">
            <h4 class="text-[12px] font-semibold text-slate-300 mb-3">Top Instruments</h4>
            <div class="space-y-2">
              ${stats.topInstruments.map(inst => {
                const instPnlColor = inst.totalPnl >= 0 ? "text-emerald-300" : "text-rose-300";
                return `
                  <div class="rounded-lg bg-black/40 border border-[#262626] p-3 flex items-center justify-between">
                    <div class="flex-1">
                      <div class="text-[12px] font-semibold text-slate-200">${sanitizeHTML(inst.instrument)}</div>
                      <div class="text-[10px] text-slate-400">${inst.trades} trades · ${inst.winRate.toFixed(1)}% WR</div>
                    </div>
                    <div class="text-[13px] font-semibold ${instPnlColor}">
                      ${inst.totalPnl >= 0 ? '+' : ''}$${inst.totalPnl.toFixed(2)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      `;
    };
  
    // ------- Trading Heatmap -------
    window.renderTradingHeatmap = function renderTradingHeatmap() {
      const gridEl = document.getElementById("heatmap-grid");
      const emptyEl = document.getElementById("heatmap-empty");
      const containerEl = document.getElementById("heatmap-container");
      const metricSelect = document.getElementById("heatmap-metric");
      const periodSelect = document.getElementById("analysis-period");
      const bestEl = document.getElementById("heatmap-best");
      const worstEl = document.getElementById("heatmap-worst");
      
      if (!gridEl) return;
      
      const metric = metricSelect?.value || 'pnl';
      const period = periodSelect?.value || 'all';
      
      const trades = getFilteredJournal();
      const { start, end } = getDateRange(period);
      const filteredTrades = filterTradesByDate(trades, start, end);
      
      if (filteredTrades.length === 0) {
        gridEl.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        if (containerEl) containerEl.classList.add('hidden');
        return;
      }
      
      if (emptyEl) emptyEl.classList.add('hidden');
      if (containerEl) containerEl.classList.remove('hidden');
      
      // Build heatmap data: 7 days x 24 hours
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const heatmapData = {};
      
      // Initialize
      days.forEach((day, dayIndex) => {
        heatmapData[dayIndex] = {};
        for (let hour = 0; hour < 24; hour++) {
          heatmapData[dayIndex][hour] = { pnl: 0, wins: 0, losses: 0, trades: 0 };
        }
      });
      
      // Populate data
      filteredTrades.forEach(trade => {
        const date = getTradeDate(trade);
        if (!date) return;
        let dayIndex = date.getDay() - 1; // Monday = 0
        if (dayIndex < 0) dayIndex = 6; // Sunday = 6
        const hour = date.getHours();
        
        heatmapData[dayIndex][hour].trades++;
        heatmapData[dayIndex][hour].pnl += trade.pnl || 0;
        if (trade.result === 'win') heatmapData[dayIndex][hour].wins++;
        if (trade.result === 'loss') heatmapData[dayIndex][hour].losses++;
      });
      
      // Find min/max for coloring
      let minVal = Infinity, maxVal = -Infinity;
      let bestSlot = null, worstSlot = null;
      
      days.forEach((day, dayIndex) => {
        for (let hour = 0; hour < 24; hour++) {
          const cell = heatmapData[dayIndex][hour];
          let value = 0;
          
          if (metric === 'pnl') {
            value = cell.pnl;
          } else if (metric === 'winrate') {
            value = cell.trades > 0 ? (cell.wins / cell.trades) * 100 : 0;
          } else {
            value = cell.trades;
          }
          
          if (cell.trades > 0) {
            if (value < minVal) {
              minVal = value;
              worstSlot = { day, hour, value, trades: cell.trades };
            }
            if (value > maxVal) {
              maxVal = value;
              bestSlot = { day, hour, value, trades: cell.trades };
            }
          }
        }
      });
      
      // Render grid using flexbox (not grid-cols-24 which isn't supported)
      gridEl.innerHTML = days.map((day, dayIndex) => {
        const cells = [];
        for (let hour = 0; hour < 24; hour++) {
          const cell = heatmapData[dayIndex][hour];
          let value = 0;
          
          if (metric === 'pnl') {
            value = cell.pnl;
          } else if (metric === 'winrate') {
            value = cell.trades > 0 ? (cell.wins / cell.trades) * 100 : 0;
          } else {
            value = cell.trades;
          }
          
          // Calculate color based on value
          let bgClass = 'bg-slate-800/30';
          if (cell.trades > 0) {
            if (metric === 'pnl') {
              if (value < 0) {
                bgClass = value < (minVal * 0.5) ? 'bg-rose-600/60' : 'bg-rose-800/40';
              } else if (value > 0) {
                bgClass = value > (maxVal * 0.5) ? 'bg-emerald-500/60' : 'bg-emerald-800/40';
              } else {
                bgClass = 'bg-slate-700/50';
              }
            } else {
              const range = maxVal - minVal;
              const normalized = range > 0 ? (value - minVal) / range : 0.5;
              if (normalized > 0.75) bgClass = 'bg-emerald-500/60';
              else if (normalized > 0.5) bgClass = 'bg-emerald-800/40';
              else if (normalized > 0.25) bgClass = 'bg-slate-600/40';
              else bgClass = 'bg-rose-800/40';
            }
          }
          
          const tooltip = `${day} ${hour}:00 - ${cell.trades} trades, $${cell.pnl.toFixed(2)}, ${cell.trades > 0 ? ((cell.wins/cell.trades)*100).toFixed(0) : 0}% WR`;
          
          cells.push(`<div class="flex-1 h-5 ${bgClass} rounded-sm hover:ring-1 hover:ring-white/30 cursor-pointer" title="${tooltip}"></div>`);
        }
        
        return `
          <div class="flex items-center gap-px">
            <div class="w-12 flex-shrink-0 text-[10px] text-slate-500">${day}</div>
            <div class="flex-1 flex gap-px">
              ${cells.join('')}
            </div>
          </div>
        `;
      }).join('');
      
      // Update summary
      if (bestEl && bestSlot) {
        bestEl.textContent = `${bestSlot.day} ${bestSlot.hour}:00`;
      }
      if (worstEl && worstSlot) {
        worstEl.textContent = `${worstSlot.day} ${worstSlot.hour}:00`;
      }
    };
    
    // ------- Advanced Statistics -------
    let equityCurveChart = null;
    let pnlDistributionChart = null;
    
    window.renderAdvancedStats = function renderAdvancedStats() {
      const periodSelect = document.getElementById("analysis-period");
      const emptyEl = document.getElementById("analysis-empty");
      const period = periodSelect?.value || 'all';
      
      const trades = getFilteredJournal();
      const archives = loadDailyArchives();
      const { start, end } = getDateRange(period);
      const filteredTrades = filterTradesByDate(trades, start, end);
      
      if (filteredTrades.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
      }
      
      if (emptyEl) emptyEl.classList.add('hidden');
      
      // Calculate advanced metrics
      // For win rate: count all trades with result === 'win'
      // For avg calculations: only include trades with actual P&L values
      const winCount = filteredTrades.filter(t => t.result === 'win').length;
      const lossCount = filteredTrades.filter(t => t.result === 'loss').length;
      
      // For averages, only count trades with actual positive/negative P&L
      const winsWithPnl = filteredTrades.filter(t => t.result === 'win' && t.pnl > 0);
      const lossesWithPnl = filteredTrades.filter(t => t.result === 'loss' && t.pnl < 0);
      
      const totalWinAmount = winsWithPnl.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const totalLossAmount = Math.abs(lossesWithPnl.reduce((sum, t) => sum + (t.pnl || 0), 0));
      
      const avgWin = winsWithPnl.length > 0 ? totalWinAmount / winsWithPnl.length : 0;
      const avgLoss = lossesWithPnl.length > 0 ? totalLossAmount / lossesWithPnl.length : 0;
      
      // Expectancy: (Win% × Avg Win) - (Loss% × Avg Loss)
      const winRate = filteredTrades.length > 0 ? winCount / filteredTrades.length : 0;
      const lossRate = filteredTrades.length > 0 ? lossCount / filteredTrades.length : 0;
      const expectancy = (winRate * avgWin) - (lossRate * avgLoss);
      
      // Profit Factor
      const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;
      
      // Streaks
      const streaks = calculateStreaks(filteredTrades);
      
      // Drawdown calculation
      let balance = 0;
      let peak = 0;
      let maxDrawdown = 0;
      let maxDrawdownPercent = 0;
      let currentDrawdown = 0;
      let currentDrawdownPercent = 0;
      let drawdownStart = null;
      let recoveryTrades = 0;
      
      const sortedTrades = [...filteredTrades].sort((a, b) => {
        const dateA = getTradeDate(a) || new Date(0);
        const dateB = getTradeDate(b) || new Date(0);
        return dateA - dateB;
      });
      
      const equityData = [{ x: 0, y: 0 }];
      const drawdownData = [{ x: 0, y: 0 }];
      
      // For proper drawdown calculation, we need a starting reference point
      // Try to get initial balance from: 1) Risk account selector, 2) First available account, 3) Use 0
      const accounts = typeof loadAccounts === 'function' ? loadAccounts() : [];
      
      let initialBalance = 0;
      
      // First try: Check if there's a selected account in Risk Management
      const riskAccountSelector = document.getElementById('risk-account-selector');
      if (riskAccountSelector?.value) {
        const selectedAccount = accounts.find(a => a.id === riskAccountSelector.value);
        if (selectedAccount) {
          initialBalance = parseFloat(selectedAccount.initialBalance) || 0;
        }
      }
      
      // Second try: Use the first account's initial balance
      if (initialBalance === 0 && accounts.length > 0) {
        // Get the account with the most trades linked to it
        const accountTradeCounts = {};
        filteredTrades.forEach(t => {
          if (t.accountId) {
            accountTradeCounts[t.accountId] = (accountTradeCounts[t.accountId] || 0) + 1;
          }
        });
        
        // Find account with most linked trades
        const mostUsedAccountId = Object.entries(accountTradeCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0];
        
        if (mostUsedAccountId) {
          const mostUsedAccount = accounts.find(a => a.id === mostUsedAccountId);
          if (mostUsedAccount) {
            initialBalance = parseFloat(mostUsedAccount.initialBalance) || 0;
          }
        } else {
          // Use first account as fallback
          initialBalance = parseFloat(accounts[0].initialBalance) || 0;
        }
      }
      
      // Start with initial balance for proper drawdown calculation
      let runningBalance = initialBalance;
      let runningPeak = initialBalance;
      
      sortedTrades.forEach((trade, index) => {
        runningBalance += trade.pnl || 0;
        balance = runningBalance - initialBalance; // P&L from start
        equityData.push({ x: index + 1, y: balance });
        
        if (runningBalance > runningPeak) {
          runningPeak = runningBalance;
          if (drawdownStart !== null) {
            recoveryTrades = index - drawdownStart;
          }
          drawdownStart = null;
        }
        
        // Calculate drawdown from peak
        const dd = runningPeak - runningBalance;
        let ddPercent = 0;
        
        if (runningPeak > 0) {
          // Normal case: drawdown as % of peak balance
          ddPercent = (dd / runningPeak) * 100;
          // Cap at 100% for display purposes
          ddPercent = Math.min(ddPercent, 100);
        } else if (runningBalance < 0) {
          // Edge case: peak is 0 or negative, but we have losses
          ddPercent = 100;
        }
        
        drawdownData.push({ x: index + 1, y: -ddPercent });
        
        // Track max drawdown by amount (dd) as well as percent
        if (dd > maxDrawdown) {
          maxDrawdown = dd;
          if (drawdownStart === null) drawdownStart = index;
        }
        if (ddPercent > maxDrawdownPercent) {
          maxDrawdownPercent = ddPercent;
        }
        
        currentDrawdown = dd;
        currentDrawdownPercent = ddPercent;
      });
      
      // Update balance to show total P&L
      balance = runningBalance - initialBalance;
      
      // Trading days
      const tradingDays = new Set(filteredTrades.map(t => 
        t.timestamp ? t.timestamp.slice(0, 10) : null
      ).filter(Boolean)).size;
      
      const avgTradesPerDay = tradingDays > 0 ? filteredTrades.length / tradingDays : 0;
      
      // Calculate total P&L
      const totalPnl = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      // Calculate Risk/Reward ratio
      const rrRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(1) : avgWin > 0 ? '∞' : '0';
      
      // Update Overview Stats
      const totalTradesEl = document.getElementById("analysis-total-trades");
      const winRateEl = document.getElementById("analysis-win-rate");
      const totalPnlEl = document.getElementById("analysis-total-pnl");
      
      if (totalTradesEl) totalTradesEl.textContent = filteredTrades.length;
      if (winRateEl) {
        winRateEl.textContent = `${(winRate * 100).toFixed(1)}%`;
        winRateEl.className = `text-[24px] font-bold ${winRate >= 0.5 ? 'text-emerald-400' : 'text-rose-400'}`;
      }
      if (totalPnlEl) {
        totalPnlEl.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
        totalPnlEl.className = `text-[24px] font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
      }
      
      // Update DOM
      const expectancyEl = document.getElementById("stat-expectancy");
      const profitFactorEl = document.getElementById("stat-profit-factor");
      const avgWinEl = document.getElementById("stat-avg-win");
      const avgLossEl = document.getElementById("stat-avg-loss");
      const rrRatioEl = document.getElementById("stat-risk-reward");
      const maxDdEl = document.getElementById("stat-max-dd");
      const maxDdAmountEl = document.getElementById("stat-max-dd-amount");
      const recoveryEl = document.getElementById("stat-recovery-time");
      const currentDdEl = document.getElementById("stat-current-dd");
      const currentStreakEl = document.getElementById("stat-current-streak");
      const bestStreakEl = document.getElementById("stat-best-streak");
      const worstStreakEl = document.getElementById("stat-worst-streak");
      const avgTradesEl = document.getElementById("stat-avg-trades");
      
      if (expectancyEl) {
        expectancyEl.textContent = `${expectancy >= 0 ? '+' : ''}$${expectancy.toFixed(2)}`;
        expectancyEl.className = `text-[24px] font-bold ${expectancy >= 0 ? 'text-blue-400' : 'text-rose-400'}`;
      }
      if (profitFactorEl) {
        const pfDisplay = profitFactor === Infinity ? '∞' : profitFactor.toFixed(2);
        profitFactorEl.textContent = pfDisplay;
        profitFactorEl.className = `text-[18px] font-bold ${profitFactor >= 1.5 ? 'text-emerald-400' : profitFactor >= 1 ? 'text-amber-400' : 'text-rose-400'}`;
      }
      if (avgWinEl) avgWinEl.textContent = `$${avgWin.toFixed(2)}`;
      if (avgLossEl) avgLossEl.textContent = `$${avgLoss.toFixed(2)}`;
      if (rrRatioEl) rrRatioEl.textContent = `1:${rrRatio}`;
      if (maxDdEl) maxDdEl.textContent = `${maxDrawdownPercent.toFixed(1)}%`;
      if (maxDdAmountEl) maxDdAmountEl.textContent = `$${maxDrawdown.toFixed(2)}`;
      if (recoveryEl) recoveryEl.textContent = recoveryTrades > 0 ? `${recoveryTrades} trades` : '-';
      if (currentDdEl) {
        currentDdEl.textContent = `${currentDrawdownPercent.toFixed(1)}%`;
        currentDdEl.className = `text-[12px] font-semibold ${currentDrawdownPercent > 10 ? 'text-rose-400' : currentDrawdownPercent > 5 ? 'text-amber-400' : 'text-emerald-400'}`;
      }
      if (currentStreakEl) {
        const streak = streaks.currentStreak;
        currentStreakEl.textContent = streak.count > 0 ? `${streak.count} ${streak.type === 'win' ? 'W' : 'L'}` : '-';
        currentStreakEl.className = `text-[12px] font-semibold ${streak.type === 'win' ? 'text-emerald-400' : streak.type === 'loss' ? 'text-rose-400' : 'text-slate-300'}`;
      }
      if (bestStreakEl) bestStreakEl.textContent = streaks.longestWinStreak;
      if (worstStreakEl) worstStreakEl.textContent = streaks.longestLossStreak;
      if (avgTradesEl) avgTradesEl.textContent = avgTradesPerDay.toFixed(1);
      
      // Render Equity Curve Chart
      renderEquityCurveChart(equityData, drawdownData);
      
      // Render P&L Distribution Chart
      renderPnlDistributionChart(filteredTrades);
    };
    
    function renderEquityCurveChart(equityData, drawdownData) {
      const canvas = document.getElementById("equity-curve-chart");
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      if (equityCurveChart) {
        equityCurveChart.destroy();
      }
      
      equityCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Equity',
              data: equityData,
              borderColor: 'rgb(52, 211, 153)',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              fill: true,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2
            },
            {
              label: 'Drawdown %',
              data: drawdownData,
              borderColor: 'rgba(248, 113, 113, 0.5)',
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              fill: true,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#e2e8f0',
              bodyColor: '#94a3b8',
              borderColor: '#262626',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  if (context.datasetIndex === 0) {
                    return `Balance: $${context.parsed.y.toFixed(2)}`;
                  } else {
                    return `Drawdown: ${Math.abs(context.parsed.y).toFixed(1)}%`;
                  }
                }
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              display: true,
              title: {
                display: true,
                text: 'Trade #',
                color: '#64748b',
                font: { size: 10 }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#64748b',
                font: { size: 9 }
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'P&L ($)',
                color: '#64748b',
                font: { size: 10 }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#64748b',
                font: { size: 9 },
                callback: function(value) {
                  return '$' + value;
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'DD %',
                color: '#64748b',
                font: { size: 10 }
              },
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                color: '#64748b',
                font: { size: 9 },
                callback: function(value) {
                  return Math.abs(value) + '%';
                }
              },
              max: 0,
              min: -50
            }
          }
        }
      });
    }
    
    function renderPnlDistributionChart(trades) {
      const canvas = document.getElementById("pnl-distribution-chart");
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      if (pnlDistributionChart) {
        pnlDistributionChart.destroy();
      }
      
      // Create histogram bins
      const pnlValues = trades.map(t => t.pnl || 0).filter(p => p !== 0);
      if (pnlValues.length === 0) return;
      
      const min = Math.min(...pnlValues);
      const max = Math.max(...pnlValues);
      const range = max - min;
      
      const bins = [];
      const labels = [];
      const binStarts = []; // Track bin start values for coloring
      
      // Handle edge case: all values are the same (range = 0) or only 1-2 values
      if (range === 0 || pnlValues.length <= 2) {
        // Just show one bar with the count
        bins.push(pnlValues.length);
        labels.push(`$${min.toFixed(0)}`);
        binStarts.push(min);
      } else {
        // Normal histogram
        const binCount = Math.min(20, Math.max(5, Math.ceil(pnlValues.length / 3)));
        const binSize = range / binCount;
        
        for (let i = 0; i < binCount; i++) {
          const binStart = min + (i * binSize);
          const binEnd = i === binCount - 1 ? max + 0.01 : binStart + binSize;
          const count = pnlValues.filter(p => p >= binStart && p < binEnd).length;
          bins.push(count);
          labels.push(`$${binStart.toFixed(0)}`);
          binStarts.push(binStart);
        }
      }
      
      // Determine colors based on bin values
      const colors = binStarts.map(binStart => {
        return binStart >= 0 ? 'rgba(52, 211, 153, 0.6)' : 'rgba(248, 113, 113, 0.6)';
      });
      
      pnlDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Trades',
            data: bins,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.6', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#e2e8f0',
              bodyColor: '#94a3b8'
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#64748b',
                font: { size: 8 },
                maxRotation: 45
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: '#64748b',
                font: { size: 9 }
              }
            }
          }
        }
      });
    }
    
    // Initialize Analysis Page
    function initHeatmapAndStats() {
      const heatmapMetric = document.getElementById("heatmap-metric");
      const analysisPeriod = document.getElementById("analysis-period");
      
      if (heatmapMetric) {
        heatmapMetric.addEventListener("change", renderTradingHeatmap);
      }
      
      if (analysisPeriod) {
        analysisPeriod.addEventListener("change", () => {
          renderTradingHeatmap();
          renderAdvancedStats();
        });
      }
      
      // Initial render
      renderTradingHeatmap();
      renderAdvancedStats();
      renderStrategyPerformance();
    }
    
    // ------- Strategy Performance -------
    window.renderStrategyPerformance = function renderStrategyPerformance() {
      const listEl = document.getElementById("strategy-performance-list");
      if (!listEl) return;
      
      const setups = loadPlaybook();
      const currentFilter = getGlobalFilter();
      const filterLabel = currentFilter === 'all' ? null : 
        currentFilter.startsWith('cat:') ? currentFilter.replace('cat:', '').charAt(0).toUpperCase() + currentFilter.replace('cat:', '').slice(1) :
        loadAccounts().find(a => a.id === currentFilter)?.name || null;
      
      if (setups.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-8">
            <div class="text-3xl mb-3 opacity-50">📚</div>
            <div class="text-[12px] text-slate-400 mb-1">No setups yet</div>
            <div class="text-[10px] text-slate-600">Create setups in Playbook to track strategy performance</div>
          </div>
        `;
        return;
      }
      
      // Calculate stats for each setup (use filtered journal if filter is active)
      const useFiltered = currentFilter !== 'all';
      const setupsWithStats = setups.map(setup => ({
        ...setup,
        stats: calculateSetupStats(setup.id, useFiltered)
      })).filter(s => s.stats.trades > 0);
      
      if (setupsWithStats.length === 0) {
        listEl.innerHTML = `
          <div class="text-center py-8">
            <div class="text-3xl mb-3 opacity-50">🎯</div>
            <div class="text-[12px] text-slate-400 mb-1">${filterLabel ? `No ${filterLabel} trades linked` : 'No trades linked yet'}</div>
            <div class="text-[10px] text-slate-600">${filterLabel ? 'Try a different filter or link more trades' : 'Select a setup when logging trades'}</div>
          </div>
        `;
        return;
      }
      
      // Sort by win rate (for setups with 3+ trades) then by P&L
      setupsWithStats.sort((a, b) => {
        if (a.stats.trades >= 3 && b.stats.trades >= 3) {
          return b.stats.winRate - a.stats.winRate;
        }
        if (a.stats.trades >= 3) return -1;
        if (b.stats.trades >= 3) return 1;
        return b.stats.totalPnl - a.stats.totalPnl;
      });
      
      // Calculate totals
      const totalTrades = setupsWithStats.reduce((sum, s) => sum + s.stats.trades, 0);
      const avgWinRate = setupsWithStats.reduce((sum, s) => sum + s.stats.winRate, 0) / setupsWithStats.length;
      const totalPnl = setupsWithStats.reduce((sum, s) => sum + s.stats.totalPnl, 0);
      
      listEl.innerHTML = `
        <!-- Filter indicator -->
        ${filterLabel ? `<div class="mb-3 px-2.5 py-1.5 rounded-lg bg-slate-800/30 border border-slate-700/30 text-[10px] text-slate-400">
          Showing: <span class="text-slate-200 font-medium">${filterLabel}</span>
        </div>` : ''}
        
        <!-- Summary Stats -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="text-center py-2 px-3 rounded-lg bg-slate-800/50">
            <div class="text-[16px] font-bold text-slate-200">${setupsWithStats.length}</div>
            <div class="text-[9px] text-slate-500 uppercase tracking-wide">Strategies</div>
          </div>
          <div class="text-center py-2 px-3 rounded-lg bg-slate-800/50">
            <div class="text-[16px] font-bold ${avgWinRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}">${avgWinRate.toFixed(0)}%</div>
            <div class="text-[9px] text-slate-500 uppercase tracking-wide">Avg Win</div>
          </div>
          <div class="text-center py-2 px-3 rounded-lg bg-slate-800/50">
            <div class="text-[16px] font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}</div>
            <div class="text-[9px] text-slate-500 uppercase tracking-wide">Total P&L</div>
          </div>
        </div>
        
        <!-- Strategy List -->
        <div class="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
          ${setupsWithStats.map((setup, index) => {
            const winRate = setup.stats.winRate;
            const winRateColor = winRate >= 60 ? 'text-emerald-400' : winRate >= 50 ? 'text-blue-400' : winRate >= 40 ? 'text-amber-400' : 'text-rose-400';
            const barColor = winRate >= 60 ? 'bg-emerald-500' : winRate >= 50 ? 'bg-blue-500' : winRate >= 40 ? 'bg-amber-500' : 'bg-rose-500';
            const pnlColor = setup.stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400';
            
            // Medal for top 3
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            // Best category badge (only show in "all" view)
            const bestCatBadge = !filterLabel && setup.stats.bestCategory && setup.stats.bestCategory !== 'unknown'
              ? `<span class="px-1.5 py-0.5 rounded text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20">Best: ${setup.stats.bestCategory}</span>`
              : '';
            
            return `
              <div class="group p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-transparent hover:border-slate-700/50 transition-all cursor-pointer" data-setup-id="${setup.id}">
                <div class="flex items-center gap-3">
                  <!-- Rank/Medal -->
                  <div class="w-8 text-center">
                    ${medal ? `<span class="text-[16px]">${medal}</span>` : `<span class="text-[11px] text-slate-600 font-medium">#${index + 1}</span>`}
                  </div>
                  
                  <!-- Strategy Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="text-[12px] font-medium text-slate-200 truncate">${sanitizeHTML(setup.name)}</span>
                      ${setup.stats.trades >= 5 ? '<span class="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">★</span>' : ''}
                      ${bestCatBadge}
                    </div>
                    
                    <!-- Win Rate Bar -->
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div class="h-full ${barColor} rounded-full transition-all" style="width: ${Math.min(winRate, 100)}%"></div>
                      </div>
                      <span class="${winRateColor} text-[11px] font-semibold w-10 text-right">${winRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <!-- P&L -->
                  <div class="text-right pl-2">
                    <div class="text-[13px] font-bold ${pnlColor}">${setup.stats.totalPnl >= 0 ? '+' : ''}$${setup.stats.totalPnl.toFixed(0)}</div>
                    <div class="text-[9px] text-slate-600">${setup.stats.trades} trade${setup.stats.trades !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        ${setupsWithStats.length > 4 ? `
          <div class="mt-3 pt-3 border-t border-slate-800/50 text-center">
            <span class="text-[10px] text-slate-600">${setupsWithStats.length} strategies total • Scroll to see all</span>
          </div>
        ` : ''}
      `;
      
      // Add click handlers to open setup details
      listEl.querySelectorAll('[data-setup-id]').forEach(item => {
        item.addEventListener('click', () => {
          const setupId = item.dataset.setupId;
          if (window.openSetupDetail) window.openSetupDetail(setupId);
        });
      });
    };
    
    // Expose function to refresh analysis when section becomes visible
    window.refreshAnalysis = function() {
      renderTradingHeatmap();
      renderAdvancedStats();
      renderStrategyPerformance();
    };
  
    // ------- Playbook System -------
    const PLAYBOOK_STORAGE_KEY = "tradingdesk:playbook";
    
    function loadPlaybook() {
      try {
        return JSON.parse(localStorage.getItem(PLAYBOOK_STORAGE_KEY) || "[]");
      } catch (e) {
        console.error("Failed to load playbook:", e);
        return [];
      }
    }
    
    function savePlaybook(setups) {
      localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(setups));
    }
    
    function calculateSetupStats(setupId, useFiltered = false) {
      const journal = useFiltered ? getFilteredJournal() : loadJournal();
      const accounts = loadAccounts();
      const setupTrades = journal.filter(t => t.setupId === setupId);
      
      if (setupTrades.length === 0) {
        return { trades: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0, avgPnl: 0, byCategory: {} };
      }
      
      const wins = setupTrades.filter(t => t.result === 'win').length;
      const losses = setupTrades.filter(t => t.result === 'loss').length;
      const totalPnl = setupTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      // Calculate stats by category
      const byCategory = {};
      setupTrades.forEach(trade => {
        const account = accounts.find(a => a.id === trade.account);
        const category = account?.category || 'unknown';
        
        if (!byCategory[category]) {
          byCategory[category] = { trades: 0, wins: 0, pnl: 0 };
        }
        byCategory[category].trades++;
        if (trade.result === 'win') byCategory[category].wins++;
        byCategory[category].pnl += trade.pnl || 0;
      });
      
      // Calculate win rate for each category
      Object.keys(byCategory).forEach(cat => {
        byCategory[cat].winRate = byCategory[cat].trades > 0 
          ? (byCategory[cat].wins / byCategory[cat].trades) * 100 
          : 0;
      });
      
      // Find best category
      let bestCategory = null;
      let bestWinRate = 0;
      Object.entries(byCategory).forEach(([cat, stats]) => {
        if (stats.trades >= 2 && stats.winRate > bestWinRate) {
          bestWinRate = stats.winRate;
          bestCategory = cat;
        }
      });
      
      return {
        trades: setupTrades.length,
        wins,
        losses,
        winRate: (wins / setupTrades.length) * 100,
        totalPnl,
        avgPnl: totalPnl / setupTrades.length,
        byCategory,
        bestCategory
      };
    }
    
    window.renderPlaybook = function renderPlaybook() {
      const gridEl = document.getElementById("playbook-grid");
      const emptyEl = document.getElementById("playbook-empty");
      const searchInput = document.getElementById("playbook-search");
      const filterTag = document.getElementById("playbook-filter-tag");
      const sortSelect = document.getElementById("playbook-sort");
      
      if (!gridEl) return;
      
      let setups = loadPlaybook();
      
      // Apply search filter
      const searchTerm = searchInput?.value?.toLowerCase() || '';
      if (searchTerm) {
        setups = setups.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply tag filter
      const tagFilter = filterTag?.value || '';
      if (tagFilter) {
        setups = setups.filter(s => s.tags?.includes(tagFilter));
      }
      
      // Calculate stats for each setup
      setups = setups.map(setup => ({
        ...setup,
        stats: calculateSetupStats(setup.id)
      }));
      
      // Apply sorting
      const sortBy = sortSelect?.value || 'recent';
      switch (sortBy) {
        case 'winrate':
          setups.sort((a, b) => b.stats.winRate - a.stats.winRate);
          break;
        case 'trades':
          setups.sort((a, b) => b.stats.trades - a.stats.trades);
          break;
        case 'pnl':
          setups.sort((a, b) => b.stats.totalPnl - a.stats.totalPnl);
          break;
        case 'recent':
        default:
          setups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Update stats
      updatePlaybookStats(setups);
      
      if (setups.length === 0) {
        gridEl.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
      }
      
      if (emptyEl) emptyEl.classList.add('hidden');
      
      // Render setups
      gridEl.innerHTML = setups.map(setup => {
        const tagColors = {
          breakout: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
          reversal: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
          continuation: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
          scalp: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
          swing: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
          orderflow: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
        };
        
        const tagsHtml = (setup.tags || []).map(tag => 
          `<span class="px-2 py-0.5 rounded-full text-[9px] border ${tagColors[tag] || 'bg-slate-500/20 border-slate-500/30 text-slate-300'}">${tag}</span>`
        ).join('');
        
        const winRateColor = setup.stats.winRate >= 60 ? 'text-emerald-400' : setup.stats.winRate >= 50 ? 'text-amber-400' : 'text-rose-400';
        const pnlColor = setup.stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400';
        
        return `
          <div class="rounded-xl bg-[#0a0a0a] border border-[#161616] overflow-hidden hover:border-slate-600 transition-colors cursor-pointer group" data-setup-id="${setup.id}">
            ${setup.screenshot ? `
              <div class="h-32 overflow-hidden">
                <img src="${setup.screenshot}" alt="${sanitizeHTML(setup.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ` : `
              <div class="h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            `}
            <div class="p-4">
              <h4 class="text-[13px] font-semibold text-slate-200 mb-1 truncate">${sanitizeHTML(setup.name)}</h4>
              <p class="text-[10px] text-slate-500 mb-3 line-clamp-2">${sanitizeHTML(setup.description || 'No description')}</p>
              
              <div class="flex flex-wrap gap-1 mb-3">
                ${tagsHtml || '<span class="text-[9px] text-slate-600">No tags</span>'}
              </div>
              
              <div class="grid grid-cols-3 gap-2 pt-3 border-t border-[#161616]">
                <div class="text-center">
                  <div class="text-[9px] text-slate-500">Trades</div>
                  <div class="text-[12px] font-semibold text-slate-300">${setup.stats.trades}</div>
                </div>
                <div class="text-center">
                  <div class="text-[9px] text-slate-500">Win Rate</div>
                  <div class="text-[12px] font-semibold ${winRateColor}">${setup.stats.winRate.toFixed(0)}%</div>
                </div>
                <div class="text-center">
                  <div class="text-[9px] text-slate-500">P&L</div>
                  <div class="text-[12px] font-semibold ${pnlColor}">${setup.stats.totalPnl >= 0 ? '+' : ''}$${setup.stats.totalPnl.toFixed(0)}</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      // Add click handlers
      gridEl.querySelectorAll('[data-setup-id]').forEach(card => {
        card.addEventListener('click', () => {
          const setupId = card.dataset.setupId;
          openSetupDetail(setupId);
        });
      });
    };
    
    function updatePlaybookStats(setups) {
      const totalSetupsEl = document.getElementById("playbook-total-setups");
      const bestSetupEl = document.getElementById("playbook-best-setup");
      const bestWinrateEl = document.getElementById("playbook-best-winrate");
      const totalTradesEl = document.getElementById("playbook-total-trades");
      const avgWinrateEl = document.getElementById("playbook-avg-winrate");
      
      const totalTrades = setups.reduce((sum, s) => sum + s.stats.trades, 0);
      const avgWinrate = setups.length > 0 
        ? setups.reduce((sum, s) => sum + s.stats.winRate, 0) / setups.length 
        : 0;
      
      const bestSetup = setups.reduce((best, s) => 
        s.stats.trades >= 5 && s.stats.winRate > (best?.stats?.winRate || 0) ? s : best
      , null);
      
      if (totalSetupsEl) totalSetupsEl.textContent = setups.length;
      if (totalTradesEl) totalTradesEl.textContent = totalTrades;
      if (avgWinrateEl) avgWinrateEl.textContent = `${avgWinrate.toFixed(0)}%`;
      if (bestSetupEl) bestSetupEl.textContent = bestSetup?.name || '-';
      if (bestWinrateEl) bestWinrateEl.textContent = bestSetup ? `${bestSetup.stats.winRate.toFixed(0)}% WR` : '-';
    }
    
    window.openSetupDetail = function openSetupDetail(setupId) {
      const modal = document.getElementById("setup-detail-modal");
      const titleEl = document.getElementById("setup-detail-title");
      const contentEl = document.getElementById("setup-detail-content");
      
      if (!modal || !contentEl) return;
      
      const setups = loadPlaybook();
      const setup = setups.find(s => s.id === setupId);
      
      if (!setup) return;
      
      const stats = calculateSetupStats(setupId);
      
      if (titleEl) titleEl.textContent = setup.name;
      
      const tagColors = {
        breakout: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
        reversal: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
        continuation: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
        scalp: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
        swing: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
        orderflow: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
      };
      
      const tagsHtml = (setup.tags || []).map(tag => 
        `<span class="px-3 py-1 rounded-full text-[10px] border ${tagColors[tag] || 'bg-slate-500/20 border-slate-500/30 text-slate-300'}">${tag}</span>`
      ).join('');
      
      contentEl.innerHTML = `
        <div class="space-y-5">
          ${setup.screenshot ? `
            <div class="rounded-lg overflow-hidden border border-[#262626]">
              <img src="${setup.screenshot}" alt="${sanitizeHTML(setup.name)}" class="w-full" />
            </div>
          ` : ''}
          
          <div>
            <p class="text-[12px] text-slate-400">${sanitizeHTML(setup.description || 'No description provided.')}</p>
          </div>
          
          <div class="flex flex-wrap gap-2">
            ${tagsHtml || '<span class="text-[11px] text-slate-600">No tags</span>'}
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-4 gap-3">
            <div class="rounded-lg bg-black/40 border border-[#262626] p-3 text-center">
              <div class="text-[9px] text-slate-500">Total Trades</div>
              <div class="text-[18px] font-bold text-slate-200">${stats.trades}</div>
            </div>
            <div class="rounded-lg bg-black/40 border border-[#262626] p-3 text-center">
              <div class="text-[9px] text-slate-500">Win Rate</div>
              <div class="text-[18px] font-bold ${stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}">${stats.winRate.toFixed(1)}%</div>
            </div>
            <div class="rounded-lg bg-black/40 border border-[#262626] p-3 text-center">
              <div class="text-[9px] text-slate-500">Total P&L</div>
              <div class="text-[18px] font-bold ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}</div>
            </div>
            <div class="rounded-lg bg-black/40 border border-[#262626] p-3 text-center">
              <div class="text-[9px] text-slate-500">Avg P&L</div>
              <div class="text-[18px] font-bold ${stats.avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${stats.avgPnl >= 0 ? '+' : ''}$${stats.avgPnl.toFixed(2)}</div>
            </div>
          </div>
          
          <!-- Rules -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="rounded-lg bg-black/40 border border-[#262626] p-4">
              <h4 class="text-[12px] font-semibold text-emerald-400 mb-2">Entry Rules</h4>
              <p class="text-[11px] text-slate-400 whitespace-pre-wrap">${sanitizeHTML(setup.rules?.entry || 'Not specified')}</p>
            </div>
            <div class="rounded-lg bg-black/40 border border-[#262626] p-4">
              <h4 class="text-[12px] font-semibold text-blue-400 mb-2">Exit Rules</h4>
              <p class="text-[11px] text-slate-400 whitespace-pre-wrap">${sanitizeHTML(setup.rules?.exit || 'Not specified')}</p>
            </div>
          </div>
          
          ${setup.rules?.avoid ? `
            <div class="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4">
              <h4 class="text-[12px] font-semibold text-rose-400 mb-2">What to Avoid</h4>
              <p class="text-[11px] text-slate-400 whitespace-pre-wrap">${sanitizeHTML(setup.rules.avoid)}</p>
            </div>
          ` : ''}
          
          ${setup.instruments?.length > 0 ? `
            <div>
              <h4 class="text-[11px] font-semibold text-slate-400 mb-2">Instruments</h4>
              <div class="flex flex-wrap gap-2">
                ${setup.instruments.map(inst => `<span class="px-2 py-1 rounded bg-black/40 border border-[#262626] text-[10px] text-slate-300">${sanitizeHTML(inst)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="text-[10px] text-slate-600 pt-3 border-t border-[#161616]">
            Created: ${new Date(setup.createdAt).toLocaleDateString()}
          </div>
        </div>
      `;
      
      // Store current setup ID for edit/delete
      modal.dataset.setupId = setupId;
      modal.classList.remove('hidden');
    }
    
    let currentSetupScreenshot = null;
    
    // ------- Setup Selector for Trade Checklist -------
    window.populateSetupSelector = function populateSetupSelector() {
      const select = document.getElementById("trade-setup-select");
      if (!select) return;
      
      const setups = loadPlaybook();
      
      // Clear existing options except the first one
      select.innerHTML = '<option value="">No setup selected</option>';
      
      if (setups.length === 0) {
        const emptyOption = document.createElement("option");
        emptyOption.disabled = true;
        emptyOption.textContent = "— No setups yet. Create one in Playbook —";
        select.appendChild(emptyOption);
        return;
      }
      
      // Group setups by tag
      const byTag = {};
      setups.forEach(setup => {
        const tag = setup.tags?.[0] || 'Other';
        if (!byTag[tag]) byTag[tag] = [];
        byTag[tag].push(setup);
      });
      
      // Add setups grouped by tag
      Object.keys(byTag).sort().forEach(tag => {
        const group = document.createElement("optgroup");
        group.label = tag;
        
        byTag[tag].forEach(setup => {
          const stats = calculateSetupStats(setup.id);
          const option = document.createElement("option");
          option.value = setup.id;
          option.textContent = `${setup.name}${stats.trades > 0 ? ` (${stats.winRate.toFixed(0)}% WR)` : ''}`;
          option.dataset.setupName = setup.name;
          option.dataset.setupDesc = setup.description || '';
          option.dataset.winRate = stats.winRate || 0;
          option.dataset.trades = stats.trades || 0;
          group.appendChild(option);
        });
        
        select.appendChild(group);
      });
    };
    
    function initSetupSelector() {
      const select = document.getElementById("trade-setup-select");
      const preview = document.getElementById("selected-setup-preview");
      
      if (!select) return;
      
      // Populate on init
      populateSetupSelector();
      
      // Show preview on selection
      select.addEventListener("change", () => {
        const selectedOption = select.options[select.selectedIndex];
        
        if (!selectedOption.value || !preview) {
          if (preview) preview.classList.add("hidden");
          return;
        }
        
        const name = selectedOption.dataset.setupName || selectedOption.textContent;
        const desc = selectedOption.dataset.setupDesc || '';
        const winRate = selectedOption.dataset.winRate || 0;
        const trades = selectedOption.dataset.trades || 0;
        
        const nameEl = document.getElementById("setup-preview-name");
        const winRateEl = document.getElementById("setup-preview-winrate");
        
        if (nameEl) nameEl.textContent = name;
        if (winRateEl) {
          if (trades > 0) {
            winRateEl.textContent = `${parseFloat(winRate).toFixed(0)}% · ${trades} trade${trades > 1 ? 's' : ''}`;
            winRateEl.className = `text-[10px] ${parseFloat(winRate) >= 50 ? 'text-emerald-400' : 'text-amber-400'}`;
          } else {
            winRateEl.textContent = 'New';
            winRateEl.className = 'text-[10px] text-slate-500';
          }
        }
        
        preview.classList.remove("hidden");
      });
    }
    
    // Get selected setup ID
    window.getSelectedSetupId = function() {
      const select = document.getElementById("trade-setup-select");
      return select?.value || null;
    };
    
    // Clear setup selection
    window.clearSetupSelection = function() {
      const select = document.getElementById("trade-setup-select");
      const preview = document.getElementById("selected-setup-preview");
      if (select) select.value = "";
      if (preview) preview.classList.add("hidden");
    };
  
    function initPlaybook() {
      const addSetupBtn = document.getElementById("btn-add-setup");
      const addSetupEmptyBtn = document.getElementById("btn-add-setup-empty");
      const setupModal = document.getElementById("setup-modal");
      const closeSetupModalBtn = document.getElementById("btn-close-setup-modal");
      const cancelSetupBtn = document.getElementById("btn-cancel-setup");
      const saveSetupBtn = document.getElementById("btn-save-setup");
      const detailModal = document.getElementById("setup-detail-modal");
      const closeDetailBtn = document.getElementById("btn-close-setup-detail");
      const editSetupBtn = document.getElementById("btn-edit-setup");
      const deleteSetupBtn = document.getElementById("btn-delete-setup");
      const searchInput = document.getElementById("playbook-search");
      const filterTag = document.getElementById("playbook-filter-tag");
      const sortSelect = document.getElementById("playbook-sort");
      const screenshotDrop = document.getElementById("setup-screenshot-drop");
      const screenshotInput = document.getElementById("setup-screenshot-input");
      const removeScreenshotBtn = document.getElementById("btn-remove-screenshot");
      
      // Open modal
      const openSetupModal = (editId = null) => {
        if (!setupModal) return;
        
        const titleEl = document.getElementById("setup-modal-title");
        if (titleEl) titleEl.textContent = editId ? 'Edit Setup' : 'Add New Setup';
        
        // Clear form
        document.getElementById("setup-name").value = '';
        document.getElementById("setup-description").value = '';
        document.getElementById("setup-entry-rules").value = '';
        document.getElementById("setup-exit-rules").value = '';
        document.getElementById("setup-avoid").value = '';
        document.getElementById("setup-instruments").value = '';
        document.querySelectorAll('input[name="setup-tag"]').forEach(cb => cb.checked = false);
        currentSetupScreenshot = null;
        document.getElementById("setup-screenshot-preview")?.classList.add('hidden');
        document.getElementById("setup-screenshot-placeholder")?.classList.remove('hidden');
        
        // If editing, populate form
        if (editId) {
          const setups = loadPlaybook();
          const setup = setups.find(s => s.id === editId);
          if (setup) {
            document.getElementById("setup-name").value = setup.name || '';
            document.getElementById("setup-description").value = setup.description || '';
            document.getElementById("setup-entry-rules").value = setup.rules?.entry || '';
            document.getElementById("setup-exit-rules").value = setup.rules?.exit || '';
            document.getElementById("setup-avoid").value = setup.rules?.avoid || '';
            document.getElementById("setup-instruments").value = (setup.instruments || []).join(', ');
            (setup.tags || []).forEach(tag => {
              const cb = document.querySelector(`input[name="setup-tag"][value="${tag}"]`);
              if (cb) cb.checked = true;
            });
            if (setup.screenshot) {
              currentSetupScreenshot = setup.screenshot;
              const img = document.getElementById("setup-screenshot-img");
              if (img) img.src = setup.screenshot;
              document.getElementById("setup-screenshot-preview")?.classList.remove('hidden');
              document.getElementById("setup-screenshot-placeholder")?.classList.add('hidden');
            }
          }
          setupModal.dataset.editId = editId;
        } else {
          delete setupModal.dataset.editId;
        }
        
        setupModal.classList.remove('hidden');
      };
      
      if (addSetupBtn) addSetupBtn.addEventListener('click', () => openSetupModal());
      if (addSetupEmptyBtn) addSetupEmptyBtn.addEventListener('click', () => openSetupModal());
      
      // Close modals
      if (closeSetupModalBtn) closeSetupModalBtn.addEventListener('click', () => setupModal?.classList.add('hidden'));
      if (cancelSetupBtn) cancelSetupBtn.addEventListener('click', () => setupModal?.classList.add('hidden'));
      if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => detailModal?.classList.add('hidden'));
      
      // Save setup
      if (saveSetupBtn) {
        saveSetupBtn.addEventListener('click', () => {
          const name = document.getElementById("setup-name")?.value?.trim();
          if (!name) {
            alert('Please enter a setup name');
            return;
          }
          
          const tags = Array.from(document.querySelectorAll('input[name="setup-tag"]:checked')).map(cb => cb.value);
          const instruments = document.getElementById("setup-instruments")?.value
            ?.split(',')
            .map(s => s.trim())
            .filter(Boolean) || [];
          
          const setup = {
            id: setupModal.dataset.editId || `setup-${Date.now()}`,
            name,
            description: document.getElementById("setup-description")?.value?.trim() || '',
            tags,
            rules: {
              entry: document.getElementById("setup-entry-rules")?.value?.trim() || '',
              exit: document.getElementById("setup-exit-rules")?.value?.trim() || '',
              avoid: document.getElementById("setup-avoid")?.value?.trim() || ''
            },
            instruments,
            screenshot: currentSetupScreenshot,
            createdAt: setupModal.dataset.editId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const setups = loadPlaybook();
          const existingIndex = setups.findIndex(s => s.id === setup.id);
          
          if (existingIndex >= 0) {
            setup.createdAt = setups[existingIndex].createdAt;
            setups[existingIndex] = setup;
          } else {
            setups.push(setup);
          }
          
          savePlaybook(setups);
          setupModal.classList.add('hidden');
          renderPlaybook();
          // Refresh setup selector in Trade Checklist
          if (window.populateSetupSelector) window.populateSetupSelector();
          // Refresh strategy performance in Analysis
          if (window.renderStrategyPerformance) window.renderStrategyPerformance();
        });
      }
      
      // Edit setup
      if (editSetupBtn) {
        editSetupBtn.addEventListener('click', () => {
          const setupId = detailModal?.dataset.setupId;
          if (setupId) {
            detailModal.classList.add('hidden');
            openSetupModal(setupId);
          }
        });
      }
      
      // Delete setup
      if (deleteSetupBtn) {
        deleteSetupBtn.addEventListener('click', () => {
          const setupId = detailModal?.dataset.setupId;
          if (setupId && confirm('Delete this setup? This cannot be undone.')) {
            let setups = loadPlaybook();
            setups = setups.filter(s => s.id !== setupId);
            savePlaybook(setups);
            detailModal.classList.add('hidden');
            renderPlaybook();
            // Refresh setup selector in Trade Checklist
            if (window.populateSetupSelector) window.populateSetupSelector();
            // Refresh strategy performance in Analysis
            if (window.renderStrategyPerformance) window.renderStrategyPerformance();
          }
        });
      }
      
      // Search and filter
      if (searchInput) searchInput.addEventListener('input', renderPlaybook);
      if (filterTag) filterTag.addEventListener('change', renderPlaybook);
      if (sortSelect) sortSelect.addEventListener('change', renderPlaybook);
      
      // Screenshot handling
      if (screenshotDrop && screenshotInput) {
        screenshotDrop.addEventListener('click', () => screenshotInput.click());
        
        screenshotDrop.addEventListener('dragover', (e) => {
          e.preventDefault();
          screenshotDrop.classList.add('border-emerald-500/50');
        });
        
        screenshotDrop.addEventListener('dragleave', () => {
          screenshotDrop.classList.remove('border-emerald-500/50');
        });
        
        screenshotDrop.addEventListener('drop', (e) => {
          e.preventDefault();
          screenshotDrop.classList.remove('border-emerald-500/50');
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            handleScreenshotFile(file);
          }
        });
        
        screenshotInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) handleScreenshotFile(file);
        });
      }
      
      if (removeScreenshotBtn) {
        removeScreenshotBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentSetupScreenshot = null;
          document.getElementById("setup-screenshot-preview")?.classList.add('hidden');
          document.getElementById("setup-screenshot-placeholder")?.classList.remove('hidden');
        });
      }
      
      function handleScreenshotFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          currentSetupScreenshot = e.target.result;
          const img = document.getElementById("setup-screenshot-img");
          if (img) img.src = currentSetupScreenshot;
          document.getElementById("setup-screenshot-preview")?.classList.remove('hidden');
          document.getElementById("setup-screenshot-placeholder")?.classList.add('hidden');
        };
        reader.readAsDataURL(file);
      }
      
      // Initial render
      renderPlaybook();
    }
  
    // ------- Trade Import System -------
    const IMPORT_HISTORY_KEY = "tradingdesk:import-history";
    let parsedTrades = [];
    let csvHeaders = [];
    let columnMapping = {};
    
    function loadImportHistory() {
      try {
        return JSON.parse(localStorage.getItem(IMPORT_HISTORY_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }
    
    function saveImportHistory(history) {
      localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(history));
    }
    
    // CSV Parser
    function parseCSV(text) {
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) return { headers: [], rows: [] };
      
      // Detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : 
                       firstLine.includes(';') ? ';' : ',';
      
      const parseRow = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };
      
      const headers = parseRow(lines[0]);
      const rows = lines.slice(1).map(parseRow).filter(row => row.some(cell => cell));
      
      return { headers, rows };
    }
    
    // Format detection
    function detectFormat(headers) {
      const headerStr = headers.join(',').toLowerCase();
      
      if (headerStr.includes('tradingview') || headerStr.includes('trade #')) {
        return 'tradingview';
      }
      if (headerStr.includes('ticket') && headerStr.includes('magic')) {
        return 'mt4';
      }
      if (headerStr.includes('position id') || headerStr.includes('deal')) {
        return 'mt5';
      }
      if (headerStr.includes('execid') || headerStr.includes('ibkr') || headerStr.includes('conid')) {
        return 'ibkr';
      }
      
      return 'generic';
    }
    
    // Format-specific parsers
    const formatParsers = {
      tradingview: (headers, row) => {
        const get = (name) => {
          const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
          return idx >= 0 ? row[idx]?.trim() : '';
        };
        
        // Get all values for debugging
        const allValues = row.join(' ').toUpperCase();
        
        // Check for Balance History format (has direct P&L)
        const balanceChange = parseFloat(get('change') || get('amount') || get('delta')) || 0;
        const realizedPnl = parseFloat(
          get('realized') || get('realised') || get('profit') || 
          get('pnl') || get('p&l') || get('pl') || get('net')
        ) || 0;
        
        // Balance History usually has "Type" field with values like "Trade", "Funding", etc.
        const transactionType = get('type')?.toLowerCase() || '';
        const description = get('description') || get('desc') || get('note') || get('comment') || '';
        
        // Try to extract instrument from description or other fields
        let instrument = get('symbol') || get('ticker') || get('market') || get('asset') || get('instrument');
        
        // If no instrument found, try to extract from description or row values
        if (!instrument) {
          // Look for common crypto patterns in any field
          const cryptoPatterns = [
            /\b(BTC|ETH|XRP|SOL|DOGE|ADA|DOT|LINK|AVAX|MATIC)(USD[T]?|USDC|PERP|\.P)?\b/i,
            /\b(BYBIT|BINANCE|COINBASE|FTX)[:\s]?([A-Z]{3,10})[:\s]?([A-Z]{3,10})?\b/i
          ];
          
          for (const pattern of cryptoPatterns) {
            const match = allValues.match(pattern);
            if (match) {
              instrument = match[0].replace(/\s+/g, ':');
              break;
            }
          }
          
          // Also check description field
          if (!instrument && description) {
            const descMatch = description.match(/\b([A-Z]{2,10}(?:USD[T]?|PERP|\.P)?)\b/i);
            if (descMatch) {
              instrument = descMatch[1].toUpperCase();
            }
          }
        }
        
        // Use balance change or realized P&L
        const directPnl = realizedPnl || balanceChange;
        
        return {
          timestamp: get('closing') || get('placing') || get('date') || get('time'),
          instrument: instrument || '',
          direction: get('side')?.toLowerCase() === 'buy' ? 'long' : 
                     get('side')?.toLowerCase() === 'sell' ? 'short' :
                     (directPnl >= 0 ? 'long' : 'short'),
          side: get('side')?.toLowerCase(),
          entry: parseFloat(get('fill') || get('entry') || get('price') || get('limit') || get('avg')) || 0,
          exit: parseFloat(get('exit') || get('close')) || 0,
          pnl: directPnl,
          size: parseFloat(get('qty') || get('quantity') || get('size') || get('volume')) || 1,
          orderId: get('order id') || get('orderid') || get('id') || '',
          status: get('status')?.toLowerCase() || '',
          transactionType: transactionType,
          description: description,
          isBalanceHistory: realizedPnl !== 0 || balanceChange !== 0
        };
      },
      
      mt4: (headers, row) => {
        const get = (name) => {
          const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
          return idx >= 0 ? row[idx] : '';
        };
        
        return {
          timestamp: get('open time') || get('time'),
          instrument: get('symbol'),
          direction: get('type')?.toLowerCase().includes('buy') ? 'long' : 'short',
          entry: parseFloat(get('open price') || get('price')) || 0,
          exit: parseFloat(get('close price')) || 0,
          pnl: parseFloat(get('profit')) || 0,
          size: parseFloat(get('volume') || get('lots')) || 1
        };
      },
      
      mt5: (headers, row) => {
        const get = (name) => {
          const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
          return idx >= 0 ? row[idx] : '';
        };
        
        return {
          timestamp: get('time') || get('date'),
          instrument: get('symbol'),
          direction: get('type')?.toLowerCase().includes('buy') ? 'long' : 'short',
          entry: parseFloat(get('price')) || 0,
          exit: parseFloat(get('price')) || 0,
          pnl: parseFloat(get('profit')) || 0,
          size: parseFloat(get('volume')) || 1
        };
      },
      
      ibkr: (headers, row) => {
        const get = (name) => {
          const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
          return idx >= 0 ? row[idx] : '';
        };
        
        return {
          timestamp: get('datetime') || get('date/time') || get('tradedate'),
          instrument: get('symbol') || get('underlying'),
          direction: get('buy/sell')?.toLowerCase() === 'buy' ? 'long' : 'short',
          entry: parseFloat(get('tradeprice') || get('price')) || 0,
          exit: parseFloat(get('tradeprice') || get('price')) || 0,
          pnl: parseFloat(get('fifopnlrealized') || get('realizedpnl') || get('pnl')) || 0,
          size: parseFloat(get('quantity') || get('qty')) || 1
        };
      },
      
      generic: (headers, row, mapping) => {
        const get = (field) => {
          const colIdx = mapping[field];
          return colIdx !== undefined && colIdx >= 0 ? row[colIdx] : '';
        };
        
        const directionVal = get('direction')?.toLowerCase();
        const direction = directionVal?.includes('long') || directionVal?.includes('buy') ? 'long' : 
                         directionVal?.includes('short') || directionVal?.includes('sell') ? 'short' : 'long';
        
        return {
          timestamp: get('timestamp'),
          instrument: get('instrument'),
          direction,
          entry: parseFloat(get('entry')) || 0,
          exit: parseFloat(get('exit')) || 0,
          pnl: parseFloat(get('pnl')) || 0,
          size: parseFloat(get('size')) || 1
        };
      }
    };
    
    // Detect if instrument is inverse perpetual (BTCUSD, ETHUSD etc.) vs linear (BTCUSDT, ETHUSDT)
    function isInverseContract(instrument) {
      if (!instrument || typeof instrument !== 'string') return false;
      const upper = instrument.toUpperCase();
      // Inverse contracts typically end in USD (not USDT/USDC)
      // Examples: BTCUSD, BTCUSD.P, ETHUSD.P, XBTUSD
      if (upper.includes('USDT') || upper.includes('USDC') || upper.includes('BUSD')) {
        return false; // Linear
      }
      if (upper.includes('USD') || upper.includes('XBT')) {
        return true; // Inverse
      }
      return false; // Default to linear
    }
    
    // Calculate P&L based on contract type
    function calculatePnL(instrument, isLong, entryPrice, exitPrice, size) {
      const inverse = isInverseContract(instrument);
      
      if (inverse) {
        // Inverse perpetual: P&L = Contracts × (1/Entry - 1/Exit) for longs
        // Contract value is typically 1 USD per contract
        if (isLong) {
          // Long: profit when price goes up
          // P&L = size × (1/entry - 1/exit)
          return size * (1/entryPrice - 1/exitPrice);
        } else {
          // Short: profit when price goes down
          // P&L = size × (1/exit - 1/entry)
          return size * (1/exitPrice - 1/entryPrice);
        }
      } else {
        // Linear perpetual: P&L = Qty × (Exit - Entry) for longs
        if (isLong) {
          return size * (exitPrice - entryPrice);
        } else {
          return size * (entryPrice - exitPrice);
        }
      }
    }
    
    // Match TradingView orders to create complete trades with P&L
    function matchTradingViewOrders(orders) {
      const trades = [];
      const positions = {}; // Track open positions by instrument
      
      // Sort by timestamp
      orders.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      
      orders.forEach((order, index) => {
        if (!order.instrument || order.entry <= 0) return;
        if (order.status && !order.status.includes('fill') && !order.status.includes('executed') && order.status !== '') return;
        
        const key = order.instrument.toUpperCase();
        const isBuy = order.side === 'buy';
        
        if (!positions[key]) {
          positions[key] = [];
        }
        
        // Check if this closes an existing position
        const oppositePositions = positions[key].filter(p => p.isBuy !== isBuy);
        
        if (oppositePositions.length > 0) {
          // Close the oldest matching position (FIFO)
          const openPos = oppositePositions[0];
          const entryPrice = openPos.price;
          const exitPrice = order.entry;
          const size = Math.min(openPos.size, order.size);
          
          // Calculate P&L using proper formula
          let pnl = calculatePnL(key, openPos.isBuy, entryPrice, exitPrice, size);
          
          // For inverse contracts, pnl is in BTC - convert to USD estimate
          if (isInverseContract(key)) {
            // P&L in BTC × current price ≈ USD value
            pnl = pnl * exitPrice;
          }
          
          // Round to 2 decimals
          pnl = Math.round(pnl * 100) / 100;
          
          trades.push({
            id: `import-${Date.now()}-${index}`,
            timestamp: order.timestamp,
            instrument: key,
            direction: openPos.isBuy ? 'long' : 'short',
            entry: entryPrice,
            exit: exitPrice,
            pnl: pnl,
            size: size,
            result: pnl > 0.001 ? 'win' : pnl < -0.001 ? 'loss' : 'breakeven',
            source: 'tradingview',
            selected: true,
            isDuplicate: false
          });
          
          // Update or remove the open position
          const posIdx = positions[key].indexOf(openPos);
          if (openPos.size > size) {
            positions[key][posIdx].size -= size;
          } else {
            positions[key].splice(posIdx, 1);
          }
          
          // If closing order has remaining size, it opens a new position
          if (order.size > size) {
            positions[key].push({
              isBuy,
              price: order.entry,
              size: order.size - size,
              timestamp: order.timestamp
            });
          }
        } else {
          // Open a new position
          positions[key].push({
            isBuy,
            price: order.entry,
            size: order.size,
            timestamp: order.timestamp
          });
        }
      });
      
      return trades;
    }
    
    function parseTradesFromCSV(headers, rows, format, mapping = {}) {
      const parser = formatParsers[format] || formatParsers.generic;
      const trades = [];
      
      // For TradingView, collect all orders first then match them
      if (format === 'tradingview') {
        const orders = [];
        rows.forEach((row) => {
          try {
            const order = parser(headers, row);
            
            // Parse timestamp
            let timestamp = order.timestamp;
            if (timestamp) {
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) {
                timestamp = date.toISOString();
              }
            }
            order.timestamp = timestamp;
            
            // Include if it has instrument and price, OR if it has direct P&L (Balance History)
            if ((order.instrument && order.entry > 0) || order.pnl !== 0) {
              orders.push(order);
            }
          } catch (e) {
            console.warn('Failed to parse TradingView row:', row, e);
          }
        });
        
        // Check if this is Balance History (has direct P&L values)
        const hasDirectPnl = orders.some(o => o.pnl !== 0);
        const isBalanceHistory = orders.some(o => o.isBalanceHistory);
        
        if (hasDirectPnl || isBalanceHistory) {
          // Use direct P&L values from Balance History
          // Filter out non-trade transactions (funding, deposits, etc.)
          return orders
            .filter(o => {
              // Keep if it's a trade or has P&L and instrument
              const isValidTrade = o.pnl !== 0 || (o.instrument && o.entry > 0);
              const isNotFunding = !o.transactionType?.includes('fund');
              const isNotDeposit = !o.transactionType?.includes('deposit') && !o.transactionType?.includes('withdraw');
              return isValidTrade && isNotFunding && isNotDeposit;
            })
            .map((order, index) => ({
              id: `import-${Date.now()}-${index}`,
              timestamp: order.timestamp,
              instrument: (order.instrument || 'Unknown').toUpperCase(),
              direction: order.direction || (order.pnl >= 0 ? 'long' : 'short'),
              entry: order.entry || 0,
              exit: order.exit || order.entry || 0,
              pnl: order.pnl,
              size: order.size || 1,
              result: order.pnl > 0.001 ? 'win' : order.pnl < -0.001 ? 'loss' : 'breakeven',
              source: 'tradingview',
              selected: true,
              isDuplicate: false,
              hasDirectPnl: true
            }));
        } else {
          // Match buy/sell orders to calculate P&L (Order History without P&L)
          return matchTradingViewOrders(orders);
        }
      }
      
      // Standard parsing for other formats
      rows.forEach((row, index) => {
        try {
          const trade = format === 'generic' ? parser(headers, row, mapping) : parser(headers, row);
          
          // Validate trade
          if (trade.instrument && (trade.pnl !== 0 || trade.entry > 0)) {
            // Parse timestamp
            let timestamp = trade.timestamp;
            if (timestamp) {
              const date = new Date(timestamp);
              if (!isNaN(date.getTime())) {
                timestamp = date.toISOString();
              }
            }
            
            // Determine result
            const result = trade.pnl > 0 ? 'win' : trade.pnl < 0 ? 'loss' : 'breakeven';
            
            trades.push({
              id: `import-${Date.now()}-${index}`,
              timestamp,
              instrument: trade.instrument.toUpperCase(),
              direction: trade.direction,
              entry: trade.entry,
              exit: trade.exit,
              pnl: trade.pnl,
              size: trade.size,
              result,
              source: format,
              selected: true,
              isDuplicate: false
            });
          }
        } catch (e) {
          console.warn('Failed to parse row:', row, e);
        }
      });
      
      return trades;
    }
    
    function checkDuplicates(trades) {
      const journal = loadJournal();
      const skipDuplicatesCheckbox = document.getElementById("import-skip-duplicates");
      const skipDuplicates = skipDuplicatesCheckbox?.checked ?? true;
      
      return trades.map(trade => {
        // Check for duplicates based on timestamp and instrument
        const isDuplicate = journal.some(j => {
          const jDate = getTradeDate(j);
          const tradeDate = getTradeDate(trade);
          if (!jDate || !tradeDate) return false;
          const sameTime = Math.abs(jDate - tradeDate) < 60000; // Within 1 minute
          const sameInstrument = j.instrument?.toUpperCase() === trade.instrument?.toUpperCase();
          const samePnl = Math.abs((j.pnl || 0) - (trade.pnl || 0)) < 0.01;
          return sameTime && sameInstrument && samePnl;
        });
        
        // Duplicates are unchecked by default if skipDuplicates is on, but user can still select them
        const selected = isDuplicate && skipDuplicates ? false : trade.selected;
        
        return { ...trade, isDuplicate, selected };
      });
    }
    
    function renderImportPreview() {
      const previewSection = document.getElementById("import-preview-section");
      const actionsSection = document.getElementById("import-actions");
      const previewBody = document.getElementById("import-preview-body");
      const countEl = document.getElementById("import-preview-count");
      const totalEl = document.getElementById("import-total");
      const selectedEl = document.getElementById("import-selected");
      const duplicatesEl = document.getElementById("import-duplicates");
      const totalPnlEl = document.getElementById("import-total-pnl");
      const skipDuplicates = document.getElementById("import-skip-duplicates")?.checked;
      const multiplierInput = document.getElementById("import-contract-multiplier");
      const pnlNote = document.getElementById("import-pnl-note");
      const contractTypeEl = document.getElementById("import-contract-type");
      const multiplier = parseFloat(multiplierInput?.value) || 1;
      
      if (!previewBody || parsedTrades.length === 0) {
        previewSection?.classList.add('hidden');
        actionsSection?.classList.add('hidden');
        return;
      }
      
      previewSection?.classList.remove('hidden');
      actionsSection?.classList.remove('hidden');
      
      // Show P&L note for TradingView imports
      const isTradingView = parsedTrades.some(t => t.source === 'tradingview');
      const hasDirectPnl = parsedTrades.some(t => t.hasDirectPnl);
      
      if (pnlNote) {
        const badge = document.getElementById('import-pnl-badge');
        const icon = document.getElementById('import-pnl-icon');
        const text = document.getElementById('import-pnl-text');
        
        if (isTradingView && parsedTrades.some(t => t.pnl !== 0 || t.entry > 0)) {
          pnlNote.classList.remove('hidden');
          
          if (hasDirectPnl) {
            // Balance History - has real P&L
            if (badge) {
              badge.className = 'flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20';
            }
            if (icon) {
              icon.className = 'text-emerald-400';
              icon.textContent = '✓';
            }
            if (text) {
              text.className = 'text-emerald-300';
              text.textContent = 'P&L fra Balance History';
            }
            if (contractTypeEl) {
              contractTypeEl.textContent = '• Klar til import';
              contractTypeEl.className = 'text-emerald-500/70';
            }
          } else {
            // Order History - calculated P&L
            if (badge) {
              badge.className = 'flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20';
            }
            if (icon) {
              icon.className = 'text-blue-400';
              icon.textContent = '○';
            }
            if (text) {
              text.className = 'text-blue-300';
              text.textContent = 'P&L beregnet fra priser';
            }
            // Show contract types detected
            const instruments = [...new Set(parsedTrades.map(t => t.instrument).filter(i => i && i !== 'UNKNOWN'))];
            if (contractTypeEl && instruments.length > 0) {
              const types = instruments.slice(0, 2).map(i => isInverseContract(i) ? 'Inv' : 'Lin').join('/');
              contractTypeEl.textContent = `• ${types}`;
              contractTypeEl.className = 'text-slate-500';
            }
          }
        } else {
          pnlNote.classList.add('hidden');
        }
      }
      
      // Apply multiplier and filter based on skip duplicates
      const displayTrades = parsedTrades.map(t => ({
        ...t,
        pnl: t.pnl * multiplier
        // selected state is managed directly on parsedTrades
      }));
      
      // Render rows
      previewBody.innerHTML = displayTrades.map((trade, idx) => {
        const dateStr = trade.timestamp ? new Date(trade.timestamp).toLocaleString() : 'Unknown';
        const pnlColor = trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400';
        const directionBadge = trade.direction === 'long' 
          ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px]">Long</span>'
          : '<span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px]">Short</span>';
        
        // Check if instrument is missing or unknown
        const instrumentMissing = !trade.instrument || trade.instrument === 'UNKNOWN' || trade.instrument === '';
        const instrumentDisplay = instrumentMissing 
          ? `<input type="text" class="import-instrument-input w-24 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 placeholder-amber-500/50" data-index="${idx}" placeholder="BTCUSDT" value="" />`
          : `<span class="text-slate-200 font-medium">${sanitizeHTML(trade.instrument)}</span>`;
        
        // Determine status
        let statusBadge = '';
        const isEffectivelySelected = trade.selected && (!skipDuplicates || !trade.isDuplicate);
        
        if (trade.isDuplicate && !trade.selected) {
          statusBadge = '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px]" title="Already exists - check to import anyway">Exists</span>';
        } else if (trade.isDuplicate && trade.selected) {
          statusBadge = '<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[9px]">Re-import</span>';
        } else if (instrumentMissing) {
          statusBadge = '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px]">Need Symbol</span>';
        } else if (trade.selected) {
          statusBadge = '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px]">Ready</span>';
        } else {
          statusBadge = '<span class="px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400 text-[9px]">Skipped</span>';
        }
        
        return `
          <tr class="border-b border-[#161616] hover:bg-black/20 ${trade.isDuplicate && !trade.selected ? 'opacity-60' : ''} ${instrumentMissing ? 'bg-amber-500/5' : ''}">
            <td class="py-2 px-2">
              <input type="checkbox" class="import-trade-checkbox rounded border-slate-600" data-index="${idx}" ${trade.selected ? 'checked' : ''} />
            </td>
            <td class="py-2 px-2 text-slate-300">${dateStr}</td>
            <td class="py-2 px-2">${instrumentDisplay}</td>
            <td class="py-2 px-2">${directionBadge}</td>
            <td class="py-2 px-2 text-right text-slate-300">${trade.entry > 0 ? trade.entry.toFixed(2) : '-'}</td>
            <td class="py-2 px-2 text-right text-slate-300">${trade.exit > 0 ? trade.exit.toFixed(2) : '-'}</td>
            <td class="py-2 px-2 text-right ${pnlColor}">${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}</td>
            <td class="py-2 px-2 text-center">${statusBadge}</td>
          </tr>
        `;
      }).join('');
      
      // Update stats - count selected trades (duplicates only if user explicitly selected them)
      const selected = displayTrades.filter(t => t.selected).length;
      const duplicates = displayTrades.filter(t => t.isDuplicate).length;
      const totalPnl = displayTrades.filter(t => t.selected).reduce((sum, t) => sum + t.pnl, 0);
      
      if (countEl) countEl.textContent = `${parsedTrades.length} trades found`;
      if (totalEl) totalEl.textContent = parsedTrades.length;
      if (selectedEl) selectedEl.textContent = selected;
      if (duplicatesEl) duplicatesEl.textContent = duplicates;
      if (totalPnlEl) {
        totalPnlEl.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
        totalPnlEl.className = `text-[14px] font-semibold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
      }
      
      // Add checkbox handlers
      previewBody.querySelectorAll('.import-trade-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.index);
          parsedTrades[idx].selected = e.target.checked;
          renderImportPreview();
        });
      });
      
      // Add instrument input handlers
      previewBody.querySelectorAll('.import-instrument-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.index);
          const value = e.target.value.trim().toUpperCase();
          if (value) {
            parsedTrades[idx].instrument = value;
            renderImportPreview();
          }
        });
        input.addEventListener('blur', (e) => {
          const idx = parseInt(e.target.dataset.index);
          const value = e.target.value.trim().toUpperCase();
          if (value) {
            parsedTrades[idx].instrument = value;
            renderImportPreview();
          }
        });
      });
    }
    
    const MAPPING_FIELDS = [
      { key: 'timestamp', label: 'Date/Time', required: true },
      { key: 'instrument', label: 'Instrument/Symbol', required: true },
      { key: 'direction', label: 'Direction (Buy/Sell)', required: false },
      { key: 'entry', label: 'Entry Price', required: false },
      { key: 'exit', label: 'Exit Price', required: false },
      { key: 'pnl', label: 'P&L / Profit', required: true },
      { key: 'size', label: 'Size / Quantity', required: false }
    ];
    
    // Auto-detect column mapping based on header names
    function autoDetectColumns() {
      const mappingGrid = document.getElementById("import-mapping-grid");
      const statusEl = document.getElementById("auto-map-status");
      const messageEl = document.getElementById("auto-map-message");
      
      if (!mappingGrid || csvHeaders.length === 0) return 0;
      
      let matchedCount = 0;
      
      MAPPING_FIELDS.forEach(field => {
        const select = mappingGrid.querySelector(`select[data-field="${field.key}"]`);
        if (!select) return;
        
        // Extended matching patterns for common CSV formats
        const matchIdx = csvHeaders.findIndex(h => {
          const lower = h.toLowerCase().replace(/[_\-\s]/g, '');
          switch (field.key) {
            case 'timestamp': 
              return lower.includes('date') || lower.includes('time') || 
                     lower.includes('placed') || lower.includes('closed') ||
                     lower.includes('opentime') || lower.includes('closetime') ||
                     lower === 'dt' || lower === 'datetime';
            case 'instrument': 
              return lower.includes('symbol') || lower.includes('instrument') || 
                     lower.includes('ticker') || lower.includes('asset') ||
                     lower.includes('market') || lower.includes('pair') ||
                     lower === 'sym' || lower === 'stk';
            case 'direction': 
              return lower.includes('direction') || lower.includes('side') || 
                     lower.includes('type') || lower.includes('action') ||
                     lower.includes('buysell') || lower === 'bs';
            case 'entry': 
              return lower.includes('entry') || lower.includes('openprice') || 
                     lower.includes('fillprice') || lower.includes('avgprice') ||
                     lower.includes('buyprice') || lower === 'open';
            case 'exit': 
              return lower.includes('exit') || lower.includes('closeprice') || 
                     lower.includes('sellprice') || lower === 'close';
            case 'pnl': 
              return lower.includes('pnl') || lower.includes('profit') || 
                     lower.includes('p&l') || lower.includes('pandl') ||
                     lower.includes('realizedpl') || lower.includes('netpl') ||
                     lower.includes('gain') || lower.includes('return') ||
                     lower === 'pl' || lower === 'result';
            case 'size': 
              return lower.includes('size') || lower.includes('qty') || 
                     lower.includes('quantity') || lower.includes('volume') ||
                     lower.includes('lots') || lower.includes('shares') ||
                     lower.includes('contracts') || lower === 'vol';
            default: 
              return false;
          }
        });
        
        if (matchIdx >= 0) {
          select.value = matchIdx;
          columnMapping[field.key] = matchIdx;
          matchedCount++;
          // Add visual feedback
          select.classList.add('border-emerald-500/50');
          setTimeout(() => select.classList.remove('border-emerald-500/50'), 2000);
        }
      });
      
      // Show status message
      if (statusEl && messageEl) {
        if (matchedCount > 0) {
          messageEl.textContent = `✓ Auto-detected ${matchedCount} of ${MAPPING_FIELDS.length} columns`;
          statusEl.classList.remove('hidden');
          setTimeout(() => statusEl.classList.add('hidden'), 4000);
        }
      }
      
      return matchedCount;
    }
    
    function renderColumnMapping() {
      const mappingSection = document.getElementById("import-mapping-section");
      const mappingGrid = document.getElementById("import-mapping-grid");
      
      if (!mappingGrid || csvHeaders.length === 0) return;
      
      mappingSection?.classList.remove('hidden');
      
      mappingGrid.innerHTML = MAPPING_FIELDS.map(field => `
        <div>
          <label class="block text-[10px] text-slate-500 mb-1">
            ${field.label} ${field.required ? '<span class="text-rose-400">*</span>' : ''}
          </label>
          <select class="column-mapping-select w-full px-2 py-1.5 rounded-lg bg-black/60 border border-[#262626] text-[11px] text-slate-300 focus:outline-none transition-colors" data-field="${field.key}">
            <option value="-1">-- Select column --</option>
            ${csvHeaders.map((h, i) => `<option value="${i}">${sanitizeHTML(h)}</option>`).join('')}
          </select>
        </div>
      `).join('');
      
      // Auto-map columns on initial load
      autoDetectColumns();
      
      // Add change handlers
      mappingGrid.querySelectorAll('.column-mapping-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const field = e.target.dataset.field;
          columnMapping[field] = parseInt(e.target.value);
          
          // Re-parse trades with new mapping
          const format = document.getElementById("import-format")?.value || 'generic';
          if (format === 'generic') {
            const { headers, rows } = parseCSV(currentCSVText);
            parsedTrades = parseTradesFromCSV(headers, rows, 'generic', columnMapping);
            parsedTrades = checkDuplicates(parsedTrades);
            renderImportPreview();
          }
        });
      });
    }
    
    let currentCSVText = '';
    
    // Populate import account selector with available accounts
    function populateImportAccountSelector() {
      const selector = document.getElementById('import-account-selector');
      if (!selector) return;
      
      const accounts = loadAccounts();
      const currentValue = selector.value;
      
      // Get global filter to sync with it
      const globalFilter = getGlobalFilter();
      
      // Build options grouped by category
      let html = '<option value="">Velg konto ⚠️</option>';
      
      const categories = {
        crypto: 'Crypto',
        forex: 'Forex',
        stocks: 'Stocks',
        futures: 'Futures',
        options: 'Options',
        other: 'Other'
      };
      
      // Group accounts by category
      const grouped = {};
      accounts.forEach(a => {
        const cat = a.category || 'other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(a);
      });
      
      // Build optgroups
      Object.entries(categories).forEach(([key, label]) => {
        if (grouped[key] && grouped[key].length > 0) {
          html += `<optgroup label="${label}">`;
          grouped[key].forEach(a => {
            html += `<option value="${sanitizeHTML(a.id)}">${sanitizeHTML(a.name)}</option>`;
          });
          html += '</optgroup>';
        }
      });
      
      selector.innerHTML = html;
      
      // Priority for selection:
      // 1. If a specific account is selected globally, use that
      // 2. Otherwise restore previous selection if valid
      // 3. Otherwise leave at "No account"
      if (globalFilter && globalFilter !== 'all' && !globalFilter.startsWith('cat:')) {
        // A specific account is selected globally - sync to it
        if (accounts.some(a => a.id === globalFilter)) {
          selector.value = globalFilter;
        }
      } else if (currentValue && accounts.some(a => a.id === currentValue)) {
        // Restore previous selection
        selector.value = currentValue;
      }
    }
    
    function deleteImportHistoryItem(timestamp) {
      if (!confirm('Remove this import from history?\n\nNote: This only removes the history entry, not the imported trades.')) {
        return;
      }
      
      const history = loadImportHistory();
      const updatedHistory = history.filter(item => item.timestamp !== timestamp);
      localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(updatedHistory));
      renderImportHistory();
    }
    
    // Expose for onclick
    window.deleteImportHistoryItem = deleteImportHistoryItem;
    
    function renderImportHistory() {
      const listEl = document.getElementById("import-history-list");
      const emptyEl = document.getElementById("import-history-empty");
      
      if (!listEl) return;
      
      const history = loadImportHistory();
      
      if (history.length === 0) {
        listEl.innerHTML = '';
        emptyEl?.classList.remove('hidden');
        return;
      }
      
      emptyEl?.classList.add('hidden');
      
      listEl.innerHTML = history.slice(0, 10).map(item => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-[#262626] group hover:border-[#333] transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <div class="text-[11px] font-medium text-slate-200">${sanitizeHTML(item.filename)}</div>
              <div class="text-[9px] text-slate-500">${item.tradesImported} trades • ${new Date(item.timestamp).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-[11px] ${item.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${item.totalPnl >= 0 ? '+' : ''}$${item.totalPnl.toFixed(2)}
            </div>
            <button 
              onclick="deleteImportHistoryItem('${item.timestamp}')"
              class="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
              title="Remove from history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
    }
    
    function initTradeImport() {
      // Guide toggle functionality
      const guideToggle = document.getElementById("import-guide-toggle");
      const guideContent = document.getElementById("import-guide-content");
      const guideChevron = document.getElementById("import-guide-chevron");
      
      if (guideToggle && guideContent && guideChevron) {
        guideToggle.addEventListener('click', () => {
          const isOpen = !guideContent.classList.contains('hidden');
          if (isOpen) {
            guideContent.classList.add('hidden');
            guideChevron.style.transform = 'rotate(0deg)';
          } else {
            guideContent.classList.remove('hidden');
            guideChevron.style.transform = 'rotate(180deg)';
          }
        });
      }
      
      const dropzone = document.getElementById("import-dropzone");
      const fileInput = document.getElementById("import-file-input");
      const fileInfo = document.getElementById("import-file-info");
      const formatSelect = document.getElementById("import-format");
      const removeFileBtn = document.getElementById("btn-remove-import-file");
      const cancelBtn = document.getElementById("btn-cancel-import");
      const importBtn = document.getElementById("btn-import-trades");
      const selectAllCheckbox = document.getElementById("import-select-all");
      const skipDuplicatesCheckbox = document.getElementById("import-skip-duplicates");
      const autoMapBtn = document.getElementById("btn-auto-map");
      
      // Auto-map button
      if (autoMapBtn) {
        autoMapBtn.addEventListener('click', () => {
          const matched = autoDetectColumns();
          if (matched === 0) {
            // Show message that no columns were matched
            const statusEl = document.getElementById("auto-map-status");
            const messageEl = document.getElementById("auto-map-message");
            if (statusEl && messageEl) {
              statusEl.classList.remove('bg-emerald-500/10', 'border-emerald-500/20');
              statusEl.classList.add('bg-amber-500/10', 'border-amber-500/20');
              messageEl.innerHTML = `<span class="text-amber-400">⚠️ Could not auto-detect columns. Please map manually.</span>`;
              statusEl.classList.remove('hidden');
              setTimeout(() => {
                statusEl.classList.add('hidden');
                statusEl.classList.remove('bg-amber-500/10', 'border-amber-500/20');
                statusEl.classList.add('bg-emerald-500/10', 'border-emerald-500/20');
              }, 4000);
            }
          }
          // Update preview after auto-mapping
          renderImportPreview();
        });
      }
      
      // Multi-file storage
      let uploadedFiles = [];
      let orderHistoryData = null;
      let balanceHistoryData = null;
      
      // File drop handling
      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        
        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('border-emerald-500/50', 'bg-emerald-500/5');
        });
        
        dropzone.addEventListener('dragleave', () => {
          dropzone.classList.remove('border-emerald-500/50', 'bg-emerald-500/5');
        });
        
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('border-emerald-500/50', 'bg-emerald-500/5');
          const files = Array.from(e.dataTransfer.files);
          handleFiles(files);
        });
        
        fileInput.addEventListener('change', (e) => {
          const files = Array.from(e.target.files);
          handleFiles(files);
        });
      }
      
      // Show TradingView hint when format is selected
      if (formatSelect) {
        formatSelect.addEventListener('change', () => {
          const hint = document.getElementById('tv-multi-file-hint');
          if (hint) {
            if (formatSelect.value === 'tradingview' || formatSelect.value === 'auto') {
              hint.classList.remove('hidden');
            } else {
              hint.classList.add('hidden');
            }
          }
        });
      }
      
      function detectFileType(headers, content) {
        const headerStr = headers.join(',').toLowerCase();
        
        // Balance History typically has: change, balance, type (with values like "Trade")
        if (headerStr.includes('balance') && (headerStr.includes('change') || headerStr.includes('amount'))) {
          return 'balance-history';
        }
        
        // Order History typically has: side, fill price, status, order id
        if ((headerStr.includes('side') || headerStr.includes('buy') || headerStr.includes('sell')) && 
            (headerStr.includes('fill') || headerStr.includes('price') || headerStr.includes('order'))) {
          return 'order-history';
        }
        
        // Check content for clues
        if (content.toLowerCase().includes('realized') || content.toLowerCase().includes('profit')) {
          return 'balance-history';
        }
        
        return 'unknown';
      }
      
      function renderUploadedFiles() {
        const container = document.getElementById('import-files-container');
        if (!container) return;
        
        if (uploadedFiles.length === 0) {
          container.classList.add('hidden');
          return;
        }
        
        container.classList.remove('hidden');
        container.innerHTML = uploadedFiles.map((f, idx) => `
          <div class="p-3 rounded-lg bg-black/40 border border-[#262626] flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg ${f.type === 'balance-history' ? 'bg-emerald-500/20' : 'bg-blue-500/20'} flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${f.type === 'balance-history' ? 'text-emerald-400' : 'text-blue-400'}">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <div class="text-[11px] font-medium text-slate-200">${sanitizeHTML(f.name)}</div>
                <div class="text-[9px] ${f.type === 'balance-history' ? 'text-emerald-400' : f.type === 'order-history' ? 'text-blue-400' : 'text-slate-500'}">
                  ${f.type === 'balance-history' ? '💰 Balance History (har P&L)' : 
                    f.type === 'order-history' ? '📋 Order History' : '📄 CSV fil'}
                </div>
              </div>
            </div>
            <button class="remove-file-btn text-[10px] text-rose-400 hover:text-rose-300" data-index="${idx}">×</button>
          </div>
        `).join('');
        
        // Add remove handlers
        container.querySelectorAll('.remove-file-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            uploadedFiles.splice(idx, 1);
            processAllFiles();
            renderUploadedFiles();
          });
        });
      }
      
      function handleFiles(files) {
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;
            const { headers, rows } = parseCSV(content);
            const fileType = detectFileType(headers, content);
            
            uploadedFiles.push({
              name: file.name,
              size: file.size,
              content: content,
              headers: headers,
              rows: rows,
              type: fileType
            });
            
            renderUploadedFiles();
            processAllFiles();
          };
          reader.readAsText(file);
        });
      }
      
      function processAllFiles() {
        if (uploadedFiles.length === 0) {
          parsedTrades = [];
          csvHeaders = [];
          currentCSVText = '';
          document.getElementById("import-preview-section")?.classList.add('hidden');
          document.getElementById("import-actions")?.classList.add('hidden');
          document.getElementById("import-mapping-section")?.classList.add('hidden');
          return;
        }
        
        // Separate files by type
        const balanceFiles = uploadedFiles.filter(f => f.type === 'balance-history');
        const orderFiles = uploadedFiles.filter(f => f.type === 'order-history');
        const otherFiles = uploadedFiles.filter(f => f.type === 'unknown');
        
        // Detect or use selected format
        let format = formatSelect?.value || 'auto';
        if (format === 'auto') {
          const firstFile = uploadedFiles[0];
          format = detectFormat(firstFile.headers);
          if (formatSelect) formatSelect.value = format;
        }
        
        // If we have both balance and order history, combine them
        if (balanceFiles.length > 0 && orderFiles.length > 0) {
          console.log('Combining Balance History + Order History');
          
          // Parse balance history for P&L values (raw parsing, not matching)
          const balanceEntries = [];
          balanceFiles.forEach(f => {
            f.rows.forEach(row => {
              const parsed = formatParsers.tradingview(f.headers, row);
              if (parsed.pnl !== 0) {
                balanceEntries.push(parsed);
              }
            });
          });
          console.log('Balance entries with P&L:', balanceEntries.length, balanceEntries);
          
          // Parse order history for trade details (get raw orders)
          const orderEntries = [];
          orderFiles.forEach(f => {
            f.rows.forEach(row => {
              const parsed = formatParsers.tradingview(f.headers, row);
              if (parsed.instrument && parsed.entry > 0) {
                orderEntries.push(parsed);
              }
            });
          });
          console.log('Order entries:', orderEntries.length, orderEntries);
          
          // Match completed trades from orders
          const completedTrades = matchTradingViewOrders(orderEntries);
          console.log('Completed trades from orders:', completedTrades.length, completedTrades);
          
          // Now match P&L from balance to completed trades
          if (completedTrades.length > 0 && balanceEntries.length > 0) {
            // Try to match by date (ignore exact time)
            parsedTrades = completedTrades.map((trade, idx) => {
              const tradeDate = trade.timestamp ? new Date(trade.timestamp).toDateString() : null;
              
              // Find balance entry from same day with similar P&L sign or closest time
              let bestMatch = null;
              let bestScore = -1;
              
              balanceEntries.forEach(be => {
                const balanceDate = be.timestamp ? new Date(be.timestamp).toDateString() : null;
                
                // Score based on matching criteria
                let score = 0;
                
                // Same date = +10
                if (tradeDate && balanceDate && tradeDate === balanceDate) score += 10;
                
                // Same P&L sign = +5
                if ((trade.pnl >= 0) === (be.pnl >= 0)) score += 5;
                
                // Similar absolute P&L value (within 50%) = +3
                if (trade.pnl !== 0 && Math.abs(trade.pnl - be.pnl) / Math.abs(trade.pnl) < 0.5) score += 3;
                
                if (score > bestScore) {
                  bestScore = score;
                  bestMatch = be;
                }
              });
              
              if (bestMatch && bestScore >= 10) {
                // Remove used balance entry
                const beIdx = balanceEntries.indexOf(bestMatch);
                if (beIdx >= 0) balanceEntries.splice(beIdx, 1);
                
                return {
                  ...trade,
                  pnl: bestMatch.pnl,
                  result: bestMatch.pnl > 0.001 ? 'win' : bestMatch.pnl < -0.001 ? 'loss' : 'breakeven',
                  hasDirectPnl: true
                };
              }
              
              return trade;
            });
            
            // Add any unmatched balance entries
            balanceEntries.forEach((be, idx) => {
              parsedTrades.push({
                id: `import-balance-${Date.now()}-${idx}`,
                timestamp: be.timestamp,
                instrument: be.instrument || '',
                direction: be.pnl >= 0 ? 'long' : 'short',
                entry: 0,
                exit: 0,
                pnl: be.pnl,
                size: 1,
                result: be.pnl > 0.001 ? 'win' : be.pnl < -0.001 ? 'loss' : 'breakeven',
                source: 'tradingview',
                selected: true,
                isDuplicate: false,
                hasDirectPnl: true
              });
            });
          } else if (balanceEntries.length > 0) {
            // Only balance history, use those
            parsedTrades = balanceEntries.map((be, idx) => ({
              id: `import-balance-${Date.now()}-${idx}`,
              timestamp: be.timestamp,
              instrument: be.instrument || '',
              direction: be.pnl >= 0 ? 'long' : 'short',
              entry: be.entry || 0,
              exit: be.exit || 0,
              pnl: be.pnl,
              size: be.size || 1,
              result: be.pnl > 0.001 ? 'win' : be.pnl < -0.001 ? 'loss' : 'breakeven',
              source: 'tradingview',
              selected: true,
              isDuplicate: false,
              hasDirectPnl: true
            }));
          } else {
            // Only order history
            parsedTrades = completedTrades;
          }
          
          csvHeaders = uploadedFiles[0].headers;
          currentCSVText = uploadedFiles[0].content;
          
          console.log('Final parsed trades:', parsedTrades.length, parsedTrades);
          
        } else {
          // Single file or same type - process normally
          const allRows = [];
          let headers = [];
          
          uploadedFiles.forEach(f => {
            if (headers.length === 0) headers = f.headers;
            allRows.push(...f.rows);
          });
          
          csvHeaders = headers;
          currentCSVText = uploadedFiles[0].content;
          
          // Show mapping for generic format
          if (format === 'generic') {
            renderColumnMapping();
          } else {
            document.getElementById("import-mapping-section")?.classList.add('hidden');
          }
          
          parsedTrades = parseTradesFromCSV(headers, allRows, format, columnMapping);
        }
        
        parsedTrades = checkDuplicates(parsedTrades);
        renderImportPreview();
      }
      
      // Combine TradingView Order History with Balance History
      function combineTradingViewData(orderTrades, balanceTrades) {
        // If balance history has good data, prefer it
        const balanceWithPnl = balanceTrades.filter(t => t.pnl !== 0);
        
        if (balanceWithPnl.length === 0) {
          // No P&L in balance history, use order-based calculation
          return orderTrades;
        }
        
        // Match order trades to create complete trades first
        const completedTrades = matchTradingViewOrders(orderTrades);
        
        // Now try to match balance P&L entries with completed trades
        const result = [];
        const usedBalanceIndices = new Set();
        
        // Sort both by timestamp
        completedTrades.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        balanceWithPnl.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        completedTrades.forEach(trade => {
          // Find matching balance entry by timestamp (within 5 minutes)
          const tradeTime = new Date(trade.timestamp);
          
          let bestMatch = null;
          let bestMatchIdx = -1;
          let bestTimeDiff = Infinity;
          
          balanceWithPnl.forEach((bt, idx) => {
            if (usedBalanceIndices.has(idx)) return;
            
            const balanceTime = new Date(bt.timestamp);
            const timeDiff = Math.abs(tradeTime - balanceTime);
            
            // Match within 5 minutes and similar P&L direction
            if (timeDiff < 300000 && timeDiff < bestTimeDiff) {
              const samePnlSign = (trade.pnl >= 0) === (bt.pnl >= 0) || trade.pnl === 0;
              if (samePnlSign || Math.abs(trade.pnl) < 1) {
                bestMatch = bt;
                bestMatchIdx = idx;
                bestTimeDiff = timeDiff;
              }
            }
          });
          
          if (bestMatch) {
            usedBalanceIndices.add(bestMatchIdx);
            result.push({
              ...trade,
              pnl: bestMatch.pnl, // Use actual P&L from balance history
              result: bestMatch.pnl > 0.001 ? 'win' : bestMatch.pnl < -0.001 ? 'loss' : 'breakeven',
              hasDirectPnl: true
            });
          } else {
            // No match found, keep calculated P&L
            result.push(trade);
          }
        });
        
        // Add any unmatched balance entries (trades we couldn't match)
        balanceWithPnl.forEach((bt, idx) => {
          if (!usedBalanceIndices.has(idx)) {
            result.push({
              id: `import-balance-${Date.now()}-${idx}`,
              timestamp: bt.timestamp,
              instrument: bt.instrument || 'UNKNOWN',
              direction: bt.pnl >= 0 ? 'long' : 'short',
              entry: 0,
              exit: 0,
              pnl: bt.pnl,
              size: 1,
              result: bt.pnl > 0.001 ? 'win' : bt.pnl < -0.001 ? 'loss' : 'breakeven',
              source: 'tradingview',
              selected: true,
              isDuplicate: false,
              hasDirectPnl: true,
              needsDetails: true // Flag that this needs manual review
            });
          }
        });
        
        // Sort by timestamp
        result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return result;
      }
      
      // Legacy single file handler (for backwards compat)
      function handleFile(file) {
        handleFiles([file]);
      }
      
      // Remove file (legacy single file button)
      if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
          // Clear everything
          uploadedFiles = [];
          orderHistoryData = null;
          balanceHistoryData = null;
          fileInfo?.classList.add('hidden');
          document.getElementById("import-files-container")?.classList.add('hidden');
          document.getElementById("import-preview-section")?.classList.add('hidden');
          document.getElementById("import-actions")?.classList.add('hidden');
          document.getElementById("import-mapping-section")?.classList.add('hidden');
          parsedTrades = [];
          csvHeaders = [];
          columnMapping = {};
          currentCSVText = '';
          if (fileInput) fileInput.value = '';
          renderUploadedFiles();
        });
      }
      
      // Format change
      if (formatSelect) {
        formatSelect.addEventListener('change', () => {
          if (currentCSVText) {
            const { headers, rows } = parseCSV(currentCSVText);
            const format = formatSelect.value;
            
            if (format === 'generic') {
              renderColumnMapping();
            } else {
              document.getElementById("import-mapping-section")?.classList.add('hidden');
            }
            
            parsedTrades = parseTradesFromCSV(headers, rows, format, columnMapping);
            parsedTrades = checkDuplicates(parsedTrades);
            renderImportPreview();
          }
        });
      }
      
      // Select all
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
          const skipDuplicates = skipDuplicatesCheckbox?.checked;
          parsedTrades.forEach(t => {
            // If skipping duplicates, don't select duplicates with "select all"
            // But user can still manually select individual duplicates
            if (skipDuplicates && t.isDuplicate) {
              t.selected = false;
            } else {
              t.selected = e.target.checked;
            }
          });
          renderImportPreview();
        });
      }
      
      // Skip duplicates - when toggled, update selection state for duplicates
      if (skipDuplicatesCheckbox) {
        skipDuplicatesCheckbox.addEventListener('change', (e) => {
          const skipDuplicates = e.target.checked;
          parsedTrades.forEach(t => {
            if (t.isDuplicate) {
              // When enabling skip, unselect duplicates. When disabling, user must manually select.
              t.selected = skipDuplicates ? false : t.selected;
            }
          });
          renderImportPreview();
        });
      }
      
      // Contract multiplier
      const multiplierInput = document.getElementById("import-contract-multiplier");
      if (multiplierInput) {
        multiplierInput.addEventListener('input', renderImportPreview);
        multiplierInput.addEventListener('change', renderImportPreview);
      }
      
      // Cancel
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          removeFileBtn?.click();
        });
      }
      
      // Import trades
      if (importBtn) {
        importBtn.addEventListener('click', () => {
          const contractMultiplier = parseFloat(document.getElementById("import-contract-multiplier")?.value) || 1;
          // Import all selected trades (user controls selection via checkboxes)
          const tradesToImport = parsedTrades
            .filter(t => t.selected)
            .map(t => ({
              ...t,
              pnl: t.pnl * contractMultiplier,
              result: (t.pnl * contractMultiplier) > 0.001 ? 'win' : (t.pnl * contractMultiplier) < -0.001 ? 'loss' : 'breakeven'
            }));
          
          if (tradesToImport.length === 0) {
            alert('No trades selected for import');
            return;
          }
          
          // Get selected account from Import section
          const selectedAccountId = document.getElementById('import-account-selector')?.value || null;
          
          // Warn if no account is selected
          if (!selectedAccountId) {
            const proceed = confirm(
              'Ingen konto valgt!\n\n' +
              'Trades uten konto vil bare vises når "All Accounts" er valgt.\n' +
              'De vil IKKE vises i Analysis eller andre seksjoner når en spesifikk konto er filtrert.\n\n' +
              'Vil du fortsette uten å velge en konto?'
            );
            if (!proceed) return;
          }
          
          // Convert to journal format and save
          const journal = loadJournal();
          const today = new Date().toISOString().slice(0, 10);
          
          tradesToImport.forEach((trade, importIndex) => {
            const tradeEntry = {
              id: `import-${Date.now()}-${importIndex}-${Math.random().toString(36).substr(2, 9)}`,
              instrument: trade.instrument || 'UNKNOWN',
              direction: trade.direction || 'long',
              plan: {
                entry: trade.entry || 0,
                sl: 0,
                tp: trade.exit || 0
              },
              pnl: trade.pnl || 0,
              size: (trade.size || 1) * contractMultiplier,
              result: trade.result || 'breakeven',
              timestamp: trade.timestamp || new Date().toISOString(),
              time: trade.timestamp ? new Date(trade.timestamp).toLocaleString() : new Date().toLocaleString(),
              date: trade.timestamp ? trade.timestamp.slice(0, 10) : today,
              source: 'import',
              importSource: trade.source || 'csv',
              // Include checklist score for compatibility
              checklistScore: 0,
              notes: `Imported from ${trade.source || 'CSV'}`
            };
            
            // Add account ID if selected
            if (selectedAccountId) {
              tradeEntry.accountId = selectedAccountId;
            }
            
            journal.push(tradeEntry);
          });
          
          saveJournal(journal);
          
          // Save to import history
          const history = loadImportHistory();
          history.unshift({
            filename: document.getElementById("import-filename")?.textContent || 'Unknown',
            timestamp: new Date().toISOString(),
            tradesImported: tradesToImport.length,
            totalPnl: tradesToImport.reduce((sum, t) => sum + t.pnl, 0)
          });
          saveImportHistory(history.slice(0, 50)); // Keep last 50
          
          // Update daily archives (once per unique date for efficiency)
          const uniqueDates = [...new Set(tradesToImport.map(trade => 
            trade.timestamp ? trade.timestamp.slice(0, 10) : today
          ))];
          
          uniqueDates.forEach(tradeDate => {
            const archive = getOrCreateDailyArchive(tradeDate);
            const tradesForDate = journal.filter(j => 
              j.date === tradeDate || (j.timestamp && j.timestamp.startsWith(tradeDate))
            );
            archive.trades = tradesForDate;
            archive.summary = calculateDailySummary(tradesForDate);
            updateDailyArchive(tradeDate, archive);
          });
          
          // Reset and show success
          const totalPnl = tradesToImport.reduce((sum, t) => sum + t.pnl, 0);
          const pnlText = totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`;
          alert(`✓ Imported ${tradesToImport.length} trades (${pnlText} total P&L)`);
          
          // Clear upload
          uploadedFiles = [];
          renderUploadedFiles();
          removeFileBtn?.click();
          renderImportHistory();
          
          // Refresh ALL views to reflect imported trades
          console.log('Refreshing all views after import...');
          
          // Statistics & Analytics
          if (typeof renderStatisticsDashboard === 'function') renderStatisticsDashboard();
          if (typeof renderAdvancedStats === 'function') renderAdvancedStats(); // This also calls renderEquityCurveChart & renderPnlDistributionChart
          if (typeof renderTradingHeatmap === 'function') renderTradingHeatmap();
          if (typeof renderStrategyPerformance === 'function') renderStrategyPerformance();
          
          // Account Balance Chart (Trade Progress)
          if (window.updateAccountBalanceChart) window.updateAccountBalanceChart();
          
          // Risk Management
          if (typeof renderDailyLossTracker === 'function') renderDailyLossTracker();
          if (typeof renderDrawdownTracker === 'function') renderDrawdownTracker();
          if (typeof updateHeaderStatusBarIndependent === 'function') updateHeaderStatusBarIndependent();
          
          // Goals
          if (typeof renderGoals === 'function') renderGoals();
          
          // Trading Insights (Review section)
          if (typeof analyzeTradingEnhanced === 'function' && typeof renderTradingAnalysis === 'function') {
            const analysisData = analyzeTradingEnhanced();
            renderTradingAnalysis(analysisData);
          }
          
          // Journal list
          if (typeof renderJournal === 'function') {
            const updatedJournal = loadJournal();
            renderJournal(updatedJournal);
          }
          
          // Playbook stats (in case trades are linked to setups)
          if (typeof renderPlaybook === 'function') renderPlaybook();
          if (typeof populateSetupSelector === 'function') populateSetupSelector();
          
          console.log('All views refreshed!');
        });
      }
      
      // Initial render
      renderImportHistory();
      populateImportAccountSelector();
    }
  
    // ------- PDF Reports -------
    const EXPORT_HISTORY_KEY = "tradingdesk:export-history";
    let selectedReportType = null;
  
    function loadExportHistory() {
      try {
        return JSON.parse(localStorage.getItem(EXPORT_HISTORY_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }
  
    function saveExportHistory(entry) {
      const history = loadExportHistory();
      history.unshift(entry);
      // Keep only last 20 entries
      localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    }
  
    function getReportDateRange(rangeValue) {
      const now = new Date();
      let startDate = null;
      let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
      switch (rangeValue) {
        case "all":
          startDate = new Date(2000, 0, 1);
          break;
        case "ytd":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "2025":
          startDate = new Date(2025, 0, 1);
          endDate = new Date(2025, 11, 31, 23, 59, 59, 999);
          break;
        case "2024":
          startDate = new Date(2024, 0, 1);
          endDate = new Date(2024, 11, 31, 23, 59, 59, 999);
          break;
        case "q4-2025":
          startDate = new Date(2025, 9, 1);
          endDate = new Date(2025, 11, 31, 23, 59, 59, 999);
          break;
        case "q3-2025":
          startDate = new Date(2025, 6, 1);
          endDate = new Date(2025, 8, 30, 23, 59, 59, 999);
          break;
        case "q2-2025":
          startDate = new Date(2025, 3, 1);
          endDate = new Date(2025, 5, 30, 23, 59, 59, 999);
          break;
        case "q1-2025":
          startDate = new Date(2025, 0, 1);
          endDate = new Date(2025, 2, 31, 23, 59, 59, 999);
          break;
        case "last30":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last90":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "custom":
          const fromEl = document.getElementById("report-date-from");
          const toEl = document.getElementById("report-date-to");
          if (fromEl?.value) startDate = new Date(fromEl.value);
          if (toEl?.value) endDate = new Date(toEl.value + "T23:59:59");
          break;
        default:
          startDate = new Date(2000, 0, 1);
      }
  
      return { startDate, endDate };
    }
  
    function getFilteredTradesForReport() {
      const journal = loadJournal();
      const accounts = loadAccounts();
      const rangeSelect = document.getElementById("report-date-range");
      const categorySelect = document.getElementById("report-category");
      
      const { startDate, endDate } = getReportDateRange(rangeSelect?.value || "all");
      const categoryFilter = categorySelect?.value || "all";
  
      return journal.filter(trade => {
        // Date filter
        const tradeDate = new Date(trade.timestamp || trade.time);
        if (tradeDate < startDate || tradeDate > endDate) return false;
  
        // Category filter
        if (categoryFilter !== "all") {
          if (trade.category === categoryFilter) return true;
          // Backwards compatibility
          const account = accounts.find(a => a.id === trade.accountId);
          if (account && account.category === categoryFilter) return true;
          if (!trade.category && !trade.accountId) return false;
          return false;
        }
  
        return true;
      }).sort((a, b) => new Date(a.timestamp || a.time) - new Date(b.timestamp || b.time));
    }
  
    function formatCurrency(amount) {
      const num = parseFloat(amount) || 0;
      return num >= 0 
        ? `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `-$${Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  
    function getReportOptions() {
      return {
        includeSummary: document.getElementById("report-include-summary")?.checked ?? true,
        includeMonthly: document.getElementById("report-include-monthly")?.checked ?? true,
        includeTrades: document.getElementById("report-include-trades")?.checked ?? true,
        includeNotes: document.getElementById("report-include-notes")?.checked ?? true,
        includeChecklist: document.getElementById("report-include-checklist")?.checked ?? false,
        includeInstruments: document.getElementById("report-include-instruments")?.checked ?? true,
        includeDirection: document.getElementById("report-include-direction")?.checked ?? true,
        includeStreaks: document.getElementById("report-include-streaks")?.checked ?? false,
        groupByMonth: document.getElementById("report-group-by-month")?.checked ?? true,
        showRunningTotal: document.getElementById("report-show-running-total")?.checked ?? true,
        highlightWinners: document.getElementById("report-highlight-winners")?.checked ?? true,
        customTitle: document.getElementById("report-custom-title")?.value || ""
      };
    }
  
    function generateInstrumentStats(trades) {
      const byInstrument = {};
      trades.forEach(trade => {
        const inst = trade.instrument || "Unknown";
        if (!byInstrument[inst]) byInstrument[inst] = { trades: 0, pnl: 0, wins: 0 };
        byInstrument[inst].trades++;
        byInstrument[inst].pnl += (trade.pnl || 0);
        if (trade.result === "win" || (trade.pnl && trade.pnl > 0)) byInstrument[inst].wins++;
      });
      return Object.entries(byInstrument).sort((a, b) => b[1].pnl - a[1].pnl);
    }
  
    function generateDirectionStats(trades) {
      const long = trades.filter(t => t.direction === "long");
      const short = trades.filter(t => t.direction === "short");
      return {
        long: {
          count: long.length,
          pnl: long.reduce((sum, t) => sum + (t.pnl || 0), 0),
          wins: long.filter(t => t.result === "win" || (t.pnl && t.pnl > 0)).length
        },
        short: {
          count: short.length,
          pnl: short.reduce((sum, t) => sum + (t.pnl || 0), 0),
          wins: short.filter(t => t.result === "win" || (t.pnl && t.pnl > 0)).length
        }
      };
    }
  
    function generateTaxReport(trades, traderName) {
      const options = getReportOptions();
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const wins = trades.filter(t => t.result === "win" || (t.pnl && t.pnl > 0));
      const losses = trades.filter(t => t.result === "loss" || (t.pnl && t.pnl < 0));
      const totalWins = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const totalLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  
      // Group by month
      const byMonth = {};
      trades.forEach(trade => {
        const date = new Date(trade.timestamp || trade.time);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!byMonth[key]) byMonth[key] = { trades: [], pnl: 0 };
        byMonth[key].trades.push(trade);
        byMonth[key].pnl += (trade.pnl || 0);
      });
  
      const now = new Date();
      const rangeSelect = document.getElementById("report-date-range");
      const rangeLabel = rangeSelect?.options[rangeSelect.selectedIndex]?.text || "All Time";
      const reportTitle = options.customTitle || "Trading Tax Report";
      
      // Additional stats
      const instrumentStats = options.includeInstruments ? generateInstrumentStats(trades) : [];
      const directionStats = options.includeDirection ? generateDirectionStats(trades) : null;
  
      return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.5;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">${reportTitle}</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Generated ${now.toLocaleDateString()} • ${rangeLabel}</p>
            ${traderName ? `<p style="font-size: 14px; color: #334155; margin: 8px 0 0 0;">Trader: <strong>${traderName}</strong></p>` : ""}
          </div>
  
          ${options.includeSummary ? `
          <!-- Summary Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Summary</h2>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
              <div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Total P&L</div>
                <div style="font-size: 20px; font-weight: 700; color: ${totalPnl >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(totalPnl)}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Total Gains</div>
                <div style="font-size: 20px; font-weight: 700; color: #10b981;">${formatCurrency(totalWins)}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Total Losses</div>
                <div style="font-size: 20px; font-weight: 700; color: #ef4444;">-${formatCurrency(totalLosses)}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Total Trades</div>
                <div style="font-size: 20px; font-weight: 700; color: #0f172a;">${trades.length}</div>
              </div>
            </div>
          </div>
          ` : ""}
  
          ${options.includeDirection && directionStats ? `
          <!-- Long/Short Breakdown -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
              <div style="font-size: 12px; font-weight: 600; color: #166534; margin-bottom: 8px;">📈 Long Trades</div>
              <div style="font-size: 11px; color: #166534;">
                ${directionStats.long.count} trades • ${directionStats.long.count > 0 ? ((directionStats.long.wins / directionStats.long.count) * 100).toFixed(0) : 0}% win rate<br>
                <strong style="font-size: 16px;">${formatCurrency(directionStats.long.pnl)}</strong>
              </div>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px;">
              <div style="font-size: 12px; font-weight: 600; color: #991b1b; margin-bottom: 8px;">📉 Short Trades</div>
              <div style="font-size: 11px; color: #991b1b;">
                ${directionStats.short.count} trades • ${directionStats.short.count > 0 ? ((directionStats.short.wins / directionStats.short.count) * 100).toFixed(0) : 0}% win rate<br>
                <strong style="font-size: 16px;">${formatCurrency(directionStats.short.pnl)}</strong>
              </div>
            </div>
          </div>
          ` : ""}
  
          ${options.includeInstruments && instrumentStats.length > 0 ? `
          <!-- By Instrument -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">By Instrument</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Instrument</th>
                  <th style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Trades</th>
                  <th style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Win Rate</th>
                  <th style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">P&L</th>
                </tr>
              </thead>
              <tbody>
                ${instrumentStats.slice(0, 10).map(([inst, data]) => `
                  <tr>
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${inst}</td>
                    <td style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${data.trades}</td>
                    <td style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(0) : 0}%</td>
                    <td style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: ${data.pnl >= 0 ? '#10b981' : '#ef4444'}; font-weight: 500;">${formatCurrency(data.pnl)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}
  
          ${options.includeMonthly ? `
          <!-- Monthly Breakdown -->
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Breakdown</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Month</th>
                  <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Trades</th>
                  <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">P&L</th>
                  ${options.showRunningTotal ? `<th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Running Total</th>` : ""}
                </tr>
              </thead>
              <tbody>
                ${Object.entries(byMonth).sort().map(([month, data], i, arr) => {
                  const runningTotal = arr.slice(0, i + 1).reduce((sum, [, d]) => sum + d.pnl, 0);
                  const [year, m] = month.split("-");
                  const monthName = new Date(year, parseInt(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  return `
                    <tr>
                      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${monthName}</td>
                      <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${data.trades.length}</td>
                      <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: ${data.pnl >= 0 ? '#10b981' : '#ef4444'}; font-weight: 500;">${formatCurrency(data.pnl)}</td>
                      ${options.showRunningTotal ? `<td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: ${runningTotal >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(runningTotal)}</td>` : ""}
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
          ` : ""}
  
          ${options.includeTrades ? `
          <!-- Trade Details -->
          <div>
            <h2 style="font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Trade Details (${trades.length} trades)</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Date</th>
                  <th style="text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Instrument</th>
                  <th style="text-align: center; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Direction</th>
                  <th style="text-align: right; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Size</th>
                  <th style="text-align: right; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">P&L</th>
                  ${options.includeNotes ? `<th style="text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Notes</th>` : ""}
                </tr>
              </thead>
              <tbody>
                ${trades.map(trade => {
                  const date = new Date(trade.timestamp || trade.time);
                  const rowBg = options.highlightWinners 
                    ? ((trade.pnl || 0) > 0 ? 'background: #f0fdf4;' : (trade.pnl || 0) < 0 ? 'background: #fef2f2;' : '')
                    : '';
                  return `
                    <tr style="${rowBg}">
                      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${date.toLocaleDateString()}</td>
                      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${trade.instrument || "-"}</td>
                      <td style="text-align: center; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: ${trade.direction === "long" ? '#10b981' : trade.direction === "short" ? '#ef4444' : '#64748b'};">${trade.direction || "-"}</td>
                      <td style="text-align: right; padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${trade.plan?.size ? `$${trade.plan.size}` : "-"}</td>
                      <td style="text-align: right; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: ${(trade.pnl || 0) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">${formatCurrency(trade.pnl || 0)}</td>
                      ${options.includeNotes ? `<td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #64748b; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${trade.notes ? trade.notes.substring(0, 50) + (trade.notes.length > 50 ? '...' : '') : '-'}</td>` : ""}
                    </tr>
                  `;
                }).join("")}
              </tbody>
              <tfoot>
                <tr style="background: #f8fafc; font-weight: 600;">
                  <td colspan="${options.includeNotes ? 5 : 4}" style="padding: 10px 10px; border-top: 2px solid #e2e8f0;">Total</td>
                  <td style="text-align: right; padding: 10px 10px; border-top: 2px solid #e2e8f0; color: ${totalPnl >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(totalPnl)}</td>
                  ${options.includeNotes ? `<td style="border-top: 2px solid #e2e8f0;"></td>` : ""}
                </tr>
              </tfoot>
            </table>
          </div>
          ` : ""}
  
          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
            Generated by Trading Desk • ${now.toISOString()}
          </div>
        </div>
      `;
    }
  
    function generatePerformanceReport(trades, traderName) {
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const wins = trades.filter(t => t.result === "win" || (t.pnl && t.pnl > 0));
      const losses = trades.filter(t => t.result === "loss" || (t.pnl && t.pnl < 0));
      const winRate = trades.length > 0 ? (wins.length / trades.length * 100).toFixed(1) : 0;
      const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length : 0;
      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length) : 0;
      const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
      const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
  
      // Best/Worst
      const bestTrade = trades.length > 0 ? trades.reduce((best, t) => (t.pnl || 0) > (best.pnl || 0) ? t : best, trades[0]) : null;
      const worstTrade = trades.length > 0 ? trades.reduce((worst, t) => (t.pnl || 0) < (worst.pnl || 0) ? t : worst, trades[0]) : null;
  
      // Streaks
      let currentStreak = 0;
      let maxWinStreak = 0;
      let maxLossStreak = 0;
      let tempStreak = 0;
      let lastResult = null;
  
      trades.forEach(trade => {
        const isWin = trade.result === "win" || (trade.pnl && trade.pnl > 0);
        if (lastResult === null) {
          tempStreak = 1;
        } else if ((isWin && lastResult) || (!isWin && !lastResult)) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        if (isWin) maxWinStreak = Math.max(maxWinStreak, tempStreak);
        else maxLossStreak = Math.max(maxLossStreak, tempStreak);
        lastResult = isWin;
      });
  
      const now = new Date();
      const rangeSelect = document.getElementById("report-date-range");
      const rangeLabel = rangeSelect?.options[rangeSelect.selectedIndex]?.text || "All Time";
  
      return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.5;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">Performance Report</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Generated ${now.toLocaleDateString()} • ${rangeLabel}</p>
            ${traderName ? `<p style="font-size: 14px; color: #334155; margin: 8px 0 0 0;">Trader: <strong>${traderName}</strong></p>` : ""}
          </div>
  
          <!-- Key Metrics -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; padding: 16px; color: white;">
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Win Rate</div>
              <div style="font-size: 28px; font-weight: 700;">${winRate}%</div>
            </div>
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; padding: 16px; color: white;">
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Profit Factor</div>
              <div style="font-size: 28px; font-weight: 700;">${profitFactor.toFixed(2)}</div>
            </div>
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; padding: 16px; color: white;">
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Avg R:R</div>
              <div style="font-size: 28px; font-weight: 700;">${avgRR.toFixed(2)}</div>
            </div>
            <div style="background: ${totalPnl >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; border-radius: 8px; padding: 16px; color: white;">
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Total P&L</div>
              <div style="font-size: 28px; font-weight: 700;">${formatCurrency(totalPnl)}</div>
            </div>
          </div>
  
          <!-- Statistics Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 12px 0; text-transform: uppercase;">Trade Statistics</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
                <div><span style="color: #64748b;">Total Trades:</span> <strong>${trades.length}</strong></div>
                <div><span style="color: #64748b;">Winners:</span> <strong style="color: #10b981;">${wins.length}</strong></div>
                <div><span style="color: #64748b;">Losers:</span> <strong style="color: #ef4444;">${losses.length}</strong></div>
                <div><span style="color: #64748b;">Break-even:</span> <strong>${trades.length - wins.length - losses.length}</strong></div>
                <div><span style="color: #64748b;">Avg Win:</span> <strong style="color: #10b981;">${formatCurrency(avgWin)}</strong></div>
                <div><span style="color: #64748b;">Avg Loss:</span> <strong style="color: #ef4444;">-${formatCurrency(avgLoss)}</strong></div>
              </div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 12px 0; text-transform: uppercase;">Streaks & Extremes</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
                <div><span style="color: #64748b;">Max Win Streak:</span> <strong style="color: #10b981;">${maxWinStreak}</strong></div>
                <div><span style="color: #64748b;">Max Loss Streak:</span> <strong style="color: #ef4444;">${maxLossStreak}</strong></div>
                <div><span style="color: #64748b;">Best Trade:</span> <strong style="color: #10b981;">${bestTrade ? formatCurrency(bestTrade.pnl) : "-"}</strong></div>
                <div><span style="color: #64748b;">Worst Trade:</span> <strong style="color: #ef4444;">${worstTrade ? formatCurrency(worstTrade.pnl) : "-"}</strong></div>
              </div>
            </div>
          </div>
  
          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
            Generated by Trading Desk • ${now.toISOString()}
          </div>
        </div>
      `;
    }
  
    function generateMonthlyReport(trades, traderName) {
      const byMonth = {};
      trades.forEach(trade => {
        const date = new Date(trade.timestamp || trade.time);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!byMonth[key]) byMonth[key] = { trades: [], pnl: 0, wins: 0, losses: 0 };
        byMonth[key].trades.push(trade);
        byMonth[key].pnl += (trade.pnl || 0);
        if (trade.result === "win" || (trade.pnl && trade.pnl > 0)) byMonth[key].wins++;
        else if (trade.result === "loss" || (trade.pnl && trade.pnl < 0)) byMonth[key].losses++;
      });
  
      const now = new Date();
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
      return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.5;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #8b5cf6; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">Monthly Summary</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Generated ${now.toLocaleDateString()}</p>
            ${traderName ? `<p style="font-size: 14px; color: #334155; margin: 8px 0 0 0;">Trader: <strong>${traderName}</strong></p>` : ""}
          </div>
  
          <!-- Monthly Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            ${Object.entries(byMonth).sort().reverse().map(([month, data]) => {
              const [year, m] = month.split("-");
              const monthName = new Date(year, parseInt(m) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
              const winRate = data.trades.length > 0 ? (data.wins / data.trades.length * 100).toFixed(0) : 0;
              return `
                <div style="background: ${data.pnl >= 0 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${data.pnl >= 0 ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 16px;">
                  <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px;">${monthName}</div>
                  <div style="font-size: 24px; font-weight: 700; color: ${data.pnl >= 0 ? '#10b981' : '#ef4444'}; margin-bottom: 8px;">${formatCurrency(data.pnl)}</div>
                  <div style="font-size: 11px; color: #64748b;">
                    ${data.trades.length} trades • ${winRate}% win rate
                  </div>
                </div>
              `;
            }).join("")}
          </div>
  
          <!-- Summary Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Month</th>
                <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Trades</th>
                <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Wins</th>
                <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Losses</th>
                <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Win %</th>
                <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">P&L</th>
                <th style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(byMonth).sort().map(([month, data], i, arr) => {
                const cumulative = arr.slice(0, i + 1).reduce((sum, [, d]) => sum + d.pnl, 0);
                const [year, m] = month.split("-");
                const monthName = new Date(year, parseInt(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                const winRate = data.trades.length > 0 ? (data.wins / data.trades.length * 100).toFixed(1) : 0;
                return `
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${monthName}</td>
                    <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${data.trades.length}</td>
                    <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #10b981;">${data.wins}</td>
                    <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #ef4444;">${data.losses}</td>
                    <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${winRate}%</td>
                    <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: ${data.pnl >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(data.pnl)}</td>
                    <td style="text-align: right; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: ${cumulative >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(cumulative)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: 600;">
                <td style="padding: 10px 12px; border-top: 2px solid #e2e8f0;">Total</td>
                <td style="text-align: right; padding: 10px 12px; border-top: 2px solid #e2e8f0;">${trades.length}</td>
                <td style="text-align: right; padding: 10px 12px; border-top: 2px solid #e2e8f0; color: #10b981;">${trades.filter(t => t.result === "win" || (t.pnl > 0)).length}</td>
                <td style="text-align: right; padding: 10px 12px; border-top: 2px solid #e2e8f0; color: #ef4444;">${trades.filter(t => t.result === "loss" || (t.pnl < 0)).length}</td>
                <td style="text-align: right; padding: 10px 12px; border-top: 2px solid #e2e8f0;">-</td>
                <td style="text-align: right; padding: 10px 12px; border-top: 2px solid #e2e8f0; color: ${totalPnl >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(totalPnl)}</td>
                <td style="text-align: right; padding: 10px 12px; border-top: 2px solid #e2e8f0;">-</td>
              </tr>
            </tfoot>
          </table>
  
          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
            Generated by Trading Desk • ${now.toISOString()}
          </div>
        </div>
      `;
    }
  
    function generateJournalReport(trades, traderName) {
      const includeNotes = document.getElementById("report-include-notes")?.checked;
      const includeChecklist = document.getElementById("report-include-checklist")?.checked;
      const now = new Date();
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
      return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.5;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">Trade Journal</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Generated ${now.toLocaleDateString()} • ${trades.length} trades</p>
            ${traderName ? `<p style="font-size: 14px; color: #334155; margin: 8px 0 0 0;">Trader: <strong>${traderName}</strong></p>` : ""}
          </div>
  
          <!-- Trade Entries -->
          ${trades.map((trade, index) => {
            const date = new Date(trade.timestamp || trade.time);
            return `
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; ${(trade.pnl || 0) >= 0 ? 'border-left: 4px solid #10b981;' : 'border-left: 4px solid #ef4444;'}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <div>
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${trade.instrument || "Unknown"}</div>
                    <div style="font-size: 11px; color: #64748b;">${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 700; color: ${(trade.pnl || 0) >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(trade.pnl || 0)}</div>
                    <div style="font-size: 11px; color: ${trade.direction === 'long' ? '#10b981' : '#ef4444'}; text-transform: uppercase;">${trade.direction || "-"}</div>
                  </div>
                </div>
                
                ${trade.plan ? `
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; margin-bottom: ${includeNotes && trade.notes ? '12px' : '0'};">
                    <div><span style="color: #64748b;">Entry:</span> ${trade.plan.entry || "-"}</div>
                    <div><span style="color: #64748b;">SL:</span> ${trade.plan.sl || "-"}</div>
                    <div><span style="color: #64748b;">TP:</span> ${trade.plan.tp || "-"}</div>
                    <div><span style="color: #64748b;">Size:</span> ${trade.plan.size ? `$${trade.plan.size}` : "-"}</div>
                  </div>
                ` : ""}
  
                ${includeChecklist && trade.checklist?.score !== undefined ? `
                  <div style="background: #f8fafc; border-radius: 4px; padding: 8px 12px; font-size: 11px; margin-bottom: ${includeNotes && trade.notes ? '12px' : '0'};">
                    <span style="color: #64748b;">Checklist Score:</span> <strong>${trade.checklist.score}/100</strong>
                    ${trade.checklist.quality ? ` • <span style="color: #64748b;">Quality:</span> ${trade.checklist.quality}` : ""}
                  </div>
                ` : ""}
  
                ${includeNotes && trade.notes ? `
                  <div style="background: #fffbeb; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #92400e;">
                    <strong>Notes:</strong> ${trade.notes}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
  
          <!-- Summary -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px;">Summary</div>
            <div style="display: flex; gap: 24px; font-size: 14px;">
              <div><span style="color: #64748b;">Total Trades:</span> <strong>${trades.length}</strong></div>
              <div><span style="color: #64748b;">Total P&L:</span> <strong style="color: ${totalPnl >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(totalPnl)}</strong></div>
            </div>
          </div>
  
          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
            Generated by Trading Desk • ${now.toISOString()}
          </div>
        </div>
      `;
    }
  
    function previewReport() {
      if (!selectedReportType) {
        alert("Please select a report type first");
        return;
      }
  
      const trades = getFilteredTradesForReport();
      const traderName = document.getElementById("report-trader-name")?.value || "";
      const previewEl = document.getElementById("report-preview");
  
      if (!previewEl) return;
  
      if (trades.length === 0) {
        previewEl.innerHTML = `
          <div style="text-align: center; padding: 48px; color: #64748b;">
            <p style="font-size: 14px; margin-bottom: 8px;">No trades found for the selected period</p>
            <p style="font-size: 12px;">Try adjusting the date range or category filter</p>
          </div>
        `;
        return;
      }
  
      let reportHtml = "";
      switch (selectedReportType) {
        case "tax":
          reportHtml = generateTaxReport(trades, traderName);
          break;
        case "performance":
          reportHtml = generatePerformanceReport(trades, traderName);
          break;
        case "monthly":
          reportHtml = generateMonthlyReport(trades, traderName);
          break;
        case "journal":
          reportHtml = generateJournalReport(trades, traderName);
          break;
      }
  
      previewEl.innerHTML = reportHtml;
    }
  
    async function generatePDF() {
      if (!selectedReportType) {
        alert("Please select a report type and preview before downloading");
        return;
      }
  
      const previewEl = document.getElementById("report-preview");
      if (!previewEl || previewEl.querySelector(".text-slate-400")) {
        alert("Please preview the report first");
        return;
      }
  
      // Use html2canvas if available (already loaded for screenshots)
      if (typeof html2canvas !== "undefined") {
        try {
          const canvas = await html2canvas(previewEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
          });
  
          // Create PDF-like download (as image for simplicity)
          const link = document.createElement("a");
          link.download = `trading-report-${selectedReportType}-${new Date().toISOString().split("T")[0]}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
  
          // Save to history
          saveExportHistory({
            timestamp: new Date().toISOString(),
            type: selectedReportType,
            filename: link.download,
            tradesCount: getFilteredTradesForReport().length
          });
  
          renderExportHistory();
          showToast(`Report downloaded as ${link.download}`);
        } catch (error) {
          console.error("Failed to generate PDF:", error);
          // Fallback: print dialog
          printReport();
        }
      } else {
        // Fallback to print dialog
        printReport();
      }
    }
  
    function printReport() {
      const previewEl = document.getElementById("report-preview");
      if (!previewEl) return;
  
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Trading Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${previewEl.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
  
      // Save to history
      saveExportHistory({
        timestamp: new Date().toISOString(),
        type: selectedReportType,
        filename: `trading-report-${selectedReportType}-${new Date().toISOString().split("T")[0]}.pdf`,
        tradesCount: getFilteredTradesForReport().length
      });
  
      renderExportHistory();
    }
  
    function renderExportHistory() {
      const listEl = document.getElementById("export-history-list");
      const emptyEl = document.getElementById("export-history-empty");
      if (!listEl) return;
  
      const history = loadExportHistory();
  
      if (history.length === 0) {
        listEl.innerHTML = "";
        emptyEl?.classList.remove("hidden");
        return;
      }
  
      emptyEl?.classList.add("hidden");
  
      const typeLabels = {
        tax: "Tax Report",
        performance: "Performance",
        monthly: "Monthly",
        journal: "Journal"
      };
  
      const typeColors = {
        tax: "emerald",
        performance: "blue",
        monthly: "purple",
        journal: "amber"
      };
  
      listEl.innerHTML = history.slice(0, 10).map(item => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-[#262626]">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-${typeColors[item.type] || "slate"}-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-${typeColors[item.type] || "slate"}-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div>
              <div class="text-[11px] font-medium text-slate-200">${typeLabels[item.type] || item.type}</div>
              <div class="text-[9px] text-slate-500">${item.tradesCount} trades • ${new Date(item.timestamp).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="text-[10px] text-slate-500">${item.filename}</div>
        </div>
      `).join("");
    }
  
    // Initialize Reports section
    function initReports() {
      // Report type selection
      const reportTypeCards = document.querySelectorAll("[data-report-type]");
      reportTypeCards.forEach(card => {
        card.addEventListener("click", () => {
          reportTypeCards.forEach(c => c.classList.remove("ring-2", "ring-emerald-500"));
          card.classList.add("ring-2", "ring-emerald-500");
          selectedReportType = card.getAttribute("data-report-type");
        });
      });
  
      // Custom date range toggle
      const dateRangeSelect = document.getElementById("report-date-range");
      const customDateRange = document.getElementById("custom-date-range");
      if (dateRangeSelect && customDateRange) {
        dateRangeSelect.addEventListener("change", () => {
          if (dateRangeSelect.value === "custom") {
            customDateRange.classList.remove("hidden");
          } else {
            customDateRange.classList.add("hidden");
          }
        });
      }
  
      // Preview button
      const previewBtn = document.getElementById("btn-preview-report");
      if (previewBtn) {
        previewBtn.addEventListener("click", previewReport);
      }
  
      // Generate PDF button
      const generateBtn = document.getElementById("btn-generate-pdf");
      if (generateBtn) {
        generateBtn.addEventListener("click", generatePDF);
      }
  
      // Load trader name from localStorage
      const traderNameInput = document.getElementById("report-trader-name");
      if (traderNameInput) {
        const savedName = localStorage.getItem("tradingdesk:trader-name") || "";
        traderNameInput.value = savedName;
        traderNameInput.addEventListener("change", () => {
          localStorage.setItem("tradingdesk:trader-name", traderNameInput.value);
        });
      }
  
      // Render export history
      renderExportHistory();
    }
  
    // Initialize on load
    initReports();
  
    // ------- Goals & Targets -------
    const GOALS_STORAGE_KEY = "tradingdesk:goals";
  
    function loadGoals() {
      try {
        return JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY) || "{}");
      } catch (e) {
        console.error("Failed to parse goals from localStorage", e);
        return {};
      }
    }
  
    function saveGoals(goals) {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    }
  
    function calculateGoalProgress(goals) {
      const trades = getFilteredJournal();
      const now = new Date();
      
      // Get current month start/end (local time)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      const daysInMonth = monthEnd.getDate();
      const dayOfMonth = now.getDate();
      const daysRemainingInMonth = daysInMonth - dayOfMonth;
      
      // Get current week start (Monday) / end (Sunday) in local time
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const daysRemainingInWeek = 7 - (dayOfWeek === 0 ? 7 : dayOfWeek);
      
      // Get today start/end in local time
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      // Uses global getTradeDate() function for consistent date parsing
      
      // Filter trades by period
      const monthTrades = trades.filter(t => {
        const tradeDate = getTradeDate(t);
        if (!tradeDate) return false;
        return tradeDate >= monthStart && tradeDate <= monthEnd;
      });
      
      const weekTrades = trades.filter(t => {
        const tradeDate = getTradeDate(t);
        if (!tradeDate) return false;
        return tradeDate >= weekStart && tradeDate <= weekEnd;
      });
      
      const todayTrades = trades.filter(t => {
        const tradeDate = getTradeDate(t);
        if (!tradeDate) return false;
        return tradeDate >= todayStart && tradeDate <= todayEnd;
      });
      
      // Calculate P&L for each period
      const monthlyPnl = monthTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      const weeklyPnl = weekTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      const dailyPnl = todayTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      
      // Calculate win rate (all time)
      const allWins = trades.filter(t => t.result === "win").length;
      const totalTrades = trades.length;
      const currentWinRate = totalTrades > 0 ? (allWins / totalTrades) * 100 : 0;
      
      // Today's trade count
      const todayTradeCount = todayTrades.length;
      
      return {
        monthly: {
          current: monthlyPnl,
          target: goals.monthlyPnl || 0,
          progress: goals.monthlyPnl ? Math.min((monthlyPnl / goals.monthlyPnl) * 100, 100) : 0,
          daysRemaining: daysRemainingInMonth
        },
        weekly: {
          current: weeklyPnl,
          target: goals.weeklyPnl || 0,
          progress: goals.weeklyPnl ? Math.min((weeklyPnl / goals.weeklyPnl) * 100, 100) : 0,
          daysRemaining: daysRemainingInWeek
        },
        winRate: {
          current: currentWinRate,
          target: goals.winRateTarget || 0,
          progress: goals.winRateTarget ? Math.min((currentWinRate / goals.winRateTarget) * 100, 100) : 0
        },
        maxTrades: {
          current: todayTradeCount,
          target: goals.maxTradesPerDay || 0,
          progress: goals.maxTradesPerDay ? Math.min((todayTradeCount / goals.maxTradesPerDay) * 100, 100) : 0,
          exceeded: goals.maxTradesPerDay && todayTradeCount >= goals.maxTradesPerDay
        },
        dailyLoss: {
          current: Math.abs(Math.min(dailyPnl, 0)),
          target: goals.maxDailyLoss || 0,
          progress: goals.maxDailyLoss ? Math.min((Math.abs(Math.min(dailyPnl, 0)) / goals.maxDailyLoss) * 100, 100) : 0,
          exceeded: goals.maxDailyLoss && Math.abs(Math.min(dailyPnl, 0)) >= goals.maxDailyLoss
        }
      };
    }
  
    // Render Goals - Updates the inline goal displays with current progress
    window.renderGoals = function renderGoals() {
      const goals = loadGoals();
      const progress = calculateGoalProgress(goals);
      
      // Helper for progress bar color
      function getProgressColor(percent, isLimit = false) {
        if (isLimit) {
          if (percent >= 100) return "bg-rose-500";
          if (percent >= 75) return "bg-amber-500";
          return "bg-emerald-500";
        } else {
          if (percent >= 100) return "bg-emerald-500";
          if (percent >= 50) return "bg-blue-500";
          return "bg-amber-500";
        }
      }
      
      function getStatusText(percent, isLimit = false, daysLeft = null) {
        if (isLimit) {
          if (percent >= 100) return { text: "Limit reached!", color: "text-rose-400" };
          if (percent >= 75) return { text: "Approaching", color: "text-amber-400" };
          return { text: "Safe", color: "text-emerald-400" };
        } else {
          if (percent >= 100) return { text: "Achieved!", color: "text-emerald-400" };
          if (daysLeft !== null) return { text: `${daysLeft}d left`, color: "text-slate-500" };
          if (percent >= 75) return { text: "Almost!", color: "text-blue-400" };
          return { text: "In progress", color: "text-slate-500" };
        }
      }
      
      // Use querySelector to find elements even in hidden sections
      const financeSection = document.getElementById("finance");
      if (!financeSection) return;
      
      // Monthly P&L
      const monthlyBar = financeSection.querySelector("#goal-monthly-bar");
      const monthlyCurrent = financeSection.querySelector("#goal-monthly-current");
      const monthlyStatus = financeSection.querySelector("#goal-monthly-status");
      if (monthlyBar && monthlyCurrent && monthlyStatus) {
        const pct = goals.monthlyPnl ? Math.max(0, Math.min((progress.monthly.current / goals.monthlyPnl) * 100, 100)) : 0;
        monthlyBar.style.width = `${pct}%`;
        monthlyBar.className = `h-full ${getProgressColor(pct)} transition-all duration-500`;
        monthlyCurrent.textContent = `${progress.monthly.current >= 0 ? '+' : ''}$${progress.monthly.current.toFixed(0)}`;
        monthlyCurrent.className = `text-[12px] font-semibold ${progress.monthly.current >= 0 ? 'text-emerald-300' : 'text-rose-300'}`;
        const status = goals.monthlyPnl ? getStatusText(pct, false, progress.monthly.daysRemaining) : { text: "No target set", color: "text-slate-500" };
        monthlyStatus.textContent = status.text;
        monthlyStatus.className = `text-[9px] ${status.color}`;
      }
      
      // Weekly P&L
      const weeklyBar = financeSection.querySelector("#goal-weekly-bar");
      const weeklyCurrent = financeSection.querySelector("#goal-weekly-current");
      const weeklyStatus = financeSection.querySelector("#goal-weekly-status");
      if (weeklyBar && weeklyCurrent && weeklyStatus) {
        const pct = goals.weeklyPnl ? Math.max(0, Math.min((progress.weekly.current / goals.weeklyPnl) * 100, 100)) : 0;
        weeklyBar.style.width = `${pct}%`;
        weeklyBar.className = `h-full ${getProgressColor(pct)} transition-all duration-500`;
        weeklyCurrent.textContent = `${progress.weekly.current >= 0 ? '+' : ''}$${progress.weekly.current.toFixed(0)}`;
        weeklyCurrent.className = `text-[12px] font-semibold ${progress.weekly.current >= 0 ? 'text-emerald-300' : 'text-rose-300'}`;
        const status = goals.weeklyPnl ? getStatusText(pct, false, progress.weekly.daysRemaining) : { text: "No target set", color: "text-slate-500" };
        weeklyStatus.textContent = status.text;
        weeklyStatus.className = `text-[9px] ${status.color}`;
      }
      
      // Win Rate
      const winrateBar = financeSection.querySelector("#goal-winrate-bar");
      const winrateCurrent = financeSection.querySelector("#goal-winrate-current");
      const winrateStatus = financeSection.querySelector("#goal-winrate-status");
      if (winrateBar && winrateCurrent && winrateStatus) {
        const pct = goals.winRateTarget ? Math.max(0, Math.min((progress.winRate.current / goals.winRateTarget) * 100, 100)) : 0;
        winrateBar.style.width = `${pct}%`;
        winrateBar.className = `h-full ${getProgressColor(pct)} transition-all duration-500`;
        winrateCurrent.textContent = `${progress.winRate.current.toFixed(1)}%`;
        winrateCurrent.className = `text-[12px] font-semibold ${progress.winRate.current >= (goals.winRateTarget || 50) ? 'text-emerald-300' : 'text-slate-200'}`;
        const status = goals.winRateTarget ? getStatusText(pct) : { text: "No target set", color: "text-slate-500" };
        winrateStatus.textContent = status.text;
        winrateStatus.className = `text-[9px] ${status.color}`;
      }
      
      // Max Trades
      const tradesBar = financeSection.querySelector("#goal-trades-bar");
      const tradesCurrent = financeSection.querySelector("#goal-trades-current");
      const tradesStatus = financeSection.querySelector("#goal-trades-status");
      if (tradesBar && tradesCurrent && tradesStatus) {
        const pct = goals.maxTradesPerDay ? Math.min((progress.maxTrades.current / goals.maxTradesPerDay) * 100, 100) : 0;
        tradesBar.style.width = `${pct}%`;
        tradesBar.className = `h-full ${getProgressColor(pct, true)} transition-all duration-500`;
        tradesCurrent.textContent = `${progress.maxTrades.current} trades`;
        const status = goals.maxTradesPerDay ? getStatusText(pct, true) : { text: "No limit", color: "text-emerald-400" };
        tradesStatus.textContent = status.text;
        tradesStatus.className = `text-[9px] ${status.color}`;
      }
    };
  
    // Initialize inline goals editing
    function initGoalsModal() {
      const financeSection = document.getElementById("finance");
      if (!financeSection) return;
      
      const monthlyInput = financeSection.querySelector("#goal-monthly-pnl");
      const weeklyInput = financeSection.querySelector("#goal-weekly-pnl");
      const winRateInput = financeSection.querySelector("#goal-win-rate");
      const maxTradesInput = financeSection.querySelector("#goal-max-trades");
      const btnResetGoals = financeSection.querySelector("#btn-reset-goals");
      
      // Load saved goals into inputs
      const goals = loadGoals();
      if (monthlyInput) monthlyInput.value = goals.monthlyPnl || "";
      if (weeklyInput) weeklyInput.value = goals.weeklyPnl || "";
      if (winRateInput) winRateInput.value = goals.winRateTarget || "";
      if (maxTradesInput) maxTradesInput.value = goals.maxTradesPerDay || "";
      
      // Save on input change (debounced)
      let saveTimeout;
      function saveGoalsFromInputs() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          const newGoals = {
            monthlyPnl: parseFloat(monthlyInput?.value) || 0,
            weeklyPnl: parseFloat(weeklyInput?.value) || 0,
            winRateTarget: parseFloat(winRateInput?.value) || 0,
            maxTradesPerDay: parseInt(maxTradesInput?.value) || 0,
            maxDailyLoss: 0 // Removed from UI, using daily-loss-limit-percent from Risk Management instead
          };
          saveGoals(newGoals);
          if (window.renderGoals) window.renderGoals();
        }, 300);
      }
      
      if (monthlyInput) monthlyInput.addEventListener("input", saveGoalsFromInputs);
      if (weeklyInput) weeklyInput.addEventListener("input", saveGoalsFromInputs);
      if (winRateInput) winRateInput.addEventListener("input", saveGoalsFromInputs);
      if (maxTradesInput) maxTradesInput.addEventListener("input", saveGoalsFromInputs);
      
      // Reset button
      if (btnResetGoals) {
        btnResetGoals.addEventListener("click", () => {
          if (confirm("Reset all goals?")) {
            saveGoals({});
            if (monthlyInput) monthlyInput.value = "";
            if (weeklyInput) weeklyInput.value = "";
            if (winRateInput) winRateInput.value = "";
            if (maxTradesInput) maxTradesInput.value = "";
            if (window.renderGoals) window.renderGoals();
          }
        });
      }
    }
  
    // ------- Risk Management Tools -------
  
    // Position Size Calculator
    function calculatePositionSize(balance, riskPercent, entry, sl, tp, instrumentType, extraParams = {}) {
      if (!balance || !riskPercent || !entry || !sl || entry === sl) {
        return null;
      }
  
      const riskAmount = balance * (riskPercent / 100);
      const slDistance = Math.abs(entry - sl);
      const slDistancePercent = (slDistance / entry) * 100;
      const isLong = entry < sl ? false : true; // If SL is above entry, it's a short
      
      let positionSize = 0;
      let units = 0;
      let unitsLabel = "Units";
      
      switch (instrumentType) {
        case 'forex':
          // Forex: Position Size in lots
          const pipValue = extraParams.pipValue || 10;
          const slPips = extraParams.slPips || slDistance * 10000; // Assume 4 decimal places
          const lotSize = extraParams.lotSize || 100000;
          
          if (slPips > 0) {
            const lotsNeeded = riskAmount / (slPips * pipValue);
            units = Math.round(lotsNeeded * 100) / 100;
            positionSize = units * lotSize * entry;
            unitsLabel = "Lots";
          }
          break;
          
        case 'futures':
          // Futures: Position Size in contracts
          const tickValue = extraParams.tickValue || 12.50;
          const tickSize = extraParams.tickSize || 0.25;
          const contractSize = extraParams.contractSize || 1;
          
          const ticksRisk = slDistance / tickSize;
          const riskPerContract = ticksRisk * tickValue;
          
          if (riskPerContract > 0) {
            units = Math.floor(riskAmount / riskPerContract);
            positionSize = units * entry * contractSize;
            unitsLabel = "Contracts";
          }
          break;
          
        case 'stocks':
          // Stocks: Position Size in shares
          if (slDistance > 0) {
            units = Math.floor(riskAmount / slDistance);
            positionSize = units * entry;
            unitsLabel = "Shares";
          }
          break;
          
        case 'crypto':
        default:
          // Crypto: Position Size based on percentage
          positionSize = riskAmount / (slDistancePercent / 100);
          units = positionSize / entry;
          unitsLabel = "Units";
          break;
      }
      
      // Calculate R:R ratio
      let rrRatio = 0;
      let potentialProfit = 0;
      if (tp && tp !== entry) {
        const tpDistance = Math.abs(tp - entry);
        rrRatio = slDistance > 0 ? tpDistance / slDistance : 0;
        potentialProfit = (tpDistance / entry) * positionSize;
      }
  
      return {
        positionSize: Math.round(positionSize * 100) / 100,
        units: Math.round(units * 1000) / 1000,
        unitsLabel,
        riskAmount: Math.round(riskAmount * 100) / 100,
        slDistance: Math.round(slDistancePercent * 100) / 100,
        rrRatio: Math.round(rrRatio * 100) / 100,
        potentialProfit: Math.round(potentialProfit * 100) / 100,
        isLong
      };
    }
  
    function updatePositionSizeCalculator() {
      const balanceInput = document.getElementById("risk-balance");
      const riskPercentInput = document.getElementById("risk-percent");
      const entryInput = document.getElementById("risk-entry");
      const slInput = document.getElementById("risk-sl");
      const tpInput = document.getElementById("risk-tp");
      const instrumentTypeSelect = document.getElementById("instrument-type");
      const positionSizeEl = document.getElementById("result-position-size");
      const unitsEl = document.getElementById("result-units");
      const unitsLabelEl = document.getElementById("units-label");
      const riskAmountEl = document.getElementById("result-risk-amount");
      const rrRatioEl = document.getElementById("result-rr-ratio");
      const riskLevelBar = document.getElementById("risk-level-bar");
      const riskLevelText = document.getElementById("risk-level-text");
  
      if (!balanceInput || !riskPercentInput || !entryInput || !slInput) return;
  
      const balance = parseFloat(balanceInput.value) || 0;
      const riskPercent = parseFloat(riskPercentInput.value) || 0;
      const entry = parseFloat(entryInput.value) || 0;
      const sl = parseFloat(slInput.value) || 0;
      const tp = parseFloat(tpInput?.value) || 0;
      const instrumentType = instrumentTypeSelect?.value || 'crypto';
      
      // Get extra params based on instrument type
      const extraParams = {};
      if (instrumentType === 'forex') {
        extraParams.pipValue = parseFloat(document.getElementById("pip-value")?.value) || 10;
        extraParams.slPips = parseFloat(document.getElementById("sl-pips")?.value) || 0;
        extraParams.lotSize = parseFloat(document.getElementById("lot-size")?.value) || 100000;
      } else if (instrumentType === 'futures') {
        extraParams.tickValue = parseFloat(document.getElementById("tick-value")?.value) || 12.50;
        extraParams.tickSize = parseFloat(document.getElementById("tick-size")?.value) || 0.25;
        extraParams.contractSize = parseFloat(document.getElementById("contract-size")?.value) || 1;
      }
  
      const result = calculatePositionSize(balance, riskPercent, entry, sl, tp, instrumentType, extraParams);
  
      if (result) {
        positionSizeEl.textContent = `$${result.positionSize.toLocaleString()}`;
        if (unitsEl) unitsEl.textContent = result.units.toLocaleString();
        if (unitsLabelEl) unitsLabelEl.textContent = result.unitsLabel;
        riskAmountEl.textContent = `$${result.riskAmount.toLocaleString()}`;
        if (rrRatioEl) {
          rrRatioEl.textContent = result.rrRatio > 0 ? `1:${result.rrRatio}` : "N/A";
          rrRatioEl.className = `text-[15px] font-bold ${result.rrRatio >= 2 ? 'text-emerald-300' : result.rrRatio >= 1 ? 'text-amber-300' : 'text-purple-300'}`;
        }
        
        // Update risk level indicator
        if (riskLevelBar && riskLevelText) {
          const riskLevel = riskPercent;
          riskLevelBar.style.width = `${Math.min(riskLevel * 20, 100)}%`; // 5% = full bar
          
          if (riskLevel <= 1) {
            riskLevelBar.className = "h-full bg-emerald-500 transition-all duration-300";
            riskLevelText.textContent = "Conservative";
            riskLevelText.className = "text-[9px] text-emerald-400";
          } else if (riskLevel <= 2) {
            riskLevelBar.className = "h-full bg-blue-500 transition-all duration-300";
            riskLevelText.textContent = "Moderate";
            riskLevelText.className = "text-[9px] text-blue-400";
          } else if (riskLevel <= 3) {
            riskLevelBar.className = "h-full bg-amber-500 transition-all duration-300";
            riskLevelText.textContent = "Aggressive";
            riskLevelText.className = "text-[9px] text-amber-400";
          } else {
            riskLevelBar.className = "h-full bg-rose-500 transition-all duration-300";
            riskLevelText.textContent = "High Risk!";
            riskLevelText.className = "text-[9px] text-rose-400";
          }
        }
      } else {
        positionSizeEl.textContent = `$0`;
        if (unitsEl) unitsEl.textContent = "0";
        riskAmountEl.textContent = `$0`;
        if (rrRatioEl) rrRatioEl.textContent = "N/A";
      }
    }
    
    // Toggle instrument-specific inputs
    function toggleInstrumentInputs() {
      const instrumentType = document.getElementById("instrument-type")?.value || 'crypto';
      const forexInputs = document.getElementById("forex-inputs");
      const futuresInputs = document.getElementById("futures-inputs");
      
      if (forexInputs) forexInputs.classList.toggle("hidden", instrumentType !== 'forex');
      if (futuresInputs) futuresInputs.classList.toggle("hidden", instrumentType !== 'futures');
      
      updatePositionSizeCalculator();
    }
    
    // Copy to clipboard functionality
    function initCopyToClipboard() {
      document.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', () => {
          const type = el.dataset.copy;
          let value = '';
          
          if (type === 'position-size') {
            value = document.getElementById("result-position-size")?.textContent.replace(/[$,]/g, '') || '0';
          } else if (type === 'units') {
            value = document.getElementById("result-units")?.textContent.replace(/,/g, '') || '0';
          }
          
          if (value && value !== '0') {
            navigator.clipboard.writeText(value).then(() => {
              // Show feedback
              const originalText = el.querySelector('.text-emerald-300, .text-blue-300')?.textContent;
              const displayEl = el.querySelector('.text-emerald-300, .text-blue-300');
              if (displayEl) {
                displayEl.textContent = 'Copied!';
                setTimeout(() => {
                  displayEl.textContent = type === 'position-size' ? `$${parseFloat(value).toLocaleString()}` : parseFloat(value).toLocaleString();
                }, 1000);
              }
            });
          }
        });
      });
    }
  
    function populateRiskAccountSelector() {
      const selector = document.getElementById("risk-account-select");
      const balanceInput = document.getElementById("risk-balance");
      const balanceDisplay = document.getElementById("risk-balance-display");
      const dailyLimitInput = document.getElementById("daily-loss-limit");
      const dailyLimitPercentInput = document.getElementById("daily-loss-limit-percent");
      const dailyLimitDisplay = document.getElementById("daily-loss-limit-display");
      if (!selector) return;
  
      const accounts = loadAccounts();
      const journal = loadJournal();
      
      selector.innerHTML = '<option value="">Select account...</option>';
      accounts.forEach(account => {
        const currentBalance = calculateAccountBalance(account.id, journal);
        const option = document.createElement("option");
        option.value = account.id;
        option.textContent = `${account.name} ($${currentBalance.toLocaleString()})`;
        option.dataset.balance = currentBalance;
        selector.appendChild(option);
      });
  
      // Function to update all displays
      function updateAllDisplays() {
        const selected = selector.options[selector.selectedIndex];
        const balance = selected && selected.dataset.balance ? parseFloat(selected.dataset.balance) : 0;
        
        // Update balance
        if (balanceInput) balanceInput.value = balance;
        if (balanceDisplay) balanceDisplay.textContent = `$${balance.toLocaleString()}`;
        
        // Update daily limit based on percentage
        const limitPercent = parseFloat(dailyLimitPercentInput?.value) || 0;
        if (limitPercent > 0 && balance > 0) {
          const limitAmount = balance * (limitPercent / 100);
          if (dailyLimitInput) dailyLimitInput.value = limitAmount.toFixed(2);
          if (dailyLimitDisplay) dailyLimitDisplay.textContent = `$${Math.round(limitAmount)}`;
        } else if (dailyLimitDisplay) {
          const manualLimit = parseFloat(dailyLimitInput?.value) || 0;
          dailyLimitDisplay.textContent = manualLimit > 0 ? `$${Math.round(manualLimit)}` : '$0';
        }
        
        updatePositionSizeCalculator();
        renderDrawdownTracker();
        renderDailyLossTracker();
      }
  
      // Update when account is selected
      selector.addEventListener("change", updateAllDisplays);
      
      // Update when daily limit percent changes
      if (dailyLimitPercentInput) {
        dailyLimitPercentInput.addEventListener("input", updateAllDisplays);
        dailyLimitPercentInput.addEventListener("change", updateAllDisplays);
      }
      
      // Auto-select first account if available
      if (selector.options.length > 1) {
        selector.selectedIndex = 1;
        updateAllDisplays();
      }
    }
  
    // Drawdown Tracker
    function calculateDrawdown(accountId) {
      if (!accountId) return null;
  
      const accounts = loadAccounts();
      const account = accounts.find(a => a.id === accountId);
      if (!account) return null;
  
      const journal = loadJournal();
      const accountTrades = journal.filter(t => t.accountId === accountId);
      
      // Sort by timestamp
      accountTrades.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateA - dateB;
      });
  
      const initialBalance = parseFloat(account.initialBalance) || 0;
      let balance = initialBalance;
      let peak = initialBalance;
      let maxDrawdown = 0;
      let maxDrawdownPercent = 0;
  
      accountTrades.forEach(trade => {
        balance += trade.pnl || 0;
        if (balance > peak) {
          peak = balance;
        }
        const drawdown = peak - balance;
        const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
        if (drawdownPercent > maxDrawdownPercent) {
          maxDrawdown = drawdown;
          maxDrawdownPercent = drawdownPercent;
        }
      });
  
      const currentDrawdown = peak - balance;
      const currentDrawdownPercent = peak > 0 ? (currentDrawdown / peak) * 100 : 0;
  
      return {
        initialBalance,
        currentBalance: balance,
        peakBalance: peak,
        currentDrawdown,
        currentDrawdownPercent: Math.round(currentDrawdownPercent * 100) / 100,
        maxDrawdown,
        maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100
      };
    }
  
    function renderDrawdownTracker() {
      const selector = document.getElementById("risk-account-select");
      const contentEl = document.getElementById("drawdown-tracker-content");
      const emptyEl = document.getElementById("drawdown-empty");
      const currentDrawdownEl = document.getElementById("current-drawdown");
      const maxDrawdownEl = document.getElementById("max-drawdown");
      const peakBalanceEl = document.getElementById("peak-balance");
      const currentBalanceEl = document.getElementById("current-balance");
      const drawdownBar = document.getElementById("drawdown-bar");
      const drawdownLevelText = document.getElementById("drawdown-level-text");
  
      if (!selector || !contentEl) return;
  
      const accountId = selector.value;
      
      if (!accountId) {
        if (contentEl) contentEl.classList.add("hidden");
        if (emptyEl) emptyEl.classList.remove("hidden");
        return;
      }
  
      const data = calculateDrawdown(accountId);
      
      if (!data) {
        if (contentEl) contentEl.classList.add("hidden");
        if (emptyEl) emptyEl.classList.remove("hidden");
        return;
      }
  
      if (contentEl) contentEl.classList.remove("hidden");
      if (emptyEl) emptyEl.classList.add("hidden");
  
      // Update values
      if (currentDrawdownEl) {
        currentDrawdownEl.textContent = `${data.currentDrawdownPercent}%`;
        currentDrawdownEl.className = `text-[14px] font-semibold ${
          data.currentDrawdownPercent < 5 ? "text-emerald-300" :
          data.currentDrawdownPercent < 10 ? "text-amber-300" : "text-rose-300"
        }`;
      }
      if (maxDrawdownEl) {
        maxDrawdownEl.textContent = `${data.maxDrawdownPercent}%`;
        maxDrawdownEl.className = `text-[14px] font-semibold ${
          data.maxDrawdownPercent < 5 ? "text-emerald-300" :
          data.maxDrawdownPercent < 10 ? "text-amber-300" : "text-rose-300"
        }`;
      }
      if (peakBalanceEl) peakBalanceEl.textContent = `$${data.peakBalance.toLocaleString()}`;
      if (currentBalanceEl) currentBalanceEl.textContent = `$${data.currentBalance.toLocaleString()}`;
  
      // Update progress bar (max 20% for visualization)
      if (drawdownBar) {
        const barWidth = Math.min(data.currentDrawdownPercent * 5, 100); // 20% drawdown = full bar
        drawdownBar.style.width = `${barWidth}%`;
        drawdownBar.className = `h-full transition-all duration-300 ${
          data.currentDrawdownPercent < 5 ? "bg-emerald-500" :
          data.currentDrawdownPercent < 10 ? "bg-amber-500" : "bg-rose-500"
        }`;
      }
  
      // Update level text
      if (drawdownLevelText) {
        if (data.currentDrawdownPercent < 5) {
          drawdownLevelText.textContent = "Safe";
          drawdownLevelText.className = "text-emerald-400";
        } else if (data.currentDrawdownPercent < 10) {
          drawdownLevelText.textContent = "Caution";
          drawdownLevelText.className = "text-amber-400";
        } else {
          drawdownLevelText.textContent = "Danger";
          drawdownLevelText.className = "text-rose-400";
        }
      }
    }
  
    // Daily Loss Limit Tracker
    const DAILY_LOSS_LIMIT_KEY = "tradingdesk:daily-loss-limit";
  
    function loadDailyLossLimit() {
      try {
        return JSON.parse(localStorage.getItem(DAILY_LOSS_LIMIT_KEY) || "{}");
      } catch (e) {
        return {};
      }
    }
  
    function saveDailyLossLimit(settings) {
      localStorage.setItem(DAILY_LOSS_LIMIT_KEY, JSON.stringify(settings));
    }
  
    function getTodayPnl() {
      const today = new Date().toISOString().slice(0, 10);
      
      // Always calculate from filtered journal to respect global filter
      const journal = getFilteredJournal();
      return journal
        .filter(t => t.timestamp && t.timestamp.startsWith(today))
        .reduce((sum, t) => sum + (t.pnl || 0), 0);
    }
  
    function renderDailyLossTracker() {
      const limitInput = document.getElementById("daily-loss-limit");
      const limitDollarInput = document.getElementById("daily-loss-limit-dollar");
      const limitPercentInput = document.getElementById("daily-loss-limit-percent");
      const limitPercentInputNew = document.getElementById("daily-loss-limit-percent-input");
      const balanceInput = document.getElementById("risk-balance");
      const todayPnlEl = document.getElementById("today-pnl");
      const remainingEl = document.getElementById("remaining-loss");
      const statusEl = document.getElementById("loss-limit-status");
      const lossBar = document.getElementById("loss-limit-bar");
      const lossProgressText = document.getElementById("loss-progress-text");
  
      if (!todayPnlEl) return;
  
      // Load saved settings
      const savedSettings = loadDailyLossLimit();
      
      // Always load saved limit if available
      if (savedSettings.limit !== undefined && savedSettings.limit !== null && savedSettings.limit > 0) {
        if (limitInput) limitInput.value = savedSettings.limit;
        if (limitDollarInput && !limitDollarInput.value) limitDollarInput.value = savedSettings.limit;
      }
      if (savedSettings.limitPercent !== undefined && savedSettings.limitPercent !== null && savedSettings.limitPercent > 0) {
        if (limitPercentInput && !limitPercentInput.value) limitPercentInput.value = savedSettings.limitPercent;
        if (limitPercentInputNew && !limitPercentInputNew.value) limitPercentInputNew.value = savedSettings.limitPercent;
      }
  
      const balance = parseFloat(balanceInput?.value) || 0;
      
      // Get limit from dollar input first, then percent
      let lossLimit = parseFloat(limitDollarInput?.value) || parseFloat(limitInput?.value) || 0;
      const limitPercent = parseFloat(limitPercentInputNew?.value) || parseFloat(limitPercentInput?.value) || 0;
  
      // If percent is set and balance is available, calculate limit from percent
      if (limitPercent > 0 && balance > 0) {
        lossLimit = balance * (limitPercent / 100);
        if (limitInput) limitInput.value = lossLimit.toFixed(2);
        if (limitDollarInput) limitDollarInput.value = lossLimit.toFixed(0);
      }
  
      const todayPnl = getTodayPnl();
      const todayLoss = todayPnl < 0 ? Math.abs(todayPnl) : 0;
      const remaining = lossLimit > 0 ? Math.max(0, lossLimit - todayLoss) : 0;
      const lossProgress = lossLimit > 0 ? (todayLoss / lossLimit) * 100 : 0;
  
      // Update Today's P&L
      if (todayPnlEl) {
        todayPnlEl.textContent = `${todayPnl >= 0 ? '+' : ''}$${todayPnl.toFixed(2)}`;
        todayPnlEl.className = `text-[14px] font-semibold ${todayPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`;
      }
  
      // Update Remaining
      if (remainingEl) {
        remainingEl.textContent = lossLimit > 0 ? `$${remaining.toFixed(2)}` : "No limit set";
        remainingEl.className = `text-[14px] font-semibold ${
          lossProgress < 50 ? "text-emerald-300" :
          lossProgress < 80 ? "text-amber-300" : "text-rose-300"
        }`;
      }
  
      // Update Status
      if (statusEl) {
        if (lossLimit === 0) {
          statusEl.textContent = "No Limit";
          statusEl.className = "text-[14px] font-semibold text-slate-400";
        } else if (lossProgress >= 100) {
          statusEl.textContent = "STOP";
          statusEl.className = "text-[14px] font-semibold text-rose-300 animate-pulse";
        } else if (lossProgress >= 80) {
          statusEl.textContent = "WARNING";
          statusEl.className = "text-[14px] font-semibold text-rose-300";
        } else if (lossProgress >= 50) {
          statusEl.textContent = "CAUTION";
          statusEl.className = "text-[14px] font-semibold text-amber-300";
        } else {
          statusEl.textContent = "OK";
          statusEl.className = "text-[14px] font-semibold text-emerald-300";
        }
      }
  
      // Update Progress Bar
      if (lossBar) {
        const barWidth = Math.min(lossProgress, 100);
        lossBar.style.width = `${barWidth}%`;
        lossBar.className = `h-full transition-all duration-300 ${
          lossProgress < 50 ? "bg-emerald-500" :
          lossProgress < 80 ? "bg-amber-500" : "bg-rose-500"
        }`;
      }
  
      if (lossProgressText) {
        lossProgressText.textContent = `${Math.round(lossProgress)}%`;
      }
      
      // Update header status bar
      updateHeaderStatusBar(todayPnl, lossLimit, lossProgress);
      
      // Check for alerts
      checkLossLimitAlerts(lossProgress, todayLoss, lossLimit);
    }
    
    // Update header status bar independently (can be called without finance section)
    window.updateHeaderStatusBarIndependent = function updateHeaderStatusBarIndependent() {
      const savedSettings = loadDailyLossLimit();
      const lossLimit = parseFloat(savedSettings.limit) || 0;
      const todayPnl = getTodayPnl();
      const todayLoss = todayPnl < 0 ? Math.abs(todayPnl) : 0;
      const lossProgress = lossLimit > 0 ? (todayLoss / lossLimit) * 100 : 0;
      
      updateHeaderStatusBar(todayPnl, lossLimit, lossProgress);
    };
    
    // Header Status Bar
    function updateHeaderStatusBar(todayPnl, lossLimit, lossProgress) {
      const headerPnl = document.getElementById("header-today-pnl");
      const headerLimitBar = document.getElementById("header-limit-bar");
      const headerLimitPercent = document.getElementById("header-limit-percent");
      const headerTradesCount = document.getElementById("header-trades-count");
      // Single unified status badge
      const headerStatusBadge = document.getElementById("header-status-badge");
      const headerStatusDot = document.getElementById("header-status-dot");
      const headerStatusText = document.getElementById("header-status-text");
      
      if (!headerPnl) return;
      
      // Update Today's P&L
      headerPnl.textContent = `${todayPnl >= 0 ? '+' : ''}$${todayPnl.toFixed(2)}`;
      headerPnl.className = `font-medium ${todayPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`;
      
      // Update limit bar
      if (headerLimitBar) {
        const barWidth = Math.min(lossProgress, 100);
        headerLimitBar.style.width = `${barWidth}%`;
        headerLimitBar.className = `h-full transition-all duration-300 ${
          lossProgress < 50 ? "bg-emerald-500" :
          lossProgress < 75 ? "bg-amber-500" : "bg-rose-500"
        }`;
      }
      
      if (headerLimitPercent) {
        headerLimitPercent.textContent = lossLimit > 0 ? `${Math.round(lossProgress)}%` : "No limit";
      }
      
      // Update trades count
      const today = new Date().toISOString().slice(0, 10);
      const journal = getFilteredJournal();
      const todayTrades = journal.filter(t => t.timestamp && t.timestamp.startsWith(today));
      if (headerTradesCount) {
        headerTradesCount.textContent = todayTrades.length;
      }
      
      // Update unified status badge
      if (headerStatusBadge && headerStatusDot && headerStatusText) {
        const baseClass = "flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0";
        
        if (lossProgress >= 100) {
          headerStatusBadge.className = `${baseClass} bg-rose-500/20 border border-rose-500/30 animate-pulse`;
          headerStatusDot.className = "w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse";
          headerStatusText.textContent = "STOP";
          headerStatusText.className = "text-[9px] md:text-[10px] font-medium text-rose-400";
        } else if (lossProgress >= 75) {
          headerStatusBadge.className = `${baseClass} bg-rose-500/10 border border-rose-500/20`;
          headerStatusDot.className = "w-1.5 h-1.5 rounded-full bg-rose-400";
          headerStatusText.textContent = "Warning";
          headerStatusText.className = "text-[9px] md:text-[10px] font-medium text-rose-400";
        } else if (lossProgress >= 50) {
          headerStatusBadge.className = `${baseClass} bg-amber-500/10 border border-amber-500/20`;
          headerStatusDot.className = "w-1.5 h-1.5 rounded-full bg-amber-400";
          headerStatusText.textContent = "Caution";
          headerStatusText.className = "text-[9px] md:text-[10px] font-medium text-amber-400";
        } else {
          headerStatusBadge.className = `${baseClass} bg-emerald-500/10 border border-emerald-500/20`;
          headerStatusDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400";
          headerStatusText.textContent = "Ready";
          headerStatusText.className = "text-[9px] md:text-[10px] font-medium text-emerald-400";
        }
      }
    }
    
    // Loss Limit Alerts
    let lastAlertLevel = 0;
    let cooldownEndTime = null;
    let cooldownInterval = null;
    
    function checkLossLimitAlerts(lossProgress, todayLoss, lossLimit) {
      const savedSettings = loadDailyLossLimit();
      const alertLevels = savedSettings.alertAt || [50, 75, 100];
      
      // Check if we've crossed a new alert level
      for (const level of alertLevels) {
        if (lossProgress >= level && lastAlertLevel < level) {
          showLossLimitAlert(level, todayLoss, lossLimit);
          lastAlertLevel = level;
          break;
        }
      }
      
      // Reset alert level if we're back below 50%
      if (lossProgress < 50) {
        lastAlertLevel = 0;
      }
    }
    
    function showLossLimitAlert(level, todayLoss, lossLimit) {
      const modal = document.getElementById("loss-limit-alert-modal");
      const titleEl = document.getElementById("alert-modal-title");
      const messageEl = document.getElementById("alert-modal-message");
      const todayLossEl = document.getElementById("alert-today-loss");
      const dailyLimitEl = document.getElementById("alert-daily-limit");
      const cooldownSection = document.getElementById("cooldown-section");
      
      if (!modal) return;
      
      // Update content based on level
      if (level >= 100) {
        titleEl.textContent = "Daily Loss Limit Reached!";
        messageEl.textContent = "You have reached your daily loss limit. Stop trading now to protect your capital.";
        if (cooldownSection) cooldownSection.classList.remove("hidden");
        startCooldownTimer(30); // 30 minute cooldown
      } else if (level >= 75) {
        titleEl.textContent = "Warning: 75% of Daily Limit";
        messageEl.textContent = "You are approaching your daily loss limit. Consider reducing position sizes or stopping for the day.";
        if (cooldownSection) cooldownSection.classList.add("hidden");
      } else if (level >= 50) {
        titleEl.textContent = "Caution: 50% of Daily Limit";
        messageEl.textContent = "You have used half of your daily loss limit. Trade carefully.";
        if (cooldownSection) cooldownSection.classList.add("hidden");
      }
      
      if (todayLossEl) todayLossEl.textContent = `-$${todayLoss.toFixed(2)}`;
      if (dailyLimitEl) dailyLimitEl.textContent = `$${lossLimit.toFixed(2)}`;
      
      modal.classList.remove("hidden");
      
      // Play sound if enabled
      const savedSettings = loadDailyLossLimit();
      if (savedSettings.soundEnabled) {
        playAlertSound();
      }
    }
    
    function startCooldownTimer(minutes) {
      cooldownEndTime = Date.now() + (minutes * 60 * 1000);
      
      const timerEl = document.getElementById("cooldown-timer");
      
      if (cooldownInterval) clearInterval(cooldownInterval);
      
      cooldownInterval = setInterval(() => {
        const remaining = cooldownEndTime - Date.now();
        
        if (remaining <= 0) {
          clearInterval(cooldownInterval);
          if (timerEl) timerEl.textContent = "00:00";
          return;
        }
        
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        if (timerEl) timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }, 1000);
    }
    
    function playAlertSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.log("Could not play alert sound");
      }
    }
    
    // Tilt Detection
    const TILT_SETTINGS_KEY = "tradingdesk:tilt-settings";
    
    function loadTiltSettings() {
      try {
        return JSON.parse(localStorage.getItem(TILT_SETTINGS_KEY) || '{}');
      } catch (e) {
        return {};
      }
    }
    
    function saveTiltSettings(settings) {
      localStorage.setItem(TILT_SETTINGS_KEY, JSON.stringify(settings));
    }
    
    function checkForTilt() {
      const indicators = [];
      const today = new Date().toISOString().slice(0, 10);
      const journal = getFilteredJournal();
      const todayTrades = journal.filter(t => t.timestamp && t.timestamp.startsWith(today));
      
      if (todayTrades.length < 2) return indicators;
      
      // Sort by timestamp
      todayTrades.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Check 1: Rapid trading (3+ trades in 10 minutes)
      const recentTrades = todayTrades.slice(-5);
      for (let i = 2; i < recentTrades.length; i++) {
        const timeDiff = new Date(recentTrades[i].timestamp) - new Date(recentTrades[i-2].timestamp);
        if (timeDiff < 10 * 60 * 1000) { // 10 minutes
          indicators.push({
            type: 'rapid_trading',
            message: '3+ trades within 10 minutes',
            severity: 'warning'
          });
          break;
        }
      }
      
      // Check 2: Increasing position size after losses
      const lastThreeTrades = todayTrades.slice(-3);
      if (lastThreeTrades.length >= 3) {
        const allLosses = lastThreeTrades.every(t => t.result === 'loss');
        const increasingSize = lastThreeTrades[2].size > lastThreeTrades[1].size && 
                              lastThreeTrades[1].size > lastThreeTrades[0].size;
        
        if (allLosses || increasingSize) {
          indicators.push({
            type: 'revenge_trading',
            message: allLosses ? '3 consecutive losses' : 'Increasing position size after losses',
            severity: 'danger'
          });
        }
      }
      
      // Check 3: Trading outside defined hours
      const settings = loadTiltSettings();
      if (settings.tradingHours) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = settings.tradingHours.start.split(':').map(Number);
        const [endH, endM] = settings.tradingHours.end.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        if (currentTime < startMinutes || currentTime > endMinutes) {
          indicators.push({
            type: 'outside_hours',
            message: 'Trading outside your defined hours',
            severity: 'warning'
          });
        }
      }
      
      // Check 4: High loss rate today
      const losses = todayTrades.filter(t => t.result === 'loss').length;
      const winRate = todayTrades.length > 0 ? ((todayTrades.length - losses) / todayTrades.length) * 100 : 100;
      if (todayTrades.length >= 5 && winRate < 30) {
        indicators.push({
          type: 'low_winrate',
          message: `Today's win rate is only ${winRate.toFixed(0)}%`,
          severity: 'danger'
        });
      }
      
      return indicators;
    }
    
    function showTiltWarning(indicators) {
      const modal = document.getElementById("tilt-warning-modal");
      const indicatorsEl = document.getElementById("tilt-indicators");
      
      if (!modal || !indicatorsEl || indicators.length === 0) return;
      
      indicatorsEl.innerHTML = indicators.map(ind => `
        <div class="flex items-center gap-2 p-2 rounded-lg ${ind.severity === 'danger' ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-amber-500/10 border border-amber-500/20'}">
          <div class="w-2 h-2 rounded-full ${ind.severity === 'danger' ? 'bg-rose-400' : 'bg-amber-400'}"></div>
          <span class="text-[11px] ${ind.severity === 'danger' ? 'text-rose-300' : 'text-amber-300'}">${ind.message}</span>
        </div>
      `).join('');
      
      modal.classList.remove("hidden");
    }
    
    // Initialize alert modals
    function initAlertModals() {
      // Loss limit alert modal
      const lossAlertModal = document.getElementById("loss-limit-alert-modal");
      const acknowledgeBtn = document.getElementById("alert-acknowledge-btn");
      const dismissBtn = document.getElementById("alert-dismiss-btn");
      
      if (acknowledgeBtn) {
        acknowledgeBtn.addEventListener("click", () => {
          lossAlertModal?.classList.add("hidden");
          // Could add logic to lock trading here
        });
      }
      
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => {
          lossAlertModal?.classList.add("hidden");
        });
      }
      
      // Tilt warning modal
      const tiltModal = document.getElementById("tilt-warning-modal");
      const takeBreakBtn = document.getElementById("tilt-take-break-btn");
      const tiltDismissBtn = document.getElementById("tilt-dismiss-btn");
      
      if (takeBreakBtn) {
        takeBreakBtn.addEventListener("click", () => {
          tiltModal?.classList.add("hidden");
          startCooldownTimer(15); // 15 minute break
          const cooldownSection = document.getElementById("cooldown-section");
          const lossAlertModal = document.getElementById("loss-limit-alert-modal");
          if (cooldownSection) cooldownSection.classList.remove("hidden");
          if (lossAlertModal) lossAlertModal.classList.remove("hidden");
        });
      }
      
      if (tiltDismissBtn) {
        tiltDismissBtn.addEventListener("click", () => {
          tiltModal?.classList.add("hidden");
        });
      }
    }
  
    // Initialize Risk Management Tools
    function initRiskManagementTools() {
      populateRiskAccountSelector();
  
      // Position Size Calculator
      const btnCalculate = document.getElementById("btn-calculate-position");
      const riskInputs = ["risk-balance", "risk-percent", "risk-entry", "risk-sl", "risk-tp", "pip-value", "sl-pips", "lot-size", "tick-value", "tick-size", "contract-size"];
      
      if (btnCalculate) {
        btnCalculate.addEventListener("click", updatePositionSizeCalculator);
      }
  
      riskInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.addEventListener("input", updatePositionSizeCalculator);
        }
      });
      
      // Instrument type selector
      const instrumentTypeSelect = document.getElementById("instrument-type");
      if (instrumentTypeSelect) {
        instrumentTypeSelect.addEventListener("change", toggleInstrumentInputs);
      }
      
      // Initialize copy to clipboard
      initCopyToClipboard();
  
      // Daily Loss Limit
      const limitInput = document.getElementById("daily-loss-limit");
      const limitDollarInput = document.getElementById("daily-loss-limit-dollar");
      const limitPercentInput = document.getElementById("daily-loss-limit-percent");
      const limitPercentInputNew = document.getElementById("daily-loss-limit-percent-input");
  
      // Helper to save and update
      function saveLimitAndUpdate() {
        const dollarValue = parseFloat(limitDollarInput?.value) || parseFloat(limitInput?.value) || 0;
        const percentValue = parseFloat(limitPercentInputNew?.value) || parseFloat(limitPercentInput?.value) || 0;
        
        saveDailyLossLimit({ 
          limit: dollarValue,
          limitPercent: percentValue
        });
        renderDailyLossTracker();
        
        // Also update header
        if (window.updateHeaderStatusBarIndependent) {
          window.updateHeaderStatusBarIndependent();
        }
      }
  
      if (limitInput) {
        limitInput.addEventListener("change", saveLimitAndUpdate);
      }
  
      if (limitDollarInput) {
        limitDollarInput.addEventListener("change", () => {
          // Clear percent when dollar is set directly
          if (limitPercentInputNew) limitPercentInputNew.value = "";
          if (limitPercentInput) limitPercentInput.value = "";
          saveLimitAndUpdate();
        });
        limitDollarInput.addEventListener("input", () => {
          // Clear percent when typing in dollar field
          if (limitPercentInputNew) limitPercentInputNew.value = "";
        });
      }
  
      if (limitPercentInput) {
        limitPercentInput.addEventListener("change", saveLimitAndUpdate);
      }
  
      if (limitPercentInputNew) {
        limitPercentInputNew.addEventListener("change", () => {
          // Clear dollar when percent is set
          if (limitDollarInput) limitDollarInput.value = "";
          saveLimitAndUpdate();
        });
        limitPercentInputNew.addEventListener("input", () => {
          // Clear dollar when typing in percent field
          if (limitDollarInput) limitDollarInput.value = "";
        });
      }
  
      // Initial render
      renderDrawdownTracker();
      renderDailyLossTracker();
      
      // Initialize alert modals
      initAlertModals();
      
      // Check for tilt on trade logging
      const originalSaveTradeToJournal = window.saveTradeToJournal;
      if (typeof originalSaveTradeToJournal === 'function') {
        window.saveTradeToJournal = function(...args) {
          const result = originalSaveTradeToJournal.apply(this, args);
          // Check for tilt after each trade
          setTimeout(() => {
            const indicators = checkForTilt();
            if (indicators.length > 0) {
              showTiltWarning(indicators);
            }
            renderDailyLossTracker();
          }, 500);
          return result;
        };
      }
    }
  
    // Make functions globally available
    window.renderDrawdownTracker = renderDrawdownTracker;
    window.renderDailyLossTracker = renderDailyLossTracker;
    window.populateRiskAccountSelector = populateRiskAccountSelector;
    window.checkForTilt = checkForTilt;
    window.showTiltWarning = showTiltWarning;
  
    function loadVaultScreenshots() {
      try {
        return JSON.parse(localStorage.getItem(VAULT_SCREENSHOTS_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }
  
    function saveVaultScreenshots(screenshots) {
      localStorage.setItem(VAULT_SCREENSHOTS_KEY, JSON.stringify(screenshots));
    }
  
    function loadVaultJournals() {
      try {
        return JSON.parse(localStorage.getItem(VAULT_JOURNALS_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }
  
    function saveVaultJournals(journals) {
      localStorage.setItem(VAULT_JOURNALS_KEY, JSON.stringify(journals));
    }
  
    function saveScreenshotToVault(imageData, date, type = "full-day", metadata = {}) {
      // Only save screenshots from Chart section (full-day, journal types)
      // Daily Prep and Checklist screenshots are only downloaded locally
      if (type === "daily-prep" || type === "checklist") {
        return; // Skip storage for these types
      }
      
      try {
        const screenshotId = Date.now().toString();
        const today = new Date().toISOString().slice(0, 10);
        
        const archive = getOrCreateDailyArchive(today);
        // Check if screenshot already exists to avoid duplicates
        const screenshotExists = archive.screenshots.some(s => s.id === screenshotId);
        if (!screenshotExists) {
          const screenshotObj = {
            id: screenshotId,
            type: type,
            data: imageData,
            timestamp: new Date().toISOString(),
            label: metadata.label || `${type} - ${today}`,
            tradeId: metadata.tradeId || null
          };
          
          archive.screenshots.push(screenshotObj);
          updateDailyArchive(today, archive);
          
          // Update calendar if visible
          const screenshotsSection = document.getElementById("screenshots");
          if (screenshotsSection && !screenshotsSection.classList.contains("hidden")) {
            setTimeout(() => renderCalendar(), 200);
          }
        }
      } catch (e) {
        console.error("Failed to save screenshot to vault:", e);
      }
    }
  
    function saveJournalToVault(journalEntry) {
      try {
        const journals = loadVaultJournals();
        const date = new Date().toISOString().slice(0, 10);
        const existingDay = journals.find(j => j.date === date);
        
        if (existingDay) {
          existingDay.entries.push(journalEntry);
        } else {
          journals.push({
            date: date,
            entries: [journalEntry],
          });
        }
        saveVaultJournals(journals);
        const renderFn = window.renderVaultJournals;
        if (renderFn) renderFn();
        
        // Also link to daily archive
        const archive = getOrCreateDailyArchive(date);
        // Check if trade already exists in archive (avoid duplicates)
        const tradeExists = archive.trades.some(t => t.id === journalEntry.id);
        if (!tradeExists) {
          archive.trades.push(journalEntry);
          archive.summary = calculateDailySummary(archive.trades);
          updateDailyArchive(date, archive);
        }
      } catch (e) {
        console.error("Failed to save journal to vault:", e);
      }
    }
  
    // Make functions available globally for early calls
    window.saveScreenshotToVault = saveScreenshotToVault;
    window.saveJournalToVault = saveJournalToVault;
  
    // Calendar View for Screenshot Vault
    let currentCalendarMonth = new Date().getMonth();
    let currentCalendarYear = new Date().getFullYear();
    let currentCalendarView = 'month'; // 'day', 'week', 'month', 'year'
    let currentCalendarDay = new Date().getDate();
    let currentCalendarWeek = getWeekNumber(new Date());
    
    // Get week number of a date
    function getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    // Get dates for a specific week
    function getWeekDates(year, weekNum) {
      const simple = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(ISOweekStart);
        d.setDate(ISOweekStart.getDate() + i);
        dates.push(d);
      }
      return dates;
    }
  
    // Helper function to extract date from various screenshot date formats
    function extractDateFromScreenshot(screenshot) {
      if (!screenshot) return null;
      
      // Try direct date field first
      if (screenshot.date) {
        // Handle formats like "daily-prep-2026-01-06" or "checklist-2026-01-06-123456" or "journal-2026-01-06T12:30:00"
        const dateMatch = screenshot.date.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) return dateMatch[1];
        
        // If date is already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(screenshot.date)) {
          return screenshot.date;
        }
        
        // Handle full-day-TIMESTAMP format (e.g., "full-day-2026-01-06T12:30:00.000Z")
        if (screenshot.date.includes('T')) {
          try {
            // Extract date part from ISO timestamp
            const isoDateMatch = screenshot.date.match(/\d{4}-\d{2}-\d{2}T/);
            if (isoDateMatch) {
              return isoDateMatch[0].replace('T', '');
            }
            // Try parsing as full ISO string
            const d = new Date(screenshot.date);
            if (!isNaN(d.getTime())) {
              return d.toISOString().slice(0, 10);
            }
          } catch (e) {}
        }
      }
      
      // Try timestamp field
      if (screenshot.timestamp) {
        try {
          const d = new Date(screenshot.timestamp);
          if (!isNaN(d.getTime())) {
            return d.toISOString().slice(0, 10);
          }
        } catch (e) {}
      }
      
      // Try extracting from id if it's a timestamp
      if (screenshot.id && /^\d{13,}$/.test(screenshot.id)) {
        try {
          const d = new Date(parseInt(screenshot.id));
          if (!isNaN(d.getTime())) {
            return d.toISOString().slice(0, 10);
          }
        } catch (e) {}
      }
      
      // Try label field as last resort (e.g., "Daily Prep - 2026-01-06")
      if (screenshot.label) {
        const labelDateMatch = screenshot.label.match(/(\d{4}-\d{2}-\d{2})/);
        if (labelDateMatch) return labelDateMatch[1];
      }
      
      return null;
    }
  
    // Get all screenshots for a specific date from all sources
    function getScreenshotsForDate(dateStr) {
      const allScreenshots = [];
      const seenIds = new Set();
      
      // 1. Get from daily archives
      const archives = loadDailyArchives();
      const archive = archives.find(a => a.date === dateStr);
      if (archive) {
        // Daily Prep screenshot
        if (archive.dailyPrep && archive.dailyPrep.screenshot && 
            typeof archive.dailyPrep.screenshot === 'string' && 
            archive.dailyPrep.screenshot.startsWith('data:image')) {
          const prepId = `prep-${dateStr}`;
          if (!seenIds.has(prepId)) {
            seenIds.add(prepId);
            allScreenshots.push({
              id: prepId,
              type: 'daily-prep',
              data: archive.dailyPrep.screenshot,
              label: `Daily Prep - ${dateStr}`,
              timestamp: archive.dailyPrep.timestamp
            });
          }
        }
        
        // Archive screenshots
        if (archive.screenshots && Array.isArray(archive.screenshots)) {
          archive.screenshots.forEach(s => {
            if (s && s.data && typeof s.data === 'string' && s.data.startsWith('data:image')) {
              const id = s.id || `archive-${Date.now()}-${Math.random()}`;
              if (!seenIds.has(id)) {
                seenIds.add(id);
                allScreenshots.push({
                  id: id,
                  type: s.type || 'screenshot',
                  data: s.data,
                  label: s.label || s.type || 'Screenshot',
                  timestamp: s.timestamp
                });
              }
            }
          });
        }
      }
      
      // 2. Get from vault screenshots
      const vaultScreenshots = loadVaultScreenshots();
      vaultScreenshots.forEach(s => {
        const screenshotDate = extractDateFromScreenshot(s);
        if (screenshotDate === dateStr) {
          if (s && s.data && typeof s.data === 'string' && s.data.startsWith('data:image')) {
            const id = s.id || `vault-${Date.now()}-${Math.random()}`;
            if (!seenIds.has(id)) {
              seenIds.add(id);
              allScreenshots.push({
                id: id,
                type: s.type || 'screenshot',
                data: s.data,
                label: s.label || s.type || 'Screenshot',
                timestamp: s.timestamp
              });
            }
          }
        }
      });
      
      return allScreenshots;
    }
  
    function renderCalendar() {
      const calendarContainer = domCache.get("calendar-container");
      const calendarGrid = domCache.get("calendar-grid");
      const monthHeader = domCache.get("calendar-month-header");
      const emptyEl = domCache.get("screenshots-empty");
      
      if (!calendarContainer || !calendarGrid || !monthHeader || !emptyEl) {
        console.log("Calendar elements not found:", { calendarContainer, calendarGrid, monthHeader, emptyEl });
        return;
      }
      
      // Update view selector buttons
      document.querySelectorAll('.calendar-view-btn').forEach(btn => {
        if (btn.dataset.view === currentCalendarView) {
          btn.classList.add('bg-emerald-500/20', 'text-emerald-400', 'border', 'border-emerald-500/30');
          btn.classList.remove('text-slate-400');
        } else {
          btn.classList.remove('bg-emerald-500/20', 'text-emerald-400', 'border', 'border-emerald-500/30');
          btn.classList.add('text-slate-400');
        }
      });
  
      const archives = loadDailyArchives();
      // Only count dates with actual activity (dailyPrep or trades), not just screenshots
      const activeDates = new Set(archives
        .filter(a => a.dailyPrep || (a.trades && a.trades.length > 0))
        .map(a => a.date));
  
      const monthNames = ["januar", "februar", "mars", "april", "mai", "juni",
        "juli", "august", "september", "oktober", "november", "desember"];
      const monthNamesShort = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
      
      // Render based on current view
      if (currentCalendarView === 'year') {
        renderYearView(calendarGrid, monthHeader, activeDates, archives, monthNamesShort);
        return;
      } else if (currentCalendarView === 'week') {
        renderWeekView(calendarGrid, monthHeader, activeDates, archives, monthNames);
        return;
      } else if (currentCalendarView === 'day') {
        renderDayView(calendarGrid, monthHeader, activeDates, archives, monthNames);
        return;
      }
      
      // Default: Month view
      // Get first day of month and number of days
      const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
      const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const rawDayOfWeek = firstDay.getDay();
      const startingDayOfWeek = rawDayOfWeek === 0 ? 6 : rawDayOfWeek - 1;
  
      // Update header
      monthHeader.textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
  
      // Clear grid
      calendarGrid.innerHTML = "";
  
      // Day headers (Norwegian abbreviations) - shorter on mobile
      const dayHeaders = ["ma", "ti", "on", "to", "fr", "lø", "sø"];
      const dayHeadersFull = ["man.", "tir.", "ons.", "tor.", "fre.", "lør.", "søn."];
      const isMobile = window.innerWidth < 768;
      
      (isMobile ? dayHeaders : dayHeadersFull).forEach(day => {
        const header = document.createElement("div");
        header.className = "text-[9px] md:text-[11px] font-medium text-slate-400 text-center pb-2 md:pb-3";
        header.textContent = day;
        calendarGrid.appendChild(header);
      });
  
      // Empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "min-h-[50px] md:min-h-[90px] p-0.5 md:p-1";
        calendarGrid.appendChild(emptyCell);
      }
  
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasActivity = activeDates.has(dateStr);
        const isToday = dateStr === new Date().toISOString().slice(0, 10);
        
        const dayCell = document.createElement("div");
        dayCell.className = `min-h-[50px] md:min-h-[90px] p-1 md:p-2 rounded-lg border cursor-pointer transition-all active:scale-95 ${
          hasActivity 
            ? 'border-[#262626] bg-black/40 hover:bg-black/60' 
            : 'border-[#161616] bg-black/20 hover:bg-black/30'
        }`;
        
        dayCell.dataset.date = dateStr;
        
        // Day number with red circle if has activity
        const dayNumberContainer = document.createElement("div");
        dayNumberContainer.className = "flex items-center justify-center mb-0.5 md:mb-1";
        
        const dayNumber = document.createElement("span");
        dayNumber.className = `text-[11px] md:text-[13px] font-medium ${
          hasActivity ? 'text-slate-200' : 'text-slate-500'
        }`;
        dayNumber.textContent = day;
        
        if (hasActivity) {
          // Red circle indicator like in the image
          dayNumber.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #ef4444;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 10px;
          `;
          // Larger on desktop
          if (window.innerWidth >= 768) {
            dayNumber.style.width = '24px';
            dayNumber.style.height = '24px';
            dayNumber.style.fontSize = '13px';
          }
        }
        
        dayNumberContainer.appendChild(dayNumber);
        dayCell.appendChild(dayNumberContainer);
        
        // Activity summary if has activity - show compact info
        if (hasActivity) {
          const archive = archives.find(a => a.date === dateStr);
          if (archive) {
            const summary = archive.summary || calculateDailySummary(archive.trades);
            const hasPrep = archive.dailyPrep && (archive.dailyPrep.screenshot || archive.dailyPrep.data);
            
            // Create compact activity summary container
            const activityContainer = document.createElement("div");
            activityContainer.className = "mt-1 space-y-0.5";
            
            // Row 1: Daily Prep indicator
            if (hasPrep) {
              const prepRow = document.createElement("div");
              prepRow.className = "text-[9px] md:text-[10px] text-emerald-400 truncate font-medium";
              prepRow.textContent = "✓ Prep";
              activityContainer.appendChild(prepRow);
            }
            
            // Row 2: Trades count
            if (summary.totalTrades > 0) {
              const tradesRow = document.createElement("div");
              tradesRow.className = "text-[9px] md:text-[10px] text-slate-400 truncate";
              tradesRow.textContent = `${summary.totalTrades} trade${summary.totalTrades > 1 ? 's' : ''}`;
              activityContainer.appendChild(tradesRow);
            }
            
            // Row 3: P&L display (prominent)
            if (summary.totalTrades > 0) {
              const pnlRow = document.createElement("div");
              const pnlClass = summary.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400";
              pnlRow.className = `text-[10px] md:text-[11px] font-semibold ${pnlClass}`;
              pnlRow.textContent = `$${summary.totalPnl >= 0 ? '' : ''}${summary.totalPnl.toFixed(2)}`;
              activityContainer.appendChild(pnlRow);
            }
            
            dayCell.appendChild(activityContainer);
          }
        }
        
        // Highlight today
        if (isToday) {
          dayCell.classList.add("ring-2", "ring-slate-500/50");
        }
        
        dayCell.addEventListener("click", () => {
          showDayDetail(dateStr);
        });
        
        calendarGrid.appendChild(dayCell);
      }
  
      // Always show calendar, even if empty
      emptyEl.style.display = "none";
      calendarContainer.style.display = "block";
      
      // Show empty message only if no archives at all
      const allArchives = loadDailyArchives();
      if (allArchives.length === 0) {
        emptyEl.style.display = "block";
      } else {
        emptyEl.style.display = "none";
      }
    }
  
    function showDayDetail(dateStr) {
      const calendarGrid = document.getElementById("calendar-grid");
      const calendarHeader = document.querySelector("#calendar-container > div:first-child");
      const dayDetailView = document.getElementById("day-detail-view");
      const dayDetailDate = document.getElementById("day-detail-date");
      const dayDetailEmpty = document.getElementById("day-detail-empty");
      
      if (!calendarGrid || !dayDetailView || !dayDetailDate) return;
  
      // Load fresh archive data
      const allArchives = loadDailyArchives();
      let archive = allArchives.find(a => a.date === dateStr);
      
      if (!archive) {
        archive = getOrCreateDailyArchive(dateStr);
      }
      
      // Don't count screenshots as activity - they're only downloaded locally now
      const hasActivity = archive.dailyPrep || archive.trades.length > 0;
  
      // Format date
      const dateObj = new Date(dateStr + "T00:00:00");
      const dateDisplay = dateObj.toLocaleDateString('nb-NO', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      dayDetailDate.textContent = dateDisplay;
  
      // Hide calendar grid and header, show detail view
      calendarGrid.classList.add("hidden");
      if (calendarHeader) calendarHeader.classList.add("hidden");
      dayDetailView.classList.remove("hidden");
  
      if (!hasActivity) {
        dayDetailEmpty.style.display = "block";
        document.getElementById("day-detail-prep").classList.add("hidden");
        document.getElementById("day-detail-trades").classList.add("hidden");
        document.getElementById("day-detail-screenshots").classList.add("hidden");
        return;
      }
  
      dayDetailEmpty.style.display = "none";
  
      // Show Daily Prep - text summary only (no screenshot)
      const prepSection = document.getElementById("day-detail-prep");
      const prepContent = document.getElementById("day-detail-prep-content");
      if (archive.dailyPrep && archive.dailyPrep.data) {
        const data = archive.dailyPrep.data;
        const hasData = data.instrument || data.trend || data.levels || data.marketProfile || 
                        data.supportResistance || data.vwap || data.narrative || data.ltvw;
        
        if (hasData) {
          prepSection.classList.remove("hidden");
          let html = '<div class="text-[11px] text-slate-300 space-y-1">';
          if (data.instrument) html += `<div><span class="text-slate-500">Instrument:</span> ${sanitizeHTML(data.instrument)}</div>`;
          if (data.trend && data.trend !== '–') html += `<div><span class="text-slate-500">Trend:</span> ${sanitizeHTML(data.trend)}</div>`;
          if (data.levels) html += `<div><span class="text-slate-500">Levels:</span> ${sanitizeHTML(data.levels)}</div>`;
          if (data.narrative) html += `<div><span class="text-slate-500">Narrative:</span> ${sanitizeHTML(data.narrative)}</div>`;
          html += '</div>';
          prepContent.innerHTML = html;
        } else {
          prepSection.classList.add("hidden");
        }
      } else {
        prepSection.classList.add("hidden");
      }
  
      // Show Trades
      const tradesSection = document.getElementById("day-detail-trades");
      const tradesContent = document.getElementById("day-detail-trades-content");
      if (archive.trades.length > 0) {
        tradesSection.classList.remove("hidden");
        tradesContent.innerHTML = "";
        
        archive.trades.forEach((trade) => {
          const directionBadge = trade.direction === "long"
            ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400">↑ Long</span>'
            : trade.direction === "short"
            ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400">↓ Short</span>'
            : '';
          
          const resultBadge = trade.result === "win" 
            ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300">✓ Win</span>'
            : trade.result === "loss"
            ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">✗ Loss</span>'
            : '';
          
          const pnlDisplay = trade.pnl !== undefined 
            ? `<span class="text-[11px] ${trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${trade.pnl.toFixed(2)}</span>`
            : '';
          
          const tradeEl = document.createElement("div");
          tradeEl.className = "rounded-lg border border-[#161616] bg-black/20 p-3 text-[11px]";
          tradeEl.innerHTML = `
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-200">${sanitizeHTML(trade.instrument)}</span>
                ${directionBadge}
                ${resultBadge}
              </div>
              <div class="text-right">
                ${pnlDisplay}
                <div class="text-[10px] text-slate-400">${sanitizeHTML(trade.time || '')}</div>
              </div>
            </div>
            <div class="text-[10px] text-slate-400">
              Entry: ${sanitizeHTML(trade.plan?.entry || "-")} · SL: ${sanitizeHTML(trade.plan?.sl || "-")} · TP: ${sanitizeHTML(trade.plan?.tp || "-")}
              ${trade.plan?.leverage ? ` · Leverage: ${sanitizeHTML(trade.plan.leverage)}` : ''}
              ${trade.plan?.lots ? ` · Lots: ${sanitizeHTML(trade.plan.lots)}` : ''}
            </div>
            ${trade.notes ? `<div class="text-[10px] text-slate-300 mt-2 whitespace-pre-line">${sanitizeHTML(trade.notes)}</div>` : ''}
          `;
          tradesContent.appendChild(tradeEl);
        });
      } else {
        tradesSection.classList.add("hidden");
      }
  
      // Hide Screenshots section - screenshots are only downloaded locally now
      const screenshotsSection = document.getElementById("day-detail-screenshots");
      screenshotsSection.classList.add("hidden");
    }
  
    function hideDayDetail() {
      const calendarGrid = document.getElementById("calendar-grid");
      const calendarHeader = document.querySelector("#calendar-container > div:first-child");
      const dayDetailView = document.getElementById("day-detail-view");
      
      if (calendarGrid && dayDetailView) {
        calendarGrid.classList.remove("hidden");
        if (calendarHeader) calendarHeader.classList.remove("hidden");
        dayDetailView.classList.add("hidden");
      }
    }
    
    // Year View - show all 12 months in a grid
    function renderYearView(calendarGrid, monthHeader, activeDates, archives, monthNamesShort) {
      monthHeader.textContent = `${currentCalendarYear}`;
      calendarGrid.innerHTML = "";
      calendarGrid.className = "grid grid-cols-3 md:grid-cols-4 gap-3";
      
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(currentCalendarYear, month + 1, 0).getDate();
        let monthPnl = 0;
        let monthTrades = 0;
        let hasActivity = false;
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${currentCalendarYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (activeDates.has(dateStr)) {
            hasActivity = true;
            const archive = archives.find(a => a.date === dateStr);
            if (archive?.summary) {
              monthPnl += archive.summary.totalPnl || 0;
              monthTrades += archive.summary.totalTrades || 0;
            }
          }
        }
        
        const monthCard = document.createElement("div");
        monthCard.className = `p-3 rounded-lg border cursor-pointer transition-all hover:bg-black/40 ${
          hasActivity ? 'border-[#262626] bg-black/30' : 'border-[#1a1a1a] bg-black/10'
        }`;
        monthCard.innerHTML = `
          <div class="text-[12px] font-medium ${hasActivity ? 'text-slate-200' : 'text-slate-500'} mb-1">${monthNamesShort[month]}</div>
          ${hasActivity ? `
            <div class="text-[10px] text-slate-500">${monthTrades} trades</div>
            <div class="text-[11px] font-medium ${monthPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">$${monthPnl.toFixed(0)}</div>
          ` : '<div class="text-[10px] text-slate-600">No activity</div>'}
        `;
        monthCard.addEventListener("click", () => {
          currentCalendarMonth = month;
          currentCalendarView = 'month';
          renderCalendar();
        });
        calendarGrid.appendChild(monthCard);
      }
    }
    
    // Week View - show 7 days in detail
    function renderWeekView(calendarGrid, monthHeader, activeDates, archives, monthNames) {
      const weekDates = getWeekDates(currentCalendarYear, currentCalendarWeek);
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      const monthNamesShort = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
      
      // Shorter format: "W5 · 27 jan - 2 feb"
      monthHeader.textContent = `W${currentCalendarWeek} · ${startDate.getDate()} ${monthNamesShort[startDate.getMonth()]} - ${endDate.getDate()} ${monthNamesShort[endDate.getMonth()]}`;
      
      calendarGrid.innerHTML = "";
      calendarGrid.className = "grid grid-cols-7 gap-1";
      
      const dayHeaders = ["ma", "ti", "on", "to", "fr", "lø", "sø"];
      dayHeaders.forEach(day => {
        const header = document.createElement("div");
        header.className = "text-[9px] font-medium text-slate-500 text-center pb-1.5";
        header.textContent = day;
        calendarGrid.appendChild(header);
      });
      
      weekDates.forEach(date => {
        const dateStr = date.toISOString().slice(0, 10);
        const hasActivity = activeDates.has(dateStr);
        const isToday = dateStr === new Date().toISOString().slice(0, 10);
        const archive = archives.find(a => a.date === dateStr);
        
        const dayCell = document.createElement("div");
        dayCell.className = `min-h-[90px] p-2 rounded-lg border cursor-pointer transition-all hover:bg-black/50 ${
          hasActivity ? 'border-[#262626] bg-black/40' : 'border-[#1a1a1a] bg-black/20'
        } ${isToday ? 'ring-1 ring-emerald-500/50' : ''}`;
        
        dayCell.innerHTML = `
          <div class="text-[11px] font-medium ${hasActivity ? 'text-slate-200' : 'text-slate-500'} mb-1">${date.getDate()}</div>
          ${hasActivity && archive?.summary ? `
            <div class="text-[9px] text-slate-500">${archive.summary.totalTrades} trades</div>
            <div class="text-[10px] font-medium ${archive.summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">$${archive.summary.totalPnl.toFixed(0)}</div>
            ${archive.dailyPrep ? '<div class="text-[8px] text-emerald-400/70 mt-0.5">Prep</div>' : ''}
          ` : ''}
        `;
        
        dayCell.addEventListener("click", () => showDayDetail(dateStr));
        calendarGrid.appendChild(dayCell);
      });
    }
    
    // Day View - detailed view of single day
    function renderDayView(calendarGrid, monthHeader, activeDates, archives, monthNames) {
      const currentDate = new Date(currentCalendarYear, currentCalendarMonth, currentCalendarDay);
      const dateStr = currentDate.toISOString().slice(0, 10);
      const dayNamesShort = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
      const monthNamesShort = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
      
      // Shorter format: "tor 8. jan 2026"
      monthHeader.textContent = `${dayNamesShort[currentDate.getDay()]} ${currentCalendarDay}. ${monthNamesShort[currentCalendarMonth]} ${currentCalendarYear}`;
      
      calendarGrid.innerHTML = "";
      calendarGrid.className = "";
      
      const archive = archives.find(a => a.date === dateStr);
      const hasActivity = activeDates.has(dateStr);
      
      if (!hasActivity && !archive) {
        calendarGrid.innerHTML = `
          <div class="text-center py-12 px-4">
            <div class="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="text-slate-400 text-[12px] mb-3">No activity on this day</div>
            <button class="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-400 hover:bg-emerald-500/30 transition-colors" onclick="showDayDetail('${dateStr}')">
              Add Entry
            </button>
          </div>
        `;
        return;
      }
      
      // Show day detail directly
      showDayDetail(dateStr);
    }
  
    function navigateCalendar(direction) {
      const delta = direction === "next" ? 1 : -1;
      
      switch (currentCalendarView) {
        case 'year':
          currentCalendarYear += delta;
          break;
        case 'month':
          currentCalendarMonth += delta;
          if (currentCalendarMonth > 11) {
            currentCalendarMonth = 0;
            currentCalendarYear++;
          } else if (currentCalendarMonth < 0) {
            currentCalendarMonth = 11;
            currentCalendarYear--;
          }
          break;
        case 'week':
          currentCalendarWeek += delta;
          if (currentCalendarWeek > 52) {
            currentCalendarWeek = 1;
            currentCalendarYear++;
          } else if (currentCalendarWeek < 1) {
            currentCalendarWeek = 52;
            currentCalendarYear--;
          }
          break;
        case 'day':
          const d = new Date(currentCalendarYear, currentCalendarMonth, currentCalendarDay + delta);
          currentCalendarYear = d.getFullYear();
          currentCalendarMonth = d.getMonth();
          currentCalendarDay = d.getDate();
          break;
      }
      renderCalendar();
    }
  
    window.renderVaultScreenshots = function renderVaultScreenshots() {
      // Use calendar view instead
      renderCalendar();
    };
  
    // Old renderVaultScreenshots function kept for reference but not used
    function renderVaultScreenshotsOld() {
      const listEl = domCache.get("screenshots-list");
      const emptyEl = domCache.get("screenshots-empty");
      if (!listEl || !emptyEl) return;
  
      const screenshots = loadVaultScreenshots();
      listEl.innerHTML = "";
  
      if (!screenshots.length) {
        emptyEl.style.display = "block";
        return;
      }
      emptyEl.style.display = "none";
  
      screenshots.reverse().forEach((screenshot) => {
        // Format date and time
        let dateTimeDisplay = screenshot.date;
        if (screenshot.timestamp) {
          const date = new Date(screenshot.timestamp);
          dateTimeDisplay = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) + ' ' + date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          });
        } else if (screenshot.date) {
          // Fallback for old screenshots without timestamp
          dateTimeDisplay = screenshot.date;
        }
  
        const item = document.createElement("div");
        item.className = "relative group rounded-lg overflow-hidden border border-[#262626] bg-black/40 hover:border-slate-500 transition-all";
        item.innerHTML = `
          <div class="relative cursor-pointer" data-screenshot-id="${sanitizeHTML(screenshot.id)}" data-action="preview">
            <img 
              src="${screenshot.data}" 
              alt="Screenshot ${sanitizeHTML(screenshot.date)}"
              class="w-full h-32 object-cover group-hover:opacity-80 group-hover:scale-105 transition-all duration-200 pointer-events-none"
            />
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
              <button
                data-screenshot-id="${sanitizeHTML(screenshot.id)}"
                data-action="download"
                class="px-3 py-1.5 rounded-lg bg-emerald-500 text-[11px] text-black hover:bg-emerald-400 pointer-events-auto"
              >
                Download
              </button>
              <button
                data-screenshot-id="${sanitizeHTML(screenshot.id)}"
                data-action="delete"
                class="px-3 py-1.5 rounded-lg bg-rose-500 text-[11px] text-white hover:bg-rose-400 pointer-events-auto"
              >
                Delete
              </button>
              <button
                data-screenshot-id="${sanitizeHTML(screenshot.id)}"
                data-action="preview"
                class="px-3 py-1.5 rounded-lg bg-blue-500 text-[11px] text-white hover:bg-blue-400 pointer-events-auto"
              >
                View
              </button>
            </div>
          </div>
          <div class="p-2 text-[10px] text-slate-400">
            ${sanitizeHTML(dateTimeDisplay)}
          </div>
        `;
        listEl.appendChild(item);
      });
  
      // Event handlers for all actions (buttons and image click)
      listEl.querySelectorAll("[data-screenshot-id]").forEach((element) => {
        element.addEventListener("click", (e) => {
          const id = element.dataset.screenshotId;
          const action = element.dataset.action;
          const screenshot = screenshots.find(s => s.id === id);
          
          if (!screenshot) return;
          
          if (action === "preview") {
            openScreenshotPreview(screenshot);
          } else if (action === "download") {
            e.stopPropagation();
            const link = document.createElement("a");
            link.href = screenshot.data;
            link.download = `trading-desk-${screenshot.date}.png`;
            link.click();
          } else if (action === "delete") {
            e.stopPropagation();
            if (!confirm("Delete this screenshot?")) return;
            const updated = screenshots.filter(s => s.id !== id);
            saveVaultScreenshots(updated);
            renderVaultScreenshots();
          }
        });
      });
    }
  
    // Render Daily Archives with prep, trades, and screenshots
    window.renderDailyArchives = function renderDailyArchives() {
      const listEl = document.getElementById("daily-archives-list");
      const emptyEl = document.getElementById("daily-archives-empty");
      if (!listEl || !emptyEl) return;
  
      const archives = loadDailyArchives();
      listEl.innerHTML = "";
  
      // Filter out future dates
      const today = new Date().toISOString().slice(0, 10);
      const validArchives = archives.filter(a => a.date <= today);
  
      if (!validArchives.length) {
        emptyEl.style.display = "block";
        return;
      }
      emptyEl.style.display = "none";
  
      // Sort by date (newest first)
      validArchives.sort((a, b) => b.date.localeCompare(a.date)).forEach((archive) => {
        const card = document.createElement("div");
        card.className = "rounded-lg border border-[#262626] bg-black/40 mb-3";
        card.dataset.date = archive.date;
        card.dataset.expanded = "false";
  
        // Format date
        const dateObj = new Date(archive.date + "T00:00:00");
        const dateDisplay = dateObj.toLocaleDateString('en-US', { 
          weekday: 'short',
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
  
        // Summary
        const summary = archive.summary || calculateDailySummary(archive.trades);
        const pnlColor = summary.totalPnl >= 0 ? "text-emerald-300" : "text-rose-300";
        const pnlSign = summary.totalPnl >= 0 ? "+" : "";
  
        // Compact view (always visible)
        const compactView = `
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <div class="flex-1">
                <div class="text-[13px] font-semibold text-slate-200 mb-1">${dateDisplay}</div>
                <div class="flex items-center gap-3 text-[11px] text-slate-400">
                  ${archive.dailyPrep ? '<span class="text-emerald-400">✓ Daily Prep</span>' : '<span class="text-slate-600">No Prep</span>'}
                  <span>${summary.totalTrades} trade${summary.totalTrades !== 1 ? 's' : ''}</span>
                  <span>${archive.screenshots.length} screenshot${archive.screenshots.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-[13px] font-semibold ${pnlColor}">
                  ${pnlSign}$${summary.totalPnl.toFixed(2)}
                </div>
                <div class="text-[11px] text-slate-400">
                  ${summary.wins}W / ${summary.losses}L · ${summary.winRate}% WR
                </div>
              </div>
            </div>
            <button
              class="expand-archive-btn ml-4 text-[10px] text-slate-400 hover:text-slate-300 px-2 py-1 rounded border border-[#262626] hover:border-slate-500"
              data-action="expand"
            >
              Details
            </button>
          </div>
        `;
  
        // Expanded view (hidden by default)
        let expandedContent = `
          <div class="archive-details-expanded hidden px-4 pb-4 pt-0 border-t border-[#161616]">
        `;
  
        // Daily Prep section
        if (archive.dailyPrep && archive.dailyPrep.screenshot) {
          expandedContent += `
            <div class="mt-4">
              <div class="text-[12px] font-semibold text-slate-200 mb-2">Daily Prep</div>
              <div class="rounded-lg border border-[#161616] bg-black/20 p-2 cursor-pointer hover:bg-black/40 transition-colors" data-action="view-prep">
                <img 
                  src="${archive.dailyPrep.screenshot}" 
                  alt="Daily Prep"
                  class="w-full h-auto rounded"
                />
              </div>
            </div>
          `;
        }
  
        // Trades section
        if (archive.trades.length > 0) {
          expandedContent += `
            <div class="mt-4">
              <div class="text-[12px] font-semibold text-slate-200 mb-2">Trades (${archive.trades.length})</div>
              <div class="space-y-2">
          `;
          
          archive.trades.forEach((trade) => {
            const directionBadge = trade.direction === "long"
              ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400">↑ Long</span>'
              : trade.direction === "short"
              ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400">↓ Short</span>'
              : '';
            
            const resultBadge = trade.result === "win" 
              ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300">✓ Win</span>'
              : trade.result === "loss"
              ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">✗ Loss</span>'
              : '';
            
            const pnlDisplay = trade.pnl !== undefined 
              ? `<span class="text-[11px] ${trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${trade.pnl.toFixed(2)}</span>`
              : '';
            
            expandedContent += `
              <div class="rounded-lg border border-[#161616] bg-black/20 p-2 text-[11px]">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-slate-200">${trade.instrument}</span>
                    ${directionBadge}
                    ${resultBadge}
                  </div>
                  <div class="text-right">
                    ${pnlDisplay}
                    <div class="text-[10px] text-slate-400">${trade.time}</div>
                  </div>
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  Entry: ${trade.plan.entry || "-"} · SL: ${trade.plan.sl || "-"} · TP: ${trade.plan.tp || "-"}
                </div>
              </div>
            `;
          });
          
          expandedContent += `
              </div>
            </div>
          `;
        }
  
        // Screenshots section
        if (archive.screenshots.length > 0) {
          expandedContent += `
            <div class="mt-4">
              <div class="text-[12px] font-semibold text-slate-200 mb-2">Screenshots (${archive.screenshots.length})</div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          `;
          
          archive.screenshots.forEach((screenshot) => {
            expandedContent += `
              <div class="relative group rounded-lg overflow-hidden border border-[#262626] bg-black/40 hover:border-slate-500 transition-all cursor-pointer" data-action="view-screenshot" data-screenshot-id="${screenshot.id}">
                <img 
                  src="${screenshot.data}" 
                  alt="${screenshot.label}"
                  class="w-full h-24 object-cover group-hover:opacity-80 transition-opacity"
                />
                <div class="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                  <div class="text-[9px] text-slate-300 truncate">${screenshot.label}</div>
                </div>
              </div>
            `;
          });
          
          expandedContent += `
              </div>
            </div>
          `;
        }
  
        expandedContent += `</div>`;
  
        card.innerHTML = compactView + expandedContent;
        listEl.appendChild(card);
      });
  
      // Event handlers using event delegation
      listEl.addEventListener("click", (e) => {
        const btn = e.target.closest("button, [data-action]");
        if (!btn) return;
        
        const action = btn.dataset.action;
        const card = btn.closest("[data-date]");
        
        if (action === "expand") {
          if (!card) return;
          const expanded = card.querySelector(".archive-details-expanded");
          const isExpanded = card.dataset.expanded === "true";
          
          if (isExpanded) {
            expanded.classList.add("hidden");
            btn.textContent = "Details";
            card.dataset.expanded = "false";
          } else {
            expanded.classList.remove("hidden");
            btn.textContent = "Hide";
            card.dataset.expanded = "true";
          }
        } else if (action === "view-prep") {
          const archive = archives.find(a => a.date === card.dataset.date);
          if (archive && archive.dailyPrep && archive.dailyPrep.screenshot) {
            openScreenshotPreview({
              data: archive.dailyPrep.screenshot,
              date: archive.date,
              timestamp: archive.dailyPrep.timestamp
            });
          }
        } else if (action === "view-screenshot") {
          const screenshotId = btn.dataset.screenshotId;
          const archive = archives.find(a => a.date === card.dataset.date);
          if (archive) {
            const screenshot = archive.screenshots.find(s => s.id === screenshotId);
            if (screenshot) {
              openScreenshotPreview({
                data: screenshot.data,
                date: archive.date,
                timestamp: screenshot.timestamp
              });
            }
          }
        }
      });
    };
  
    window.renderVaultJournals = function renderVaultJournals() {
      const listEl = domCache.get("journal-archives-list");
      const emptyEl = domCache.get("journal-archives-empty");
      if (!listEl || !emptyEl) return;
  
      const journals = loadVaultJournals();
      listEl.innerHTML = "";
  
      if (!journals.length) {
        emptyEl.style.display = "block";
        return;
      }
      emptyEl.style.display = "none";
  
      journals.sort((a, b) => b.date.localeCompare(a.date)).forEach((day) => {
        const wins = day.entries.filter(e => e.result === "win").length;
        const losses = day.entries.filter(e => e.result === "loss").length;
        const totalPnL = day.entries.reduce((sum, e) => sum + (e.pnl || 0), 0);
  
        const item = document.createElement("div");
        item.className = "rounded-lg border border-[#262626] bg-black/40 p-4";
        item.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="text-[13px] font-medium text-slate-200">${sanitizeHTML(day.date)}</div>
              <div class="text-[11px] text-slate-400 mt-1">
                ${day.entries.length} trade${day.entries.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div class="text-right">
              <div class="text-[12px] font-medium ${totalPnL >= 0 ? "text-emerald-300" : "text-rose-300"}">
                P&L: $${totalPnL.toFixed(2)}
              </div>
              <div class="text-[10px] text-slate-400 mt-1">
                ${wins}W / ${losses}L
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button
              data-date="${sanitizeHTML(day.date)}"
              data-action="view"
              class="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-300 hover:bg-emerald-500/30"
            >
              View
            </button>
            <button
              data-date="${sanitizeHTML(day.date)}"
              data-action="export"
              class="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-[#262626] text-[11px] text-slate-200 hover:bg-black"
            >
              Export
            </button>
          </div>
        `;
        listEl.appendChild(item);
      });
  
      // Event handlers
      listEl.querySelectorAll("button[data-date]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const date = btn.dataset.date;
          const action = btn.dataset.action;
          const day = journals.find(j => j.date === date);
          
          if (action === "export" && day) {
            const blob = new Blob([JSON.stringify(day.entries, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `journal-${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
          } else if (action === "view" && day) {
            openJournalArchivesModal(day);
          }
        });
      });
    }
  
    // Journal Archives Modal
    function openJournalArchivesModal(day) {
      const modal = document.getElementById("journal-archives-modal");
      const title = document.getElementById("journal-archives-modal-title");
      const content = document.getElementById("journal-archives-modal-content");
      
      if (!modal || !title || !content) return;
      
      title.textContent = `Trades for ${day.date}`;
      content.innerHTML = "";
      
      if (!day.entries || day.entries.length === 0) {
        content.innerHTML = '<div class="text-[12px] text-slate-500 text-center py-8">No trades for this date.</div>';
        modal.classList.remove("hidden");
        return;
      }
      
      day.entries.forEach((trade, index) => {
        const accounts = loadAccounts();
        const accountName = trade.accountId 
          ? (accounts.find(a => a.id === trade.accountId)?.name || "Unknown")
          : null;
        
        const item = document.createElement("div");
        item.className = "rounded-lg border border-[#262626] bg-black/40 p-4";
        const directionBadge = trade.direction === "long"
          ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400">↑ Long</span>'
          : trade.direction === "short"
          ? '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400">↓ Short</span>'
          : '';
        
        item.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[13px] font-medium text-slate-200">${sanitizeHTML(trade.instrument || "Unknown")}</span>
                ${directionBadge}
                ${trade.result === "win" 
                  ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300">✓ Win</span>'
                  : trade.result === "loss"
                  ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">✗ Loss</span>'
                  : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-[10px] text-slate-300">No result</span>'
                }
              </div>
              <div class="text-[11px] text-slate-400">${sanitizeHTML(trade.time || "")}</div>
              <div class="text-[11px] text-slate-300 mt-1">
                Entry: ${sanitizeHTML(trade.plan?.entry || "-")} · SL: ${sanitizeHTML(trade.plan?.sl || "-")} · TP: ${sanitizeHTML(trade.plan?.tp || "-")}
                ${trade.pnl !== undefined && typeof trade.pnl === 'number' ? ` · P&L: <span class="${trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${trade.pnl.toFixed(2)}</span>` : ""}
              </div>
              ${accountName ? `<div class="text-[10px] text-slate-500 mt-1">Account: ${sanitizeHTML(accountName)}</div>` : ""}
              ${trade.checklist ? `<div class="text-[10px] text-slate-500 mt-1">Checklist Score: ${trade.checklist.score}/100</div>` : ""}
              ${trade.notes ? `<div class="text-[10px] text-slate-400 mt-2 whitespace-pre-line">${sanitizeHTML(trade.notes)}</div>` : ""}
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-3">
            <button
              data-trade-index="${index}"
              data-date="${sanitizeHTML(day.date)}"
              data-trade-id="${sanitizeHTML(trade.id || '')}"
              data-action="delete-trade"
              class="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-[11px] text-rose-300 hover:bg-rose-500/20"
            >
              Delete
            </button>
          </div>
        `;
        content.appendChild(item);
      });
      
      // Event delegation for delete buttons
      content.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action='delete-trade']");
        if (!btn) return;
        
        const tradeIndex = parseInt(btn.dataset.tradeIndex);
        const date = btn.dataset.date;
        const tradeId = btn.dataset.tradeId;
        
        if (!confirm("Delete this trade from the archive?")) return;
        
        const journals = loadVaultJournals();
        const dayIndex = journals.findIndex(j => j.date === date);
        
        if (dayIndex !== -1 && journals[dayIndex].entries[tradeIndex]) {
          const tradeToDelete = journals[dayIndex].entries[tradeIndex];
          
          // Remove the trade from archive
          journals[dayIndex].entries.splice(tradeIndex, 1);
          
          // If no more entries for this day, remove the entire day
          if (journals[dayIndex].entries.length === 0) {
            journals.splice(dayIndex, 1);
          }
          saveVaultJournals(journals);
          
          // Also remove from main journal if it exists there
          if (tradeId) {
            const mainJournal = loadJournal();
            const updatedJournal = mainJournal.filter(t => t.id !== tradeId);
            saveJournal(updatedJournal);
            renderJournal(updatedJournal);
            renderAccounts(); // Update account balances
          }
          
          // Re-render the modal with updated data
          const updatedDay = journals.find(j => j.date === date);
          if (updatedDay) {
            openJournalArchivesModal(updatedDay);
          } else {
            // Day was removed, close modal
            closeJournalArchivesModal();
          }
          
          // Re-render the archives list
          renderVaultJournals();
        }
      });
      
      modal.classList.remove("hidden");
    }
    
    function closeJournalArchivesModal() {
      const modal = document.getElementById("journal-archives-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
    }
  
    // Screenshot Preview Modal
    function openScreenshotPreview(screenshot) {
      const modal = document.getElementById("screenshot-preview-modal");
      const img = document.getElementById("screenshot-preview-image");
      const dateEl = document.getElementById("screenshot-preview-date");
      
      if (!modal || !img || !dateEl) return;
      
      img.src = screenshot.data;
      
      // Format date and time
      let dateTimeDisplay = screenshot.date;
      if (screenshot.timestamp) {
        const date = new Date(screenshot.timestamp);
        dateTimeDisplay = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) + ' ' + date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      }
      dateEl.textContent = dateTimeDisplay;
      
      modal.classList.remove("hidden");
    }
  
    function closeScreenshotPreview() {
      const modal = document.getElementById("screenshot-preview-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
    }
  
    // Trading Analysis
    function analyzeTrading() {
      const journal = loadJournal();
      if (!journal.length) {
        alert("No journal entries to analyze. Please add some trades first.");
        return;
      }
  
      const analysisResults = {
        totalTrades: journal.length,
        wins: journal.filter(t => t.result === "win").length,
        losses: journal.filter(t => t.result === "loss").length,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        problems: [],
        recommendations: [],
      };
  
      // Calculate metrics
      analysisResults.totalPnL = journal.reduce((sum, t) => sum + (t.pnl || 0), 0);
      analysisResults.winRate = analysisResults.totalTrades > 0 
        ? (analysisResults.wins / analysisResults.totalTrades) * 100 
        : 0;
  
      const wins = journal.filter(t => t.result === "win" && t.pnl > 0);
      const losses = journal.filter(t => t.result === "loss" && t.pnl < 0);
      
      analysisResults.avgWin = wins.length > 0 
        ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length 
        : 0;
      analysisResults.avgLoss = losses.length > 0 
        ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0) / losses.length)
        : 0;
  
      // Identify problems
      if (analysisResults.winRate < 40) {
        analysisResults.problems.push({
          severity: "high",
          title: "Low Win Rate",
          description: `Your win rate is ${analysisResults.winRate.toFixed(1)}%, which is below optimal. This suggests you may be taking low-quality setups.`,
        });
      }
  
      if (analysisResults.avgLoss > analysisResults.avgWin && analysisResults.avgWin > 0) {
        analysisResults.problems.push({
          severity: "high",
          title: "Risk/Reward Imbalance",
          description: `Your average loss ($${analysisResults.avgLoss.toFixed(2)}) is larger than your average win ($${analysisResults.avgWin.toFixed(2)}). You need better risk management.`,
        });
      }
  
      const tradesWithoutAccount = journal.filter(t => !t.accountId);
      if (tradesWithoutAccount.length > journal.length * 0.3) {
        analysisResults.problems.push({
          severity: "medium",
          title: "Missing Account Tracking",
          description: `${tradesWithoutAccount.length} trades (${((tradesWithoutAccount.length / journal.length) * 100).toFixed(0)}%) are not linked to accounts. This makes it hard to track performance.`,
        });
      }
  
      const tradesWithoutResult = journal.filter(t => !t.result);
      if (tradesWithoutResult.length > 0) {
        analysisResults.problems.push({
          severity: "medium",
          title: "Incomplete Trade Records",
          description: `${tradesWithoutResult.length} trades are missing win/loss results. Complete your journal entries for better analysis.`,
        });
      }
  
      const consecutiveLosses = findConsecutiveLosses(journal);
      if (consecutiveLosses > 3) {
        analysisResults.problems.push({
          severity: "high",
          title: "Consecutive Losses",
          description: `You had ${consecutiveLosses} consecutive losses. Consider taking a break or reviewing your strategy when this happens.`,
        });
      }
  
      // Generate recommendations
      if (analysisResults.winRate < 50) {
        analysisResults.recommendations.push("Focus on quality over quantity. Only take trades that score high on your checklist.");
      }
  
      if (analysisResults.avgLoss > analysisResults.avgWin) {
        analysisResults.recommendations.push("Improve your risk/reward ratio. Aim for at least 2:1 (risk $1 to make $2).");
      }
  
      if (analysisResults.totalPnL < 0) {
        analysisResults.recommendations.push("Review your losing trades. Look for common patterns in your losses.");
      }
  
      if (tradesWithoutAccount.length > 0) {
        analysisResults.recommendations.push("Always link trades to accounts for better tracking and analysis.");
      }
  
      renderTradingAnalysis(analysisResults);
    }
  
    function findConsecutiveLosses(journal) {
      let maxConsecutive = 0;
      let current = 0;
      journal.forEach(trade => {
        if (trade.result === "loss") {
          current++;
          maxConsecutive = Math.max(maxConsecutive, current);
        } else {
          current = 0;
        }
      });
      return maxConsecutive;
    }
  
    function renderTradingAnalysis(results) {
      const resultsEl = document.getElementById("trading-analysis-results");
      const emptyEl = document.getElementById("analysis-empty");
      const quickStatsEl = document.getElementById("analysis-quick-stats");
      const strengthsEl = document.getElementById("analysis-strengths");
      const improvementsEl = document.getElementById("analysis-improvements");
      const strategiesEl = document.getElementById("analysis-strategies");
      const checklistSection = document.getElementById("analysis-checklist-section");
      const checklistGrid = document.getElementById("analysis-checklist-grid");
      const recommendationsEl = document.getElementById("analysis-recommendations-list");
  
      if (!resultsEl) return;
  
      emptyEl.style.display = "none";
      resultsEl.classList.remove("hidden");
  
      // Quick Stats (compact)
      const rrRatio = results.avgWin > 0 && results.avgLoss > 0 ? (results.avgWin / results.avgLoss).toFixed(1) : "—";
      quickStatsEl.innerHTML = `
        <div class="rounded-lg bg-slate-800/50 p-2 text-center">
          <div class="text-[14px] font-bold text-slate-200">${results.totalTrades}</div>
          <div class="text-[9px] text-slate-500">Trades</div>
        </div>
        <div class="rounded-lg bg-slate-800/50 p-2 text-center">
          <div class="text-[14px] font-bold ${results.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}">${results.winRate.toFixed(0)}%</div>
          <div class="text-[9px] text-slate-500">Win Rate</div>
        </div>
        <div class="rounded-lg bg-slate-800/50 p-2 text-center">
          <div class="text-[14px] font-bold ${results.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}">$${results.totalPnL.toFixed(0)}</div>
          <div class="text-[9px] text-slate-500">P&L</div>
        </div>
        <div class="rounded-lg bg-slate-800/50 p-2 text-center">
          <div class="text-[14px] font-bold text-blue-400">${rrRatio}</div>
          <div class="text-[9px] text-slate-500">R:R</div>
        </div>
      `;
  
      // Strengths (compact, max 3)
      if (results.strengths && results.strengths.length > 0) {
        strengthsEl.innerHTML = results.strengths.slice(0, 3).map(s => `
          <div class="flex items-start gap-1.5">
            <span class="text-emerald-400">✓</span>
            <span class="text-slate-300 leading-tight">${sanitizeHTML(s)}</span>
          </div>
        `).join("");
      } else {
        strengthsEl.innerHTML = `<div class="text-slate-500">Keep trading</div>`;
      }
  
      // Improvements (compact, max 3)
      if (results.improvements && results.improvements.length > 0) {
        improvementsEl.innerHTML = results.improvements.slice(0, 3).map(i => `
          <div class="flex items-start gap-1.5">
            <span class="text-amber-400">→</span>
            <span class="text-slate-300 leading-tight">${sanitizeHTML(i)}</span>
          </div>
        `).join("");
      } else {
        improvementsEl.innerHTML = `<div class="text-slate-500">Looking good!</div>`;
      }
  
      // Strategy Performance (compact)
      if (results.strategies && results.strategies.length > 0) {
        strategiesEl.innerHTML = results.strategies.slice(0, 3).map((s, i) => {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
          const winRateColor = s.winRate >= 60 ? "text-emerald-400" : s.winRate >= 50 ? "text-blue-400" : "text-amber-400";
          return `
            <div class="flex items-center justify-between py-1 text-[10px]">
              <span class="text-slate-300">${medal} ${sanitizeHTML(s.name)}</span>
              <span class="${winRateColor} font-medium">${s.winRate.toFixed(0)}%</span>
            </div>
          `;
        }).join("");
      } else {
        strategiesEl.innerHTML = `<div class="text-[10px] text-slate-500">No strategies linked</div>`;
      }
      
  
      // Checklist Insights
      if (results.checklistInsights && Object.keys(results.checklistInsights).length > 0) {
        checklistSection.classList.remove("hidden");
        checklistGrid.innerHTML = `
          <div class="text-center">
            <div class="text-[16px] font-bold text-slate-200">${results.checklistInsights.avgScore.toFixed(0)}</div>
            <div class="text-[10px] text-slate-500">Avg Score</div>
          </div>
          <div class="text-center">
            <div class="text-[16px] font-bold text-emerald-400">${results.checklistInsights.winAvgScore.toFixed(0)}</div>
            <div class="text-[10px] text-slate-500">Win Avg</div>
          </div>
          <div class="text-center">
            <div class="text-[16px] font-bold text-rose-400">${results.checklistInsights.lossAvgScore.toFixed(0)}</div>
            <div class="text-[10px] text-slate-500">Loss Avg</div>
          </div>
        `;
      } else {
        checklistSection.classList.add("hidden");
      }
  
      // Recommendations / Action Items
      if (results.recommendations && results.recommendations.length > 0) {
        recommendationsEl.innerHTML = results.recommendations.map((r, i) => `
          <div class="flex items-start gap-2">
            <span class="text-purple-400 font-medium">${i + 1}.</span>
            <span class="text-slate-300">${sanitizeHTML(r)}</span>
          </div>
        `).join("");
      } else {
        recommendationsEl.innerHTML = `<div class="text-slate-500">You're on track! Keep following your process.</div>`;
      }
    }
  
    // Old render function structure for compatibility - keeping for potential old references
    function renderTradingAnalysisLegacy(results) {
      const resultsEl = document.getElementById("trading-analysis-results");
      const emptyEl = document.getElementById("analysis-empty");
      const summaryEl = document.getElementById("analysis-summary");
      const problemsEl = document.getElementById("analysis-problems");
      const recommendationsEl = document.getElementById("analysis-recommendations-list");
  
      if (!resultsEl || !summaryEl || !problemsEl || !recommendationsEl) return;
  
      emptyEl.style.display = "none";
      resultsEl.classList.remove("hidden");
  
      // Summary
      let checklistInfo = "";
      if (results.checklistInsights && Object.keys(results.checklistInsights).length > 0) {
        checklistInfo = `
          <div class="mt-4 p-3 rounded-lg bg-black/40 border border-[#262626]">
            <div class="text-[11px] text-slate-400 mb-2">Checklist Analysis</div>
            <div class="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <div class="text-slate-500">Avg Score</div>
                <div class="text-slate-200 font-medium">${results.checklistInsights.avgScore.toFixed(1)}/100</div>
              </div>
              <div>
                <div class="text-slate-500">Win Avg</div>
                <div class="text-emerald-300 font-medium">${results.checklistInsights.winAvgScore.toFixed(1)}/100</div>
              </div>
              <div>
                <div class="text-slate-500">Loss Avg</div>
                <div class="text-rose-300 font-medium">${results.checklistInsights.lossAvgScore.toFixed(1)}/100</div>
              </div>
            </div>
          </div>
        `;
      }
  
      summaryEl.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Total Trades</div>
            <div class="text-[16px] font-semibold text-slate-200">${results.totalTrades}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Win Rate</div>
            <div class="text-[16px] font-semibold ${results.winRate >= 50 ? "text-emerald-300" : "text-rose-300"}">${results.winRate.toFixed(1)}%</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">Total P&L</div>
            <div class="text-[16px] font-semibold ${results.totalPnL >= 0 ? "text-emerald-300" : "text-rose-300"}">$${results.totalPnL.toFixed(2)}</div>
          </div>
          <div class="rounded-lg bg-black/40 border border-[#262626] p-3">
            <div class="text-[10px] text-slate-400 mb-1">R:R Ratio</div>
            <div class="text-[16px] font-semibold text-slate-200">${results.avgWin > 0 && results.avgLoss > 0 ? (results.avgWin / results.avgLoss).toFixed(2) : "N/A"}</div>
          </div>
        </div>
        ${checklistInfo}
      `;
  
      // Problems
      problemsEl.innerHTML = "";
      if (results.problems.length === 0) {
        problemsEl.innerHTML = `
          <div class="text-[12px] text-emerald-300 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            No major problems detected! Keep up the good work.
          </div>
        `;
      } else {
        results.problems.forEach(problem => {
          const isHigh = problem.severity === "high";
          const item = document.createElement("div");
          item.className = isHigh 
            ? "p-3 rounded-lg bg-rose-500/10 border border-rose-500/30"
            : "p-3 rounded-lg bg-amber-500/10 border border-amber-500/30";
          item.innerHTML = `
            <div class="flex items-start gap-2">
              <div class="${isHigh ? "text-rose-300" : "text-amber-300"} text-[14px] mt-0.5">
                ${isHigh ? "⚠️" : "ℹ️"}
              </div>
              <div class="flex-1">
                <div class="text-[12px] font-semibold ${isHigh ? "text-rose-300" : "text-amber-300"} mb-1">${sanitizeHTML(problem.title)}</div>
                <div class="text-[11px] text-slate-300">${sanitizeHTML(problem.description)}</div>
              </div>
            </div>
          `;
          problemsEl.appendChild(item);
        });
      }
  
      // Recommendations
      recommendationsEl.innerHTML = "";
      if (results.recommendations.length === 0) {
        recommendationsEl.innerHTML = `
          <div class="text-[12px] text-slate-400">No specific recommendations at this time.</div>
        `;
      } else {
        results.recommendations.forEach(rec => {
          const item = document.createElement("div");
          item.className = "flex items-start gap-2 text-[12px] text-slate-300";
          item.innerHTML = `
            <span class="text-emerald-300 mt-0.5">•</span>
            <span>${sanitizeHTML(rec)}</span>
          `;
          recommendationsEl.appendChild(item);
        });
      }
    }
  
    // Initialize vault rendering
    renderCalendar(); // Calendar view for screenshots
    renderVaultJournals();
    if (window.renderDailyArchives) {
      window.renderDailyArchives();
    }
    
    // Re-render daily archives when section is shown
    const vaultSection = document.getElementById("vault");
    if (vaultSection) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (!vaultSection.classList.contains("hidden")) {
            if (window.renderDailyArchives) {
              window.renderDailyArchives();
            }
          }
        });
      });
      observer.observe(vaultSection, { attributes: true, attributeFilter: ["class"] });
    }
    
    // Re-render calendar when screenshots section is shown
    const screenshotsSection = document.getElementById("screenshots");
    if (screenshotsSection) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (!screenshotsSection.classList.contains("hidden")) {
            renderCalendar();
          }
        });
      });
      observer.observe(screenshotsSection, { attributes: true, attributeFilter: ["class"] });
      
      // Also listen to section navigation
      const sectionLinks = document.querySelectorAll("[data-section-nav]");
      sectionLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const target = link.getAttribute("data-section-nav");
          if (target === "screenshots") {
            setTimeout(() => renderCalendar(), 100);
          }
        });
      });
    }
  
    // Trade Reviews
    const TRADE_REVIEWS_KEY = "tradingdesk:trade-reviews";
  
    function loadTradeReviews() {
      try {
        return JSON.parse(localStorage.getItem(TRADE_REVIEWS_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }
  
    function saveTradeReviews(reviews) {
      localStorage.setItem(TRADE_REVIEWS_KEY, JSON.stringify(reviews));
    }
  
    // Trade Reviews Tab State
    let currentReviewTab = "needs";
    let tradeReviewsListenerAttached = false;
  
    // Make renderTradeReviews available globally
    window.renderTradeReviews = function renderTradeReviews() {
      const listEl = domCache.get("trade-reviews-list");
      const emptyEl = domCache.get("trade-reviews-empty");
      if (!listEl || !emptyEl) return;
  
      // First, ensure all trades have IDs (check full journal for backwards compatibility)
      let fullJournal = loadJournal();
      let needsSave = false;
      fullJournal = fullJournal.map(t => {
        if (!t.id) {
          // Generate ID for old trades that don't have one
          t.id = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          needsSave = true;
        }
        return t;
      });
      
      // Save updated journal with IDs if we added any
      if (needsSave) {
        saveJournal(fullJournal);
      }
      
      // Use filtered journal for display (respects global filter)
      let journal = getFilteredJournal();
      const reviews = loadTradeReviews();
      const reviewedIds = new Set(reviews.map(r => r.tradeId));
  
      // Show trades that haven't been reviewed yet
      const unreviewedTrades = journal.filter(t => t.id && !reviewedIds.has(t.id));
      
      // Create a map of reviews by tradeId for quick lookup
      const reviewMap = {};
      reviews.forEach(review => {
        reviewMap[review.tradeId] = review;
      });
  
      // Filter trades based on current tab
      let tradesToShow = [];
      if (currentReviewTab === "needs") {
        tradesToShow = unreviewedTrades;
      } else if (currentReviewTab === "reviewed") {
        tradesToShow = reviews.map(r => {
          const trade = journal.find(t => t.id === r.tradeId);
          return trade ? { trade, review: r } : null;
        }).filter(Boolean);
      } else { // all
        tradesToShow = [
          ...unreviewedTrades.map(t => ({ trade: t, review: null })),
          ...reviews.map(r => {
            const trade = journal.find(t => t.id === r.tradeId);
            return trade ? { trade, review: r } : null;
          }).filter(Boolean)
        ];
      }
  
      listEl.innerHTML = "";
  
      if (tradesToShow.length === 0) {
        emptyEl.style.display = "block";
        emptyEl.textContent = currentReviewTab === "needs" 
          ? "No trades need review. Great job!"
          : currentReviewTab === "reviewed"
          ? "No reviewed trades yet."
          : "No trades to review yet.";
        return;
      }
      emptyEl.style.display = "none";
  
      // Render compact cards
      tradesToShow.forEach((itemData) => {
        const trade = itemData.trade || itemData;
        const review = itemData.review || null;
        const isReviewed = !!review;
        
        const card = document.createElement("div");
        card.className = "rounded-lg border border-[#262626] bg-black/40 hover:bg-black/60 transition-colors";
        card.dataset.tradeId = trade.id;
        card.dataset.expanded = "false";
        
        // Result badge
        const resultBadge = trade.result === "win" 
          ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">✓ Win</span>'
          : trade.result === "loss"
          ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300 font-medium">✗ Loss</span>'
          : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-[10px] text-slate-400">No result</span>';
        
        // Review status badge (for reviewed trades)
        const reviewBadge = isReviewed
          ? (review.worked 
            ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300">✓ Worked</span>'
            : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">✗ Didn\'t Work</span>')
          : '';
        
        // P&L display
        const pnlDisplay = trade.pnl !== undefined 
          ? `<div class="text-[13px] font-semibold ${trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${trade.pnl.toFixed(2)}</div>`
          : '<div class="text-[11px] text-slate-500">No P&L</div>';
        
        // Compact view (always visible)
        const compactView = `
          <div class="p-3 flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[13px] font-semibold text-slate-200">${trade.instrument}</span>
                  ${resultBadge}
                  ${reviewBadge}
                </div>
                <div class="text-[11px] text-slate-400">${trade.time}</div>
              </div>
              <div class="text-right">
                ${pnlDisplay}
              </div>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button
                class="expand-details-btn text-[10px] text-slate-400 hover:text-slate-300 px-2 py-1 rounded border border-[#262626] hover:border-slate-500"
                data-action="expand"
              >
                Details
              </button>
              ${!isReviewed 
                ? `<button
                    data-trade-id="${trade.id}"
                    data-action="review"
                    class="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-300 hover:bg-emerald-500/30 font-medium"
                  >
                    Review
                  </button>`
                : `<button
                    data-review-id="${trade.id}"
                    data-action="edit"
                    class="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-[11px] text-sky-300 hover:bg-sky-500/30"
                  >
                    Edit
                  </button>`
              }
            </div>
          </div>
        `;
        
        // Expanded view (hidden by default)
        const expandedDetails = `
          <div class="trade-details-expanded hidden px-3 pb-3 pt-0 border-t border-[#161616]">
            <div class="grid grid-cols-2 gap-3 mt-3 text-[11px]">
              <div><span class="text-slate-400">Entry:</span> <span class="text-slate-200">${trade.plan.entry || "-"}</span></div>
              <div><span class="text-slate-400">SL:</span> <span class="text-slate-200">${trade.plan.sl || "-"}</span></div>
              <div><span class="text-slate-400">TP:</span> <span class="text-slate-200">${trade.plan.tp || "-"}</span></div>
              ${trade.plan.size ? `<div><span class="text-slate-400">Size:</span> <span class="text-slate-200">$${trade.plan.size}</span></div>` : ""}
              ${trade.plan.leverage ? `<div><span class="text-slate-400">Leverage:</span> <span class="text-slate-200">${trade.plan.leverage}</span></div>` : ""}
              ${trade.plan.lots ? `<div><span class="text-slate-400">Lots:</span> <span class="text-slate-200">${trade.plan.lots}</span></div>` : ""}
              ${trade.checklist ? `<div><span class="text-slate-400">Checklist Score:</span> <span class="text-slate-200">${trade.checklist.score}/100</span></div>` : ""}
            </div>
            ${isReviewed && review.problems && review.problems.length > 0 
              ? `<div class="mt-3 pt-3 border-t border-[#161616]">
                  <div class="text-[11px] text-slate-400 mb-1">Problems:</div>
                  <div class="text-[11px] text-slate-300">${review.problems.join(", ")}</div>
                </div>`
              : ""}
            ${isReviewed && review.notes 
              ? `<div class="mt-3 pt-3 border-t border-[#161616]">
                  <div class="text-[11px] text-slate-400 mb-1">Notes:</div>
                  <div class="text-[11px] text-slate-300 italic">${review.notes}</div>
                </div>`
              : ""}
            ${isReviewed 
              ? `<div class="mt-3 flex gap-2">
                  <button
                    data-review-id="${trade.id}"
                    data-action="delete"
                    class="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-[11px] text-rose-300 hover:bg-rose-500/30"
                  >
                    Delete Review
                  </button>
                </div>`
              : ""}
          </div>
        `;
        
        card.innerHTML = compactView + expandedDetails;
        listEl.appendChild(card);
      });
  
      // Event handlers using event delegation - only attach once
      if (!tradeReviewsListenerAttached) {
        listEl.addEventListener("click", (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          
          const action = btn.dataset.action;
          const tradeId = btn.dataset.tradeId || btn.dataset.reviewId;
          
          if (action === "expand") {
            const card = btn.closest("[data-trade-id]");
            if (!card) return;
            const expanded = card.querySelector(".trade-details-expanded");
            const isExpanded = card.dataset.expanded === "true";
            
            if (isExpanded) {
              expanded.classList.add("hidden");
              btn.textContent = "Details";
              card.dataset.expanded = "false";
            } else {
              expanded.classList.remove("hidden");
              btn.textContent = "Hide";
              card.dataset.expanded = "true";
            }
          } else if (action === "review") {
            const currentJournal = loadJournal();
            const trade = currentJournal.find(t => t.id === tradeId);
            if (trade) openTradeReviewModal(trade);
          } else if (action === "edit") {
            const currentJournal = loadJournal();
            const currentReviews = loadTradeReviews();
            const trade = currentJournal.find(t => t.id === tradeId);
            if (trade) {
              const review = currentReviews.find(r => r.tradeId === tradeId);
              if (review) {
                openTradeReviewModal(trade, review);
              } else {
                openTradeReviewModal(trade);
              }
            }
          } else if (action === "delete") {
            if (!confirm("Delete this review?")) return;
            const currentReviews = loadTradeReviews();
            const updated = currentReviews.filter(r => r.tradeId !== tradeId);
            saveTradeReviews(updated);
            renderTradeReviews();
          }
        });
        tradeReviewsListenerAttached = true;
      }
    };
  
    function openTradeReviewModal(trade, existingReview = null) {
      const modal = document.getElementById("trade-review-modal");
      const content = document.getElementById("trade-review-content");
      const title = document.getElementById("trade-review-title");
      
      if (!modal || !content || !title) return;
  
      title.textContent = existingReview ? `Edit Review: ${trade.instrument}` : `Review: ${trade.instrument}`;
      
      // Compact summary
      const resultBadge = trade.result === "win" 
        ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300">✓ Win</span>'
        : trade.result === "loss"
        ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] text-rose-300">✗ Loss</span>'
        : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-[10px] text-slate-400">No result</span>';
      
      const pnlDisplay = trade.pnl !== undefined 
        ? `<div class="text-[14px] font-semibold ${trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${trade.pnl.toFixed(2)}</div>`
        : '<div class="text-[12px] text-slate-500">No P&L</div>';
      
      content.innerHTML = `
        <!-- Compact Summary -->
        <div class="rounded-lg border border-[#262626] bg-black/40 p-3 mb-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[13px] font-semibold text-slate-200">${sanitizeHTML(trade.instrument)}</span>
                ${resultBadge}
              </div>
              <div class="text-[11px] text-slate-400">${sanitizeHTML(trade.time)}</div>
            </div>
            <div class="text-right">
              ${pnlDisplay}
            </div>
          </div>
        </div>
        
        <!-- Collapsible Trade Details -->
        <div class="mb-4">
          <button
            id="toggle-trade-details"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#262626] bg-black/40 text-[11px] text-slate-300 hover:bg-black/60 transition-colors"
          >
            <span>Trade Details</span>
            <svg id="details-arrow" class="w-4 h-4 text-slate-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div id="trade-details-content" class="hidden mt-2 p-3 rounded-lg border border-[#161616] bg-black/20">
            <div class="grid grid-cols-2 gap-3 text-[11px]">
              <div><span class="text-slate-400">Entry:</span> <span class="text-slate-200">${sanitizeHTML(trade.plan.entry || "-")}</span></div>
              <div><span class="text-slate-400">SL:</span> <span class="text-slate-200">${sanitizeHTML(trade.plan.sl || "-")}</span></div>
              <div><span class="text-slate-400">TP:</span> <span class="text-slate-200">${sanitizeHTML(trade.plan.tp || "-")}</span></div>
              ${trade.plan.size ? `<div><span class="text-slate-400">Size:</span> <span class="text-slate-200">$${sanitizeHTML(trade.plan.size)}</span></div>` : ""}
              ${trade.plan.leverage ? `<div><span class="text-slate-400">Leverage:</span> <span class="text-slate-200">${sanitizeHTML(trade.plan.leverage)}</span></div>` : ""}
              ${trade.plan.lots ? `<div><span class="text-slate-400">Lots:</span> <span class="text-slate-200">${sanitizeHTML(trade.plan.lots)}</span></div>` : ""}
              ${trade.checklist ? `<div><span class="text-slate-400">Checklist Score:</span> <span class="text-slate-200">${trade.checklist.score}/100</span></div>` : ""}
            </div>
          </div>
        </div>
      `;
      
      // Add toggle functionality for trade details
      const toggleBtn = document.getElementById("toggle-trade-details");
      const detailsContent = document.getElementById("trade-details-content");
      const detailsArrow = document.getElementById("details-arrow");
      
      if (toggleBtn && detailsContent && detailsArrow) {
        toggleBtn.addEventListener("click", () => {
          const isHidden = detailsContent.classList.contains("hidden");
          if (isHidden) {
            detailsContent.classList.remove("hidden");
            detailsArrow.style.transform = "rotate(180deg)";
          } else {
            detailsContent.classList.add("hidden");
            detailsArrow.style.transform = "rotate(0deg)";
          }
        });
      }
  
      modal.dataset.tradeId = trade.id;
      modal.dataset.isEdit = existingReview ? "true" : "false";
      modal.classList.remove("hidden");
  
      // Reset or pre-fill form
      if (existingReview) {
        reviewWorked = existingReview.worked;
        const workedYes = document.getElementById("review-worked-yes");
        const workedNo = document.getElementById("review-worked-no");
        if (existingReview.worked) {
          workedYes.classList.remove("bg-emerald-500/10", "border-emerald-500/30");
          workedYes.classList.add("bg-emerald-500/40", "border-emerald-500", "ring-2", "ring-emerald-500/50", "ring-offset-2", "ring-offset-black");
          workedYes.style.transform = "scale(1.02)";
          workedNo.classList.remove("bg-rose-500/40", "border-rose-500", "ring-2", "ring-rose-500/50", "ring-offset-2", "ring-offset-black");
          workedNo.classList.add("bg-rose-500/10", "border-rose-500/30");
          workedNo.style.transform = "scale(1)";
        } else {
          workedNo.classList.remove("bg-rose-500/10", "border-rose-500/30");
          workedNo.classList.add("bg-rose-500/40", "border-rose-500", "ring-2", "ring-rose-500/50", "ring-offset-2", "ring-offset-black");
          workedNo.style.transform = "scale(1.02)";
          workedYes.classList.remove("bg-emerald-500/40", "border-emerald-500", "ring-2", "ring-emerald-500/50", "ring-offset-2", "ring-offset-black");
          workedYes.classList.add("bg-emerald-500/10", "border-emerald-500/30");
          workedYes.style.transform = "scale(1)";
        }
        updateReviewProblemsDisplay();
        // Set checkboxes based on review
        const activeSection = reviewWorked ? 
          document.getElementById("review-problems-worked") : 
          document.getElementById("review-problems-wrong");
        if (activeSection) {
          activeSection.querySelectorAll(".review-problem").forEach(cb => {
            cb.checked = existingReview.problems && existingReview.problems.includes(cb.value);
          });
        }
        document.getElementById("review-notes").value = existingReview.notes || "";
      } else {
        reviewWorked = null;
        const workedYes = document.getElementById("review-worked-yes");
        const workedNo = document.getElementById("review-worked-no");
        workedYes.classList.remove("bg-emerald-500/40", "border-emerald-500", "ring-2", "ring-emerald-500/50", "ring-offset-2", "ring-offset-black");
        workedYes.classList.add("bg-emerald-500/10", "border-emerald-500/30");
        workedYes.style.transform = "scale(1)";
        workedNo.classList.remove("bg-rose-500/40", "border-rose-500", "ring-2", "ring-rose-500/50", "ring-offset-2", "ring-offset-black");
        workedNo.classList.add("bg-rose-500/10", "border-rose-500/30");
        workedNo.style.transform = "scale(1)";
        document.querySelectorAll(".review-problem").forEach(cb => cb.checked = false);
        document.getElementById("review-notes").value = "";
        updateReviewProblemsDisplay();
      }
    }
  
    function closeTradeReviewModal() {
      const modal = document.getElementById("trade-review-modal");
      if (modal) modal.classList.add("hidden");
    }
  
    // Trade review modal handlers
    const reviewModal = document.getElementById("trade-review-modal");
    const btnCloseReview = document.getElementById("btn-close-review");
    const btnCancelReview = document.getElementById("btn-cancel-review");
    const btnSaveReview = document.getElementById("btn-save-review");
    const reviewWorkedYes = document.getElementById("review-worked-yes");
    const reviewWorkedNo = document.getElementById("review-worked-no");
  
    let reviewWorked = null;
  
    function updateReviewProblemsDisplay() {
      const label = document.getElementById("review-problems-label");
      const wrongSection = document.getElementById("review-problems-wrong");
      const workedSection = document.getElementById("review-problems-worked");
      
      if (reviewWorked === true) {
        // Show "What worked?" section
        if (label) label.textContent = "What worked? (Select all that apply)";
        if (wrongSection) wrongSection.classList.add("hidden");
        if (workedSection) workedSection.classList.remove("hidden");
        // Clear wrong checkboxes
        if (wrongSection) {
          wrongSection.querySelectorAll(".review-problem").forEach(cb => cb.checked = false);
        }
      } else if (reviewWorked === false) {
        // Show "What went wrong?" section
        if (label) label.textContent = "What went wrong? (Select all that apply)";
        if (workedSection) workedSection.classList.add("hidden");
        if (wrongSection) wrongSection.classList.remove("hidden");
        // Clear worked checkboxes
        if (workedSection) {
          workedSection.querySelectorAll(".review-problem").forEach(cb => cb.checked = false);
        }
      } else {
        // Default to "What went wrong?"
        if (label) label.textContent = "What went wrong? (Select all that apply)";
        if (workedSection) workedSection.classList.add("hidden");
        if (wrongSection) wrongSection.classList.remove("hidden");
      }
    }
  
    if (reviewWorkedYes) {
      reviewWorkedYes.addEventListener("click", () => {
        reviewWorked = true;
        // Make "Worked" button more visible
        reviewWorkedYes.classList.remove("bg-emerald-500/10", "border-emerald-500/30");
        reviewWorkedYes.classList.add("bg-emerald-500/40", "border-emerald-500", "ring-2", "ring-emerald-500/50", "ring-offset-2", "ring-offset-black");
        reviewWorkedYes.style.transform = "scale(1.02)";
        // Reset "Didn't Work" button
        reviewWorkedNo.classList.remove("bg-rose-500/40", "border-rose-500", "ring-2", "ring-rose-500/50", "ring-offset-2", "ring-offset-black");
        reviewWorkedNo.classList.add("bg-rose-500/10", "border-rose-500/30");
        reviewWorkedNo.style.transform = "scale(1)";
        updateReviewProblemsDisplay();
      });
    }
  
    if (reviewWorkedNo) {
      reviewWorkedNo.addEventListener("click", () => {
        reviewWorked = false;
        // Make "Didn't Work" button more visible
        reviewWorkedNo.classList.remove("bg-rose-500/10", "border-rose-500/30");
        reviewWorkedNo.classList.add("bg-rose-500/40", "border-rose-500", "ring-2", "ring-rose-500/50", "ring-offset-2", "ring-offset-black");
        reviewWorkedNo.style.transform = "scale(1.02)";
        // Reset "Worked" button
        reviewWorkedYes.classList.remove("bg-emerald-500/40", "border-emerald-500", "ring-2", "ring-emerald-500/50", "ring-offset-2", "ring-offset-black");
        reviewWorkedYes.classList.add("bg-emerald-500/10", "border-emerald-500/30");
        reviewWorkedYes.style.transform = "scale(1)";
        updateReviewProblemsDisplay();
      });
    }
  
    if (btnCloseReview) {
      btnCloseReview.addEventListener("click", closeTradeReviewModal);
    }
  
    if (btnCancelReview) {
      btnCancelReview.addEventListener("click", closeTradeReviewModal);
    }
  
    if (btnSaveReview) {
      btnSaveReview.addEventListener("click", () => {
        const tradeId = reviewModal?.dataset.tradeId;
        const isEdit = reviewModal?.dataset.isEdit === "true";
        if (!tradeId) return;
  
        // Get checked problems from the visible section
        const activeSection = reviewWorked ? 
          document.getElementById("review-problems-worked") : 
          document.getElementById("review-problems-wrong");
        const problems = activeSection ? 
          Array.from(activeSection.querySelectorAll(".review-problem:checked")).map(cb => cb.value) : 
          [];
        const notes = document.getElementById("review-notes").value.trim();
  
        if (reviewWorked === null) {
          alert("Please indicate if the trade worked or not.");
          return;
        }
  
        const reviews = loadTradeReviews();
        
        if (isEdit) {
          // Update existing review
          const index = reviews.findIndex(r => r.tradeId === tradeId);
          if (index >= 0) {
            reviews[index] = {
              ...reviews[index],
              worked: reviewWorked,
              problems: problems,
              notes: notes,
              timestamp: new Date().toISOString(),
            };
          }
        } else {
          // Add new review
          reviews.push({
            tradeId: tradeId,
            worked: reviewWorked,
            problems: problems,
            notes: notes,
            timestamp: new Date().toISOString(),
          });
        }
  
        saveTradeReviews(reviews);
        renderTradeReviews();
        closeTradeReviewModal();
      });
    }
  
    if (reviewModal) {
      reviewModal.addEventListener("click", (e) => {
        if (e.target.id === "trade-review-modal") closeTradeReviewModal();
      });
    }
  
    // Demo Mode
    function loadDemoData() {
      if (!confirm("This will add sample trades to demonstrate the analysis features. Continue?")) return;
  
      const demoTrades = [
        {
          id: "demo-1",
          instrument: "BTCUSDT",
          time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(),
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          plan: { entry: "45000", sl: "44500", tp: "46000", size: 1000 },
          notes: "Demo trade 1",
          result: "win",
          pnl: 222.22,
          checklist: {
            score: 75,
            groups: {
              ms: { score: 4, max: 7, percentage: 57 },
              of: { score: 2, max: 4, percentage: 50 },
              tpo: { score: 2, max: 3, percentage: 67 },
              pa: { score: 3, max: 4, percentage: 75 },
              exec: { score: 4, max: 6, percentage: 67 },
            },
          },
        },
        {
          id: "demo-2",
          instrument: "ETHUSDT",
          time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleString(),
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          plan: { entry: "2800", sl: "2750", tp: "2900", size: 1000 },
          notes: "Demo trade 2",
          result: "loss",
          pnl: -178.57,
          checklist: {
            score: 45,
            groups: {
              ms: { score: 2, max: 7, percentage: 29 },
              of: { score: 1, max: 4, percentage: 25 },
              tpo: { score: 1, max: 3, percentage: 33 },
              pa: { score: 2, max: 4, percentage: 50 },
              exec: { score: 3, max: 6, percentage: 50 },
            },
          },
        },
        {
          id: "demo-3",
          instrument: "BTCUSDT",
          time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString(),
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          plan: { entry: "45500", sl: "45000", tp: "47000", size: 1000 },
          notes: "Demo trade 3",
          result: "loss",
          pnl: -109.89,
          checklist: {
            score: 55,
            groups: {
              ms: { score: 3, max: 7, percentage: 43 },
              of: { score: 2, max: 4, percentage: 50 },
              tpo: { score: 2, max: 3, percentage: 67 },
              pa: { score: 3, max: 4, percentage: 75 },
              exec: { score: 2, max: 6, percentage: 33 },
            },
          },
        },
        {
          id: "demo-4",
          instrument: "SOLUSDT",
          time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleString(),
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          plan: { entry: "95", sl: "92", tp: "100", size: 1000 },
          notes: "Demo trade 4",
          result: "win",
          pnl: 52.63,
          checklist: {
            score: 80,
            groups: {
              ms: { score: 6, max: 7, percentage: 86 },
              of: { score: 3, max: 4, percentage: 75 },
              tpo: { score: 3, max: 3, percentage: 100 },
              pa: { score: 4, max: 4, percentage: 100 },
              exec: { score: 5, max: 6, percentage: 83 },
            },
          },
        },
        {
          id: "demo-5",
          instrument: "BTCUSDT",
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          plan: { entry: "46000", sl: "45500", tp: "47500", size: 1000 },
          notes: "Demo trade 5",
          result: "loss",
          pnl: -108.70,
          checklist: {
            score: 50,
            groups: {
              ms: { score: 3, max: 7, percentage: 43 },
              of: { score: 1, max: 4, percentage: 25 },
              tpo: { score: 2, max: 3, percentage: 67 },
              pa: { score: 2, max: 4, percentage: 50 },
              exec: { score: 3, max: 6, percentage: 50 },
            },
          },
        },
      ];
  
      const journal = loadJournal();
      const updatedJournal = [...demoTrades, ...journal];
      saveJournal(updatedJournal);
      renderJournal(updatedJournal);
      renderTradeReviews();
  
      alert("Demo data loaded! Go to Review to see the analysis features.");
    }
  
    // Enhanced analysis with checklist and review data
    function analyzeTradingEnhanced() {
      const journal = getFilteredJournal();
      const reviews = loadTradeReviews();
      const playbook = loadPlaybook();
      
      if (!journal.length) {
        alert("No journal entries to analyze. Please add some trades first.");
        return;
      }
  
      const analysisResults = {
        totalTrades: journal.length,
        wins: journal.filter(t => t.result === "win").length,
        losses: journal.filter(t => t.result === "loss").length,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        strengths: [],
        improvements: [],
        strategies: [],
        recommendations: [],
        checklistInsights: {},
      };
  
      // Calculate basic metrics
      analysisResults.totalPnL = journal.reduce((sum, t) => sum + (t.pnl || 0), 0);
      analysisResults.winRate = analysisResults.totalTrades > 0 
        ? (analysisResults.wins / analysisResults.totalTrades) * 100 
        : 0;
  
      const wins = journal.filter(t => t.result === "win");
      const losses = journal.filter(t => t.result === "loss");
      const winsWithPnl = wins.filter(t => t.pnl > 0);
      const lossesWithPnl = losses.filter(t => t.pnl < 0);
      
      analysisResults.avgWin = winsWithPnl.length > 0 
        ? winsWithPnl.reduce((sum, t) => sum + (t.pnl || 0), 0) / winsWithPnl.length 
        : 0;
      analysisResults.avgLoss = lossesWithPnl.length > 0 
        ? Math.abs(lossesWithPnl.reduce((sum, t) => sum + (t.pnl || 0), 0) / lossesWithPnl.length)
        : 0;
  
      // ========== STRATEGY PERFORMANCE FROM PLAYBOOK ==========
      // playbook is an array of setups (not an object with .setups property)
      if (playbook && playbook.length > 0) {
        const strategyStats = {};
        
        // Count trades per setup
        journal.forEach(trade => {
          if (trade.setupId) {
            if (!strategyStats[trade.setupId]) {
              const setup = playbook.find(s => s.id === trade.setupId);
              strategyStats[trade.setupId] = {
                name: setup ? setup.name : "Unknown Setup",
                trades: 0,
                wins: 0,
                pnl: 0
              };
            }
            strategyStats[trade.setupId].trades++;
            if (trade.result === "win") strategyStats[trade.setupId].wins++;
            strategyStats[trade.setupId].pnl += (trade.pnl || 0);
          }
        });
        
        // Convert to array and calculate win rates
        analysisResults.strategies = Object.values(strategyStats)
          .map(s => ({
            ...s,
            winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0
          }))
          .filter(s => s.trades >= 1)
          .sort((a, b) => {
            // Sort by win rate first, then by number of trades
            if (a.trades >= 3 && b.trades >= 3) return b.winRate - a.winRate;
            if (a.trades >= 3) return -1;
            if (b.trades >= 3) return 1;
            return b.winRate - a.winRate;
          })
          .slice(0, 5); // Top 5 strategies
      }
  
      // ========== ANALYZE STRENGTHS ==========
      // Good win rate
      if (analysisResults.winRate >= 60) {
        analysisResults.strengths.push(`Strong win rate at ${analysisResults.winRate.toFixed(0)}%`);
      } else if (analysisResults.winRate >= 50) {
        analysisResults.strengths.push(`Positive win rate at ${analysisResults.winRate.toFixed(0)}%`);
      }
  
      // Good R:R
      const rrRatio = analysisResults.avgWin > 0 && analysisResults.avgLoss > 0 
        ? analysisResults.avgWin / analysisResults.avgLoss 
        : 0;
      if (rrRatio >= 2) {
        analysisResults.strengths.push(`Excellent R:R ratio of ${rrRatio.toFixed(1)}:1`);
      } else if (rrRatio >= 1.5) {
        analysisResults.strengths.push(`Good R:R ratio of ${rrRatio.toFixed(1)}:1`);
      }
  
      // Profitable
      if (analysisResults.totalPnL > 0) {
        analysisResults.strengths.push(`Net profitable: +$${analysisResults.totalPnL.toFixed(0)}`);
      }
  
      // Consistent trading
      if (analysisResults.totalTrades >= 10) {
        analysisResults.strengths.push(`Building experience with ${analysisResults.totalTrades} trades logged`);
      }
  
      // Best strategy
      if (analysisResults.strategies.length > 0) {
        const best = analysisResults.strategies[0];
        if (best.winRate >= 60 && best.trades >= 3) {
          analysisResults.strengths.push(`"${best.name}" performing well at ${best.winRate.toFixed(0)}% win rate`);
        }
      }
  
      // Analyze checklist data
      const tradesWithChecklist = journal.filter(t => t.checklist);
      if (tradesWithChecklist.length > 0) {
        const avgChecklistScore = tradesWithChecklist.reduce((sum, t) => sum + (t.checklist.score || 0), 0) / tradesWithChecklist.length;
        const winChecklistScore = wins.filter(t => t.checklist).reduce((sum, t) => sum + (t.checklist.score || 0), 0) / Math.max(1, wins.filter(t => t.checklist).length);
        const lossChecklistScore = losses.filter(t => t.checklist).reduce((sum, t) => sum + (t.checklist.score || 0), 0) / Math.max(1, losses.filter(t => t.checklist).length);
  
        analysisResults.checklistInsights = {
          avgScore: avgChecklistScore,
          winAvgScore: winChecklistScore,
          lossAvgScore: lossChecklistScore,
        };
  
        if (avgChecklistScore >= 70) {
          analysisResults.strengths.push(`High-quality trade selection (avg score ${avgChecklistScore.toFixed(0)})`);
        }
  
        if (winChecklistScore > lossChecklistScore && wins.length > 0) {
          analysisResults.strengths.push("Checklist is predictive — wins have higher scores");
        }
      }
  
      // ========== ANALYZE AREAS TO IMPROVE ==========
      if (analysisResults.winRate < 50) {
        analysisResults.improvements.push(`Win rate of ${analysisResults.winRate.toFixed(0)}% needs improvement`);
      }
  
      if (rrRatio > 0 && rrRatio < 1.5) {
        analysisResults.improvements.push(`R:R ratio of ${rrRatio.toFixed(1)}:1 — aim for 2:1 or higher`);
      }
  
      if (analysisResults.totalPnL < 0) {
        analysisResults.improvements.push(`Net loss of $${Math.abs(analysisResults.totalPnL).toFixed(0)} — review losing trades`);
      }
  
      // Checklist-based improvements
      if (tradesWithChecklist.length > 0) {
        const avgChecklistScore = analysisResults.checklistInsights.avgScore;
        if (avgChecklistScore < 60) {
          analysisResults.improvements.push(`Average checklist score of ${avgChecklistScore.toFixed(0)} is low — be more selective`);
        }
  
        // Analyze by group for weak areas
        const groupScores = {};
        tradesWithChecklist.forEach(trade => {
          if (trade.checklist.groups) {
            Object.keys(trade.checklist.groups).forEach(group => {
              if (!groupScores[group]) groupScores[group] = [];
              groupScores[group].push(trade.checklist.groups[group].percentage);
            });
          }
        });
  
        const groupNames = { ms: "Market Structure", of: "Orderflow", tpo: "TPO/Profile", pa: "PA/Orderblocks", exec: "Execution" };
        Object.entries(groupScores).forEach(([group, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg < 50) {
            analysisResults.improvements.push(`${groupNames[group] || group} is weak (${avg.toFixed(0)}% avg)`);
          }
        });
      }
  
      // Worst performing strategy
      if (analysisResults.strategies.length > 0) {
        const worst = [...analysisResults.strategies].sort((a, b) => a.winRate - b.winRate)[0];
        if (worst.winRate < 40 && worst.trades >= 3) {
          analysisResults.improvements.push(`Review "${worst.name}" — only ${worst.winRate.toFixed(0)}% win rate`);
        }
      }
  
      // Analyze review data for common problems
      if (reviews.length > 0) {
        const problemCounts = {};
        reviews.forEach(review => {
          if (review.problems) {
            review.problems.forEach(problem => {
              problemCounts[problem] = (problemCounts[problem] || 0) + 1;
            });
          }
        });
  
        const sortedProblems = Object.entries(problemCounts).sort((a, b) => b[1] - a[1]);
        if (sortedProblems.length > 0) {
          const mostCommon = sortedProblems[0];
          const problemNames = {
            "market-structure": "Market Structure",
            "orderflow": "Orderflow",
            "tpo-profile": "TPO/Profile",
            "orderblock": "Orderblocks",
            "execution": "Execution",
            "risk-management": "Risk Management",
            "timing": "Timing",
          };
          analysisResults.improvements.push(`Common issue: ${problemNames[mostCommon[0]] || mostCommon[0]} (${mostCommon[1]} times)`);
        }
      }
  
      // ========== GENERATE ACTION ITEMS ==========
      if (analysisResults.winRate < 50) {
        analysisResults.recommendations.push("Focus on quality over quantity — be more selective with entries");
      }
  
      if (rrRatio > 0 && rrRatio < 1.5) {
        analysisResults.recommendations.push("Work on letting winners run and cutting losers early");
      }
  
      if (tradesWithChecklist.length > 0 && analysisResults.checklistInsights.avgScore < 70) {
        analysisResults.recommendations.push("Only take trades scoring 70+ on your checklist");
      }
  
      if (analysisResults.strategies.length === 0 && playbook && playbook.setups && playbook.setups.length > 0) {
        analysisResults.recommendations.push("Start linking trades to your Playbook setups for better insights");
      }
  
      if (analysisResults.strategies.length > 0) {
        const best = analysisResults.strategies[0];
        if (best.winRate >= 60 && best.trades >= 3) {
          analysisResults.recommendations.push(`Focus more on "${best.name}" — it's your best performer`);
        }
      }
  
      if (analysisResults.totalTrades < 20) {
        analysisResults.recommendations.push("Keep logging trades — more data = better insights");
      }
  
      // Default if nothing else
      if (analysisResults.recommendations.length === 0) {
        analysisResults.recommendations.push("You're doing well! Maintain your process and stay disciplined");
      }
  
      renderTradingAnalysis(analysisResults);
    }
    
    // Expose analysis functions on window for global access
    window.analyzeTradingEnhanced = analyzeTradingEnhanced;
    window.renderTradingAnalysis = renderTradingAnalysis;
  
    // Initialize trade reviews
    renderTradeReviews();
    
    // Initialize statistics dashboard
    if (window.renderStatisticsDashboard) {
      window.renderStatisticsDashboard("all");
    }
    
    // Initialize goals & targets
    if (window.renderGoals) {
      window.renderGoals();
    }
    initGoalsModal();
    
    // Initialize risk management tools
    initRiskManagementTools();
    
    // Update header status bar on page load
    if (typeof updateHeaderStatusBarIndependent === 'function') {
      updateHeaderStatusBarIndependent();
    }
    
    // Initialize heatmap and advanced stats
    initHeatmapAndStats();
    
    // Initialize playbook
    initPlaybook();
    
    // Initialize setup selector in Trade Checklist
    initSetupSelector();
    
    // Initialize theme selector
    initThemeSelector();
    
    // Initialize global account filter
    initGlobalFilter();
    
    // Initialize trade import
    initTradeImport();
  
    // Review & Calendar button handlers
    const btnAnalyze = document.getElementById("btn-analyze-trading");
    const btnClearScreenshots = document.getElementById("btn-clear-screenshots");
    const btnCalendarPrev = document.getElementById("btn-calendar-prev");
    const btnCalendarNext = document.getElementById("btn-calendar-next");
    const btnCalendarToday = document.getElementById("btn-calendar-today");
    const btnCloseDayDetail = document.getElementById("btn-close-day-detail");
    const btnExportAll = document.getElementById("btn-export-all-journals");
    
    // Calendar navigation
    if (btnCalendarPrev) {
      btnCalendarPrev.addEventListener("click", () => navigateCalendar("prev"));
    }
    
    if (btnCalendarNext) {
      btnCalendarNext.addEventListener("click", () => navigateCalendar("next"));
    }
    
    if (btnCalendarToday) {
      btnCalendarToday.addEventListener("click", () => {
        const today = new Date();
        currentCalendarMonth = today.getMonth();
        currentCalendarYear = today.getFullYear();
        currentCalendarDay = today.getDate();
        currentCalendarWeek = getWeekNumber(today);
        renderCalendar();
      });
    }
    
    // Calendar view selector
    const calendarViewSelector = document.getElementById("calendar-view-selector");
    if (calendarViewSelector) {
      calendarViewSelector.addEventListener("click", (e) => {
        const btn = e.target.closest(".calendar-view-btn");
        if (btn && btn.dataset.view) {
          currentCalendarView = btn.dataset.view;
          // Reset grid classes
          const calendarGrid = document.getElementById("calendar-grid");
          if (calendarGrid) {
            calendarGrid.className = "grid grid-cols-7 gap-0.5 md:gap-1";
          }
          renderCalendar();
        }
      });
    }
    
    if (btnCloseDayDetail) {
      btnCloseDayDetail.addEventListener("click", hideDayDetail);
    }
    // Demo mode removed
    const btnLoadDemo = null; // document.getElementById("btn-load-demo");
    const btnClearAllReviews = document.getElementById("btn-clear-all-reviews");
  
    if (btnAnalyze) {
      btnAnalyze.addEventListener("click", analyzeTradingEnhanced);
    }
  
    if (btnLoadDemo) {
      btnLoadDemo.addEventListener("click", loadDemoData);
    }
  
    if (btnClearScreenshots) {
      btnClearScreenshots.addEventListener("click", () => {
        if (!confirm("Clear all screenshots from vault? This will also clear daily archives.")) return;
        saveVaultScreenshots([]);
        saveDailyArchives([]);
        renderCalendar();
      });
    }
  
    if (btnClearAllReviews) {
      btnClearAllReviews.addEventListener("click", () => {
        if (!confirm("Clear all trade reviews? This cannot be undone.")) return;
        saveTradeReviews([]);
        // Force reload and re-render
        setTimeout(() => {
          renderTradeReviews();
        }, 100);
      });
    }
  
    if (btnExportAll) {
      btnExportAll.addEventListener("click", () => {
        const journals = loadVaultJournals();
        if (!journals.length) {
          alert("No journals to export.");
          return;
        }
        const blob = new Blob([JSON.stringify(journals, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `all-journals-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  
    // Journal Archives Modal close button
    const btnCloseJournalArchivesModal = document.getElementById("btn-close-journal-archives-modal");
    if (btnCloseJournalArchivesModal) {
      btnCloseJournalArchivesModal.addEventListener("click", closeJournalArchivesModal);
    }
  
    // Close modal when clicking outside
    const journalArchivesModal = document.getElementById("journal-archives-modal");
    if (journalArchivesModal) {
      journalArchivesModal.addEventListener("click", (e) => {
        if (e.target.id === "journal-archives-modal") closeJournalArchivesModal();
      });
    }
  
    // Screenshot Preview Modal close button
    const btnCloseScreenshotPreview = document.getElementById("btn-close-screenshot-preview");
    if (btnCloseScreenshotPreview) {
      btnCloseScreenshotPreview.addEventListener("click", closeScreenshotPreview);
    }
  
    // Close screenshot preview modal when clicking outside
    const screenshotPreviewModal = document.getElementById("screenshot-preview-modal");
    if (screenshotPreviewModal) {
      screenshotPreviewModal.addEventListener("click", (e) => {
        if (e.target.id === "screenshot-preview-modal") closeScreenshotPreview();
      });
    }
  
    // Close screenshot preview on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("screenshot-preview-modal");
        if (modal && !modal.classList.contains("hidden")) {
          closeScreenshotPreview();
        }
      }
    });
  
    // Re-render trade reviews when journal updates
    const originalRenderJournal = window.renderJournal || renderJournal;
    window.renderJournal = function(list) {
      originalRenderJournal(list);
      // Call renderTradeReviews after journal is updated
      if (window.renderTradeReviews && typeof window.renderTradeReviews === 'function') {
        window.renderTradeReviews();
      }
      // Update trade progress chart
      if (window.updateAccountBalanceChart && typeof window.updateAccountBalanceChart === 'function') {
        window.updateAccountBalanceChart();
      }
    };
  
    // Trade Progress Chart
    let tradeProgressChart = null;
    let currentTimeframe = "All"; // Default to All to show all imported trades
    let currentChartMetric = "pnl"; // Default to P&L which works with imported trades
  
    function calculateTradeProgressOverTime(timeframe, metric) {
      const journal = getFilteredJournal();
      const reviews = loadTradeReviews();
      
      if (journal.length === 0) {
        return { labels: [], values: [] };
      }
  
      // Calculate date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case "7D":
          startDate.setDate(now.getDate() - 7);
          break;
        case "4W":
          startDate.setDate(now.getDate() - 28);
          break;
        case "MTD":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "QTD":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "YTD":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "All":
          startDate = new Date(0);
          break;
      }
  
      // Filter and sort trades by date (using global getTradeDate for consistency)
      const tradesInRange = journal.filter(trade => {
        const tradeDate = getTradeDate(trade);
        if (!tradeDate) return false;
        return tradeDate >= startDate;
      });
  
      tradesInRange.sort((a, b) => {
        const dateA = getTradeDate(a) || new Date(0);
        const dateB = getTradeDate(b) || new Date(0);
        return dateA - dateB;
      });
  
      const dataPoints = [];
      
      if (metric === "checklist") {
        // Running average of checklist scores
        let runningSum = 0;
        let count = 0;
        
        tradesInRange.forEach((trade, index) => {
          if (trade.checklist && trade.checklist.score !== undefined) {
            runningSum += trade.checklist.score;
            count++;
            const avg = runningSum / count;
            const tradeDate = getTradeDate(trade);
            dataPoints.push({
              date: tradeDate,
              value: avg,
              label: tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
          }
        });
      } else if (metric === "winrate") {
        // Running win rate
        let wins = 0;
        let total = 0;
        
        tradesInRange.forEach(trade => {
          if (trade.result === "win" || trade.result === "loss") {
            total++;
            if (trade.result === "win") wins++;
            const winRate = total > 0 ? (wins / total) * 100 : 0;
            const tradeDate = getTradeDate(trade);
            dataPoints.push({
              date: tradeDate,
              value: winRate,
              label: tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
          }
        });
      } else if (metric === "pnl") {
        // Cumulative P&L
        let cumulativePnL = 0;
        
        tradesInRange.forEach(trade => {
          if (trade.pnl !== undefined && trade.pnl !== null) {
            cumulativePnL += trade.pnl;
            const tradeDate = getTradeDate(trade);
            dataPoints.push({
              date: tradeDate,
              value: cumulativePnL,
              label: tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
          }
        });
      }
  
      if (dataPoints.length === 0) {
        const today = new Date();
        return {
          labels: [today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })],
          values: [0]
        };
      }
  
      return {
        labels: dataPoints.map(d => d.label),
        values: dataPoints.map(d => d.value)
      };
    }
  
    function calculateAccountBalanceOverTime(accountId, timeframe) {
      const journal = getFilteredJournal();
      const accounts = loadAccounts();
      
      // Filter by account if specified
      let filteredJournal = journal;
      if (accountId !== "all") {
        filteredJournal = journal.filter(t => t.accountId === accountId);
      }
  
      if (filteredJournal.length === 0) {
        return { labels: [], balances: [] };
      }
  
      // Get initial balance
      let initialBalance = 0;
      if (accountId !== "all") {
        const account = accounts.find(a => a.id === accountId);
        if (account) {
          initialBalance = account.initialBalance || 0;
        }
      } else {
        // Sum all initial balances
        initialBalance = accounts.reduce((sum, a) => sum + (a.initialBalance || 0), 0);
      }
  
      // Calculate date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case "7D":
          startDate.setDate(now.getDate() - 7);
          break;
        case "4W":
          startDate.setDate(now.getDate() - 28);
          break;
        case "MTD":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "QTD":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "YTD":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "All":
          startDate = new Date(0); // Beginning of time
          break;
      }
  
      // Filter trades by date (using global getTradeDate for consistency)
      const tradesInRange = filteredJournal.filter(trade => {
        const tradeDate = getTradeDate(trade);
        if (!tradeDate) return false;
        return tradeDate >= startDate;
      });
  
      // Sort by timestamp
      tradesInRange.sort((a, b) => {
        const dateA = getTradeDate(a) || new Date(0);
        const dateB = getTradeDate(b) || new Date(0);
        return dateA - dateB;
      });
  
      // Calculate running balance
      const dataPoints = [];
      let runningBalance = initialBalance;
      
      // Group by date and calculate daily balance
      const dailyBalances = {};
      
      tradesInRange.forEach(trade => {
        const tradeDate = getTradeDate(trade);
        const dateKey = tradeDate.toISOString().split('T')[0];
        
        if (!dailyBalances[dateKey]) {
          dailyBalances[dateKey] = 0;
        }
        
        if (trade.pnl !== undefined) {
          dailyBalances[dateKey] += trade.pnl;
        }
      });
  
      // Create data points
      const sortedDates = Object.keys(dailyBalances).sort();
      sortedDates.forEach(date => {
        runningBalance += dailyBalances[date];
        const dateObj = new Date(date);
        dataPoints.push({
          date: date,
          balance: runningBalance,
          label: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      });
  
      // If no trades, return initial balance with today's date
      if (dataPoints.length === 0) {
        const today = new Date();
        return {
          labels: [today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })],
          balances: [initialBalance],
          dates: [today.toISOString().split('T')[0]]
        };
      }
  
      return {
        labels: dataPoints.map(d => d.label),
        balances: dataPoints.map(d => d.balance),
        dates: dataPoints.map(d => d.date)
      };
    }
  
    function updateAccountBalanceChart() {
      const canvas = document.getElementById("account-balance-chart");
      if (!canvas) {
        return;
      }
  
      if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded");
        return;
      }
  
      const ctx = canvas.getContext("2d");
      const data = calculateTradeProgressOverTime(currentTimeframe, currentChartMetric);
  
      if (tradeProgressChart) {
        tradeProgressChart.destroy();
      }
  
      // Ensure we have at least one data point
      if (!data.labels || data.labels.length === 0 || !data.values || data.values.length === 0) {
        // No data to display, using default
        const today = new Date();
        data.labels = [today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })];
        data.values = [0];
      }
      
      // Chart data prepared
  
      // Set canvas size
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight || 400;
      }
  
      // Determine label and color based on metric
      let label = '';
      let color = 'rgb(16, 185, 129)';
      let yAxisCallback = (value) => value.toFixed(0);
      
      if (currentChartMetric === "checklist") {
        label = 'Checklist Score (Avg)';
        color = 'rgb(59, 130, 246)'; // blue
        yAxisCallback = (value) => value.toFixed(1);
      } else if (currentChartMetric === "winrate") {
        label = 'Win Rate (%)';
        color = 'rgb(16, 185, 129)'; // green
        yAxisCallback = (value) => value.toFixed(1) + '%';
      } else if (currentChartMetric === "pnl") {
        label = 'Cumulative P&L';
        color = 'rgb(16, 185, 129)'; // green
        yAxisCallback = (value) => '$' + value.toFixed(2);
      }
  
      // Show points when there are few data points
      const showPoints = data.values.length <= 5;
      
      tradeProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: label,
            data: data.values,
            borderColor: color,
            backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            fill: true,
            tension: 0.4,
            pointRadius: showPoints ? 4 : 0,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: color.replace('rgb', 'rgba').replace(')', ', 0.5)'),
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  if (currentChartMetric === "checklist") {
                    return context.parsed.y.toFixed(1) + '/100';
                  } else if (currentChartMetric === "winrate") {
                    return context.parsed.y.toFixed(1) + '%';
                  } else {
                    return '$' + context.parsed.y.toFixed(2);
                  }
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)',
                font: {
                  size: 11
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)',
                font: {
                  size: 11
                },
                callback: yAxisCallback
              }
            }
          }
        }
      });
    }
  
    function updateAccountSelector() {
      // This function is kept for compatibility but not needed for trade progress chart
    }
  
    // Event listeners for chart
    const timeframeButtons = document.querySelectorAll(".account-chart-timeframe");
    timeframeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        currentTimeframe = btn.dataset.timeframe;
        
        // Update button styles
        timeframeButtons.forEach(b => {
          b.classList.remove("bg-emerald-500/20", "border-emerald-500/30", "text-emerald-300");
          b.classList.add("bg-black/60", "border-[#262626]", "text-slate-300");
        });
        
        btn.classList.remove("bg-black/60", "border-[#262626]", "text-slate-300");
        btn.classList.add("bg-emerald-500/20", "border-emerald-500/30", "text-emerald-300");
        
        updateAccountBalanceChart();
      });
    });
  
    const metricSelector = document.getElementById("chart-metric-selector");
    if (metricSelector) {
      metricSelector.addEventListener("change", (e) => {
        currentChartMetric = e.target.value;
        updateAccountBalanceChart();
      });
    }
  
    // Initialize chart when Analysis section is shown (chart moved from old "tv" section)
    const analysisSection = document.querySelector('[data-section-panel="analysis"]');
    if (analysisSection) {
      // Also listen to section navigation
      const sectionLinksForChart = document.querySelectorAll("[data-section-nav]");
      sectionLinksForChart.forEach(link => {
        link.addEventListener("click", (e) => {
          const section = link.dataset.sectionNav;
          if (section === "analysis") {
            setTimeout(() => {
              updateAccountSelector();
              updateAccountBalanceChart();
            }, 100);
          }
        });
      });
  
      const chartObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (!analysisSection.classList.contains("hidden")) {
            setTimeout(() => {
              updateAccountSelector();
              updateAccountBalanceChart();
            }, 100);
          }
        });
      });
      
      chartObserver.observe(analysisSection, {
        attributes: true,
        attributeFilter: ['class']
      });
  
      // Initial check if section is already visible
      if (!analysisSection.classList.contains("hidden")) {
        setTimeout(() => {
          updateAccountSelector();
          updateAccountBalanceChart();
        }, 500);
      }
    }
  
    // Make functions globally available
    window.updateAccountBalanceChart = updateAccountBalanceChart;
    window.updateAccountSelector = updateAccountSelector;
  
    // Update account selector when accounts change
    const originalRenderAccounts = window.renderAccounts || renderAccounts;
    window.renderAccounts = function() {
      originalRenderAccounts();
      if (window.updateAccountSelector && typeof window.updateAccountSelector === 'function') {
        window.updateAccountSelector();
      }
      // Also update import account selector
      if (typeof populateImportAccountSelector === 'function') {
        populateImportAccountSelector();
      }
    };
  
    // Trade Plan Configuration
    const TRADE_PLAN_CONFIG_KEY = "tradingdesk:trade-plan-config";
    
    const defaultConfig = {
      account: true,
      entry: true,
      sl: true,
      tp: true,
      size: true,
      result: true,
      pnl: true,
      notes: true
    };
  
    function loadTradePlanConfig() {
      try {
        const saved = localStorage.getItem(TRADE_PLAN_CONFIG_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load trade plan config:", e);
      }
      return { ...defaultConfig };
    }
  
    function saveTradePlanConfig(config) {
      try {
        localStorage.setItem(TRADE_PLAN_CONFIG_KEY, JSON.stringify(config));
      } catch (e) {
        console.error("Failed to save trade plan config:", e);
      }
    }
  
    function applyTradePlanConfig(config) {
      // Hide/show account
      const accountSection = document.querySelector('[data-param="account"]');
      if (accountSection) {
        accountSection.style.display = config.account ? 'block' : 'none';
      }
  
      // Handle entry, SL, TP (they're in the same grid)
      const entrySlTpSection = document.querySelector('[data-param="entry-sl-tp"]');
      if (entrySlTpSection) {
        const entryInput = document.getElementById("plan-entry");
        const slInput = document.getElementById("plan-sl");
        const tpInput = document.getElementById("plan-tp");
        
        if (entryInput) entryInput.style.display = config.entry ? 'block' : 'none';
        if (slInput) slInput.style.display = config.sl ? 'block' : 'none';
        if (tpInput) tpInput.style.display = config.tp ? 'block' : 'none';
        
        // Show/hide the grid container if all are hidden
        const visibleCount = [config.entry, config.sl, config.tp].filter(Boolean).length;
        entrySlTpSection.style.display = visibleCount > 0 ? 'grid' : 'none';
        
        // Adjust grid columns based on visible inputs
        if (visibleCount > 0) {
          entrySlTpSection.className = `grid gap-2 mb-2 ${visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`;
        }
      }
  
      // Hide/show size
      const sizeSection = document.querySelector('[data-param="size"]');
      if (sizeSection) {
        sizeSection.style.display = config.size ? 'block' : 'none';
      }
  
      // Hide/show result
      const resultSection = document.querySelector('[data-param="result"]');
      if (resultSection) {
        resultSection.style.display = config.result ? 'block' : 'none';
      }
  
      // Hide/show P&L
      const pnlSection = document.querySelector('[data-param="pnl"]');
      if (pnlSection) {
        pnlSection.style.display = config.pnl ? 'block' : 'none';
      }
  
      // Hide/show notes
      const notesTextarea = document.getElementById("plan-notes");
      if (notesTextarea) {
        notesTextarea.style.display = config.notes ? 'block' : 'none';
      }
    }
  
    // Initialize trade plan config
    let tradePlanConfig = loadTradePlanConfig();
    applyTradePlanConfig(tradePlanConfig);
  
    // Trade Plan Config Modal
    const btnConfigureTradePlan = document.getElementById("btn-configure-trade-plan");
    const tradePlanConfigModal = document.getElementById("trade-plan-config-modal");
    const btnCloseTradePlanConfig = document.getElementById("btn-close-trade-plan-config");
    const btnSaveTradePlanConfig = document.getElementById("btn-save-trade-plan-config");
  
    function openTradePlanConfigModal() {
      if (!tradePlanConfigModal) return;
      
      // Set checkboxes based on current config
      document.querySelectorAll(".trade-plan-param").forEach(cb => {
        const param = cb.dataset.param;
        cb.checked = tradePlanConfig[param] !== false;
      });
      
      tradePlanConfigModal.classList.remove("hidden");
    }
  
    function closeTradePlanConfigModal() {
      if (tradePlanConfigModal) {
        tradePlanConfigModal.classList.add("hidden");
      }
    }
  
    if (btnConfigureTradePlan) {
      btnConfigureTradePlan.addEventListener("click", openTradePlanConfigModal);
    }
  
    if (btnCloseTradePlanConfig) {
      btnCloseTradePlanConfig.addEventListener("click", closeTradePlanConfigModal);
    }
  
    if (btnSaveTradePlanConfig) {
      btnSaveTradePlanConfig.addEventListener("click", () => {
        // Get config from checkboxes
        const newConfig = { ...defaultConfig };
        document.querySelectorAll(".trade-plan-param").forEach(cb => {
          const param = cb.dataset.param;
          newConfig[param] = cb.checked;
        });
        
        tradePlanConfig = newConfig;
        saveTradePlanConfig(tradePlanConfig);
        applyTradePlanConfig(tradePlanConfig);
        closeTradePlanConfigModal();
      });
    }
  
    // Close modal when clicking outside
    if (tradePlanConfigModal) {
      tradePlanConfigModal.addEventListener("click", (e) => {
        if (e.target.id === "trade-plan-config-modal") {
          closeTradePlanConfigModal();
        }
      });
    }
  
    // ------- Symbol-Based Reports -------
    let currentReportRange = "1D";
    let symbolFilter = "";
  
    function getDateRange(range) {
      const now = new Date();
      const start = new Date();
  
      switch (range) {
        case "1D":
          start.setDate(now.getDate() - 1);
          break;
        case "7D":
          start.setDate(now.getDate() - 7);
          break;
        case "30D":
          start.setDate(now.getDate() - 30);
          break;
        case "custom":
          const startDateInput = document.getElementById("report-start-date");
          const endDateInput = document.getElementById("report-end-date");
          if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            return {
              start: new Date(startDateInput.value),
              end: new Date(endDateInput.value)
            };
          }
          return null;
        default:
          return { start: new Date(0), end: now };
      }
  
      return { start, end: now };
    }
  
    function filterTradesByDateRange(journal, dateRange) {
      if (!dateRange) return [];
      
      return journal.filter(trade => {
        const tradeDate = new Date(trade.timestamp);
        return tradeDate >= dateRange.start && tradeDate <= dateRange.end;
      });
    }
  
    function calculateSymbolReport(trades, symbolFilter) {
      const symbolStats = {};
  
      trades.forEach(trade => {
        if (!trade.instrument) return;
        
        // Apply symbol filter if provided
        if (symbolFilter && !trade.instrument.toLowerCase().includes(symbolFilter.toLowerCase())) {
          return;
        }
  
        const symbol = trade.instrument;
        if (!symbolStats[symbol]) {
          symbolStats[symbol] = {
            symbol: symbol,
            totalTrades: 0,
            totalPnl: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            avgPnl: 0
          };
        }
  
        const stats = symbolStats[symbol];
        stats.totalTrades++;
        
        if (trade.pnl !== undefined && trade.pnl !== null) {
          stats.totalPnl += trade.pnl;
          if (trade.result === "win") {
            stats.wins++;
          } else if (trade.result === "loss") {
            stats.losses++;
          }
        }
      });
  
      // Calculate win rate and average P&L
      Object.values(symbolStats).forEach(stats => {
        if (stats.totalTrades > 0) {
          stats.winRate = ((stats.wins / stats.totalTrades) * 100).toFixed(1);
          stats.avgPnl = (stats.totalPnl / stats.totalTrades).toFixed(2);
        }
      });
  
      return Object.values(symbolStats).sort((a, b) => b.totalPnl - a.totalPnl);
    }
  
    function renderSymbolReport(reportData) {
      const resultsEl = document.getElementById("symbol-report-results");
      if (!resultsEl) return;
  
      if (!reportData || reportData.length === 0) {
        resultsEl.innerHTML = `
          <div class="text-[12px] text-slate-500 text-center py-8">
            No trades found for the selected date range and filters
          </div>
        `;
        return;
      }
  
      // Calculate totals
      const totals = reportData.reduce((acc, stat) => {
        acc.totalTrades += stat.totalTrades;
        acc.totalPnl += parseFloat(stat.totalPnl);
        acc.wins += stat.wins;
        acc.losses += stat.losses;
        return acc;
      }, { totalTrades: 0, totalPnl: 0, wins: 0, losses: 0 });
  
      const overallWinRate = totals.totalTrades > 0 
        ? ((totals.wins / totals.totalTrades) * 100).toFixed(1) 
        : "0.0";
  
      let html = `
        <div class="overflow-x-auto">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="border-b border-[#161616]">
                <th class="text-left py-2 px-2 text-slate-400 font-medium">Symbol</th>
                <th class="text-right py-2 px-2 text-slate-400 font-medium">Trades</th>
                <th class="text-right py-2 px-2 text-slate-400 font-medium">Wins</th>
                <th class="text-right py-2 px-2 text-slate-400 font-medium">Losses</th>
                <th class="text-right py-2 px-2 text-slate-400 font-medium">Win Rate</th>
                <th class="text-right py-2 px-2 text-slate-400 font-medium">Total P&L</th>
                <th class="text-right py-2 px-2 text-slate-400 font-medium">Avg P&L</th>
              </tr>
            </thead>
            <tbody>
      `;
  
      reportData.forEach(stat => {
        const pnlClass = parseFloat(stat.totalPnl) >= 0 ? "text-emerald-300" : "text-rose-300";
        const avgPnlClass = parseFloat(stat.avgPnl) >= 0 ? "text-emerald-300" : "text-rose-300";
        
        html += `
          <tr class="border-b border-[#161616] hover:bg-[#0f0f0f]">
            <td class="py-2 px-2 text-slate-200 font-medium">${sanitizeHTML(stat.symbol)}</td>
            <td class="py-2 px-2 text-right text-slate-300">${stat.totalTrades}</td>
            <td class="py-2 px-2 text-right text-emerald-300">${stat.wins}</td>
            <td class="py-2 px-2 text-right text-rose-300">${stat.losses}</td>
            <td class="py-2 px-2 text-right text-slate-300">${stat.winRate}%</td>
            <td class="py-2 px-2 text-right ${pnlClass} font-medium">$${parseFloat(stat.totalPnl).toFixed(2)}</td>
            <td class="py-2 px-2 text-right ${avgPnlClass}">$${stat.avgPnl}</td>
          </tr>
        `;
      });
  
      html += `
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-[#262626] font-semibold">
                <td class="py-2 px-2 text-slate-200">Total</td>
                <td class="py-2 px-2 text-right text-slate-200">${totals.totalTrades}</td>
                <td class="py-2 px-2 text-right text-emerald-300">${totals.wins}</td>
                <td class="py-2 px-2 text-right text-rose-300">${totals.losses}</td>
                <td class="py-2 px-2 text-right text-slate-200">${overallWinRate}%</td>
                <td class="py-2 px-2 text-right ${totals.totalPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}">$${totals.totalPnl.toFixed(2)}</td>
                <td class="py-2 px-2 text-right text-slate-300">$${(totals.totalPnl / totals.totalTrades || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
  
      resultsEl.innerHTML = html;
    }
  
    function updateSymbolReport() {
      const journal = getFilteredJournal();
      const dateRange = getDateRange(currentReportRange);
      
      if (!dateRange) {
        const resultsEl = document.getElementById("symbol-report-results");
        if (resultsEl) {
          resultsEl.innerHTML = `
            <div class="text-[12px] text-slate-500 text-center py-8">
              Please select a valid date range
            </div>
          `;
        }
        return;
      }
  
      const filteredTrades = filterTradesByDateRange(journal, dateRange);
      const reportData = calculateSymbolReport(filteredTrades, symbolFilter);
      renderSymbolReport(reportData);
    }
  
    // Event listeners for report controls
    const reportRangeButtons = document.querySelectorAll(".symbol-report-range");
    reportRangeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const range = btn.dataset.reportRange;
        currentReportRange = range;
  
        // Update button styles
        reportRangeButtons.forEach(b => {
          b.classList.remove("bg-emerald-500/20", "border-emerald-500/30", "text-emerald-300");
          b.classList.add("bg-black/60", "border-[#262626]", "text-slate-300");
        });
        btn.classList.remove("bg-black/60", "border-[#262626]", "text-slate-300");
        btn.classList.add("bg-emerald-500/20", "border-emerald-500/30", "text-emerald-300");
  
        // Show/hide custom date range inputs
        const customDateRange = document.getElementById("custom-date-range");
        if (range === "custom") {
          if (customDateRange) customDateRange.classList.remove("hidden");
        } else {
          if (customDateRange) customDateRange.classList.add("hidden");
        }
  
        updateSymbolReport();
      });
    });
  
    // Custom date range inputs
    const startDateInput = document.getElementById("report-start-date");
    const endDateInput = document.getElementById("report-end-date");
    
    if (startDateInput) {
      startDateInput.addEventListener("change", () => {
        if (currentReportRange === "custom") {
          updateSymbolReport();
        }
      });
    }
    
    if (endDateInput) {
      endDateInput.addEventListener("change", () => {
        if (currentReportRange === "custom") {
          updateSymbolReport();
        }
      });
    }
  
    // Symbol filter input
    const symbolFilterInput = document.getElementById("symbol-filter-input");
    if (symbolFilterInput) {
      let filterTimeout;
      symbolFilterInput.addEventListener("input", (e) => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
          symbolFilter = e.target.value.trim();
          updateSymbolReport();
        }, 300);
      });
    }
  
    // Initialize report with default range
    updateSymbolReport();
  
    // Trade Reviews Tab Handlers
    const reviewTabs = document.querySelectorAll(".review-tab");
    reviewTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const tabValue = tab.dataset.tab;
        currentReviewTab = tabValue;
        
        // Update tab styles
        reviewTabs.forEach(t => {
          t.classList.remove("border-emerald-500", "text-emerald-300");
          t.classList.add("border-transparent", "text-slate-400");
        });
        tab.classList.remove("border-transparent", "text-slate-400");
        tab.classList.add("border-emerald-500", "text-emerald-300");
        
        // Re-render reviews
        if (window.renderTradeReviews) {
          window.renderTradeReviews();
        }
      });
    });
  
    // Statistics Dashboard Period Tabs
    const statsTabs = document.querySelectorAll(".stats-tab");
    statsTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const period = tab.dataset.period;
        currentStatsPeriod = period;
        
        // Update tab styles
        statsTabs.forEach(t => {
          t.classList.remove("border-emerald-500", "text-emerald-300");
          t.classList.add("border-transparent", "text-slate-400", "hover:text-slate-300");
        });
        tab.classList.remove("border-transparent", "text-slate-400", "hover:text-slate-300");
        tab.classList.add("border-emerald-500", "text-emerald-300");
        
        // Re-render statistics
        if (window.renderStatisticsDashboard) {
          window.renderStatisticsDashboard(period);
        }
      });
    });
  
    // Journaled Trades Collapsible Toggle
    const toggleJournalBtn = document.getElementById("toggle-journaled-trades");
    const journalContent = document.getElementById("journaled-trades-content");
    const journalArrow = document.getElementById("journal-arrow");
    
    if (toggleJournalBtn && journalContent && journalArrow) {
      toggleJournalBtn.addEventListener("click", () => {
        const isHidden = journalContent.classList.contains("hidden");
        if (isHidden) {
          journalContent.classList.remove("hidden");
          journalArrow.style.transform = "rotate(180deg)";
        } else {
          journalContent.classList.add("hidden");
          journalArrow.style.transform = "rotate(0deg)";
        }
      });
    }
  
    // ------- Symbol Management -------
    let symbolSearchQuery = "";
    let symbolMarketFilter = "";
  
    function addSymbol(symbol, name, market, category) {
      // Validate inputs
      const validSymbol = validateText(symbol, { maxLength: 20, allowEmpty: false });
      const validName = validateText(name, { maxLength: 100, allowEmpty: false });
      const validMarket = validateText(market, { maxLength: 30, allowEmpty: false });
      const validCategory = validateText(category, { maxLength: 50, allowEmpty: true });
      
      if (!validSymbol || !validName || !validMarket) {
        alert("Please fill in Symbol, Name, and Market fields.");
        return false;
      }
      
      const symbols = loadSymbols();
      
      // Check if symbol already exists
      if (symbols.some(s => s.symbol.toLowerCase() === validSymbol.toLowerCase())) {
        alert(`Symbol "${validSymbol}" already exists in the database.`);
        return false;
      }
  
      const newSymbol = {
        symbol: validSymbol.toUpperCase(),
        name: validName,
        market: validMarket.toLowerCase(),
        category: validCategory || ""
      };
  
      symbols.push(newSymbol);
      saveSymbols(symbols);
      return true;
    }
  
    function deleteSymbol(symbolToDelete) {
      if (!confirm(`Are you sure you want to delete "${symbolToDelete}"?`)) {
        return;
      }
  
      const symbols = loadSymbols();
      const filtered = symbols.filter(s => s.symbol !== symbolToDelete);
      saveSymbols(filtered);
      renderSymbolsList();
    }
  
    function renderSymbolsList() {
      const symbolsListEl = document.getElementById("symbols-list");
      const symbolsEmptyEl = document.getElementById("symbols-empty");
      
      if (!symbolsListEl) return;
  
      let symbols = loadSymbols();
  
      // Apply filters
      if (symbolSearchQuery) {
        const query = symbolSearchQuery.toLowerCase();
        symbols = symbols.filter(s => 
          s.symbol.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          (s.category && s.category.toLowerCase().includes(query))
        );
      }
  
      if (symbolMarketFilter) {
        symbols = symbols.filter(s => s.market === symbolMarketFilter);
      }
  
      // Sort by symbol
      symbols.sort((a, b) => a.symbol.localeCompare(b.symbol));
  
      symbolsListEl.innerHTML = "";
  
      if (symbols.length === 0) {
        symbolsEmptyEl.classList.remove("hidden");
        return;
      }
  
      symbolsEmptyEl.classList.add("hidden");
  
      symbols.forEach(symbol => {
        const row = document.createElement("div");
        row.className = "flex items-center justify-between p-3 rounded-lg bg-black/40 border border-[#161616] hover:bg-black/60 transition-colors";
        
        row.innerHTML = `
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <span class="text-[12px] font-medium text-slate-200">${sanitizeHTML(symbol.symbol)}</span>
              <span class="text-[10px] text-slate-400">${sanitizeHTML(symbol.name)}</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] px-2 py-0.5 rounded bg-[#181818] text-slate-400 uppercase">${sanitizeHTML(symbol.market)}</span>
              ${symbol.category ? `<span class="text-[10px] text-slate-500">${sanitizeHTML(symbol.category)}</span>` : ""}
            </div>
          </div>
          <button
            data-symbol="${sanitizeHTML(symbol.symbol)}"
            class="symbol-delete-btn px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            Delete
          </button>
        `;
  
        symbolsListEl.appendChild(row);
      });
  
      // Add delete event listeners
      symbolsListEl.querySelectorAll(".symbol-delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const symbol = btn.dataset.symbol;
          deleteSymbol(symbol);
        });
      });
    }
  
    // Add symbol form
    const btnAddSymbol = document.getElementById("btn-add-symbol");
    if (btnAddSymbol) {
      btnAddSymbol.addEventListener("click", () => {
        const symbolInput = document.getElementById("new-symbol-symbol");
        const nameInput = document.getElementById("new-symbol-name");
        const marketSelect = document.getElementById("new-symbol-market");
        const categoryInput = document.getElementById("new-symbol-category");
  
        if (!symbolInput || !nameInput || !marketSelect) return;
  
        const symbol = symbolInput.value.trim();
        const name = nameInput.value.trim();
        const market = marketSelect.value;
        const category = categoryInput ? categoryInput.value.trim() : "";
  
        if (!symbol || !name || !market) {
          alert("Please fill in all required fields (Symbol, Name, Market).");
          return;
        }
  
        if (addSymbol(symbol, name, market, category)) {
          // Clear form
          symbolInput.value = "";
          nameInput.value = "";
          marketSelect.value = "";
          if (categoryInput) categoryInput.value = "";
          
          // Refresh list
          renderSymbolsList();
          
          // Show success message
          const successMsg = document.createElement("div");
          successMsg.className = "mt-2 text-[11px] text-emerald-300";
          successMsg.textContent = `Symbol "${symbol}" added successfully!`;
          btnAddSymbol.parentElement.appendChild(successMsg);
          setTimeout(() => successMsg.remove(), 3000);
        }
      });
    }
  
    // Symbol search
    const symbolSearchInput = document.getElementById("symbol-search");
    if (symbolSearchInput) {
      let searchTimeout;
      symbolSearchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          symbolSearchQuery = e.target.value.trim();
          renderSymbolsList();
        }, 300);
      });
    }
  
    // Market filter
    const symbolMarketFilterSelect = document.getElementById("symbol-market-filter");
    if (symbolMarketFilterSelect) {
      symbolMarketFilterSelect.addEventListener("change", (e) => {
        symbolMarketFilter = e.target.value;
        renderSymbolsList();
      });
    }
  
    // Render symbols list on section load
    const symbolsSection = document.getElementById("symbols");
    if (symbolsSection) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (!symbolsSection.classList.contains("hidden")) {
            renderSymbolsList();
          }
        });
      });
      observer.observe(symbolsSection, { attributes: true, attributeFilter: ["class"] });
    }
  
    // Initial render
    renderSymbolsList();
  
    // ------- Settings Modal -------
    let currentPrepConfig = loadPrepConfig();
    let currentChecklistConfig = loadChecklistConfig();
    let editingPrepGroup = null;
    let editingChecklistCategory = null;
  
    const settingsModal = document.getElementById('settings-modal');
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanels = document.querySelectorAll('.settings-panel');
  
    // Open/close settings modal
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        renderSettingsPrepGroups();
        renderSettingsPrepNotes();
        renderSettingsChecklistCategories();
        loadChecklistSettings();
      });
    }
  
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
      });
    }
  
    // Settings tabs
    settingsTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.settingsTab;
        
        settingsTabs.forEach(t => {
          if (t.dataset.settingsTab === targetTab) {
            t.classList.add('bg-[#181818]', 'text-white');
            t.classList.remove('text-slate-400');
          } else {
            t.classList.remove('bg-[#181818]', 'text-white');
            t.classList.add('text-slate-400');
          }
        });
  
        settingsPanels.forEach(panel => {
          if (panel.id === `settings-${targetTab}`) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        });
      });
    });
  
    // ------- Daily Prep Settings -------
    function renderSettingsPrepGroups() {
      const container = document.getElementById('prep-groups-list');
      if (!container) return;
  
      container.innerHTML = '';
      currentPrepConfig.groups.forEach((group, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 rounded-lg bg-black/50 border border-[#1f1f1f]';
        div.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-slate-500 text-[11px]">${index + 1}</span>
            <div>
              <div class="text-[12px] text-slate-200">${sanitizeHTML(group.title)}</div>
              <div class="text-[10px] text-slate-500">${group.fields.length} fields</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="edit-prep-group px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white hover:bg-[#181818]" data-group-id="${group.id}">
              Edit
            </button>
          </div>
        `;
        container.appendChild(div);
      });
  
      // Add edit event listeners
      container.querySelectorAll('.edit-prep-group').forEach(btn => {
        btn.addEventListener('click', () => {
          const groupId = btn.dataset.groupId;
          openEditPrepGroupModal(groupId);
        });
      });
    }
  
    function renderSettingsPrepNotes() {
      const container = document.getElementById('prep-notes-list');
      if (!container) return;
  
      container.innerHTML = '';
      currentPrepConfig.notes.forEach((note, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 rounded-lg bg-black/50 border border-[#1f1f1f]';
        div.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-slate-500 text-[11px]">${index + 1}</span>
            <div>
              <div class="text-[12px] text-slate-200">${sanitizeHTML(note.title)}</div>
              <div class="text-[10px] text-slate-500 truncate max-w-[200px]">${sanitizeHTML(note.placeholder)}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="edit-prep-note px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white hover:bg-[#181818]" data-note-id="${note.id}">
              Edit
            </button>
            <button class="delete-prep-note px-2 py-1 rounded text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" data-note-id="${note.id}">
              ×
            </button>
          </div>
        `;
        container.appendChild(div);
      });
  
      // Add event listeners
      container.querySelectorAll('.edit-prep-note').forEach(btn => {
        btn.addEventListener('click', () => {
          const noteId = btn.dataset.noteId;
          const note = currentPrepConfig.notes.find(n => n.id === noteId);
          if (note) {
            const newTitle = prompt('Note title:', note.title);
            if (newTitle !== null) {
              note.title = newTitle.trim() || note.title;
              const newPlaceholder = prompt('Placeholder text:', note.placeholder);
              if (newPlaceholder !== null) {
                note.placeholder = newPlaceholder.trim();
              }
              savePrepConfig(currentPrepConfig);
              renderSettingsPrepNotes();
              renderDailyPrepFromConfig();
            }
          }
        });
      });
  
      container.querySelectorAll('.delete-prep-note').forEach(btn => {
        btn.addEventListener('click', () => {
          const noteId = btn.dataset.noteId;
          if (confirm('Delete this note field?')) {
            currentPrepConfig.notes = currentPrepConfig.notes.filter(n => n.id !== noteId);
            savePrepConfig(currentPrepConfig);
            renderSettingsPrepNotes();
            renderDailyPrepFromConfig();
          }
        });
      });
    }
  
    // Add prep note
    const btnAddPrepNote = document.getElementById('btn-add-prep-note');
    if (btnAddPrepNote) {
      btnAddPrepNote.addEventListener('click', () => {
        const title = prompt('Note title:');
        if (title && title.trim()) {
          const placeholder = prompt('Placeholder text:') || '';
          currentPrepConfig.notes.push({
            id: generateId(),
            title: title.trim(),
            placeholder: placeholder.trim()
          });
          savePrepConfig(currentPrepConfig);
          renderSettingsPrepNotes();
          renderDailyPrepFromConfig();
        }
      });
    }
  
    // Add prep group
    const btnAddPrepGroup = document.getElementById('btn-add-prep-group');
    if (btnAddPrepGroup) {
      btnAddPrepGroup.addEventListener('click', () => {
        const newGroup = {
          id: generateId(),
          title: 'New Group',
          fields: []
        };
        currentPrepConfig.groups.push(newGroup);
        savePrepConfig(currentPrepConfig);
        renderSettingsPrepGroups();
        openEditPrepGroupModal(newGroup.id);
      });
    }
  
    // Reset prep to defaults
    const btnResetPrepDefaults = document.getElementById('btn-reset-prep-defaults');
    if (btnResetPrepDefaults) {
      btnResetPrepDefaults.addEventListener('click', () => {
        if (confirm('Reset Daily Prep to default configuration? This will remove all customizations.')) {
          currentPrepConfig = JSON.parse(JSON.stringify(DEFAULT_PREP_CONFIG));
          savePrepConfig(currentPrepConfig);
          renderSettingsPrepGroups();
          renderSettingsPrepNotes();
          renderDailyPrepFromConfig();
        }
      });
    }
  
    // ------- Edit Prep Group Modal -------
    const editPrepGroupModal = document.getElementById('edit-prep-group-modal');
    const btnCloseEditPrepGroup = document.getElementById('btn-close-edit-prep-group');
    const btnSavePrepGroup = document.getElementById('btn-save-prep-group');
    const btnDeletePrepGroup = document.getElementById('btn-delete-prep-group');
    const btnAddPrepField = document.getElementById('btn-add-prep-field');
  
    function openEditPrepGroupModal(groupId) {
      editingPrepGroup = currentPrepConfig.groups.find(g => g.id === groupId);
      if (!editingPrepGroup) return;
  
      document.getElementById('edit-prep-group-title').textContent = 'Edit Group';
      document.getElementById('edit-prep-group-name').value = editingPrepGroup.title;
      renderPrepGroupFields();
      editPrepGroupModal.classList.remove('hidden');
    }
  
    function renderPrepGroupFields() {
      const container = document.getElementById('edit-prep-group-fields');
      if (!container || !editingPrepGroup) return;
  
      container.innerHTML = '';
      editingPrepGroup.fields.forEach((field, index) => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-lg bg-black border border-[#222] space-y-2';
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Field ${index + 1}</span>
            <button class="delete-prep-field text-[10px] text-rose-400 hover:text-rose-300" data-field-index="${index}">Remove</button>
          </div>
          <input type="text" class="field-label w-full px-2 py-1 rounded border border-[#222] bg-black/50 text-[11px] text-slate-100" placeholder="Label" value="${sanitizeHTML(field.label)}" data-field-index="${index}" />
          <select class="field-type w-full px-2 py-1 rounded border border-[#222] bg-black/50 text-[11px] text-slate-100" data-field-index="${index}">
            <option value="input" ${field.type === 'input' ? 'selected' : ''}>Text Input</option>
            <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>Textarea</option>
            <option value="select" ${field.type === 'select' ? 'selected' : ''}>Dropdown</option>
            <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
          </select>
          ${field.type === 'select' ? `
            <input type="text" class="field-options w-full px-2 py-1 rounded border border-[#222] bg-black/50 text-[11px] text-slate-100" placeholder="Options (comma separated)" value="${sanitizeHTML((field.options || []).join(', '))}" data-field-index="${index}" />
          ` : ''}
          ${field.type === 'input' || field.type === 'textarea' ? `
            <input type="text" class="field-placeholder w-full px-2 py-1 rounded border border-[#222] bg-black/50 text-[11px] text-slate-100" placeholder="Placeholder text" value="${sanitizeHTML(field.placeholder || '')}" data-field-index="${index}" />
          ` : ''}
        `;
        container.appendChild(div);
      });
  
      // Add event listeners
      container.querySelectorAll('.delete-prep-field').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.fieldIndex);
          editingPrepGroup.fields.splice(index, 1);
          renderPrepGroupFields();
        });
      });
  
      container.querySelectorAll('.field-label').forEach(input => {
        input.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.fieldIndex);
          editingPrepGroup.fields[index].label = e.target.value;
        });
      });
  
      container.querySelectorAll('.field-type').forEach(select => {
        select.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.fieldIndex);
          editingPrepGroup.fields[index].type = e.target.value;
          if (e.target.value === 'select' && !editingPrepGroup.fields[index].options) {
            editingPrepGroup.fields[index].options = ['–'];
          }
          renderPrepGroupFields();
        });
      });
  
      container.querySelectorAll('.field-options').forEach(input => {
        input.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.fieldIndex);
          editingPrepGroup.fields[index].options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
        });
      });
  
      container.querySelectorAll('.field-placeholder').forEach(input => {
        input.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.fieldIndex);
          editingPrepGroup.fields[index].placeholder = e.target.value;
        });
      });
    }
  
    if (btnAddPrepField) {
      btnAddPrepField.addEventListener('click', () => {
        if (!editingPrepGroup) return;
        editingPrepGroup.fields.push({
          id: generateId(),
          label: 'New Field',
          type: 'input',
          placeholder: ''
        });
        renderPrepGroupFields();
      });
    }
  
    if (btnCloseEditPrepGroup) {
      btnCloseEditPrepGroup.addEventListener('click', () => {
        editPrepGroupModal.classList.add('hidden');
        editingPrepGroup = null;
      });
    }
  
    if (btnSavePrepGroup) {
      btnSavePrepGroup.addEventListener('click', () => {
        if (!editingPrepGroup) return;
        editingPrepGroup.title = document.getElementById('edit-prep-group-name').value.trim() || 'Untitled';
        savePrepConfig(currentPrepConfig);
        renderSettingsPrepGroups();
        renderDailyPrepFromConfig();
        editPrepGroupModal.classList.add('hidden');
        editingPrepGroup = null;
      });
    }
  
    if (btnDeletePrepGroup) {
      btnDeletePrepGroup.addEventListener('click', () => {
        if (!editingPrepGroup) return;
        if (confirm('Delete this group and all its fields?')) {
          currentPrepConfig.groups = currentPrepConfig.groups.filter(g => g.id !== editingPrepGroup.id);
          savePrepConfig(currentPrepConfig);
          renderSettingsPrepGroups();
          renderDailyPrepFromConfig();
          editPrepGroupModal.classList.add('hidden');
          editingPrepGroup = null;
        }
      });
    }
  
    // ------- Trade Checklist Settings -------
    function renderSettingsChecklistCategories() {
      const container = document.getElementById('checklist-categories-list');
      if (!container) return;
  
      container.innerHTML = '';
      currentChecklistConfig.categories.forEach((category, index) => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-lg bg-black/50 border border-[#1f1f1f]';
        div.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <span class="text-slate-500 text-[11px]">${category.number}.</span>
              <div>
                <div class="text-[12px] text-slate-200">${sanitizeHTML(category.title)}</div>
                <div class="text-[10px] text-slate-500">${sanitizeHTML(category.subtitle)}</div>
              </div>
            </div>
            <button class="edit-checklist-category px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white hover:bg-[#181818]" data-category-id="${category.id}">
              Edit
            </button>
          </div>
          <div class="text-[10px] text-slate-500">${category.items.length} items • Total weight: ${category.items.reduce((sum, item) => sum + item.weight, 0)}</div>
        `;
        container.appendChild(div);
      });
  
      // Add edit event listeners
      container.querySelectorAll('.edit-checklist-category').forEach(btn => {
        btn.addEventListener('click', () => {
          const categoryId = btn.dataset.categoryId;
          openEditChecklistCategoryModal(categoryId);
        });
      });
    }
  
    function loadChecklistSettings() {
      const minScoreInput = document.getElementById('settings-min-score');
      const qualityLabelsSelect = document.getElementById('settings-quality-labels');
      
      if (minScoreInput) {
        minScoreInput.value = currentChecklistConfig.settings?.minScore || 70;
        minScoreInput.addEventListener('change', () => {
          if (!currentChecklistConfig.settings) currentChecklistConfig.settings = {};
          currentChecklistConfig.settings.minScore = parseInt(minScoreInput.value) || 70;
          saveChecklistConfig(currentChecklistConfig);
        });
      }
      
      if (qualityLabelsSelect) {
        qualityLabelsSelect.value = currentChecklistConfig.settings?.qualityLabels || 'default';
        qualityLabelsSelect.addEventListener('change', () => {
          if (!currentChecklistConfig.settings) currentChecklistConfig.settings = {};
          currentChecklistConfig.settings.qualityLabels = qualityLabelsSelect.value;
          saveChecklistConfig(currentChecklistConfig);
        });
      }
    }
  
    // Add checklist category
    const btnAddChecklistCategory = document.getElementById('btn-add-checklist-category');
    if (btnAddChecklistCategory) {
      btnAddChecklistCategory.addEventListener('click', () => {
        const newCategory = {
          id: generateId(),
          number: String(currentChecklistConfig.categories.length + 1),
          title: 'New Category',
          subtitle: 'Description',
          description: 'Add description here.',
          items: []
        };
        currentChecklistConfig.categories.push(newCategory);
        saveChecklistConfig(currentChecklistConfig);
        renderSettingsChecklistCategories();
        openEditChecklistCategoryModal(newCategory.id);
      });
    }
  
    // Reset checklist to defaults
    const btnResetChecklistDefaults = document.getElementById('btn-reset-checklist-defaults');
    if (btnResetChecklistDefaults) {
      btnResetChecklistDefaults.addEventListener('click', () => {
        if (confirm('Reset Trade Checklist to default configuration? This will remove all customizations.')) {
          currentChecklistConfig = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_CONFIG));
          saveChecklistConfig(currentChecklistConfig);
          renderSettingsChecklistCategories();
          loadChecklistSettings();
          renderChecklistFromConfig();
        }
      });
    }
  
    // ------- Edit Checklist Category Modal -------
    const editChecklistCategoryModal = document.getElementById('edit-checklist-category-modal');
    const btnCloseEditChecklistCategory = document.getElementById('btn-close-edit-checklist-category');
    const btnSaveChecklistCategory = document.getElementById('btn-save-checklist-category');
    const btnDeleteChecklistCategory = document.getElementById('btn-delete-checklist-category');
    const btnAddChecklistItem = document.getElementById('btn-add-checklist-item');
  
    function openEditChecklistCategoryModal(categoryId) {
      editingChecklistCategory = currentChecklistConfig.categories.find(c => c.id === categoryId);
      if (!editingChecklistCategory) return;
  
      document.getElementById('edit-checklist-category-title').textContent = 'Edit Category';
      document.getElementById('edit-checklist-category-number').value = editingChecklistCategory.number;
      document.getElementById('edit-checklist-category-id').value = editingChecklistCategory.id;
      document.getElementById('edit-checklist-category-title-input').value = editingChecklistCategory.title;
      document.getElementById('edit-checklist-category-subtitle').value = editingChecklistCategory.subtitle;
      document.getElementById('edit-checklist-category-description').value = editingChecklistCategory.description;
      renderChecklistCategoryItems();
      editChecklistCategoryModal.classList.remove('hidden');
    }
  
    function renderChecklistCategoryItems() {
      const container = document.getElementById('edit-checklist-category-items');
      if (!container || !editingChecklistCategory) return;
  
      container.innerHTML = '';
      editingChecklistCategory.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-lg bg-black border border-[#222] space-y-2';
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Item ${index + 1}</span>
            <button class="delete-checklist-item text-[10px] text-rose-400 hover:text-rose-300" data-item-index="${index}">Remove</button>
          </div>
          <textarea class="item-text w-full px-2 py-1 rounded border border-[#222] bg-black/50 text-[11px] text-slate-100" rows="2" placeholder="Checklist item text" data-item-index="${index}">${sanitizeHTML(item.text)}</textarea>
          <div class="flex items-center gap-2">
            <label class="text-[10px] text-slate-400">Weight:</label>
            <select class="item-weight px-2 py-1 rounded border border-[#222] bg-black/50 text-[11px] text-slate-100" data-item-index="${index}">
              <option value="1" ${item.weight === 1 ? 'selected' : ''}>1 (Low)</option>
              <option value="2" ${item.weight === 2 ? 'selected' : ''}>2 (High)</option>
              <option value="3" ${item.weight === 3 ? 'selected' : ''}>3 (Critical)</option>
            </select>
          </div>
        `;
        container.appendChild(div);
      });
  
      // Add event listeners
      container.querySelectorAll('.delete-checklist-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.itemIndex);
          editingChecklistCategory.items.splice(index, 1);
          renderChecklistCategoryItems();
        });
      });
  
      container.querySelectorAll('.item-text').forEach(textarea => {
        textarea.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.itemIndex);
          editingChecklistCategory.items[index].text = e.target.value;
        });
      });
  
      container.querySelectorAll('.item-weight').forEach(select => {
        select.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.itemIndex);
          editingChecklistCategory.items[index].weight = parseInt(e.target.value);
        });
      });
    }
  
    if (btnAddChecklistItem) {
      btnAddChecklistItem.addEventListener('click', () => {
        if (!editingChecklistCategory) return;
        editingChecklistCategory.items.push({
          text: 'New checklist item',
          weight: 1
        });
        renderChecklistCategoryItems();
      });
    }
  
    if (btnCloseEditChecklistCategory) {
      btnCloseEditChecklistCategory.addEventListener('click', () => {
        editChecklistCategoryModal.classList.add('hidden');
        editingChecklistCategory = null;
      });
    }
  
    if (btnSaveChecklistCategory) {
      btnSaveChecklistCategory.addEventListener('click', () => {
        if (!editingChecklistCategory) return;
        editingChecklistCategory.number = document.getElementById('edit-checklist-category-number').value.trim() || '1';
        editingChecklistCategory.title = document.getElementById('edit-checklist-category-title-input').value.trim() || 'Untitled';
        editingChecklistCategory.subtitle = document.getElementById('edit-checklist-category-subtitle').value.trim();
        editingChecklistCategory.description = document.getElementById('edit-checklist-category-description').value.trim();
        saveChecklistConfig(currentChecklistConfig);
        renderSettingsChecklistCategories();
        renderChecklistFromConfig();
        editChecklistCategoryModal.classList.add('hidden');
        editingChecklistCategory = null;
      });
    }
  
    if (btnDeleteChecklistCategory) {
      btnDeleteChecklistCategory.addEventListener('click', () => {
        if (!editingChecklistCategory) return;
        if (confirm('Delete this category and all its items?')) {
          currentChecklistConfig.categories = currentChecklistConfig.categories.filter(c => c.id !== editingChecklistCategory.id);
          saveChecklistConfig(currentChecklistConfig);
          renderSettingsChecklistCategories();
          renderChecklistFromConfig();
          editChecklistCategoryModal.classList.add('hidden');
          editingChecklistCategory = null;
        }
      });
    }
  
    // ------- Render Daily Prep from Config -------
    function renderDailyPrepFromConfig() {
      const prepSection = document.getElementById('prep');
      if (!prepSection) return;
  
      // Find the grid container for groups
      const groupsGrid = prepSection.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      if (groupsGrid) {
        groupsGrid.innerHTML = '';
        
        currentPrepConfig.groups.forEach(group => {
          const groupDiv = document.createElement('div');
          groupDiv.className = 'rounded-2xl bg-[#0a0a0a] border border-[#161616] p-4';
          
          let fieldsHTML = `<div class="mb-2 text-slate-300 font-medium">${sanitizeHTML(group.title)}</div>`;
          
          group.fields.forEach(field => {
            const fieldId = `prep-${field.id}`;
            
            if (field.type === 'checkbox') {
              fieldsHTML += `
                <label class="flex items-center gap-2 mb-2">
                  <input id="${fieldId}" type="checkbox" class="rounded border-[#333] bg-black" />
                  <span class="text-slate-300 text-[12px]">${sanitizeHTML(field.label)}</span>
                </label>
              `;
            } else if (field.type === 'select') {
              const optionsHTML = (field.options || ['–']).map(opt => 
                `<option value="${opt === '–' ? '' : opt.toLowerCase()}">${sanitizeHTML(opt)}</option>`
              ).join('');
              fieldsHTML += `
                <label class="block mb-2">
                  <span class="text-slate-500">${sanitizeHTML(field.label)}</span>
                  <select id="${fieldId}" class="mt-1 w-full px-3 py-2 rounded-lg border border-[#222] bg-black text-slate-100 text-[12px] focus:outline-none focus:border-slate-400">
                    ${optionsHTML}
                  </select>
                </label>
              `;
            } else if (field.type === 'textarea') {
              fieldsHTML += `
                <label class="block mb-2">
                  <span class="text-slate-500">${sanitizeHTML(field.label)}</span>
                  <textarea id="${fieldId}" rows="${field.rows || 3}" class="mt-1 w-full px-3 py-2 rounded-lg border border-[#222] bg-black text-slate-100 text-[12px] focus:outline-none focus:border-slate-400" placeholder="${sanitizeHTML(field.placeholder || '')}"></textarea>
                </label>
              `;
            } else {
              // Default to input
              fieldsHTML += `
                <label class="block mb-2">
                  <span class="text-slate-500">${sanitizeHTML(field.label)}</span>
                  <div class="relative mt-1">
                    <input id="${fieldId}" class="w-full px-3 py-2 rounded-lg border border-[#222] bg-black text-slate-100 text-[12px] focus:outline-none focus:border-slate-400" placeholder="${sanitizeHTML(field.placeholder || '')}" autocomplete="off" />
                    ${field.autocomplete ? `<div id="${fieldId}-autocomplete" class="absolute z-50 w-full mt-1 bg-black border border-[#222] rounded-lg shadow-lg max-h-60 overflow-y-auto hidden"></div>` : ''}
                  </div>
                </label>
              `;
            }
          });
          
          groupDiv.innerHTML = fieldsHTML;
          groupsGrid.appendChild(groupDiv);
        });
      }
  
      // Find the notes grid container
      const notesGrid = prepSection.querySelector('.grid.md\\:grid-cols-2.gap-4');
      if (notesGrid && notesGrid.closest('.mt-6')) {
        notesGrid.innerHTML = '';
        
        currentPrepConfig.notes.forEach(note => {
          const noteDiv = document.createElement('div');
          noteDiv.className = 'rounded-2xl bg-[#0a0a0a] border border-[#161616] p-4';
          noteDiv.innerHTML = `
            <label class="block">
              <span class="text-slate-500 font-medium mb-2 block">${sanitizeHTML(note.title)}</span>
              <textarea id="prep-${note.id}" rows="4" class="w-full px-3 py-2 rounded-lg border border-[#222] bg-black text-slate-100 text-[12px] focus:outline-none focus:border-slate-400" placeholder="${sanitizeHTML(note.placeholder)}"></textarea>
            </label>
          `;
          notesGrid.appendChild(noteDiv);
        });
      }
  
      // Re-initialize autocomplete for instrument fields if needed
      initPrepAutocomplete();
    }
  
    function initPrepAutocomplete() {
      // Re-init autocomplete for any fields with autocomplete enabled
      currentPrepConfig.groups.forEach(group => {
        group.fields.forEach(field => {
          if (field.autocomplete) {
            const input = document.getElementById(`prep-${field.id}`);
            const dropdown = document.getElementById(`prep-${field.id}-autocomplete`);
            if (input && dropdown) {
              setupAutocomplete(input, dropdown);
            }
          }
        });
      });
    }
  
    function setupAutocomplete(input, dropdown) {
      let selectedIdx = -1;
      let suggestions = [];
  
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length < 1) {
          dropdown.classList.add('hidden');
          selectedIdx = -1;
          return;
        }
  
        suggestions = searchSymbols(query);
        if (!suggestions || suggestions.length === 0) {
          dropdown.classList.add('hidden');
          return;
        }
  
        dropdown.innerHTML = '';
        suggestions.forEach((symbol, index) => {
          const item = document.createElement('div');
          item.className = `px-3 py-2 text-[12px] cursor-pointer hover:bg-[#181818] border-b border-[#161616] last:border-b-0 ${index === selectedIdx ? 'bg-[#181818]' : ''}`;
          item.innerHTML = `
            <div class="flex items-center justify-between">
              <div>
                <div class="text-slate-200 font-medium">${sanitizeHTML(symbol.symbol)}</div>
                <div class="text-[10px] text-slate-400">${sanitizeHTML(symbol.name)}</div>
              </div>
              <span class="text-[10px] text-slate-500 uppercase">${sanitizeHTML(symbol.market)}</span>
            </div>
          `;
          item.addEventListener('click', () => {
            input.value = symbol.symbol;
            dropdown.classList.add('hidden');
            selectedIdx = -1;
          });
          dropdown.appendChild(item);
        });
        dropdown.classList.remove('hidden');
        selectedIdx = -1;
      });
  
      input.addEventListener('keydown', (e) => {
        if (!dropdown.classList.contains('hidden') && suggestions.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = Math.min(selectedIdx + 1, suggestions.length - 1);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = Math.max(selectedIdx - 1, -1);
          } else if (e.key === 'Enter' && selectedIdx >= 0) {
            e.preventDefault();
            input.value = suggestions[selectedIdx].symbol;
            dropdown.classList.add('hidden');
            selectedIdx = -1;
          } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
            selectedIdx = -1;
          }
        }
      });
  
      document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.add('hidden');
          selectedIdx = -1;
        }
      });
    }
  
    // ------- Render Checklist from Config -------
    function renderChecklistFromConfig() {
      const checklistSection = document.getElementById('checklist');
      if (!checklistSection) return;
  
      // Find the checklist container (the left column in the grid)
      const checklistContainer = checklistSection.querySelector('.grid.md\\:grid-cols-2 .space-y-4');
      if (!checklistContainer) return;
  
      checklistContainer.innerHTML = '';
  
      currentChecklistConfig.categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'rounded-2xl bg-[#0a0a0a] border border-[#161616] p-4';
        categoryDiv.setAttribute('data-group', category.id);
  
        let itemsHTML = '';
        category.items.forEach(item => {
          itemsHTML += `
            <label class="flex items-center gap-2">
              <input type="checkbox" class="crit" data-weight="${item.weight}" />
              <span>${sanitizeHTML(item.text)}</span>
            </label>
          `;
        });
  
        categoryDiv.innerHTML = `
          <div class="flex items-baseline justify-between gap-4 mb-1">
            <div>
              <div class="text-[10px] uppercase tracking-[0.18em] text-slate-500">${sanitizeHTML(category.number)}. ${sanitizeHTML(category.title)}</div>
              <div class="text-[13px] font-medium">${sanitizeHTML(category.subtitle)}</div>
            </div>
          </div>
          <p class="text-[11px] text-slate-500 mb-2">${sanitizeHTML(category.description)}</p>
          <div class="flex flex-col gap-2">
            ${itemsHTML}
          </div>
        `;
  
        checklistContainer.appendChild(categoryDiv);
      });
  
      // Re-initialize the checklist scoring
      reinitChecklistScoring();
    }
  
    function reinitChecklistScoring() {
      // Re-query all crit inputs and re-attach event listeners
      const newCritInputs = document.querySelectorAll('.crit');
      newCritInputs.forEach(input => {
        input.addEventListener('change', () => {
          recalcGrade();
        });
      });
    }
  
    function recalcGrade() {
      const critInputs = document.querySelectorAll('.crit');
      const gradeScoreEl = document.getElementById('grade-score');
      const gradeLabelEl = document.getElementById('grade-label');
      const gradeAllowedEl = document.getElementById('grade-allowed');
      const summaryTextEl = document.getElementById('summary-text');
  
      let maxScore = 0;
      let score = 0;
  
      critInputs.forEach((el) => {
        const w = Number(el.dataset.weight || 1);
        maxScore += w;
        if (el.checked) score += w;
      });
  
      if (maxScore === 0) {
        if (gradeScoreEl) gradeScoreEl.textContent = '0';
        if (gradeLabelEl) gradeLabelEl.textContent = 'Not rated';
        return;
      }
  
      const pct = Math.round((score / maxScore) * 100);
      if (gradeScoreEl) gradeScoreEl.textContent = pct;
  
      const minScore = currentChecklistConfig.settings?.minScore || 70;
      let label = 'D';
      if (pct >= 90) label = 'A+';
      else if (pct >= 80) label = 'A';
      else if (pct >= 70) label = 'B';
      else if (pct >= 50) label = 'C';
  
      if (gradeLabelEl) gradeLabelEl.textContent = label;
  
      if (gradeAllowedEl) {
        if (pct >= minScore) {
          gradeAllowedEl.textContent = 'Yes';
          gradeAllowedEl.className = 'mt-1 inline-flex items-center justify-center px-2 py-1 rounded-full border text-[10px] grade-badge-low';
        } else {
          gradeAllowedEl.textContent = 'No';
          gradeAllowedEl.className = 'mt-1 inline-flex items-center justify-center px-2 py-1 rounded-full border text-[10px] grade-badge-high';
        }
      }
  
      // Generate summary
      if (summaryTextEl) {
        const checkedGroups = [];
        const uncheckedGroups = [];
        
        currentChecklistConfig.categories.forEach(category => {
          const groupEl = document.querySelector(`[data-group="${category.id}"]`);
          if (groupEl) {
            const inputs = groupEl.querySelectorAll('.crit');
            const checked = Array.from(inputs).filter(i => i.checked).length;
            const total = inputs.length;
            if (checked === total && total > 0) {
              checkedGroups.push(category.title);
            } else if (checked < total / 2) {
              uncheckedGroups.push(category.title);
            }
          }
        });
  
        let summary = '';
        if (checkedGroups.length > 0) {
          summary += `Strong: ${checkedGroups.join(', ')}. `;
        }
        if (uncheckedGroups.length > 0) {
          summary += `Weak: ${uncheckedGroups.join(', ')}.`;
        }
        if (!summary) {
          summary = 'Fill the checklist to see a summary of strong and weak areas.';
        }
        summaryTextEl.textContent = summary;
      }
    }
  
    // Initialize from config on page load
    // Only render from config if user has saved custom config
    const hasPrepConfig = localStorage.getItem('tradedesk-prep-config');
    const hasChecklistConfig = localStorage.getItem('tradedesk-checklist-config');
    
    if (hasPrepConfig) {
      renderDailyPrepFromConfig();
    }
    
    if (hasChecklistConfig) {
      renderChecklistFromConfig();
    }
  
    // ------- Enhanced Number Inputs -------
    function enhanceNumberInputs() {
      // Target specific number inputs that should have custom controls
      const targetInputIds = [
        'risk-percent',
        'risk-entry', 
        'risk-sl',
        'daily-loss-limit-percent',
        'goal-monthly-pnl',
        'goal-weekly-pnl',
        'goal-win-rate',
        'goal-max-trades',
        'plan-entry',
        'plan-tp',
        'plan-sl',
        'plan-size',
        'plan-pnl',
        'mc-win-rate',
        'mc-avg-win',
        'mc-avg-loss',
        'mc-trades',
        'mc-starting'
      ];
      
      targetInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input || input.dataset.enhanced) return;
        
        // Mark as enhanced to prevent double-enhancement
        input.dataset.enhanced = 'true';
        
        // Get step value from input or default to appropriate value
        const step = parseFloat(input.step) || (id.includes('percent') || id.includes('rate') ? 0.5 : 1);
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'number-input-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Create controls container
        const controls = document.createElement('div');
        controls.className = 'number-input-controls';
        
        // Up button
        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.innerHTML = '▲';
        upBtn.tabIndex = -1;
        upBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentVal = parseFloat(input.value) || 0;
          const max = parseFloat(input.max) || Infinity;
          const newVal = Math.min(currentVal + step, max);
          input.value = newVal;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Down button
        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.innerHTML = '▼';
        downBtn.tabIndex = -1;
        downBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentVal = parseFloat(input.value) || 0;
          const min = parseFloat(input.min) || 0;
          const newVal = Math.max(currentVal - step, min);
          input.value = newVal;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        controls.appendChild(upBtn);
        controls.appendChild(downBtn);
        wrapper.appendChild(controls);
      });
    }
    
    // Run on page load
    enhanceNumberInputs();
    
    // Re-run when sections become visible (for dynamically shown content)
    const observer = new MutationObserver(() => {
      enhanceNumberInputs();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  
    // ------- Widget Settings -------
    const WIDGET_SETTINGS_KEY = "tradingdesk:widget-settings";
    
    // Load widget settings from localStorage
    function loadWidgetSettings() {
      try {
        const stored = localStorage.getItem(WIDGET_SETTINGS_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        console.error("Error loading widget settings:", e);
        return {};
      }
    }
    
    // Save widget settings to localStorage
    function saveWidgetSettings(settings) {
      try {
        localStorage.setItem(WIDGET_SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error("Error saving widget settings:", e);
      }
    }
    
    // Apply widget visibility based on settings
    function applyWidgetSettings() {
      const settings = loadWidgetSettings();
      
      // Find all widget toggles
      document.querySelectorAll('[data-widget]').forEach(toggle => {
        const widgetId = toggle.dataset.widget;
        const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
        
        if (widget) {
          // Check if there's a saved setting, default to visible (true)
          const isVisible = settings[widgetId] !== false;
          toggle.checked = isVisible;
          widget.style.display = isVisible ? '' : 'none';
        }
      });
    }
    
    // Toggle widget visibility
    function toggleWidget(widgetId, isVisible) {
      const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (widget) {
        widget.style.display = isVisible ? '' : 'none';
        
        // Save setting
        const settings = loadWidgetSettings();
        settings[widgetId] = isVisible;
        saveWidgetSettings(settings);
      }
    }
    
    // Initialize widget settings
    function initWidgetSettings() {
      // Apply saved settings on load
      applyWidgetSettings();
      
      // Handle dropdown toggle buttons
      document.querySelectorAll('[data-settings-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const section = btn.dataset.settingsToggle;
          const dropdown = document.querySelector(`[data-settings-dropdown="${section}"]`);
          
          // Close all other dropdowns first
          document.querySelectorAll('.widget-settings-dropdown.open').forEach(d => {
            if (d !== dropdown) {
              d.classList.remove('open');
              const otherBtn = document.querySelector(`[data-settings-toggle="${d.dataset.settingsDropdown}"]`);
              if (otherBtn) otherBtn.classList.remove('active');
            }
          });
          
          // Toggle this dropdown
          if (dropdown) {
            const isOpen = dropdown.classList.toggle('open');
            btn.classList.toggle('active', isOpen);
          }
        });
      });
      
      // Handle widget toggle switches
      document.querySelectorAll('[data-widget]').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
          const widgetId = toggle.dataset.widget;
          toggleWidget(widgetId, toggle.checked);
        });
      });
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.widget-settings-container')) {
          document.querySelectorAll('.widget-settings-dropdown.open').forEach(d => {
            d.classList.remove('open');
          });
          document.querySelectorAll('.widget-settings-btn.active').forEach(btn => {
            btn.classList.remove('active');
          });
        }
      });
      
      // Close dropdowns on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.widget-settings-dropdown.open').forEach(d => {
            d.classList.remove('open');
          });
          document.querySelectorAll('.widget-settings-btn.active').forEach(btn => {
            btn.classList.remove('active');
          });
        }
      });
    }
    
    // Initialize widget settings
    initWidgetSettings();
  });
  
  
  // ------- PWA Install Prompt -------
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 76+ from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    showInstallButton();
  });
  
  function showInstallButton() {
    const installContainer = document.getElementById('pwa-install-container');
    const installBtn = document.getElementById('pwa-install-btn');
    
    if (installContainer && installBtn) {
      installContainer.classList.remove('hidden');
      
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
          // Already installed or not supported
          showToast('App is already installed or installation is not supported', 'info');
          return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ User accepted the install prompt');
          showToast('Trading Desk installed! 🎉', 'success');
          installContainer.classList.add('hidden');
        } else {
          console.log('❌ User dismissed the install prompt');
        }
        
        // Clear the deferredPrompt
        deferredPrompt = null;
      });
    }
  }
  
  // Hide install button if app is already installed
  window.addEventListener('appinstalled', () => {
    console.log('✅ Trading Desk was installed');
    const installContainer = document.getElementById('pwa-install-container');
    if (installContainer) {
      installContainer.classList.add('hidden');
    }
    deferredPrompt = null;
  });
  
  // Check if running as installed PWA
  function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }
  
  // Add a class to body if running as PWA (for custom styling if needed)
  if (isPWA()) {
    document.body.classList.add('pwa-mode');
    console.log('📱 Running as installed PWA');
  }
  
  // iOS Install Banner
  const IOS_INSTALL_DISMISSED_KEY = 'tradingdesk:ios-install-dismissed';
  
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  
  function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
  
  function showIOSInstallBanner() {
    // Only show on iOS Safari, not already installed, and not previously dismissed
    if (!isIOS() || !isSafari() || isPWA()) return;
    
    const dismissed = localStorage.getItem(IOS_INSTALL_DISMISSED_KEY);
    if (dismissed) return;
    
    const banner = document.getElementById('ios-install-banner');
    const dismissBtn = document.getElementById('ios-install-dismiss');
    
    if (banner && dismissBtn) {
      // Show after a short delay
      setTimeout(() => {
        banner.classList.remove('hidden');
        banner.classList.add('animate-slide-up');
      }, 3000);
      
      dismissBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
        localStorage.setItem(IOS_INSTALL_DISMISSED_KEY, 'true');
      });
    }
  }
  
  // Initialize iOS banner when DOM is ready
  document.addEventListener('DOMContentLoaded', showIOSInstallBanner);
  