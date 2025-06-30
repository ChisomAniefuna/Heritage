import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, Bell, Settings, Calendar, Users, Mail, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { checkinService, CheckinStatus, BeneficiaryNotification, CheckinPrivacyPreferences } from '../services/checkinService';
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
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [lastProcessedDate, setLastProcessedDate] = useState<Date | null>(null);
  const [privacyPreferences, setPrivacyPreferences] = useState<CheckinPrivacyPreferences>({
    alertBeneficiariesWhenOverdue: true,
    alertType: 'concern',
    allowWellnessChecks: true,
    inheritanceOnlyMode: false,
    customMessage: undefined
  });

  useEffect(() => {
    loadCheckinData();
    checkPushNotificationStatus();
  }, [userId]);

  const loadCheckinData = async () => {
    try {
      // Load current check-in status
      let status = await checkinService.getUserCheckinStatus(userId);
      
      if (!status) {
        // Initialize check-in for new user with default privacy preferences
        status = await checkinService.initializeUserCheckin(userId, userEmail, privacyPreferences);
      }
      
      setCheckinStatus(status);
      setPrivacyPreferences(status.privacyPreferences);

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

  const handlePrivacyUpdate = async (updates: Partial<CheckinPrivacyPreferences>) => {
    try {
      const updatedPreferences = { ...privacyPreferences, ...updates };
      setPrivacyPreferences(updatedPreferences);
      
      const updatedStatus = await checkinService.updatePrivacyPreferences(userId, updatedPreferences);
      if (updatedStatus) {
        setCheckinStatus(updatedStatus);
        alert('Privacy preferences updated successfully!');
      }
    } catch (error) {
      console.error('Error updating privacy preferences:', error);
      alert('Failed to update privacy preferences.');
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
            `- Inheritance triggered: ${results.inheritanceTriggered}\n` +
            `- Privacy respected: ${results.privacyRespected}`);
      
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
              title="Privacy Settings"
            >
              <Lock className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
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

        {/* Privacy Status Indicator */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">Privacy Settings Active</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <span className="font-medium">Beneficiary alerts:</span> 
              <span className="ml-1">{privacyPreferences.alertBeneficiariesWhenOverdue ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <span className="font-medium">Alert type:</span> 
              <span className="ml-1 capitalize">{privacyPreferences.alertType.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-medium">Wellness checks:</span> 
              <span className="ml-1">{privacyPreferences.allowWellnessChecks ? 'Allowed' : 'Not allowed'}</span>
            </div>
            <div>
              <span className="font-medium">Mode:</span> 
              <span className="ml-1">{privacyPreferences.inheritanceOnlyMode ? 'Inheritance-only' : 'Standard'}</span>
            </div>
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

      {/* Privacy Settings Panel */}
      {showPrivacySettings && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <span>Privacy & Beneficiary Alert Settings</span>
          </h4>
          
          <div className="space-y-6">
            {/* Main Privacy Toggle */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-purple-900">Alert Beneficiaries When Overdue</h5>
                  <p className="text-sm text-purple-700">
                    Control whether your beneficiaries are notified if you miss check-ins
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyUpdate({ 
                    alertBeneficiariesWhenOverdue: !privacyPreferences.alertBeneficiariesWhenOverdue 
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacyPreferences.alertBeneficiariesWhenOverdue ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacyPreferences.alertBeneficiariesWhenOverdue ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {!privacyPreferences.alertBeneficiariesWhenOverdue && (
                <div className="bg-purple-100 border border-purple-300 rounded p-3 mt-3">
                  <p className="text-sm text-purple-800">
                    <strong>Privacy Mode:</strong> Your beneficiaries will NOT be alerted to check on you. 
                    Inheritance processes will be triggered directly after maximum failed attempts.
                  </p>
                </div>
              )}
            </div>

            {/* Alert Type Selection */}
            {privacyPreferences.alertBeneficiariesWhenOverdue && (
              <div>
                <h5 className="font-medium text-slate-900 mb-3">Alert Type</h5>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={privacyPreferences.alertType === 'concern'}
                      onChange={() => handlePrivacyUpdate({ alertType: 'concern' })}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <span className="font-medium text-slate-900">Concern-based alerts</span>
                      <p className="text-sm text-slate-600">
                        Ask beneficiaries to check on your wellbeing first, then proceed to inheritance if needed
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={privacyPreferences.alertType === 'direct_inheritance'}
                      onChange={() => handlePrivacyUpdate({ alertType: 'direct_inheritance' })}
                      className="mt-1 text-purple-600"
                    />
                    <div>
                      <span className="font-medium text-slate-900">Direct inheritance alerts</span>
                      <p className="text-sm text-slate-600">
                        Skip wellness checks and notify beneficiaries directly about inheritance availability
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Wellness Checks Toggle */}
            {privacyPreferences.alertBeneficiariesWhenOverdue && privacyPreferences.alertType === 'concern' && (
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900">Allow Wellness Check Requests</h5>
                  <p className="text-sm text-slate-600">
                    Let beneficiaries know they can contact you to check on your wellbeing
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyUpdate({ 
                    allowWellnessChecks: !privacyPreferences.allowWellnessChecks 
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacyPreferences.allowWellnessChecks ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacyPreferences.allowWellnessChecks ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            {/* Inheritance-Only Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-slate-900">Inheritance-Only Mode</h5>
                <p className="text-sm text-slate-600">
                  Skip all wellness checks and go directly to inheritance notifications
                </p>
              </div>
              <button
                onClick={() => handlePrivacyUpdate({ 
                  inheritanceOnlyMode: !privacyPreferences.inheritanceOnlyMode 
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacyPreferences.inheritanceOnlyMode ? 'bg-red-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacyPreferences.inheritanceOnlyMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Custom Message */}
            <div>
              <h5 className="font-medium text-slate-900 mb-2">Custom Message for Beneficiaries (Optional)</h5>
              <textarea
                value={privacyPreferences.customMessage || ''}
                onChange={(e) => setPrivacyPreferences(prev => ({ ...prev, customMessage: e.target.value }))}
                onBlur={() => handlePrivacyUpdate({ customMessage: privacyPreferences.customMessage })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add a personal message that will be included in inheritance notifications..."
              />
              <p className="text-xs text-slate-500 mt-1">
                This message will be included in notifications to your beneficiaries
              </p>
            </div>
          </div>
        </div>
      )}

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
          This simulates the automated system that runs daily to check for overdue check-ins and send notifications 
          (respecting privacy preferences).
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
                  notification.type === 'inheritance_triggered' ? 'bg-red-100' : 
                  notification.privacyRespected ? 'bg-purple-100' : 'bg-yellow-100'
                }`}>
                  {notification.type === 'inheritance_triggered' ? (
                    <Shield className="w-4 h-4 text-red-600" />
                  ) : notification.privacyRespected ? (
                    <Lock className="w-4 h-4 text-purple-600" />
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
                  <div className="flex items-center space-x-2 mt-2">
                    {notification.actionRequired && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Action Required
                      </span>
                    )}
                    {notification.privacyRespected && (
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        Privacy Respected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">How Privacy-Aware Check-ins Work</h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Every 6 months, you'll receive reminders to complete a simple check-in</span>
          </div>
          <div className="flex items-start space-x-2">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Your privacy preferences control how and when beneficiaries are notified</span>
          </div>
          <div className="flex items-start space-x-2">
            <EyeOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>You can choose to skip wellness checks and go directly to inheritance notifications</span>
          </div>
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Beneficiaries are only contacted according to your specific privacy settings</span>
          </div>
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Inheritance processes respect your privacy preferences throughout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinManager;