// Constants for UI components
// Single Responsibility: Centralized constants for UI components

export const PHONE_CONSTANTS = {
  MAX_DIGITS: 11,
  MIN_DIGITS: 10,
  MAX_LENGTH: 15,
  FORMAT_PATTERNS: {
    EMPTY: '',
    DDD_ONLY: (dd: string) => `(${dd}`,
    DDD_AND_PARTIAL: (dd: string, partial: string) => `(${dd}) ${partial}`,
    COMPLETE: (dd: string, first: string, last: string) => `(${dd}) ${first}-${last}`
  }
} as const;

export const PRICE_CONSTANTS = {
  DECIMAL_PLACES: 2,
  CURRENCY_SYMBOL: 'R$',
  PLACEHOLDER: '0,00'
} as const;

export const VALIDATION_MESSAGES = {
  PHONE: {
    INVALID: 'Número deve ter pelo menos 10 dígitos',
    VALID: '✓ Número válido',
    HELPER: 'Número usado pelos clientes para contato'
  },
  PRICE: {
    HELPER: 'Use vírgula ou ponto para decimais (ex: 15,90 ou 15.90)'
  }
} as const;

export const KEYBOARD_KEYS = {
  ALLOWED_NAVIGATION: [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ],
  ALLOWED_MODIFIERS: ['a', 'c', 'v', 'x']
} as const;
