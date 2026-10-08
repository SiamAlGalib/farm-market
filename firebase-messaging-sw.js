// Minimal Service Worker for Firebase Messaging (compat SDK)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// TODO: replace with real config (same as in app.js)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background messages – show simple notification
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Notification';
  const options = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon.png'
  };
  self.registration.showNotification(title, options);
});