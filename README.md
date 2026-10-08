# farm-market

## Photo upload feature

- **UI**: added a file input (`#photoInput`) and preview image (`#photoPreview`) on the product‑creation page.
- **Compression**: `utils/compressImage.js` reduces image size to ≤ 200 KB using canvas scaling and JPEG quality reduction.
- **Upload flow**:
  1. User selects a photo → compression runs → preview shown.
  2. On form submit the compressed Blob is uploaded to Firebase Storage under `productPhotos/{uid}/{timestamp}.jpg`.
  3. The resulting download URL is stored in Firestore together with other product fields.
- **Fallback**: if no photo is chosen the product is saved without `photoUrl`.
- **Security note**: ensure Firestore rules only allow the owner (`request.auth.uid == resource.data.farmerId`) to write `photoUrl`.

No external dependencies, pure HTML/CSS/JS, suitable for GitHub Pages.
