// Helper functions for UI components
// Single Responsibility: Pure utility functions for UI components

import { formatBRL } from '../../utils/formatters';
import { PRICE_CONSTANTS } from './constants';

/**
 * Formats a price value for display in input fields
 * Removes currency symbol and formats according to Brazilian standards
 */
export const formatPriceForDisplay = (value: number): string => {
  return formatBRL(value)
    .replace(PRICE_CONSTANTS.CURRENCY_SYMBOL, '')
    .trim();
};

/**
 * Formats a price value for editing (shows decimal separator as comma)
 */
export const formatPriceForEditing = (value: number): string => {
  return value.toString().replace('.', ',');
};

/**
 * Validates if a phone number has the minimum required digits
 */
export const isValidPhoneNumber = (phone: string, minDigits: number): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= minDigits;
};

/**
 * Extracts only numeric characters from a string
 */
export const extractNumbers = (input: string): string => {
  return input.replace(/\D/g, '');
};

/**
 * Limits a string to a maximum number of characters
 */
export const limitString = (input: string, maxLength: number): string => {
  return input.slice(0, maxLength);
};

/**
 * Checks if a key is allowed for navigation
 */
export const isNavigationKey = (key: string): boolean => {
  const { KEYBOARD_KEYS } = require('./constants');
  return KEYBOARD_KEYS.ALLOWED_NAVIGATION.includes(key);
};

/**
 * Checks if a key combination is allowed (Ctrl+A, Ctrl+C, etc.)
 */
export const isAllowedModifierKey = (key: string, ctrlKey: boolean): boolean => {
  const { KEYBOARD_KEYS } = require('./constants');
  return ctrlKey && KEYBOARD_KEYS.ALLOWED_MODIFIERS.includes(key.toLowerCase());
};

/**
 * Checks if a key is a numeric digit
 */
export const isNumericKey = (key: string): boolean => {
  return /\d/.test(key);
};
