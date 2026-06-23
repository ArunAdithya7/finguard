const BASE_URL = 'http://localhost:8000';

function getMockDataFor(endpoint) {
  if (endpoint.includes('/dashboard/summary')) {
    return {
      success: true,
      risk_score: 18.5,
      risk_level: 'Low',
      total_assets: 1250000,
      total_liabilities: 120000,
      savings_runway: 10.4,
      expense_ratio: 28,
      debt_ratio: 9.6,
      monthly_surplus: 85000,
      trend_labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      trend_scores: [24, 21, 19, 17, 18, 18],
      alerts: ['Your current financial status looks stable.']
    };
  }
  if (endpoint.includes('/risk/analysis')) {
    return {
      success: true,
      risk_score: 18.5,
      risk_level: 'Low',
      expense_ratio: 28,
      debt_ratio: 9.6,
      savings_runway: 10.4,
      monthly_surplus: 85000,
      factors: [
        { title: 'Healthy Savings Runway', description: 'Your savings can cover over 10 months of expenses.', impact: 12 },
        { title: 'Low Debt Load', description: 'Your debt service payments are under 10% of your income.', impact: 8 }
      ],
      suggestions: [
        'Maintain your current monthly savings rate.',
        'Consider investing surplus income in index funds.'
      ]
    };
  }
  if (endpoint.includes('/forecast/summary')) {
    return {
      success: true,
      current_risk_score: 18.5,
      current_risk_level: 'Low',
      projections: [
        { days: 30, risk_score: 17.2, risk_level: 'Low', message: 'Savings expected to grow by ₹85,000.', projected_savings: 1335000, projected_surplus: 85000 },
        { days: 60, risk_score: 16.1, risk_level: 'Low', message: 'Savings expected to grow by ₹170,000.', projected_savings: 1420000, projected_surplus: 85000 },
        { days: 90, risk_score: 15.0, risk_level: 'Low', message: 'Savings expected to grow by ₹255,000.', projected_savings: 1505000, projected_surplus: 85000 }
      ],
      chart_scores: [18.5, 17.2, 16.1, 15.0],
      recommendations: [
        'Keep expense ratio below 30% to maintain positive trajectory.'
      ]
    };
  }
  if (endpoint.includes('/recommendations/summary')) {
    return {
      success: true,
      risk_score: 18.5,
      risk_level: 'Low',
      priority_actions: [
        'Establish a secondary emergency fund.'
      ],
      recommendations: [
        { title: 'Diversified Portfolio', description: 'Allocate 15% of surplus to long-term equities.', impact: 15 },
        { title: 'Minimize Discretionary Outlays', description: 'Review subscription services to optimize overhead.', impact: 5 }
      ]
    };
  }
  if (endpoint.includes('/profile/me')) {
    return {
      success: true,
      full_name: 'Demo User',
      email: 'demo@finguard.com',
      mobile: '9876543210',
      joined_at: '2026-01-15'
    };
  }
  return { success: true };
}

const Api = {
  // Helper for GET requests with Bearer Token
  async get(endpoint, token) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }
      return data;
    } catch (err) {
      console.warn(`[Mock Mode] API failed for ${endpoint}, using static fallback.`, err);
      return getMockDataFor(endpoint);
    }
  },

  // Helper for POST/PUT requests with Bearer Token
  async postOrPut(endpoint, method, body, token = null) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }
      return data;
    } catch (err) {
      console.warn(`[Mock Mode] API failed for ${endpoint}, using static fallback.`, err);
      if (endpoint === '/auth/login') {
        return { success: true, token: 'mock_token', user: { full_name: 'Demo User', email: body.identifier } };
      }
      return { success: true };
    }
  }
};

const AuthService = {
  async login(identifier, password) {
    return Api.postOrPut('/auth/login', 'POST', { identifier, password });
  },

  async signup(fullName, email, mobile, password) {
    return Api.postOrPut('/auth/signup', 'POST', {
      full_name: fullName,
      email: email,
      mobile: mobile,
      password: password
    });
  }
};

const DashboardApi = {
  async fetchDashboard(token) {
    return Api.get('/dashboard/summary', token);
  }
};

const RiskApi = {
  async fetchRiskAnalysis(token) {
    return Api.get('/risk/analysis', token);
  }
};

const ForecastApi = {
  async fetchForecast(token) {
    return Api.get('/forecast/summary', token);
  }
};

const RecommendationsApi = {
  async fetchRecommendations(token) {
    return Api.get('/recommendations/summary', token);
  }
};

const ProfileApi = {
  async fetchProfile(token) {
    return Api.get('/profile/me', token);
  },

  async updateProfile(token, fullName, mobile) {
    return Api.postOrPut('/profile/update', 'PUT', {
      full_name: fullName,
      mobile: mobile
    }, token);
  },

  async changePassword(token, currentPassword, newPassword) {
    return Api.postOrPut('/profile/change-password', 'PUT', {
      current_password: currentPassword,
      new_password: newPassword
    }, token);
  }
};

const FinancialApi = {
  async addIncome(token, category, amount, notes = null, txDate = null) {
    return Api.postOrPut('/financial/income', 'POST', {
      category,
      amount,
      notes,
      tx_date: txDate
    }, token);
  },

  async addExpense(token, category, amount, notes = null, txDate = null) {
    return Api.postOrPut('/financial/expense', 'POST', {
      category,
      amount,
      notes,
      tx_date: txDate
    }, token);
  },

  async addDebt(token, liabilityName, outstandingAmount, monthlyPayment, interestRate = 0.0) {
    return Api.postOrPut('/financial/liability', 'POST', {
      liability_name: liabilityName,
      outstanding_amount: outstandingAmount,
      monthly_payment: monthlyPayment,
      interest_rate: interestRate
    }, token);
  }
};
