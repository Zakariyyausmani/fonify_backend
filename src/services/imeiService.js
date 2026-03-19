// This service handles communication with 3rd party IMEI verification APIs
// Example providers: Surepass, IMEI.info, IMEIAPI.net

exports.verifyImei = async (imei) => {
  try {
    // For now, we implement a Mock/Sandbox verification
    // In production, you would replace this with an axios call to your chosen provider

    console.log(`--- Verifying IMEI: ${imei} ---`);

    // Basic Luhn check first
    if (!isValidLuhn(imei)) {
      return { isValid: false, message: 'Invalid IMEI digit checksum' };
    }

    // Mock successful database lookup
    // In a real app, this data comes from the API response
    return {
      isValid: true,
      brand: 'System Detected', // This would be 'Apple', 'Samsung', etc.
      model: 'Validated Device',
      storage: 'Verified',
      ram: 'Verified',
      blacklistStatus: 'Clean',
      message: 'IMEI successfully verified against international databases'
    };
  } catch (error) {
    console.error('IMEI Verification Service Error:', error);
    return { isValid: false, message: 'Verification service unavailable' };
  }
};

function isValidLuhn(imei) {
  if (imei.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
