// Kraken Logo Utilities
// Helper functions for logo integration

export class KrakenLogoManager {
  constructor() {
    this.logoElement = null;
    this.init();
  }

  init() {
    this.logoElement = document.querySelector('.kraken-logo-temp');
    this.setupLogoEffects();
  }

  // Method to update logo with Base64 data
  updateLogoFromBase64(base64String) {
    if (this.logoElement) {
      this.logoElement.src = `data:image/png;base64,${base64String}`;
      this.logoElement.className = 'kraken-logo';
      this.applyKrakenEffects();
    }
  }

  // Method to update logo with file path
  updateLogoFromFile(filePath) {
    if (this.logoElement) {
      this.logoElement.src = filePath;
      this.logoElement.className = 'kraken-logo';
      this.applyKrakenEffects();
    }
  }

  // Method to update logo with SVG
  updateLogoFromSVG(svgContent) {
    if (this.logoElement && this.logoElement.parentNode) {
      const svgContainer = document.createElement('div');
      svgContainer.className = 'kraken-logo-svg';
      svgContainer.innerHTML = svgContent;
      this.logoElement.parentNode.replaceChild(svgContainer, this.logoElement);
      this.applyKrakenEffects(svgContainer);
    }
  }

  // Apply Kraken-themed effects to the logo
  applyKrakenEffects(element = this.logoElement) {
    if (!element) return;

    // Add CSS classes for effects
    element.style.filter = 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))';
    element.style.transition = 'all 0.3s ease';
    
    // Add hover effects
    element.addEventListener('mouseenter', () => {
      element.style.filter = 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.8)) brightness(1.2)';
      element.style.transform = 'scale(1.05)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.filter = 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))';
      element.style.transform = 'scale(1)';
    });
  }

  setupLogoEffects() {
    // Apply initial effects to placeholder
    this.applyKrakenEffects();
  }

  // Utility to convert file to Base64 (for file input)
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Example usage:
// const logoManager = new KrakenLogoManager();
// logoManager.updateLogoFromBase64('your-base64-string-here');