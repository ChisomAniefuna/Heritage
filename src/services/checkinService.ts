import { supabase } from './supabase';

export interface CheckinStatus {
  id: string;
  userId: string;
  status: 'active' | 'warning' | 'overdue' | 'deceased_presumed';
  lastCheckinDate: string;
  nextCheckinDue: string;
  remindersSent: number;
  maxReminders: number;
  gracePeriodDays: number;
  privacyPreferences: CheckinPrivacyPreferences;
}

export interface CheckinPrivacyPreferences {
  alertBeneficiariesWhenOverdue: boolean;
  alertType: 'concern' | 'direct_inheritance';
  allowWellnessChecks: boolean;
  inheritanceOnlyMode: boolean;
  customMessage?: string;
  useProfessionalContactsOnly: boolean;
  professionalContactIds: string[];
  professionalConcernMessage?: string;
  separateProfessionalAndFamily: boolean;
}

export interface BeneficiaryNotification {
  id: string;
  userId: string;
  beneficiaryId: string;
  type: 'checkin_reminder' | 'checkin_overdue' | 'wellness_check' | 'inheritance_triggered' | 'professional_concern';
  message: string;
  sentDate: string;
  recipientType: 'beneficiary' | 'professional' | 'emergency';
  actionRequired: boolean;
  privacyRespected: boolean;
}

class CheckinService {
  // Get user's check-in status
  async getUserCheckinStatus(userId: string): Promise<CheckinStatus | null> {
    try {
      const { data, error } = await supabase
        .from('checkin_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Handle case where no check-in record exists yet
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        status: this.calculateStatus(data.next_checkin_due, data.reminders_sent, data.max_reminders),
        lastCheckinDate: data.checkin_date,
        nextCheckinDue: data.next_checkin_due,
        remindersSent: data.reminders_sent,
        maxReminders: data.max_reminders,
        gracePeriodDays: data.grace_period_days,
        privacyPreferences: data.privacy_preferences || this.getDefaultPrivacyPreferences()
      };
    } catch (error) {
      console.error('Error getting check-in status:', error);
      return null;
    }
  }

  // Initialize user check-in
  async initializeUserCheckin(
    userId: string, 
    userEmail: string,
    privacyPreferences?: CheckinPrivacyPreferences
  ): Promise<CheckinStatus | null> {
    try {
      // Set next check-in date to 6 months from now
      const nextCheckinDate = new Date();
      nextCheckinDate.setMonth(nextCheckinDate.getMonth() + 6);

      const { data, error } = await supabase
        .from('checkin_records')
        .insert({
          user_id: userId,
          checkin_date: new Date().toISOString(),
          status: 'completed',
          next_checkin_due: nextCheckinDate.toISOString(),
          reminders_sent: 0,
          max_reminders: 4,
          grace_period_days: 30,
          privacy_preferences: privacyPreferences || this.getDefaultPrivacyPreferences()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        status: 'active',
        lastCheckinDate: data.checkin_date,
        nextCheckinDue: data.next_checkin_due,
        remindersSent: data.reminders_sent,
        maxReminders: data.max_reminders,
        gracePeriodDays: data.grace_period_days,
        privacyPreferences: data.privacy_preferences
      };
    } catch (error) {
      console.error('Error initializing check-in:', error);
      return null;
    }
  }

  // Process user check-in
  async processUserCheckin(userId: string, userEmail: string): Promise<CheckinStatus | null> {
    try {
      // Get current check-in record
      const currentStatus = await this.getUserCheckinStatus(userId);
      if (!currentStatus) {
        return this.initializeUserCheckin(userId, userEmail);
      }

      // Set next check-in date to 6 months from now
      const nextCheckinDate = new Date();
      nextCheckinDate.setMonth(nextCheckinDate.getMonth() + 6);

      // Update check-in record
      const { data, error } = await supabase
        .from('checkin_records')
        .update({
          checkin_date: new Date().toISOString(),
          status: 'completed',
          next_checkin_due: nextCheckinDate.toISOString(),
          reminders_sent: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStatus.id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        status: 'active',
        lastCheckinDate: data.checkin_date,
        nextCheckinDue: data.next_checkin_due,
        remindersSent: data.reminders_sent,
        maxReminders: data.max_reminders,
        gracePeriodDays: data.grace_period_days,
        privacyPreferences: data.privacy_preferences
      };
    } catch (error) {
      console.error('Error processing check-in:', error);
      return null;
    }
  }

  // Update privacy preferences
  async updatePrivacyPreferences(
    userId: string,
    preferences: CheckinPrivacyPreferences
  ): Promise<CheckinStatus | null> {
    try {
      const currentStatus = await this.getUserCheckinStatus(userId);
      if (!currentStatus) {
        return null;
      }

      const { data, error } = await supabase
        .from('checkin_records')
        .update({
          privacy_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStatus.id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...currentStatus,
        privacyPreferences: preferences
      };
    } catch (error) {
      console.error('Error updating privacy preferences:', error);
      return null;
    }
  }

  // Get all notifications for a user
  async getAllUserNotifications(userId: string): Promise<BeneficiaryNotification[]> {
    // This would fetch from a notifications table
    // For now, return mock data
    return [
      {
        id: '1',
        userId,
        beneficiaryId: 'contact1',
        type: 'checkin_reminder',
        message: 'Your 6-month check-in is due in 7 days',
        sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        recipientType: 'beneficiary',
        actionRequired: false,
        privacyRespected: true
      },
      {
        id: '2',
        userId,
        beneficiaryId: 'contact2',
        type: 'professional_concern',
        message: 'Please check on the account holder as they have missed their scheduled check-in',
        sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        recipientType: 'professional',
        actionRequired: true,
        privacyRespected: true
      }
    ];
  }

  // Process overdue check-ins
  async processOverdueCheckins(): Promise<{
    processed: number;
    remindersSent: number;
    beneficiaryAlerts: number;
    professionalAlerts: number;
    inheritanceTriggered: number;
    privacyRespected: number;
  }> {
    // This would process all overdue check-ins in the system
    // For now, return mock results
    return {
      processed: 5,
      remindersSent: 3,
      beneficiaryAlerts: 1,
      professionalAlerts: 1,
      inheritanceTriggered: 0,
      privacyRespected: 2
    };
  }

  // Calculate check-in status based on due date and reminders
  private calculateStatus(
    nextCheckinDue: string,
    remindersSent: number,
    maxReminders: number
  ): CheckinStatus['status'] {
    const now = new Date();
    const dueDate = new Date(nextCheckinDue);
    const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 0) {
      return 'active';
    } else if (daysDiff >= -7) {
      return 'warning';
    } else if (remindersSent < maxReminders) {
      return 'overdue';
    } else {
      return 'deceased_presumed';
    }
  }

  // Get default privacy preferences
  private getDefaultPrivacyPreferences(): CheckinPrivacyPreferences {
    return {
      alertBeneficiariesWhenOverdue: true,
      alertType: 'concern',
      allowWellnessChecks: true,
      inheritanceOnlyMode: false,
      useProfessionalContactsOnly: false,
      professionalContactIds: [],
      separateProfessionalAndFamily: true
    };
  }
}

// Create singleton instance
export const checkinService = new CheckinService();