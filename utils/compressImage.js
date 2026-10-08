// utils/compressImage.js – simple client‑side JPEG compression using canvas
export async function compressImage(file, maxSizeKB = 200) {
  // Read file into an Image element
  const dataUrl = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });

  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = e => rej(e);
    i.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let width = img.width;
  let height = img.height;
  // keep aspect ratio, start with original size
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Helper to get blob size
  const toBlob = quality => new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));

  let quality = 0.7; // start quality
  let blob = await toBlob(quality);
  // If still too big, iteratively scale down
  while (blob.size / 1024 > maxSizeKB && (width > 100 && height > 100)) {
    // reduce dimensions by 0.9
    width = Math.round(width * 0.9);
    height = Math.round(height * 0.9);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    blob = await toBlob(quality);
  }
  // final check – if still too big, lower quality a bit
  while (blob.size / 1024 > maxSizeKB && quality > 0.4) {
    quality -= 0.1;
    blob = await toBlob(quality);
  }
  return blob;
}
