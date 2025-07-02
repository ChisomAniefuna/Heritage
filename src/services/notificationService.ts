interface PushNotification {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  type: 'checkin_reminder' | 'checkin_overdue' | 'inheritance_alert' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledTime?: string;
  expirationTime?: string;
}

interface NotificationSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
  isActive: boolean;
}

class NotificationService {
  private vapidKeys = {
    publicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
    privateKey: import.meta.env.VITE_VAPID_PRIVATE_KEY || ''
  };

  // Initialize push notifications
  async initializePushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Subscribe user to push notifications
  async subscribeUser(userId: string): Promise<NotificationSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKeys.publicKey)
      });

      const subscriptionData: NotificationSubscription = {
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        },
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Save subscription to localStorage (in production, save to server)
      localStorage.setItem(`push_subscription_${userId}`, JSON.stringify(subscriptionData));

      console.log('User subscribed to push notifications:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return null;
    }
  }

  // Send push notification
  async sendPushNotification(notification: PushNotification): Promise<boolean> {
    try {
      // Get user's subscription
      const subscriptionData = localStorage.getItem(`push_subscription_${notification.userId}`);
      if (!subscriptionData) {
        console.warn('No push subscription found for user:', notification.userId);
        return false;
      }

      const subscription: NotificationSubscription = JSON.parse(subscriptionData);

      // In a real implementation, this would send to your server
      // which would then use web-push library to send the notification
      const payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        image: notification.image,
        data: {
          ...notification.data,
          type: notification.type,
          userId: notification.userId,
          timestamp: new Date().toISOString()
        },
        actions: notification.actions,
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low'
      };

      // For demo purposes, show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: payload.icon,
          badge: payload.badge,
          image: payload.image,
          data: payload.data,
          requireInteraction: payload.requireInteraction,
          silent: payload.silent
        });

        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
          
          // Handle notification click based on type
          this.handleNotificationClick(notification.type, notification.data);
        };

        // Auto-close after 10 seconds unless urgent
        if (notification.priority !== 'urgent') {
          setTimeout(() => browserNotification.close(), 10000);
        }
      }

      console.log('Push notification sent:', notification);
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Handle notification click
  private handleNotificationClick(type: string, data?: any): void {
    switch (type) {
      case 'checkin_reminder':
      case 'checkin_overdue':
        window.location.href = '/checkin';
        break;
      case 'inheritance_alert':
        window.location.href = '/inheritance';
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  // Schedule notification
  async scheduleNotification(notification: PushNotification, scheduledTime: Date): Promise<boolean> {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      // Send immediately if scheduled time is in the past
      return this.sendPushNotification(notification);
    }

    // Schedule for future delivery
    setTimeout(() => {
      this.sendPushNotification(notification);
    }, delay);

    console.log(`Notification scheduled for ${scheduledTime.toISOString()}`);
    return true;
  }

  // Send multiple notifications
  async sendBulkNotifications(notifications: PushNotification[]): Promise<boolean[]> {
    const results = [];
    
    for (const notification of notifications) {
      const result = await this.sendPushNotification(notification);
      results.push(result);
      
      // Add small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Unsubscribe user from notifications
  async unsubscribeUser(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from localStorage
      localStorage.removeItem(`push_subscription_${userId}`);

      console.log('User unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      return false;
    }
  }

  // Check if user is subscribed
  async isUserSubscribed(userId: string): Promise<boolean> {
    const subscriptionData = localStorage.getItem(`push_subscription_${userId}`);
    return !!subscriptionData;
  }

  // Get user's notification preferences
  getUserNotificationPreferences(userId: string): {
    pushEnabled: boolean;
    emailEnabled: boolean;
    checkinReminders: boolean;
    inheritanceAlerts: boolean;
    quietHours: { start: string; end: string } | null;
  } {
    const preferences = localStorage.getItem(`notification_preferences_${userId}`);
    
    if (preferences) {
      return JSON.parse(preferences);
    }

    // Default preferences
    return {
      pushEnabled: true,
      emailEnabled: true,
      checkinReminders: true,
      inheritanceAlerts: true,
      quietHours: { start: '22:00', end: '08:00' }
    };
  }

  // Update user's notification preferences
  updateUserNotificationPreferences(
    userId: string, 
    preferences: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      checkinReminders?: boolean;
      inheritanceAlerts?: boolean;
      quietHours?: { start: string; end: string } | null;
    }
  ): void {
    const currentPreferences = this.getUserNotificationPreferences(userId);
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    localStorage.setItem(`notification_preferences_${userId}`, JSON.stringify(updatedPreferences));
    console.log('Notification preferences updated:', updatedPreferences);
  }

  // Check if current time is within quiet hours
  private isQuietHours(userId: string): boolean {
    const preferences = this.getUserNotificationPreferences(userId);
    
    if (!preferences.quietHours) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

export type { PushNotification, NotificationSubscription };