import { supabase } from './supabase';
import { Database } from './supabase';

type Expense = Database['public']['Tables']['expenses']['Row'];
type Bill = Database['public']['Tables']['bills']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

// Expense queries
export const expenseQueries = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(expense: Database['public']['Tables']['expenses']['Insert']) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Database['public']['Tables']['expenses']['Update']) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getMonthlyTotal(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    return data.reduce((sum, expense) => sum + Number(expense.amount), 0);
  },

  async getCategoryBreakdown(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const breakdown: { [key: string]: number } = {};
    data.forEach(expense => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + Number(expense.amount);
    });
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0 // Will be calculated in component
    }));
  },

  async getRecentExpenses(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// Bill queries
export const billQueries = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(bill: Database['public']['Tables']['bills']['Insert']) {
    const { data, error } = await supabase
      .from('bills')
      .insert(bill)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Database['public']['Tables']['bills']['Update']) {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getUpcoming(userId: string, days: number = 7) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('due_date', today)
      .lte('due_date', futureDate)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getOverdue(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('due_date', today)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

// Subscription queries
export const subscriptionQueries = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_payment', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(subscription: Database['public']['Tables']['subscriptions']['Insert']) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Database['public']['Tables']['subscriptions']['Update']) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getActive(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },

  async getUpcomingPayments(userId: string, days: number = 7) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('next_payment', today)
      .lte('next_payment', futureDate)
      .order('next_payment', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};