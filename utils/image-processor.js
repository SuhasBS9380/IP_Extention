// Image Processor Utility Module
// Handles image validation, conversion, and preview generation

class ImageProcessor {
  // Supported image formats
  static SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  // Maximum file size in bytes (5MB)
  static MAX_SIZE_MB = 5;
  static MAX_SIZE_BYTES = ImageProcessor.MAX_SIZE_MB * 1024 * 1024;
  
  /**
   * Validate and process an image file
   * @param {File} file - The image file to process
   * @returns {Promise<Object>} - Processed image data with base64 and metadata
   * @throws {Error} - If validation fails
   */
  static async validateAndProcess(file) {
    // Validate file format
    if (!this.isValidFormat(file.type)) {
      throw new Error('INVALID_FORMAT');
    }
    
    // Validate file size
    if (!this.isValidSize(file.size)) {
      throw new Error('IMAGE_TOO_LARGE');
    }
    
    // Convert to base64
    const base64 = await this.toBase64(file);
    
    // Get image dimensions
    const dimensions = await this.getImageDimensions(base64);
    
    return {
      base64,
      type: file.type,
      size: file.size,
      name: file.name,
      width: dimensions.width,
      height: dimensions.height
    };
  }
  
  /**
   * Validate image format
   * @param {string} mimeType - The MIME type of the file
   * @returns {boolean} - True if format is supported
   */
  static isValidFormat(mimeType) {
    return this.SUPPORTED_FORMATS.includes(mimeType);
  }
  
  /**
   * Validate image size
   * @param {number} sizeInBytes - The file size in bytes
   * @returns {boolean} - True if size is within limit
   */
  static isValidSize(sizeInBytes) {
    return sizeInBytes <= this.MAX_SIZE_BYTES;
  }
  
  /**
   * Convert file to base64 string
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Base64 encoded string
   */
  static toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Get image dimensions from base64 or URL
   * @param {string} imageData - Base64 string or URL
   * @returns {Promise<Object>} - Width and height
   */
  static getImageDimensions(imageData) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageData;
    });
  }
  
  /**
   * Create a thumbnail preview of the image
   * @param {string} imageData - Base64 string or URL
   * @param {number} maxWidth - Maximum width for thumbnail (default: 200)
   * @param {number} maxHeight - Maximum height for thumbnail (default: 200)
   * @returns {Promise<string>} - Base64 encoded thumbnail
   */
  static async createPreview(imageData, maxWidth = 200, maxHeight = 200) {
    const img = new Image();
    img.src = imageData;
    await img.decode();
    
    // Calculate scaled dimensions
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    // Create canvas and draw scaled image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  
  /**
   * Validate image URL
   * @param {string} url - The URL to validate
   * @returns {boolean} - True if URL is valid
   */
  static isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size string
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Get error message for error code
   * @param {string} errorCode - Error code from validation
   * @returns {string} - User-friendly error message
   */
  static getErrorMessage(errorCode) {
    const messages = {
      'INVALID_FORMAT': 'Unsupported format. Please use JPG, PNG, WEBP, or GIF.',
      'IMAGE_TOO_LARGE': `Image size exceeds ${this.MAX_SIZE_MB}MB. Please choose a smaller image.`,
      'INVALID_URL': 'Invalid image URL. Please provide a valid HTTP or HTTPS URL.',
      'LOAD_FAILED': 'Failed to load image. Please try again.'
    };
    
    return messages[errorCode] || 'An error occurred while processing the image.';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessor;
}
