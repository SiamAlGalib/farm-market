// messaging.js – push notification helper and badge logic
// Uses modular Firebase SDK (already loaded in index.html)
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

export async function initPushNotifications() {
  const app = window.firebaseApp;
  const messaging = getMessaging(app);
  try {
    const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    console.log('FCM token', token);
    // Optionally store token in Firestore under user profile
    return token;
  } catch (err) {
    console.error('Push init error', err);
    throw err;
  }
}

// ---------- Stock badge helper ----------
/**
 * Show low‑stock badge on a product card.
 * @param {HTMLElement} cardEl - Root element of the product card.
 * @param {number} qty - Quantity in kg.
 * @param {string} role - "farmer" or "buyer".
 */
export function addStockBadge(cardEl, qty, role) {
  const lowBadge = cardEl.querySelector('.stock-badge.low-stock');
  const limitedBadge = cardEl.querySelector('.stock-badge.limited');
  if (!lowBadge && !limitedBadge) return;
  if (qty < 5) {
    if (role === 'farmer') {
      lowBadge.hidden = false;
      lowBadge.textContent = 'Low Stock';
      limitedBadge.hidden = true;
    } else {
      limitedBadge.hidden = false;
      limitedBadge.textContent = 'Limited Stock';
      lowBadge.hidden = true;
    }
  } else {
    lowBadge.hidden = true;
    limitedBadge.hidden = true;
  }
}

// Listen for foreground messages (optional UI toast)
export function listenForeground() {
  const app = window.firebaseApp;
  const messaging = getMessaging(app);
  onMessage(messaging, payload => {
    console.log('Message foreground', payload);
    // Simple alert – replace with custom toast if desired
    alert(payload.notification?.title || 'New notification');
  });
}
