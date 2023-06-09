
// For simplicity, you should probably use Buffer in browser for that
export const base64ToDecimalHex = (str: any) => {
  const raw = window.atob(str);
  const result = [...raw].map((c) => {
    return c.charCodeAt(0).toString(16).padStart(2, '0')
  }).join();

  return result.toUpperCase();
};

export const clearQrCodeContainer = () => {
  const qrContainer = document.querySelector('#qr-code-container');
  if (qrContainer && qrContainer?.childNodes?.length > 0) {
    qrContainer?.replaceChildren();
  }
};
