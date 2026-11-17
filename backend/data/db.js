const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, 'store.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let memoryStore = {
  users: [],
  categories: [],
  transactions: [],
  budgets: [],
  challenges: [],
  blacklistedTokens: []
};

// Seed default categories per SRS FR-3.1
const DEFAULT_CATEGORIES = [
  // Expense categories
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', color: '#F87171', icon: 'utensils', is_default: true, user: null },
  { id: 'cat-groceries', name: 'Groceries', type: 'expense', color: '#34D399', icon: 'shopping-cart', is_default: true, user: null },
  { id: 'cat-transport', name: 'Transport', type: 'expense', color: '#60A5FA', icon: 'car', is_default: true, user: null },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', color: '#FBBF24', icon: 'home', is_default: true, user: null },
  { id: 'cat-rent', name: 'Rent', type: 'expense', color: '#A78BFA', icon: 'key', is_default: true, user: null },
  { id: 'cat-health', name: 'Health', type: 'expense', color: '#EC4899', icon: 'heart', is_default: true, user: null },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', color: '#818CF8', icon: 'gamepad-2', is_default: true, user: null },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', color: '#FB7185', icon: 'shopping-bag', is_default: true, user: null },
  { id: 'cat-others-exp', name: 'Others', type: 'expense', color: '#94A3B8', icon: 'more-horizontal', is_default: true, user: null },

  // Income categories
  { id: 'cat-salary', name: 'Salary', type: 'income', color: '#10B981', icon: 'wallet', is_default: true, user: null },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', color: '#38BDF8', icon: 'laptop', is_default: true, user: null },
  { id: 'cat-investments', name: 'Investments', type: 'income', color: '#8B5CF6', icon: 'trending-up', is_default: true, user: null },
  { id: 'cat-others-inc', name: 'Others', type: 'income', color: '#64748B', icon: 'circle-dollar-sign', is_default: true, user: null }
];

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      memoryStore = JSON.parse(data);
    } else {
      seedInitialData();
      saveStore();
    }
  } catch (err) {
    console.error('Error loading store, initializing fresh seed:', err);
    seedInitialData();
    saveStore();
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);

  const demoUser = {
    id: 'user-swetha-1',
    username: 'swetha',
    email: 'swetha@spendquest.io',
    password: hashedPassword,
    first_name: 'Swetha',
    last_name: 'R.',
    currency: 'INR', // Default ISO 4217 as specified in SRS (INR)
    financial_health: 94,
    created_at: new Date('2025-01-01T00:00:00Z').toISOString()
  };

  memoryStore.users = [demoUser];
  memoryStore.categories = [...DEFAULT_CATEGORIES];

  // Transactions matching the dashboard reference image:
  // Total Balance: ₹42,500
  // Monthly Income: ₹28,000 (March 2025)
  // Monthly Expenses: ₹15,500 (March 2025)
  // Donut breakdown:
  // Food & Dining: 32% (approx ₹4,960)
  // Shopping: 28% (approx ₹4,340)
  // Transport: 20% (approx ₹3,100)
  // Bills: 12% (approx ₹1,860)
  // Others: 8% (approx ₹1,240)
  // Total = ₹15,500
  const now = new Date();
  const year = 2025;
  const month = '03'; // March 2025 as in screenshot, but we also support dynamic months

  memoryStore.transactions = [
    // Income
    {
      id: 'tx-inc-1',
      user: demoUser.id,
      type: 'income',
      amount: 25000.00,
      title: 'Monthly Salary',
      description: 'Primary software engineering salary',
      category: 'cat-salary',
      date: '2025-03-01',
      payment_method: 'Bank Transfer',
      receipt: null,
      created_at: '2025-03-01T09:00:00Z'
    },
    {
      id: 'tx-inc-2',
      user: demoUser.id,
      type: 'income',
      amount: 3000.00,
      title: 'Freelance Design Consulting',
      description: 'Fintech UI mockup delivery',
      category: 'cat-freelance',
      date: '2025-03-10',
      payment_method: 'UPI',
      receipt: null,
      created_at: '2025-03-10T14:30:00Z'
    },
    // Past Month Income for balance accumulation to reach ₹42,500
    {
      id: 'tx-inc-past',
      user: demoUser.id,
      type: 'income',
      amount: 30000.00,
      title: 'February Balance Savings',
      description: 'Carried forward savings',
      category: 'cat-salary',
      date: '2025-02-28',
      payment_method: 'Bank Transfer',
      receipt: null,
      created_at: '2025-02-28T09:00:00Z'
    },

    // Expenses in March 2025
    // Recent transactions in UI:
    // Today • Mar 16, 2025: Food & Dining, 12:45 PM • UPI, -₹450
    {
      id: 'tx-exp-1',
      user: demoUser.id,
      type: 'expense',
      amount: 450.00,
      title: 'Food & Dining',
      description: 'Sunday gourmet lunch bowl',
      category: 'cat-food',
      date: '2025-03-16',
      payment_method: 'UPI',
      receipt: null,
      created_at: '2025-03-16T12:45:00Z'
    },
    // Yesterday • Mar 15, 2025: Transport, 08:30 PM • Card, -₹120
    {
      id: 'tx-exp-2',
      user: demoUser.id,
      type: 'expense',
      amount: 120.00,
      title: 'Transport',
      description: 'City metro commute card reload',
      category: 'cat-transport',
      date: '2025-03-15',
      payment_method: 'Credit Card',
      receipt: null,
      created_at: '2025-03-15T20:30:00Z'
    },
    // Mar 14, 2025: Groceries, 05:20 PM • Cash, -₹80
    {
      id: 'tx-exp-3',
      user: demoUser.id,
      type: 'expense',
      amount: 80.00,
      title: 'Groceries',
      description: 'Organic greens & almond milk',
      category: 'cat-groceries',
      date: '2025-03-14',
      payment_method: 'Cash',
      receipt: null,
      created_at: '2025-03-14T17:20:00Z'
    },
    // Additional March expenses to match exactly ₹15,500 total
    {
      id: 'tx-exp-4',
      user: demoUser.id,
      type: 'expense',
      amount: 3920.00,
      title: 'Weekly Organic Mart',
      description: 'Family grocery staples & fruits',
      category: 'cat-groceries',
      date: '2025-03-05',
      payment_method: 'UPI',
      receipt: null,
      created_at: '2025-03-05T11:15:00Z'
    },
    {
      id: 'tx-exp-5',
      user: demoUser.id,
      type: 'expense',
      amount: 1550.00,
      title: 'Fine Dining Out',
      description: 'Celebration dinner with team',
      category: 'cat-food',
      date: '2025-03-08',
      payment_method: 'Credit Card',
      receipt: null,
      created_at: '2025-03-08T19:30:00Z'
    },
    {
      id: 'tx-exp-6',
      user: demoUser.id,
      type: 'expense',
      amount: 2980.00,
      title: 'Fuel & Ride Shares',
      description: 'Fuel refills and weekend cabs',
      category: 'cat-transport',
      date: '2025-03-11',
      payment_method: 'Debit Card',
      receipt: null,
      created_at: '2025-03-11T09:45:00Z'
    },
    {
      id: 'tx-exp-7',
      user: demoUser.id,
      type: 'expense',
      amount: 4340.00,
      title: 'Spring Wardrobe & Essentials',
      description: 'Pastel cardigan and home storage',
      category: 'cat-shopping',
      date: '2025-03-12',
      payment_method: 'Credit Card',
      receipt: null,
      created_at: '2025-03-12T16:00:00Z'
    },
    {
      id: 'tx-exp-8',
      user: demoUser.id,
      type: 'expense',
      amount: 1860.00,
      title: 'High-speed Internet & Power',
      description: 'Fiber internet & electricity utility bills',
      category: 'cat-bills',
      date: '2025-03-06',
      payment_method: 'Bank Transfer',
      receipt: null,
      created_at: '2025-03-06T10:00:00Z'
    },
    {
      id: 'tx-exp-9',
      user: demoUser.id,
      type: 'expense',
      amount: 200.00,
      title: 'Artisan Espresso',
      description: 'Morning specialty coffee',
      category: 'cat-food',
      date: '2025-03-13',
      payment_method: 'UPI',
      receipt: null,
      created_at: '2025-03-13T08:30:00Z'
    }
  ];

  // Budgets matching Reference Image:
  // 1. Groceries: ₹4,000 / ₹5,000 (80% used -> Warning / "Almost there")
  // 2. Dining Out: ₹2,000 / ₹2,000 (100% used -> Exceeded / "Limit Reached!")
  // 3. Transport: ₹1,500 / ₹2,000 (75% used -> Normal / "On Track")
  // 4. Shopping: ₹2,000 / ₹3,000 (67% used -> Normal / "On Track")
  // Overall Budget for March 2025
  memoryStore.budgets = [
    {
      id: 'bud-overall-1',
      user: demoUser.id,
      category: null, // null = overall monthly budget
      month: '2025-03',
      limit: 20000.00,
      created_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'bud-groc-1',
      user: demoUser.id,
      category: 'cat-groceries',
      month: '2025-03',
      limit: 5000.00,
      created_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'bud-dine-1',
      user: demoUser.id,
      category: 'cat-food',
      month: '2025-03',
      limit: 2200.00,
      created_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'bud-trans-1',
      user: demoUser.id,
      category: 'cat-transport',
      month: '2025-03',
      limit: 4000.00,
      created_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'bud-shop-1',
      user: demoUser.id,
      category: 'cat-shopping',
      month: '2025-03',
      limit: 5000.00,
      created_at: '2025-03-01T00:00:00Z'
    }
  ];

  // Savings Challenge:
  // "Save ₹5,000 in 30 days" -> 60% progress, ₹3,000 / ₹5,000 • 12 days left
  memoryStore.challenges = [
    {
      id: 'chal-1',
      user: demoUser.id,
      title: 'Spring Savings Sprint',
      description: 'Save ₹5,000 in 30 days for emergency fund',
      target_amount: 5000.00,
      current_amount: 3000.00,
      duration_days: 30,
      days_left: 12,
      badge: 'Sparkle Saver',
      status: 'active', // active, completed, expired
      created_at: '2025-03-01T00:00:00Z'
    },
    {
      id: 'chal-2',
      user: demoUser.id,
      title: 'Zero Dining-Out Weekend',
      description: 'Cook delicious meals at home for 2 consecutive weekends',
      target_amount: 2500.00,
      current_amount: 2500.00,
      duration_days: 14,
      days_left: 0,
      badge: 'Master Chef Saver',
      status: 'completed',
      created_at: '2025-02-15T00:00:00Z'
    }
  ];
}

// Load store immediately on module init
loadStore();

module.exports = {
  getStore: () => memoryStore,
  saveStore,
  DEFAULT_CATEGORIES
};
