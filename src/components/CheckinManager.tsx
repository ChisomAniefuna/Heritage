import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Bell, Settings, Calendar, Users, Mail, Shield } from 'lucide-react';
import { checkinService, CheckinStatus, BeneficiaryNotification } from '../services/checkinService';
import { notificationService } from '../services/notificationService';

interface CheckinManagerProps {
  userId: string;
  userEmail: string;
}

const CheckinManager: React.FC<CheckinManagerProps> = ({ userId, userEmail }) => {
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null);
  const [notifications, setNotifications] = useState<BeneficiaryNotification[]>([]);
  const [isProcessingCheckin, setIsProcessingCheckin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [lastProcessedDate, setLastProcessedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadCheckinData();
    checkPushNotificationStatus();
  }, [userId]);

  const loadCheckinData = async () => {
    try {
      // Load current check-in status
      let status = await checkinService.getUserCheckinStatus(userId);
      
      if (!status) {
        // Initialize check-in for new user
        status = await checkinService.initializeUserCheckin(userId, userEmail);
      }
      
      setCheckinStatus(status);

      // Load notifications
      const userNotifications = await checkinService.getAllUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading check-in data:', error);
    }
  };

  const checkPushNotificationStatus = async () => {
    const isSubscribed = await notificationService.isUserSubscribed(userId);
    setPushNotificationsEnabled(isSubscribed);
  };

  const handleCheckin = async () => {
    if (!checkinStatus) return;

    setIsProcessingCheckin(true);
    try {
      const updatedStatus = await checkinService.processUserCheckin(userId, userEmail);
      setCheckinStatus(updatedStatus);
      
      // Show success message
      alert('Check-in completed successfully! Your next check-in is scheduled for ' + 
            new Date(updatedStatus.nextCheckinDue).toLocaleDateString());
    } catch (error) {
      console.error('Error processing check-in:', error);
      alert('Failed to process check-in. Please try again.');
    } finally {
      setIsProcessingCheckin(false);
    }
  };

  const enablePushNotifications = async () => {
    try {
      const initialized = await notificationService.initializePushNotifications();
      if (initialized) {
        const subscription = await notificationService.subscribeUser(userId);
        if (subscription) {
          setPushNotificationsEnabled(true);
          alert('Push notifications enabled successfully!');
        }
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      alert('Failed to enable push notifications.');
    }
  };

  const processOverdueCheckins = async () => {
    try {
      setLastProcessedDate(new Date());
      const results = await checkinService.processOverdueCheckins();
      
      alert(`Processed ${results.processed} check-ins:\n` +
            `- Reminders sent: ${results.remindersSent}\n` +
            `- Beneficiary alerts: ${results.beneficiaryAlerts}\n` +
            `- Inheritance triggered: ${results.inheritanceTriggered}`);
      
      // Reload data
      await loadCheckinData();
    } catch (error) {
      console.error('Error processing overdue check-ins:', error);
      alert('Failed to process overdue check-ins.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-orange-600 bg-orange-100';
      case 'deceased_presumed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'warning': return Clock;
      case 'overdue': return AlertTriangle;
      case 'deceased_presumed': return AlertTriangle;
      default: return Clock;
    }
  };

  const getDaysUntilDue = () => {
    if (!checkinStatus) return 0;
    const dueDate = new Date(checkinStatus.nextCheckinDue);
    const now = new Date();
    return Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = () => {
    return getDaysUntilDue() < 0;
  };

  if (!checkinStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">Loading check-in status...</p>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(checkinStatus.status);
  const daysUntilDue = getDaysUntilDue();

  return (
    <div className="space-y-6">
      {/* Main Check-in Status */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${getStatusColor(checkinStatus.status)}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">6-Month Check-in Status</h3>
              <p className="text-slate-600 capitalize">{checkinStatus.status.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {isOverdue() ? Math.abs(daysUntilDue) : daysUntilDue}
            </div>
            <div className="text-sm text-slate-600">
              Days {isOverdue() ? 'overdue' : 'until due'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {new Date(checkinStatus.nextCheckinDue).toLocaleDateString()}
            </div>
            <div className="text-sm text-slate-600">Next check-in due</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {checkinStatus.remindersSent}/{checkinStatus.maxReminders}
            </div>
            <div className="text-sm text-slate-600">Reminders sent</div>
          </div>
        </div>

        {checkinStatus.status === 'active' && !isOverdue() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Your account is active and secure</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your next check-in is due in {daysUntilDue} days. We'll send you reminders before it's due.
            </p>
          </div>
        )}

        {isOverdue() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Check-in overdue!</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Your check-in is {Math.abs(daysUntilDue)} days overdue. Please complete it immediately to avoid 
              triggering inheritance processes.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleCheckin}
            disabled={isProcessingCheckin}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              isOverdue() 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:bg-slate-400`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isProcessingCheckin ? 'Processing...' : 'Complete Check-in'}</span>
          </button>

          {!pushNotificationsEnabled && (
            <button
              onClick={enablePushNotifications}
              className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Enable Notifications</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Check-in Settings</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-slate-900">Push Notifications</h5>
                <p className="text-sm text-slate-600">Receive browser notifications for reminders</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${pushNotificationsEnabled ? 'text-green-600' : 'text-slate-500'}`}>
                  {pushNotificationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {!pushNotificationsEnabled && (
                  <button
                    onClick={enablePushNotifications}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h5 className="font-medium text-slate-900 mb-2">Check-in Schedule</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Interval:</span>
                  <span className="ml-2 font-medium">6 months</span>
                </div>
                <div>
                  <span className="text-slate-600">Grace period:</span>
                  <span className="ml-2 font-medium">{checkinStatus.gracePeriodDays} days</span>
                </div>
                <div>
                  <span className="text-slate-600">Max reminders:</span>
                  <span className="ml-2 font-medium">{checkinStatus.maxReminders}</span>
                </div>
                <div>
                  <span className="text-slate-600">Last check-in:</span>
                  <span className="ml-2 font-medium">
                    {new Date(checkinStatus.lastCheckinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Controls (for testing) */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">System Controls</h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={processOverdueCheckins}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Process Overdue Check-ins</span>
          </button>
          
          {lastProcessedDate && (
            <span className="text-sm text-slate-600">
              Last processed: {lastProcessedDate.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          This simulates the automated system that runs daily to check for overdue check-ins and send notifications.
        </p>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Recent Notifications</h4>
          <div className="space-y-3">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className={`p-1 rounded ${
                  notification.type === 'inheritance_triggered' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {notification.type === 'inheritance_triggered' ? (
                    <Shield className="w-4 h-4 text-red-600" />
                  ) : (
                    <Mail className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 text-sm">
                      {notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(notification.sentDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                  {notification.actionRequired && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Action Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">How the 6-Month Check-in System Works</h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Every 6 months, you'll receive reminders to complete a simple check-in</span>
          </div>
          <div className="flex items-start space-x-2">
            <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Reminders are sent 30, 14, 7, and 1 days before your check-in is due</span>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>You have a {checkinStatus.gracePeriodDays}-day grace period after the due date</span>
          </div>
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>If you don't respond, your beneficiaries will be alerted to check on you</span>
          </div>
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>After {checkinStatus.maxReminders} failed attempts, inheritance processes may be triggered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinManager;