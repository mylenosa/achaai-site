// Type definitions for UI components
// Single Responsibility: Type definitions for UI components

export interface BaseInputProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export interface PriceInputProps extends BaseInputProps {
  value: string;
  onChange: (formattedValue: string, numericValue: number | null) => void;
}

export interface PhoneInputProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface FormatPatterns {
  EMPTY: string;
  DDD_ONLY: (dd: string) => string;
  DDD_AND_PARTIAL: (dd: string, partial: string) => string;
  COMPLETE: (dd: string, first: string, last: string) => string;
}
