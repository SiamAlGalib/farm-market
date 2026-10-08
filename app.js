// app.js – bootstrap, i18n helper and language toggle
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js";
import { initPushNotifications } from "./messaging.js";

// ---------- Firebase init (replace with real values) ----------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// expose globals for messaging.js
window.firebaseApp = app;
window.auth = auth;
window.db = db;

// ---------- Service worker registration ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => console.log('SW registered', reg.scope))
    .catch(err => console.error('SW registration failed', err));
}

// ---------- Simple i18n helper ----------
const i18n = {
  current: 'en',
  dict: {},
  async load(lang) {
    try {
      const resp = await fetch(`/lang/${lang}.json`);
      if (!resp.ok) throw new Error('fetch failed');
      this.dict = await resp.json();
      this.current = lang;
    } catch (e) {
      console.warn('Failed to load', lang, 'fallback to en');
      if (lang !== 'en') return this.load('en');
    }
  },
  t(key) { return this.dict[key] || key; },
  async set(lang) {
    await this.load(lang);
    // persist for signed‑in user
    const user = auth.currentUser;
    if (user) {
      const uRef = doc(db, 'users', user.uid);
      await updateDoc(uRef, { lang });
    }
    this.apply();
  },
  apply() {
    // replace all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      el.textContent = this.t(k);
    });
    // update toggle button label
    const btn = document.getElementById('lang-toggle');
    btn.textContent = this.t(`language_${this.current}`);
    btn.setAttribute('aria-label', this.t('toggle_language'));
  }
};

// ---------- Language toggle UI ----------
document.getElementById('lang-toggle').addEventListener('click', async () => {
  const newLang = i18n.current === 'en' ? 'bn' : 'en';
  await i18n.set(newLang);
});

// ---------- Auth handling & init flow ----------
onAuthStateChanged(auth, async user => {
  if (user) {
    // load language from Firestore, fallback to browser/lang
    const uRef = doc(db, 'users', user.uid);
    const snap = await getDoc(uRef);
    const stored = snap.data()?.lang;
    const fallback = stored || (navigator.language.startsWith('bn') ? 'bn' : 'en');
    await i18n.load(fallback);
    i18n.apply();
    initPushNotifications().catch(e => console.error('Push init failed', e));
  } else {
    // no user – just use browser language
    await i18n.load(navigator.language.startsWith('bn') ? 'bn' : 'en');
    i18n.apply();
  }
});

// ---------- Notification button (re‑request) ----------
document.getElementById('enable-notif').addEventListener('click', () => {
  initPushNotifications().catch(e => console.error('Push init failed', e));
});