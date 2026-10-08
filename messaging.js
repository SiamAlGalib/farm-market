// messaging.js – handles token registration & foreground messages (modular SDK)
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js";
import { doc, setDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js";

/**
 * Initialise push notifications for the current logged‑in user.
 * Returns a promise that resolves when the workflow completes.
 */
export async function initPushNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('Push notifications are not supported in this browser.');
    return;
  }

  // Request permission – use the Promise API for clarity
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('User denied notification permission.');
    return;
  }

  // Initialise Messaging with the already‑created firebaseApp (global)
  const messaging = getMessaging(window.firebaseApp);

  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY' // <-- replace with your VAPID key
    });
    if (token) {
      await saveToken(token);
    }
  } catch (err) {
    console.error('Failed to get FCM token:', err);
    return;
  }

  // Foreground messages – show a safe toast (textContent only)
  onMessage(messaging, payload => {
    const title = payload.notification?.title || '';
    const body = payload.notification?.body || '';
    showToast(`${title}: ${body}`);
  });
}

/**
 * Save the FCM token under the current user's sub‑collection.
 * If the user is not yet authenticated, wait for auth state.
 */
async function saveToken(token) {
  const auth = window.auth;
  const db = window.db;

  // Ensure we have a logged‑in user; wait up to 5 seconds for auth state.
  const user = await new Promise(resolve => {
    if (auth.currentUser) return resolve(auth.currentUser);
    const unsub = auth.onAuthStateChanged(u => {
      if (u) { unsub(); resolve(u); }
    });
    setTimeout(() => { unsub(); resolve(null); }, 5000);
  });

  if (!user) {
    console.warn('Cannot store token – no authenticated user.');
    return;
  }

  const tokenRef = doc(db, 'users', user.uid, 'pushTokens', token);
  try {
    await setDoc(tokenRef, {
      token,
      createdAt: new Date().toISOString(),
      platform: 'web',
      lastSeen: new Date().toISOString()
    });
  } catch (e) {
    console.error('Error writing token to Firestore:', e);
  }
}

/**
 * Simple toast that sanitises content via textContent.
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
    background:#333;color:#fff;padding:10px 20px;border-radius:4px;
    z-index:9999;font-size:14px;opacity:0.9;`
  ;
  toast.textContent = message; // safe insertion
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/**
 * Cleanup old tokens – can be called periodically (e.g., on logout).
 */
export async function revokeTokens() {
  const auth = window.auth;
  const db = window.db;
  const user = auth.currentUser;
  if (!user) return;
  const coll = collection(db, 'users', user.uid, 'pushTokens');
  try {
    const snap = await getDocs(coll);
    const promises = [];
    const now = Date.now();
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const age = now - new Date(data.lastSeen).getTime();
      if (age > 30 * 24 * 60 * 60 * 1000) { // >30 days
        promises.push(deleteDoc(docSnap.ref));
      }
    });
    await Promise.all(promises);
  } catch (e) {
    console.error('Failed to clean up tokens:', e);
  }
}
