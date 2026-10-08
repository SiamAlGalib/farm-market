// Service Worker for Firebase Cloud Messaging (modular compat version)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ---- TODO: replace with the same config used in index.html ----
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Background message handler – displays a notification safely using textContent
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Notification';
  const body = payload.notification?.body || '';
  const options = {
    body,
    icon: '/icons/icon-192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});