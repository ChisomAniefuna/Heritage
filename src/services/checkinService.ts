import { emailService } from './emailService';
import { notificationService } from './notificationService';

export interface CheckinStatus {
  id: string;
  userId: string;
  lastCheckinDate: string;
  nextCheckinDue: string;
  status: 'active' | 'warning' | 'overdue' | 'deceased_presumed';
  remindersSent: number;
  maxReminders: number;
  gracePeriodDays: number;
  isActive: boolean;
  privacyPreferences: CheckinPrivacyPreferences;
}

export interface CheckinPrivacyPreferences {
  alertBeneficiariesWhenOverdue: boolean; // Control beneficiary alerts
  alertType: 'concern' | 'direct_inheritance'; // Type of alert to send
  allowWellnessChecks: boolean; // Allow beneficiaries to check on user
  inheritanceOnlyMode: boolean; // Skip concern alerts, go straight to inheritance
  customMessage?: string; // Custom message for beneficiaries
  
  // NEW: Professional contact preferences
  useProfessionalContactsOnly: boolean; // Only alert lawyers/professionals for concerns
  professionalContactIds: string[]; // IDs of professional contacts (lawyers, etc.)
  professionalConcernMessage?: string; // Custom message for professional contacts
  separateProfessionalAndFamily: boolean; // Send different messages to professionals vs family
}

export interface CheckinReminder {
  id: string;
  checkinId: string;
  type: 'initial' | 'warning' | 'final' | 'beneficiary_alert' | 'professional_alert';
  scheduledDate: string;
  sentDate?: string;
  status: 'pending' | 'sent' | 'failed';
  recipientType: 'user' | 'beneficiary' | 'professional';
  recipientEmail: string;
  message: string;
}

export interface BeneficiaryNotification {
  id: string;
  userId: string;
  beneficiaryId: string;
  type: 'user_inactive' | 'presumed_deceased' | 'inheritance_triggered' | 'direct_inheritance' | 'professional_concern';
  sentDate: string;
  status: 'sent' | 'acknowledged' | 'action_taken';
  message: string;
  actionRequired: boolean;
  inheritanceTriggered: boolean;
  privacyRespected: boolean;
  recipientType: 'beneficiary' | 'professional'; // NEW: Track recipient type
}

class CheckinService {
  private readonly CHECKIN_INTERVAL_MONTHS = 6;
  private readonly REMINDER_DAYS_BEFORE = [30, 14, 7, 1];
  private readonly GRACE_PERIOD_DAYS = 14;
  private readonly MAX_REMINDERS = 6;

  // Initialize check-in for a new user with privacy preferences
  async initializeUserCheckin(
    userId: string, 
    userEmail: string,
    privacyPreferences?: Partial<CheckinPrivacyPreferences>
  ): Promise<CheckinStatus> {
    const now = new Date();
    const nextCheckin = new Date(now);
    nextCheckin.setMonth(nextCheckin.getMonth() + this.CHECKIN_INTERVAL_MONTHS);

    // Enhanced default privacy preferences
    const defaultPrivacyPreferences: CheckinPrivacyPreferences = {
      alertBeneficiariesWhenOverdue: true,
      alertType: 'concern',
      allowWellnessChecks: true,
      inheritanceOnlyMode: false,
      customMessage: undefined,
      
      // NEW: Professional contact defaults
      useProfessionalContactsOnly: false, // Default: alert both family and professionals
      professionalContactIds: [], // No professional contacts by default
      professionalConcernMessage: undefined,
      separateProfessionalAndFamily: true // Default: send different messages to each group
    };

    const checkinStatus: CheckinStatus = {
      id: `checkin_${userId}_${Date.now()}`,
      userId,
      lastCheckinDate: now.toISOString(),
      nextCheckinDue: nextCheckin.toISOString(),
      status: 'active',
      remindersSent: 0,
      maxReminders: this.MAX_REMINDERS,
      gracePeriodDays: this.GRACE_PERIOD_DAYS,
      isActive: true,
      privacyPreferences: { ...defaultPrivacyPreferences, ...privacyPreferences }
    };

    this.saveCheckinStatus(checkinStatus);
    await this.scheduleReminders(checkinStatus, userEmail);

    console.log('User check-in initialized with enhanced privacy preferences:', checkinStatus);
    return checkinStatus;
  }

  // Update user's privacy preferences
  async updatePrivacyPreferences(
    userId: string, 
    preferences: Partial<CheckinPrivacyPreferences>
  ): Promise<CheckinStatus | null> {
    const currentStatus = this.getCheckinStatus(userId);
    if (!currentStatus) {
      throw new Error('Check-in status not found for user');
    }

    const updatedStatus: CheckinStatus = {
      ...currentStatus,
      privacyPreferences: { ...currentStatus.privacyPreferences, ...preferences }
    };

    this.saveCheckinStatus(updatedStatus);
    console.log('Enhanced privacy preferences updated:', updatedStatus.privacyPreferences);
    return updatedStatus;
  }

  // Process user check-in
  async processUserCheckin(userId: string, userEmail: string): Promise<CheckinStatus> {
    const currentStatus = this.getCheckinStatus(userId);
    if (!currentStatus) {
      throw new Error('Check-in status not found for user');
    }

    const now = new Date();
    const nextCheckin = new Date(now);
    nextCheckin.setMonth(nextCheckin.getMonth() + this.CHECKIN_INTERVAL_MONTHS);

    const updatedStatus: CheckinStatus = {
      ...currentStatus,
      lastCheckinDate: now.toISOString(),
      nextCheckinDue: nextCheckin.toISOString(),
      status: 'active',
      remindersSent: 0,
      isActive: true
    };

    this.saveCheckinStatus(updatedStatus);
    await this.cancelPendingReminders(currentStatus.id);
    await this.scheduleReminders(updatedStatus, userEmail);
    await this.sendCheckinConfirmation(userEmail, nextCheckin);

    console.log('User check-in processed successfully:', updatedStatus);
    return updatedStatus;
  }

  // Check for overdue check-ins and send reminders (respecting enhanced privacy preferences)
  async processOverdueCheckins(): Promise<{
    processed: number;
    remindersSent: number;
    beneficiaryAlerts: number;
    professionalAlerts: number;
    inheritanceTriggered: number;
    privacyRespected: number;
  }> {
    const results = {
      processed: 0,
      remindersSent: 0,
      beneficiaryAlerts: 0,
      professionalAlerts: 0,
      inheritanceTriggered: 0,
      privacyRespected: 0
    };

    const allCheckins = this.getAllCheckinStatuses();
    const now = new Date();

    for (const checkin of allCheckins) {
      if (!checkin.isActive) continue;

      const dueDate = new Date(checkin.nextCheckinDue);
      const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      results.processed++;

      if (daysPastDue > 0) {
        if (daysPastDue <= checkin.gracePeriodDays) {
          // Within grace period - send user reminders
          if (checkin.remindersSent < checkin.maxReminders) {
            await this.sendOverdueReminder(checkin);
            checkin.remindersSent++;
            checkin.status = 'overdue';
            this.saveCheckinStatus(checkin);
            results.remindersSent++;
          }
        } else {
          // Past grace period - handle based on enhanced privacy preferences
          if (checkin.remindersSent >= checkin.maxReminders) {
            await this.handleInheritanceBasedOnPrivacy(checkin);
            results.inheritanceTriggered++;
          } else {
            const alertResult = await this.handleAlertsBasedOnEnhancedPrivacy(checkin);
            results.beneficiaryAlerts += alertResult.beneficiaryAlerts;
            results.professionalAlerts += alertResult.professionalAlerts;
            if (alertResult.privacyRespected) {
              results.privacyRespected++;
            }
          }
        }
      } else {
        // Check if we need to send upcoming reminders
        const daysUntilDue = Math.abs(daysPastDue);
        if (this.REMINDER_DAYS_BEFORE.includes(daysUntilDue)) {
          await this.sendUpcomingReminder(checkin, daysUntilDue);
          results.remindersSent++;
        }
      }
    }

    return results;
  }

  // Enhanced alert handling based on professional contact preferences
  private async handleAlertsBasedOnEnhancedPrivacy(checkin: CheckinStatus): Promise<{
    beneficiaryAlerts: number;
    professionalAlerts: number;
    privacyRespected: boolean;
  }> {
    const { privacyPreferences } = checkin;
    let beneficiaryAlerts = 0;
    let professionalAlerts = 0;
    let privacyRespected = false;

    // If user doesn't want beneficiaries alerted when overdue
    if (!privacyPreferences.alertBeneficiariesWhenOverdue) {
      console.log(`Privacy respected: User ${checkin.userId} doesn't want beneficiaries alerted when overdue`);
      
      // Check if we should alert professionals only
      if (privacyPreferences.useProfessionalContactsOnly && privacyPreferences.professionalContactIds.length > 0) {
        await this.alertProfessionalContacts(checkin);
        professionalAlerts = privacyPreferences.professionalContactIds.length;
      }
      
      // Skip to inheritance trigger after max reminders
      if (checkin.remindersSent >= checkin.maxReminders) {
        await this.triggerDirectInheritance(checkin);
      }
      
      return { beneficiaryAlerts: 0, professionalAlerts, privacyRespected: true };
    }

    // If user wants professional contacts only for concerns
    if (privacyPreferences.useProfessionalContactsOnly) {
      console.log(`Privacy respected: User ${checkin.userId} wants professional contacts only for concerns`);
      
      if (privacyPreferences.professionalContactIds.length > 0) {
        await this.alertProfessionalContacts(checkin);
        professionalAlerts = privacyPreferences.professionalContactIds.length;
      }
      
      return { beneficiaryAlerts: 0, professionalAlerts, privacyRespected: true };
    }

    // If user wants inheritance-only mode (no wellness check alerts)
    if (privacyPreferences.inheritanceOnlyMode) {
      console.log(`Privacy respected: User ${checkin.userId} wants inheritance-only mode`);
      await this.sendDirectInheritanceNotification(checkin);
      return { beneficiaryAlerts: 1, professionalAlerts: 0, privacyRespected: true };
    }

    // Standard alerts based on preferences
    if (privacyPreferences.separateProfessionalAndFamily) {
      // Send different messages to professionals and family
      if (privacyPreferences.professionalContactIds.length > 0) {
        await this.alertProfessionalContacts(checkin);
        professionalAlerts = privacyPreferences.professionalContactIds.length;
      }
      
      if (privacyPreferences.alertType === 'direct_inheritance') {
        await this.sendDirectInheritanceNotification(checkin);
        beneficiaryAlerts = 1;
      } else {
        await this.alertBeneficiaries(checkin);
        beneficiaryAlerts = 1;
      }
    } else {
      // Send same message to all contacts
      if (privacyPreferences.alertType === 'direct_inheritance') {
        await this.sendDirectInheritanceNotification(checkin);
      } else {
        await this.alertBeneficiaries(checkin);
      }
      beneficiaryAlerts = 1;
    }

    return { beneficiaryAlerts, professionalAlerts, privacyRespected: false };
  }

  // NEW: Alert professional contacts (lawyers, etc.) with appropriate messaging
  private async alertProfessionalContacts(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    const allContacts = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !allContacts.length) return;

    // Filter for professional contacts
    const professionalContacts = allContacts.filter(contact => 
      checkin.privacyPreferences.professionalContactIds.includes(contact.id)
    );

    if (professionalContacts.length === 0) return;

    const daysPastDue = Math.floor(
      (new Date().getTime() - new Date(checkin.nextCheckinDue).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const professional of professionalContacts) {
      const subject = `Professional Notice: Client Check-in Status - ${user.name}`;
      const message = this.generateProfessionalAlertMessage(
        user.name,
        professional.name,
        professional.relationship,
        daysPastDue,
        checkin.gracePeriodDays,
        checkin.privacyPreferences.professionalConcernMessage
      );

      await emailService.sendEmail({
        to: professional.email,
        subject,
        html: message,
        priority: 'high'
      });

      // Save professional notification record
      const notification: BeneficiaryNotification = {
        id: `prof_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: professional.id,
        type: 'professional_concern',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `Professional concern notification sent for ${user.name} (${daysPastDue} days overdue)`,
        actionRequired: true,
        inheritanceTriggered: false,
        privacyRespected: true,
        recipientType: 'professional'
      };

      this.saveBeneficiaryNotification(notification);
    }

    console.log(`Professional alerts sent for user ${checkin.userId} to ${professionalContacts.length} professional contacts`);
  }

  // Generate professional alert message (for lawyers, etc.)
  private generateProfessionalAlertMessage(
    userName: string,
    professionalName: string,
    relationship: string,
    daysPastDue: number,
    gracePeriod: number,
    customMessage?: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚖️ Professional Client Notice</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${professionalName},</p>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">📋 Client Status Alert</h3>
            <p style="color: #92400e; margin: 0; font-weight: bold;">
              Your client ${userName} has not completed their Heritage Vault check-in for ${daysPastDue} days.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            As ${userName}'s designated ${relationship.toLowerCase()}, we are notifying you that they have not 
            responded to their required 6-month Heritage Vault check-in. This automated system helps ensure 
            their digital inheritance plan remains active and properly managed.
          </p>

          ${customMessage ? `
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">💌 Client's Message to Professional Contacts:</h4>
            <p style="color: #0c4a6e; margin: 0; font-style: italic;">"${customMessage}"</p>
          </div>
          ` : ''}
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0;">⚖️ Professional Considerations:</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>This may indicate your client needs assistance accessing their account</li>
              <li>They may require legal guidance regarding their digital inheritance plan</li>
              <li>Consider reaching out to verify their status and provide professional support</li>
              <li>Review any estate planning documents that may be affected</li>
            </ul>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 15px 0;">📋 System Information:</h4>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li><strong>Client:</strong> ${userName}</li>
              <li><strong>Days overdue:</strong> ${daysPastDue}</li>
              <li><strong>Grace period:</strong> ${gracePeriod} days</li>
              <li><strong>Your role:</strong> ${relationship}</li>
              <li><strong>Notification type:</strong> Professional concern alert</li>
            </ul>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⏰ Next Steps:</h4>
            <p style="color: #dc2626; margin: 0;">
              If ${userName} does not complete their check-in soon, Heritage Vault's inheritance processes 
              may be automatically triggered. As their ${relationship.toLowerCase()}, you may need to assist 
              with the legal aspects of this process.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getProfessionalPortalUrl()}" style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              ⚖️ Access Professional Portal
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This notification was sent according to ${userName}'s privacy preferences. They have designated 
            you to receive professional concern notifications. For questions about this system, please contact 
            Heritage Vault professional support at legal@heritagevault.com.
          </p>
        </div>
      </div>
    `;
  }

  // Handle inheritance based on privacy preferences
  private async handleInheritanceBasedOnPrivacy(checkin: CheckinStatus): Promise<void> {
    const { privacyPreferences } = checkin;

    if (!privacyPreferences.alertBeneficiariesWhenOverdue || privacyPreferences.inheritanceOnlyMode) {
      // Direct inheritance without prior alerts
      await this.triggerDirectInheritance(checkin);
    } else {
      // Standard inheritance process
      await this.triggerInheritanceProcess(checkin);
    }
  }

  // Send direct inheritance notification (no wellness check)
  private async sendDirectInheritanceNotification(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    const beneficiaries = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !beneficiaries.length) return;

    const daysPastDue = Math.floor(
      (new Date().getTime() - new Date(checkin.nextCheckinDue).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Filter out professional contacts if separate messaging is enabled
    const familyBeneficiaries = checkin.privacyPreferences.separateProfessionalAndFamily
      ? beneficiaries.filter(b => !checkin.privacyPreferences.professionalContactIds.includes(b.id))
      : beneficiaries;

    for (const beneficiary of familyBeneficiaries) {
      const subject = `Heritage Vault: Inheritance Process for ${user.name}`;
      const message = this.generateDirectInheritanceMessage(
        user.name,
        beneficiary.name,
        beneficiary.relationship,
        daysPastDue,
        checkin.privacyPreferences.customMessage
      );

      await emailService.sendEmail({
        to: beneficiary.email,
        subject,
        html: message,
        priority: 'high'
      });

      const notification: BeneficiaryNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: beneficiary.id,
        type: 'direct_inheritance',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `Direct inheritance notification sent for ${user.name} (privacy preferences respected)`,
        actionRequired: true,
        inheritanceTriggered: true,
        privacyRespected: true,
        recipientType: 'beneficiary'
      };

      this.saveBeneficiaryNotification(notification);
    }

    console.log(`Direct inheritance notifications sent for user ${checkin.userId} (privacy respected)`);
  }

  // Trigger direct inheritance (respecting privacy)
  private async triggerDirectInheritance(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    const beneficiaries = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !beneficiaries.length) return;

    console.log(`Triggering direct inheritance for user ${checkin.userId} (privacy preferences respected)`);

    checkin.status = 'deceased_presumed';
    checkin.isActive = false;
    this.saveCheckinStatus(checkin);

    // Filter beneficiaries based on professional contact preferences
    const familyBeneficiaries = checkin.privacyPreferences.separateProfessionalAndFamily
      ? beneficiaries.filter(b => !checkin.privacyPreferences.professionalContactIds.includes(b.id))
      : beneficiaries;

    // Notify family beneficiaries about inheritance
    for (const beneficiary of familyBeneficiaries) {
      const subject = `Heritage Vault: Inheritance Access Available for ${user.name}`;
      const message = this.generatePrivacyRespectingInheritanceMessage(
        user.name,
        beneficiary.name,
        beneficiary.relationship,
        checkin.privacyPreferences.customMessage
      );

      await emailService.sendEmail({
        to: beneficiary.email,
        subject,
        html: message,
        priority: 'urgent'
      });

      const notification: BeneficiaryNotification = {
        id: `inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: beneficiary.id,
        type: 'inheritance_triggered',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `Inheritance process initiated for ${user.name} (privacy preferences respected)`,
        actionRequired: true,
        inheritanceTriggered: true,
        privacyRespected: true,
        recipientType: 'beneficiary'
      };

      this.saveBeneficiaryNotification(notification);
    }

    // Notify professional contacts separately if configured
    if (checkin.privacyPreferences.separateProfessionalAndFamily && 
        checkin.privacyPreferences.professionalContactIds.length > 0) {
      await this.notifyProfessionalsOfInheritance(checkin, user);
    }

    await this.executeInheritanceRelease(checkin.userId);
  }

  // NEW: Notify professional contacts about inheritance trigger
  private async notifyProfessionalsOfInheritance(checkin: CheckinStatus, user: any): Promise<void> {
    const allContacts = await this.getUserBeneficiaries(checkin.userId);
    const professionalContacts = allContacts.filter(contact => 
      checkin.privacyPreferences.professionalContactIds.includes(contact.id)
    );

    for (const professional of professionalContacts) {
      const subject = `Professional Notice: Inheritance Process Initiated - ${user.name}`;
      const message = this.generateProfessionalInheritanceMessage(
        user.name,
        professional.name,
        professional.relationship
      );

      await emailService.sendEmail({
        to: professional.email,
        subject,
        html: message,
        priority: 'urgent'
      });

      const notification: BeneficiaryNotification = {
        id: `prof_inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: professional.id,
        type: 'inheritance_triggered',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `Professional inheritance notification sent for ${user.name}`,
        actionRequired: true,
        inheritanceTriggered: true,
        privacyRespected: true,
        recipientType: 'professional'
      };

      this.saveBeneficiaryNotification(notification);
    }
  }

  // Generate professional inheritance notification
  private generateProfessionalInheritanceMessage(
    userName: string,
    professionalName: string,
    relationship: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚖️ Professional Notice: Inheritance Process Initiated</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${professionalName},</p>
          
          <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">🏛️ Inheritance Process Activated</h3>
            <p style="color: #dc2626; margin: 0; font-weight: bold;">
              The Heritage Vault inheritance process has been initiated for your client ${userName} due to prolonged inactivity.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            As ${userName}'s designated ${relationship.toLowerCase()}, we are notifying you that Heritage Vault's 
            automated safety protocols have determined that inheritance processes should begin due to their 
            prolonged failure to complete required check-ins.
          </p>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0;">⚖️ Legal Considerations:</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Review any relevant estate planning documents</li>
              <li>Verify the legal status of digital inheritance provisions</li>
              <li>Coordinate with beneficiaries regarding asset transfers</li>
              <li>Ensure compliance with applicable inheritance laws</li>
              <li>Provide legal guidance to beneficiaries as needed</li>
            </ul>
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #047857; margin: 0 0 15px 0;">📋 Next Steps:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Beneficiaries will receive detailed asset information</li>
              <li>Legal verification processes will begin</li>
              <li>Your professional guidance may be required for complex assets</li>
              <li>Documentation and compliance procedures will be initiated</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getProfessionalPortalUrl()}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              ⚖️ Access Professional Portal
            </a>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">📞 Professional Support</h4>
            <p style="color: #6b7280; margin: 0;">
              For legal questions or assistance with the inheritance process, contact our professional support team 
              at legal@heritagevault.com or call our dedicated legal support line.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This process was initiated automatically based on ${userName}'s predetermined instructions and privacy preferences. 
            All actions are being carried out according to their wishes as specified in their Heritage Vault.
          </p>
        </div>
      </div>
    `;
  }

  // Generate direct inheritance message (no wellness check context)
  private generateDirectInheritanceMessage(
    userName: string,
    beneficiaryName: string,
    relationship: string,
    daysPastDue: number,
    customMessage?: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏛️ Heritage Vault: Inheritance Available</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${beneficiaryName},</p>
          
          <div style="background: #ede9fe; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #4338ca; margin: 0 0 10px 0;">📋 Inheritance Access Available</h3>
            <p style="color: #4338ca; margin: 0; font-weight: bold;">
              ${userName}'s Heritage Vault inheritance process has been activated and assets are now available for transfer.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            According to ${userName}'s predetermined instructions, their Heritage Vault inheritance process has been 
            initiated. You have been designated as a beneficiary and can now access your inheritance.
          </p>

          ${customMessage ? `
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">💌 Personal Message from ${userName}:</h4>
            <p style="color: #0c4a6e; margin: 0; font-style: italic;">"${customMessage}"</p>
          </div>
          ` : ''}
          
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #047857; margin: 0 0 15px 0;">✅ What happens next:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>You will receive detailed information about assets designated for you</li>
              <li>Verification processes will begin for asset transfers</li>
              <li>Legal documentation may be required for certain assets</li>
              <li>Our team will guide you through each step of the process</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 15px 0;">📋 Required Actions:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Verify your identity and relationship to ${userName}</li>
              <li>Provide any required legal documentation</li>
              <li>Review and acknowledge asset transfer details</li>
              <li>Complete any knowledge verification tests if required</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getInheritancePortalUrl()}" style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              🏛️ Access Your Inheritance
            </a>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">📞 Support & Assistance</h4>
            <p style="color: #6b7280; margin: 0;">
              Our inheritance specialists are available to help you through this process. 
              Contact us at inheritance@heritagevault.com or call our dedicated inheritance support line.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This process was initiated automatically based on ${userName}'s predetermined instructions. 
            All actions are being carried out according to their wishes as specified in their Heritage Vault.
          </p>
        </div>
      </div>
    `;
  }

  // Generate privacy-respecting inheritance message
  private generatePrivacyRespectingInheritanceMessage(
    userName: string,
    beneficiaryName: string,
    relationship: string,
    customMessage?: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏛️ Heritage Vault: Inheritance Process Initiated</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${beneficiaryName},</p>
          
          <div style="background: #ede9fe; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #4338ca; margin: 0 0 10px 0;">📋 Inheritance Process Activated</h3>
            <p style="color: #4338ca; margin: 0; font-weight: bold;">
              ${userName}'s Heritage Vault inheritance process has been initiated according to their predetermined instructions.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            ${userName} has set up their Heritage Vault to automatically initiate inheritance processes when certain 
            conditions are met. These conditions have now been satisfied, and you are receiving this notification 
            as a designated beneficiary.
          </p>

          ${customMessage ? `
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">💌 Personal Message from ${userName}:</h4>
            <p style="color: #0c4a6e; margin: 0; font-style: italic;">"${customMessage}"</p>
          </div>
          ` : ''}
          
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #047857; margin: 0 0 15px 0;">✅ What happens next:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>You will receive detailed information about assets designated for you</li>
              <li>Verification processes will begin for asset transfers</li>
              <li>Legal documentation may be required for certain assets</li>
              <li>Our team will guide you through each step of the process</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getInheritancePortalUrl()}" style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              🏛️ Access Inheritance Portal
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This process was initiated automatically based on ${userName}'s predetermined instructions and privacy preferences. 
            All actions are being carried out according to their wishes as specified in their Heritage Vault.
          </p>
        </div>
      </div>
    `;
  }

  // Send upcoming check-in reminder
  private async sendUpcomingReminder(checkin: CheckinStatus, daysUntilDue: number): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    if (!user) return;

    const subject = `Heritage Vault Check-in Reminder - ${daysUntilDue} days remaining`;
    const message = this.generateUpcomingReminderMessage(user.name, daysUntilDue, checkin.nextCheckinDue);

    await emailService.sendEmail({
      to: user.email,
      subject,
      html: message,
      priority: daysUntilDue <= 7 ? 'high' : 'normal'
    });

    await notificationService.sendPushNotification({
      userId: checkin.userId,
      title: 'Heritage Vault Check-in Reminder',
      body: `Your 6-month check-in is due in ${daysUntilDue} days`,
      type: 'checkin_reminder',
      priority: 'high'
    });

    console.log(`Upcoming reminder sent to user ${checkin.userId}, ${daysUntilDue} days until due`);
  }

  // Send overdue check-in reminder
  private async sendOverdueReminder(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    if (!user) return;

    const daysPastDue = Math.floor(
      (new Date().getTime() - new Date(checkin.nextCheckinDue).getTime()) / (1000 * 60 * 60 * 24)
    );

    const subject = `URGENT: Heritage Vault Check-in Overdue - ${daysPastDue} days past due`;
    const message = this.generateOverdueReminderMessage(
      user.name, 
      daysPastDue, 
      checkin.gracePeriodDays - daysPastDue,
      checkin.remindersSent + 1,
      checkin.maxReminders,
      checkin.privacyPreferences
    );

    await emailService.sendEmail({
      to: user.email,
      subject,
      html: message,
      priority: 'urgent'
    });

    await notificationService.sendPushNotification({
      userId: checkin.userId,
      title: 'URGENT: Check-in Overdue',
      body: `Your Heritage Vault check-in is ${daysPastDue} days overdue. Please respond immediately.`,
      type: 'checkin_overdue',
      priority: 'urgent'
    });

    console.log(`Overdue reminder sent to user ${checkin.userId}, attempt ${checkin.remindersSent + 1}`);
  }

  // Alert beneficiaries about inactive user (original method, respects privacy)
  private async alertBeneficiaries(checkin: CheckinStatus): Promise<void> {
    if (!checkin.privacyPreferences.alertBeneficiariesWhenOverdue) {
      console.log(`Skipping beneficiary alerts for user ${checkin.userId} due to privacy preferences`);
      return;
    }

    const user = await this.getUserInfo(checkin.userId);
    const allContacts = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !allContacts.length) return;

    // Filter out professional contacts if separate messaging is enabled
    const beneficiaries = checkin.privacyPreferences.separateProfessionalAndFamily
      ? allContacts.filter(contact => !checkin.privacyPreferences.professionalContactIds.includes(contact.id))
      : allContacts;

    const daysPastDue = Math.floor(
      (new Date().getTime() - new Date(checkin.nextCheckinDue).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const beneficiary of beneficiaries) {
      const subject = `Heritage Vault Alert: ${user.name} has not responded to check-ins`;
      const message = this.generateBeneficiaryAlertMessage(
        user.name,
        beneficiary.name,
        beneficiary.relationship,
        daysPastDue,
        checkin.gracePeriodDays,
        checkin.privacyPreferences.allowWellnessChecks
      );

      await emailService.sendEmail({
        to: beneficiary.email,
        subject,
        html: message,
        priority: 'high'
      });

      const notification: BeneficiaryNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: beneficiary.id,
        type: 'user_inactive',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `User ${user.name} has not responded to check-ins for ${daysPastDue} days`,
        actionRequired: checkin.privacyPreferences.allowWellnessChecks,
        inheritanceTriggered: false,
        privacyRespected: false,
        recipientType: 'beneficiary'
      };

      this.saveBeneficiaryNotification(notification);
    }

    console.log(`Beneficiary alerts sent for user ${checkin.userId} to ${beneficiaries.length} beneficiaries`);
  }

  // Trigger inheritance process (original method)
  private async triggerInheritanceProcess(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    const allContacts = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !allContacts.length) return;

    console.log(`Triggering inheritance process for user ${checkin.userId}`);

    checkin.status = 'deceased_presumed';
    checkin.isActive = false;
    this.saveCheckinStatus(checkin);

    // Filter beneficiaries based on professional contact preferences
    const beneficiaries = checkin.privacyPreferences.separateProfessionalAndFamily
      ? allContacts.filter(contact => !checkin.privacyPreferences.professionalContactIds.includes(contact.id))
      : allContacts;

    // Notify all beneficiaries about inheritance trigger
    for (const beneficiary of beneficiaries) {
      const subject = `Heritage Vault: Inheritance Process Initiated for ${user.name}`;
      const message = this.generateInheritanceNotificationMessage(
        user.name,
        beneficiary.name,
        beneficiary.relationship
      );

      await emailService.sendEmail({
        to: beneficiary.email,
        subject,
        html: message,
        priority: 'urgent'
      });

      const notification: BeneficiaryNotification = {
        id: `inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: beneficiary.id,
        type: 'inheritance_triggered',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `Inheritance process initiated for ${user.name} due to prolonged inactivity`,
        actionRequired: true,
        inheritanceTriggered: true,
        privacyRespected: false,
        recipientType: 'beneficiary'
      };

      this.saveBeneficiaryNotification(notification);
    }

    // Notify professional contacts separately if configured
    if (checkin.privacyPreferences.separateProfessionalAndFamily && 
        checkin.privacyPreferences.professionalContactIds.length > 0) {
      await this.notifyProfessionalsOfInheritance(checkin, user);
    }

    await this.executeInheritanceRelease(checkin.userId);
  }

  // Execute inheritance release
  private async executeInheritanceRelease(userId: string): Promise<void> {
    try {
      const assets = await this.getUserAssets(userId);
      const beneficiaries = await this.getUserBeneficiaries(userId);

      for (const asset of assets) {
        for (const beneficiaryName of asset.beneficiaries) {
          const beneficiary = beneficiaries.find(b => b.name === beneficiaryName);
          if (beneficiary) {
            const inheritanceEvent = {
              id: `inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'asset_release',
              assetId: asset.id,
              beneficiaryId: beneficiary.id,
              status: 'pending',
              triggeredDate: new Date().toISOString(),
              notes: 'Triggered by 6-month check-in failure - user presumed deceased',
              triggerReason: 'checkin_failure'
            };

            this.saveInheritanceEvent(inheritanceEvent);
          }
        }
      }

      console.log(`Inheritance release executed for user ${userId}`);
    } catch (error) {
      console.error('Error executing inheritance release:', error);
    }
  }

  // Generate reminder messages (updated to include enhanced privacy info)
  private generateUpcomingReminderMessage(userName: string, daysUntilDue: number, dueDate: string): string {
    const dueDateFormatted = new Date(dueDate).toLocaleDateString();
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🕒 Heritage Vault Check-in Reminder</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hello ${userName},</p>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">⏰ Check-in Due in ${daysUntilDue} Day${daysUntilDue !== 1 ? 's' : ''}</h3>
            <p style="color: #92400e; margin: 0;">Your 6-month Heritage Vault check-in is due on <strong>${dueDateFormatted}</strong></p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            This regular check-in helps ensure your digital inheritance plan remains active and your beneficiaries 
            can be properly notified if needed. It only takes a moment to confirm you're still active.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getCheckinUrl()}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ✅ Complete Check-in Now
            </a>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">📋 What happens if you don't check in?</h4>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>You'll receive additional reminders</li>
              <li>After ${this.GRACE_PERIOD_DAYS} days past due, inheritance processes may be triggered based on your privacy preferences</li>
              <li>Your beneficiaries and/or professional contacts will be notified according to your privacy settings</li>
            </ul>
          </div>
          
          <div style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
              💡 <strong>Privacy Settings:</strong> You can update your privacy preferences in your account settings 
              to control how and when your beneficiaries and professional contacts are notified.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated message from Heritage Vault. If you have questions, please contact our support team.
          </p>
        </div>
      </div>
    `;
  }

  private generateOverdueReminderMessage(
    userName: string, 
    daysPastDue: number, 
    daysRemaining: number,
    attemptNumber: number,
    maxAttempts: number,
    privacyPreferences: CheckinPrivacyPreferences
  ): string {
    let nextStepMessage = '';
    
    if (privacyPreferences.useProfessionalContactsOnly) {
      nextStepMessage = 'your professional contacts (lawyers, etc.) will be alerted';
    } else if (!privacyPreferences.alertBeneficiariesWhenOverdue) {
      nextStepMessage = 'inheritance processes will be triggered directly (per your privacy preferences)';
    } else if (privacyPreferences.inheritanceOnlyMode) {
      nextStepMessage = 'inheritance processes will be triggered directly';
    } else {
      nextStepMessage = 'your beneficiaries will be alerted';
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 URGENT: Check-in Overdue</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hello ${userName},</p>
          
          <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Your Heritage Vault check-in is ${daysPastDue} days overdue!</h3>
            <p style="color: #dc2626; margin: 0; font-weight: bold;">
              This is reminder ${attemptNumber} of ${maxAttempts}. 
              ${daysRemaining > 0 ? `You have ${daysRemaining} days remaining before ${nextStepMessage}.` : `${nextStepMessage.charAt(0).toUpperCase() + nextStepMessage.slice(1)} soon.`}
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-weight: bold;">
            IMMEDIATE ACTION REQUIRED: Please complete your check-in now to avoid triggering inheritance processes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getCheckinUrl()}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
              🚨 COMPLETE CHECK-IN IMMEDIATELY
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0;">⚡ What happens next?</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>If you don't respond within ${daysRemaining} days, ${nextStepMessage}</li>
              <li>After ${maxAttempts} failed reminders, inheritance processes will be automatically triggered</li>
              <li>Your assets will begin the release process to designated beneficiaries</li>
            </ul>
          </div>

          <div style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">🔒 Your Enhanced Privacy Settings:</h4>
            <ul style="color: #0c4a6e; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Beneficiary alerts when overdue: ${privacyPreferences.alertBeneficiariesWhenOverdue ? 'Enabled' : 'Disabled'}</li>
              <li>Professional contacts only: ${privacyPreferences.useProfessionalContactsOnly ? 'Enabled' : 'Disabled'}</li>
              <li>Alert type: ${privacyPreferences.alertType === 'direct_inheritance' ? 'Direct inheritance' : 'Concern-based'}</li>
              <li>Inheritance-only mode: ${privacyPreferences.inheritanceOnlyMode ? 'Enabled' : 'Disabled'}</li>
            </ul>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">📞 Need Help?</h4>
            <p style="color: #6b7280; margin: 0;">
              If you're unable to access your account or need assistance, please contact our support team immediately 
              at support@heritagevault.com or call our emergency line.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private generateBeneficiaryAlertMessage(
    userName: string,
    beneficiaryName: string,
    relationship: string,
    daysPastDue: number,
    gracePeriod: number,
    allowWellnessChecks: boolean
  ): string {
    const actionSection = allowWellnessChecks ? `
      <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #1e40af; margin: 0 0 15px 0;">📞 Recommended Actions:</h4>
        <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li><strong>Contact ${userName} directly</strong> to check on their wellbeing</li>
          <li>Ask if they need help accessing their Heritage Vault account</li>
          <li>Verify they are aware of the check-in requirement</li>
          <li>If you cannot reach them, consider contacting other family members</li>
        </ul>
      </div>
    ` : `
      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #0c4a6e; margin: 0 0 15px 0;">ℹ️ Information Only:</h4>
        <p style="color: #0c4a6e; margin: 0; line-height: 1.6;">
          ${userName} has configured their privacy settings to limit wellness check requests. 
          This notification is for your information only. If inheritance processes are triggered, 
          you will receive detailed instructions.
        </p>
      </div>
    `;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Heritage Vault Alert</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${beneficiaryName},</p>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">📢 Important Notice About ${userName}</h3>
            <p style="color: #92400e; margin: 0;">
              ${userName} has not responded to Heritage Vault check-in reminders for ${daysPastDue} days.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            As a designated beneficiary (${relationship}) in ${userName}'s Heritage Vault, we're notifying you that 
            they have not completed their required 6-month check-in and have not responded to multiple reminders.
          </p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 15px 0;">🔍 What this means:</h4>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>This could indicate ${userName} is unable to access their account</li>
              <li>They may need assistance or may be experiencing difficulties</li>
              <li>In rare cases, this could indicate a serious situation</li>
            </ul>
          </div>
          
          ${actionSection}
          
          <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⏰ Timeline:</h4>
            <p style="color: #dc2626; margin: 0;">
              If ${userName} does not complete their check-in soon, Heritage Vault's inheritance processes 
              may be automatically triggered to ensure their wishes are carried out.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This notification is part of Heritage Vault's safety protocols and respects ${userName}'s privacy preferences. 
            If you have questions or concerns, please contact our support team at support@heritagevault.com.
          </p>
        </div>
      </div>
    `;
  }

  private generateInheritanceNotificationMessage(
    userName: string,
    beneficiaryName: string,
    relationship: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏛️ Heritage Vault: Inheritance Process Initiated</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Dear ${beneficiaryName},</p>
          
          <div style="background: #ede9fe; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #4338ca; margin: 0 0 10px 0;">📋 Inheritance Process Activated</h3>
            <p style="color: #4338ca; margin: 0; font-weight: bold;">
              The Heritage Vault inheritance process has been initiated for ${userName} due to prolonged inactivity.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            After multiple failed attempts to contact ${userName} over an extended period, Heritage Vault's 
            automated safety protocols have determined that inheritance processes should begin.
          </p>
          
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #047857; margin: 0 0 15px 0;">✅ What happens next:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>You will receive detailed information about assets designated for you</li>
              <li>Verification processes will begin for asset transfers</li>
              <li>Legal documentation may be required for certain assets</li>
              <li>Our team will guide you through each step of the process</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.getInheritancePortalUrl()}" style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              🏛️ Access Inheritance Portal
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This process was initiated automatically based on ${userName}'s predetermined instructions. 
            All actions are being carried out according to their wishes as specified in their Heritage Vault.
          </p>
        </div>
      </div>
    `;
  }

  private generateCheckinConfirmationMessage(userName: string, nextDueDate: Date): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Check-in Completed Successfully</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hello ${userName},</p>
          
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #047857; margin: 0 0 10px 0;">🎉 Thank you for completing your check-in!</h3>
            <p style="color: #047857; margin: 0;">Your Heritage Vault account remains active and your inheritance plan is secure.</p>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 15px 0;">📅 Next Check-in Details:</h4>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li><strong>Next check-in due:</strong> ${nextDueDate.toLocaleDateString()}</li>
              <li><strong>Reminder schedule:</strong> 30, 14, 7, and 1 days before due date</li>
              <li><strong>Grace period:</strong> ${this.GRACE_PERIOD_DAYS} days after due date</li>
            </ul>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Your regular check-ins help ensure that your digital inheritance plan works exactly as intended. 
            We'll send you reminders before your next check-in is due.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using Heritage Vault to protect your family's future.
          </p>
        </div>
      </div>
    `;
  }

  // Send check-in confirmation
  private async sendCheckinConfirmation(userEmail: string, nextDueDate: Date): Promise<void> {
    const user = await this.getUserByEmail(userEmail);
    if (!user) return;

    const subject = 'Heritage Vault Check-in Completed Successfully';
    const message = this.generateCheckinConfirmationMessage(user.name, nextDueDate);

    await emailService.sendEmail({
      to: userEmail,
      subject,
      html: message,
      priority: 'normal'
    });
  }

  // Helper methods for data persistence
  private saveCheckinStatus(status: CheckinStatus): void {
    const key = `checkin_${status.userId}`;
    localStorage.setItem(key, JSON.stringify(status));
  }

  private getCheckinStatus(userId: string): CheckinStatus | null {
    const key = `checkin_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private getAllCheckinStatuses(): CheckinStatus[] {
    const statuses: CheckinStatus[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('checkin_')) {
        const data = localStorage.getItem(key);
        if (data) {
          statuses.push(JSON.parse(data));
        }
      }
    }
    return statuses;
  }

  private saveBeneficiaryNotification(notification: BeneficiaryNotification): void {
    const key = `notification_${notification.id}`;
    localStorage.setItem(key, JSON.stringify(notification));
  }

  private saveInheritanceEvent(event: any): void {
    const key = `inheritance_event_${event.id}`;
    localStorage.setItem(key, JSON.stringify(event));
  }

  // Helper methods to get user data
  private async getUserInfo(userId: string): Promise<{ name: string; email: string } | null> {
    return {
      name: 'Aniefuna Chisom',
      email: 'aniefuna.chisom@gmail.com'
    };
  }

  private async getUserByEmail(email: string): Promise<{ name: string; email: string } | null> {
    return {
      name: 'Aniefuna Chisom',
      email: email
    };
  }

  private async getUserBeneficiaries(userId: string): Promise<any[]> {
    // This would integrate with your contacts service
    return [
      {
        id: '1',
        name: 'Onyedika Aniefuna',
        relationship: 'Sister',
        email: 'onyedika.aniefuna@email.com'
      },
      {
        id: '2',
        name: 'Maryjane Aniefuna',
        relationship: 'Sister',
        email: 'maryjane.aniefuna@email.com'
      },
      {
        id: '3',
        name: 'Robert Smith, Esq.',
        relationship: 'Attorney',
        email: 'robert@smithlaw.com'
      },
      {
        id: '4',
        name: 'Dr. Sarah Johnson',
        relationship: 'Family Doctor',
        email: 'sarah.johnson@medical.com'
      }
    ];
  }

  private async getUserAssets(userId: string): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'Primary Checking Account',
        beneficiaries: ['Onyedika Aniefuna', 'Maryjane Aniefuna']
      }
    ];
  }

  private async scheduleReminders(checkin: CheckinStatus, userEmail: string): Promise<void> {
    console.log(`Reminders scheduled for user ${checkin.userId}`);
  }

  private async cancelPendingReminders(checkinId: string): Promise<void> {
    console.log(`Pending reminders cancelled for checkin ${checkinId}`);
  }

  private getCheckinUrl(): string {
    return `${window.location.origin}/checkin`;
  }

  private getInheritancePortalUrl(): string {
    return `${window.location.origin}/inheritance`;
  }

  private getProfessionalPortalUrl(): string {
    return `${window.location.origin}/professional`;
  }

  // Public API methods
  async getUserCheckinStatus(userId: string): Promise<CheckinStatus | null> {
    return this.getCheckinStatus(userId);
  }

  async getAllUserNotifications(userId: string): Promise<BeneficiaryNotification[]> {
    const notifications: BeneficiaryNotification[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('notification_')) {
        const data = localStorage.getItem(key);
        if (data) {
          const notification = JSON.parse(data);
          if (notification.userId === userId) {
            notifications.push(notification);
          }
        }
      }
    }
    return notifications.sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
  }
}

// Create singleton instance
export const checkinService = new CheckinService();

export type { CheckinStatus, CheckinReminder, BeneficiaryNotification, CheckinPrivacyPreferences };