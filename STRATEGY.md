# Goal
Mobile-first marketplace where farmers in [YOUR REGION] sell [2-3 PRODUCTS] directly to buyers.
# Users
Farmers (list products, manage stock) and buyers (browse, order).
# Stack
Vanilla JS, Firebase Auth + Firestore, hosted on Firebase Hosting.
# Out of scope
Logistics, loans, AI features, anything not needed for the first 10 farmers.
# Goal
Build a mobile-first marketplace where farmers in Bangladesh (start with the area around Dhaka) sell fresh vegetables, rice and seasonal fruit directly to buyers. This avoids the long chain of middlemen, so farmers earn more and buyers pay less. The platform takes a small commission on each order.

# Users
- Farmers: list products, set price per kg, mark stock as available or sold out, see their orders. Many use cheap Android phones with slow internet, and many prefer Bangla.
- Buyers: households, small shops and restaurants. They browse by category and location, order, and track delivery.
- Admin (the owner): verifies farmers, sees all orders, manages commissions.

# Stack
- Vanilla JavaScript, HTML and CSS (no heavy frameworks).
- Firebase Authentication, Firestore and Hosting.
- Mobile-first design that can later be packaged as an Android app with Capacitor.
- Free services only where possible.

# Principles
- Mobile first: every page must work well on a small phone screen and slow connections.
- Bangla and English text support.
- Keep pages light: small images, minimal scripts.
- Simple, large buttons and short forms, because many users are not technical.
- Cash on delivery first. Online payments come later.
- Never trust the client: enforce permissions in Firestore security rules.

# Current phase: MVP
Build only what is needed for the first 10 farmers and 50 buyers:
1. Signup and login (phone or email) with roles: farmer, buyer, admin.
2. Farmer profile and product listing (name, category, price per kg, quantity, photo).
3. Buyer product browsing with category filter, search and location filter.
4. Cart and checkout with cash on delivery.
5. Order tracking for farmers and buyers (pending, confirmed, delivered).
6. Basic admin panel: approve farmers, view orders.

# Out of scope for now
Logistics tracking, loans, AI features, wholesale contracts, price forecasting, multiple regions, online payment gateways and anything not needed for the first 10 farmers.

# Rules for agents
- Suggest small features that can be built in one pull request.
- Prefer improving the MVP list above before adding new areas.
- Do not change files in `.github/` or `agents/`.
- Keep code simple, commented, and consistent with the existing files.