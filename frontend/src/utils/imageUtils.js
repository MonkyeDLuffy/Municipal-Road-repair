export function validateImageFile(file, maxSizeKB = 50, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']) {
  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG or PNG image.';
  }

  const sizeKB = file.size / 1024;
  if (sizeKB > maxSizeKB * 3) {
    return `Image is too large (${sizeKB.toFixed(1)} KB). Please choose an image smaller than ${maxSizeKB * 3} KB for compression.`;
  }

  return null;
}

export function compressImage(file, maxSizeKB = 50, maxDimension = 1200) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8;
      let dataUrl = canvas.toDataURL(file.type, quality);
      let sizeKB = (dataUrl.length * 0.75) / 1024;

      const minQuality = 0.1;
      const maxAttempts = 10;
      let attempts = 0;

      while (sizeKB > maxSizeKB && quality > minQuality && attempts < maxAttempts) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL(file.type, quality);
        sizeKB = (dataUrl.length * 0.75) / 1024;
        attempts++;
      }

      if (sizeKB > maxSizeKB) {
        reject(new Error(`Unable to compress image below ${maxSizeKB} KB`));
        return;
      }

      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      resolve({
        base64,
        name: file.name,
        type: file.type,
        size: buffer.length,
        width,
        height,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}