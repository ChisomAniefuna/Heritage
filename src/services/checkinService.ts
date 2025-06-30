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
}

export interface CheckinReminder {
  id: string;
  checkinId: string;
  type: 'initial' | 'warning' | 'final' | 'beneficiary_alert';
  scheduledDate: string;
  sentDate?: string;
  status: 'pending' | 'sent' | 'failed';
  recipientType: 'user' | 'beneficiary';
  recipientEmail: string;
  message: string;
}

export interface BeneficiaryNotification {
  id: string;
  userId: string;
  beneficiaryId: string;
  type: 'user_inactive' | 'presumed_deceased' | 'inheritance_triggered';
  sentDate: string;
  status: 'sent' | 'acknowledged' | 'action_taken';
  message: string;
  actionRequired: boolean;
  inheritanceTriggered: boolean;
}

class CheckinService {
  private readonly CHECKIN_INTERVAL_MONTHS = 6;
  private readonly REMINDER_DAYS_BEFORE = [30, 14, 7, 1]; // Days before due date
  private readonly GRACE_PERIOD_DAYS = 14; // Days after due date before triggering alerts
  private readonly MAX_REMINDERS = 6; // Total reminders before presuming deceased

  // Initialize check-in for a new user
  async initializeUserCheckin(userId: string, userEmail: string): Promise<CheckinStatus> {
    const now = new Date();
    const nextCheckin = new Date(now);
    nextCheckin.setMonth(nextCheckin.getMonth() + this.CHECKIN_INTERVAL_MONTHS);

    const checkinStatus: CheckinStatus = {
      id: `checkin_${userId}_${Date.now()}`,
      userId,
      lastCheckinDate: now.toISOString(),
      nextCheckinDue: nextCheckin.toISOString(),
      status: 'active',
      remindersSent: 0,
      maxReminders: this.MAX_REMINDERS,
      gracePeriodDays: this.GRACE_PERIOD_DAYS,
      isActive: true
    };

    // Save to localStorage (in production, this would be a database)
    this.saveCheckinStatus(checkinStatus);
    
    // Schedule initial reminders
    await this.scheduleReminders(checkinStatus, userEmail);

    console.log('User check-in initialized:', checkinStatus);
    return checkinStatus;
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

    // Update check-in status
    const updatedStatus: CheckinStatus = {
      ...currentStatus,
      lastCheckinDate: now.toISOString(),
      nextCheckinDue: nextCheckin.toISOString(),
      status: 'active',
      remindersSent: 0,
      isActive: true
    };

    this.saveCheckinStatus(updatedStatus);

    // Cancel any pending reminders
    await this.cancelPendingReminders(currentStatus.id);

    // Schedule new reminders
    await this.scheduleReminders(updatedStatus, userEmail);

    // Send confirmation
    await this.sendCheckinConfirmation(userEmail, nextCheckin);

    console.log('User check-in processed successfully:', updatedStatus);
    return updatedStatus;
  }

  // Check for overdue check-ins and send reminders
  async processOverdueCheckins(): Promise<{
    processed: number;
    remindersSent: number;
    beneficiaryAlerts: number;
    inheritanceTriggered: number;
  }> {
    const results = {
      processed: 0,
      remindersSent: 0,
      beneficiaryAlerts: 0,
      inheritanceTriggered: 0
    };

    const allCheckins = this.getAllCheckinStatuses();
    const now = new Date();

    for (const checkin of allCheckins) {
      if (!checkin.isActive) continue;

      const dueDate = new Date(checkin.nextCheckinDue);
      const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      results.processed++;

      if (daysPastDue > 0) {
        // Check-in is overdue
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
          // Past grace period - alert beneficiaries
          if (checkin.remindersSent >= checkin.maxReminders) {
            // Presume deceased and trigger inheritance
            checkin.status = 'deceased_presumed';
            this.saveCheckinStatus(checkin);
            
            await this.triggerInheritanceProcess(checkin);
            results.inheritanceTriggered++;
          } else {
            // Send beneficiary alerts
            await this.alertBeneficiaries(checkin);
            results.beneficiaryAlerts++;
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

    // Send push notification if available
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
      checkin.maxReminders
    );

    await emailService.sendEmail({
      to: user.email,
      subject,
      html: message,
      priority: 'urgent'
    });

    // Send urgent push notification
    await notificationService.sendPushNotification({
      userId: checkin.userId,
      title: 'URGENT: Check-in Overdue',
      body: `Your Heritage Vault check-in is ${daysPastDue} days overdue. Please respond immediately.`,
      type: 'checkin_overdue',
      priority: 'urgent'
    });

    console.log(`Overdue reminder sent to user ${checkin.userId}, attempt ${checkin.remindersSent + 1}`);
  }

  // Alert beneficiaries about inactive user
  private async alertBeneficiaries(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    const beneficiaries = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !beneficiaries.length) return;

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
        checkin.gracePeriodDays
      );

      await emailService.sendEmail({
        to: beneficiary.email,
        subject,
        html: message,
        priority: 'high'
      });

      // Save beneficiary notification record
      const notification: BeneficiaryNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: beneficiary.id,
        type: 'user_inactive',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `User ${user.name} has not responded to check-ins for ${daysPastDue} days`,
        actionRequired: false,
        inheritanceTriggered: false
      };

      this.saveBeneficiaryNotification(notification);
    }

    console.log(`Beneficiary alerts sent for user ${checkin.userId} to ${beneficiaries.length} beneficiaries`);
  }

  // Trigger inheritance process
  private async triggerInheritanceProcess(checkin: CheckinStatus): Promise<void> {
    const user = await this.getUserInfo(checkin.userId);
    const beneficiaries = await this.getUserBeneficiaries(checkin.userId);
    
    if (!user || !beneficiaries.length) return;

    console.log(`Triggering inheritance process for user ${checkin.userId}`);

    // Mark user as presumed deceased
    checkin.status = 'deceased_presumed';
    checkin.isActive = false;
    this.saveCheckinStatus(checkin);

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

      // Save inheritance notification
      const notification: BeneficiaryNotification = {
        id: `inherit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: checkin.userId,
        beneficiaryId: beneficiary.id,
        type: 'inheritance_triggered',
        sentDate: new Date().toISOString(),
        status: 'sent',
        message: `Inheritance process initiated for ${user.name} due to prolonged inactivity`,
        actionRequired: true,
        inheritanceTriggered: true
      };

      this.saveBeneficiaryNotification(notification);
    }

    // Trigger actual inheritance release logic
    await this.executeInheritanceRelease(checkin.userId);
  }

  // Execute inheritance release
  private async executeInheritanceRelease(userId: string): Promise<void> {
    try {
      // This would integrate with the main inheritance system
      // For now, we'll create inheritance events
      const assets = await this.getUserAssets(userId);
      const beneficiaries = await this.getUserBeneficiaries(userId);

      for (const asset of assets) {
        for (const beneficiaryName of asset.beneficiaries) {
          const beneficiary = beneficiaries.find(b => b.name === beneficiaryName);
          if (beneficiary) {
            // Create inheritance event
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

  // Generate reminder messages
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
              <li>After ${this.GRACE_PERIOD_DAYS} days past due, your beneficiaries will be alerted</li>
              <li>If no response after ${this.MAX_REMINDERS} reminders, inheritance processes may be triggered</li>
            </ul>
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
    maxAttempts: number
  ): string {
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
              ${daysRemaining > 0 ? `You have ${daysRemaining} days remaining before beneficiaries are alerted.` : 'Your beneficiaries will be notified soon.'}
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
              <li>If you don't respond within ${daysRemaining} days, your beneficiaries will be contacted</li>
              <li>After ${maxAttempts} failed reminders, inheritance processes will be automatically triggered</li>
              <li>Your assets will begin the release process to designated beneficiaries</li>
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
    gracePeriod: number
  ): string {
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
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0;">📞 Recommended Actions:</h4>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li><strong>Contact ${userName} directly</strong> to check on their wellbeing</li>
              <li>Ask if they need help accessing their Heritage Vault account</li>
              <li>Verify they are aware of the check-in requirement</li>
              <li>If you cannot reach them, consider contacting other family members</li>
            </ul>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⏰ Timeline:</h4>
            <p style="color: #dc2626; margin: 0;">
              If ${userName} does not complete their check-in soon, Heritage Vault's inheritance processes 
              may be automatically triggered to ensure their wishes are carried out.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This notification is part of Heritage Vault's safety protocols. If you have questions or concerns, 
            please contact our support team at support@heritagevault.com.
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
              🏛️ Access Inheritance Portal
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

  // Helper methods for data persistence (in production, these would use a database)
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

  // Helper methods to get user data (these would integrate with your user service)
  private async getUserInfo(userId: string): Promise<{ name: string; email: string } | null> {
    // This would integrate with your user service
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
      }
    ];
  }

  private async getUserAssets(userId: string): Promise<any[]> {
    // This would integrate with your assets service
    return [
      {
        id: '1',
        name: 'Primary Checking Account',
        beneficiaries: ['Onyedika Aniefuna', 'Maryjane Aniefuna']
      }
    ];
  }

  private async scheduleReminders(checkin: CheckinStatus, userEmail: string): Promise<void> {
    // This would integrate with a job scheduler in production
    console.log(`Reminders scheduled for user ${checkin.userId}`);
  }

  private async cancelPendingReminders(checkinId: string): Promise<void> {
    // This would cancel scheduled jobs in production
    console.log(`Pending reminders cancelled for checkin ${checkinId}`);
  }

  private getCheckinUrl(): string {
    return `${window.location.origin}/checkin`;
  }

  private getInheritancePortalUrl(): string {
    return `${window.location.origin}/inheritance`;
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

export type { CheckinStatus, CheckinReminder, BeneficiaryNotification };