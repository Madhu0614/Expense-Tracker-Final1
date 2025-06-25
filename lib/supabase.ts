import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: number;
          user_id: string;
          purpose: string;
          amount: number;
          category: string;
          date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          purpose: string;
          amount: number;
          category: string;
          date: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          purpose?: string;
          amount?: number;
          category?: string;
          date?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      bills: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          amount: number;
          due_date: string;
          frequency: string;
          category: string;
          is_active: boolean;
          last_paid: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          amount: number;
          due_date: string;
          frequency: string;
          category: string;
          is_active?: boolean;
          last_paid?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          amount?: number;
          due_date?: string;
          frequency?: string;
          category?: string;
          is_active?: boolean;
          last_paid?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          amount: number;
          billing_cycle: string;
          next_payment: string;
          category: string;
          is_active: boolean;
          description: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          amount: number;
          billing_cycle: string;
          next_payment: string;
          category: string;
          is_active?: boolean;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          amount?: number;
          billing_cycle?: string;
          next_payment?: string;
          category?: string;
          is_active?: boolean;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
      };
    };
  };
};