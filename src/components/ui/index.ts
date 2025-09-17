// UI Components Index
// Single Responsibility: Centralized exports for UI components

export { PriceInput } from './PriceInput';
export { PhoneInput } from './PhoneInput';
export { LoadingSpinner } from './LoadingSpinner';

// Re-export types for convenience
export type { 
  PriceInputProps, 
  PhoneInputProps, 
  BaseInputProps, 
  ValidationState 
} from './types';

// Re-export constants for advanced usage
export { 
  PRICE_CONSTANTS, 
  PHONE_CONSTANTS, 
  VALIDATION_MESSAGES, 
  KEYBOARD_KEYS 
} from './constants';

// Re-export helpers for advanced usage
export {
  formatPriceForDisplay,
  formatPriceForEditing,
  isValidPhoneNumber,
  extractNumbers,
  limitString,
  isNavigationKey,
  isAllowedModifierKey,
  isNumericKey
} from './helpers';
