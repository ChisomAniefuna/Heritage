import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  security_question_1?: string;
  security_answer_1?: string;
  security_question_2?: string;
  security_answer_2?: string;
  two_factor_enabled: boolean;
  account_status: 'active' | 'inactive' | 'suspended';
  subscription_plan: 'free' | 'pro' | 'forever';
  created_at: string;
  updated_at: string;
  last_login?: string;
  profile_completed: boolean;
  privacy_preferences?: any;
  notification_preferences?: any;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: 'financial' | 'property' | 'digital' | 'personal' | 'legal';
  type: string;
  value: string;
  location: string;
  instructions: string;
  beneficiaries: string[];
  account_info?: string;
  access_instructions?: string;
  required_documents?: string;
  voice_messages?: any[];
  avatar_messages?: any[];
  release_conditions?: any[];
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  is_primary_beneficiary: boolean;
  is_emergency_contact: boolean;
  is_professional: boolean;
  verification_method: 'email' | 'phone' | 'legal' | 'biometric';
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  category: 'legal' | 'financial' | 'insurance' | 'personal' | 'medical';
  type: string;
  size: string;
  location: string;
  description: string;
  access_level: 'immediate' | 'conditional' | 'restricted';
  file_url?: string;
  file_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckinRecord {
  id: string;
  user_id: string;
  checkin_date: string;
  status: 'completed' | 'missed' | 'overdue';
  next_checkin_due: string;
  reminders_sent: number;
  max_reminders: number;
  grace_period_days: number;
  privacy_preferences: any;
  created_at: string;
  updated_at: string;
}

export interface BankStatement {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  statement_date: string;
  statement_period: string;
  balance: string;
  transaction_count: number;
  file_hash: string;
  ipfs_hash?: string;
  nft_token_id?: number;
  nft_contract_address?: string;
  blockchain_network?: string;
  created_at: string;
  updated_at: string;
}

// Authentication service
class SupabaseAuthService {
  // Sign up new user
  async signUp(email: string, password: string, userData: {
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    securityQuestion1?: string;
    securityAnswer1?: string;
    securityQuestion2?: string;
    securityAnswer2?: string;
  }) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: userData.fullName,
            phone: userData.phone,
            date_of_birth: userData.dateOfBirth,
            address: userData.address,
            emergency_contact_name: userData.emergencyContactName,
            emergency_contact_phone: userData.emergencyContactPhone,
            emergency_contact_relationship: userData.emergencyContactRelationship,
            security_question_1: userData.securityQuestion1,
            security_answer_1: userData.securityAnswer1,
            security_question_2: userData.securityQuestion2,
            security_answer_2: userData.securityAnswer2,
            two_factor_enabled: false,
            account_status: 'active',
            subscription_plan: 'free',
            profile_completed: true,
            privacy_preferences: {
              alertBeneficiariesWhenOverdue: true,
              alertType: 'concern',
              allowWellnessChecks: true,
              inheritanceOnlyMode: false,
              useProfessionalContactsOnly: false,
              professionalContactIds: [],
              separateProfessionalAndFamily: true
            },
            notification_preferences: {
              pushEnabled: true,
              emailEnabled: true,
              checkinReminders: true,
              inheritanceAlerts: true,
              quietHours: { start: '22:00', end: '08:00' }
            }
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // 3. Initialize check-in record
        const nextCheckinDate = new Date();
        nextCheckinDate.setMonth(nextCheckinDate.getMonth() + 6);

        const { error: checkinError } = await supabase
          .from('checkin_records')
          .insert({
            user_id: authData.user.id,
            checkin_date: new Date().toISOString(),
            status: 'completed',
            next_checkin_due: nextCheckinDate.toISOString(),
            reminders_sent: 0,
            max_reminders: 4,
            grace_period_days: 30,
            privacy_preferences: profileData.privacy_preferences
          });

        if (checkinError) throw checkinError;

        return {
          success: true,
          user: authData.user,
          profile: profileData,
          message: 'Account created successfully! Please check your email to verify your account.'
        };
      }

      throw new Error('Failed to create user account');
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create account'
      };
    }
  }

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Update last login
      if (data.user) {
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in'
      };
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send reset email'
      };
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Data service for managing user data
class SupabaseDataService {
  // Assets
  async createAsset(userId: string, assetData: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          ...assetData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create asset error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserAssets(userId: string): Promise<Asset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user assets error:', error);
      return [];
    }
  }

  async updateAsset(assetId: string, updates: Partial<Asset>) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update asset error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteAsset(assetId: string) {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Delete asset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Contacts
  async createContact(userId: string, contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create contact error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserContacts(userId: string): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user contacts error:', error);
      return [];
    }
  }

  // Documents
  async createDocument(userId: string, documentData: Omit<Document, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create document error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user documents error:', error);
      return [];
    }
  }

  // Bank Statements
  async createBankStatement(userId: string, statementData: Omit<BankStatement, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('bank_statements')
        .insert({
          ...statementData,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Create bank statement error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserBankStatements(userId: string): Promise<BankStatement[]> {
    try {
      const { data, error } = await supabase
        .from('bank_statements')
        .select('*')
        .eq('user_id', userId)
        .order('statement_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user bank statements error:', error);
      return [];
    }
  }

  // Check-in Records
  async getUserCheckinRecord(userId: string): Promise<CheckinRecord | null> {
    try {
      const { data, error } = await supabase
        .from('checkin_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Get user checkin record error:', error);
      return null;
    }
  }

  async updateCheckinRecord(userId: string, updates: Partial<CheckinRecord>) {
    try {
      const { data, error } = await supabase
        .from('checkin_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Update checkin record error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create service instances
export const supabaseAuth = new SupabaseAuthService();
export const supabaseData = new SupabaseDataService();

// Utility functions
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export const getSupabaseErrorMessage = (error: any): string => {
  if (error?.message) {
    // Handle common Supabase errors
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};