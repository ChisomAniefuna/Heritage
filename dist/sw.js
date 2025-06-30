// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag || 'heritage-vault-notification',
    renotify: true,
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data;
  let url = '/dashboard';

  // Determine URL based on notification type
  if (data && data.type) {
    switch (data.type) {
      case 'checkin_reminder':
      case 'checkin_overdue':
        url = '/checkin';
        break;
      case 'inheritance_alert':
        url = '/inheritance';
        break;
      default:
        url = '/dashboard';
    }
  }

  // Handle action clicks
  if (event.action) {
    switch (event.action) {
      case 'checkin':
        url = '/checkin';
        break;
      case 'view':
        url = '/dashboard';
        break;
      case 'dismiss':
        return; // Don't open any window
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  const data = event.notification.data;
  if (data && data.trackDismissal) {
    // Send analytics or tracking data
    fetch('/api/notifications/dismissed', {
      method: 'POST',
      body: JSON.stringify({
        notificationId: data.id,
        dismissedAt: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => console.error('Failed to track dismissal:', err));
  }
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-checkin-sync') {
    event.waitUntil(
      // Sync any pending check-in data when back online
      syncCheckinData()
    );
  }
});

async function syncCheckinData() {
  try {
    // This would sync any offline check-in data
    console.log('Syncing check-in data...');
  } catch (error) {
    console.error('Failed to sync check-in data:', error);
  }
}