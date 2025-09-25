import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;

  constructor() {
    // Only initialize Supabase if we have valid credentials
    const isConfigured = 
      environment.supabaseUrl !== 'https://placeholder.supabase.co' &&
      environment.supabaseAnonKey !== 'placeholder-anon-key';
    
    if (!isConfigured) {
      console.warn('Supabase not configured with valid credentials. Client not initialized.');
      return;
    }
    
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  get client() {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  // Database methods
  async insertTransaction(transaction: any) {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([transaction])
      .select();
    return { data, error };
  }

  async getTransactions(userId: string) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        categories (*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  }

  async insertInvoice(invoice: any) {
    const { data, error } = await this.supabase
      .from('invoices')
      .insert([invoice])
      .select();
    return { data, error };
  }

  async getInvoices(userId: string) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });
    return { data, error };
  }

  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');
    return { data, error };
  }
}