/**
 * Utility function to load external scripts dynamically
 * @param {string} src - Script source URL
 * @returns {Promise} - Promise that resolves when script is loaded
 */
export const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    // Check if script already exists and is loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // If script exists and Razorpay is available, resolve immediately
      if (typeof window.Razorpay !== 'undefined') {
        resolve(true);
        return;
      }
      // If script exists but Razorpay not available, wait for it
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => reject(false);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      // Add a small delay to ensure the script is fully processed
      setTimeout(() => {
        if (typeof window.Razorpay !== 'undefined') {
          resolve(true);
        } else {
          reject(new Error('Razorpay script loaded but object not available'));
        }
      }, 100);
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script); // Use head instead of body
  });
};
