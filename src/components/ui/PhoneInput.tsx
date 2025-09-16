import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { PHONE_CONSTANTS, VALIDATION_MESSAGES } from './constants';
import { 
  isValidPhoneNumber, 
  extractNumbers, 
  limitString, 
  isNavigationKey, 
  isAllowedModifierKey, 
  isNumericKey 
} from './helpers';
import { PhoneInputProps } from './types';

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "(11) 99999-9999",
  label = "WhatsApp",
  required = false,
  disabled = false,
  className = "",
  id,
  name,
  maxLength = PHONE_CONSTANTS.MAX_LENGTH
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Atualizar displayValue quando value mudar externamente
  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  const formatPhoneNumber = (phone: string): string => {
    const numbers = extractNumbers(phone);
    const limitedNumbers = limitString(numbers, PHONE_CONSTANTS.MAX_DIGITS);
    
    const { FORMAT_PATTERNS } = PHONE_CONSTANTS;
    
    // Aplica a máscara baseada no tamanho
    if (limitedNumbers.length === 0) return FORMAT_PATTERNS.EMPTY;
    if (limitedNumbers.length <= 2) return FORMAT_PATTERNS.DDD_ONLY(limitedNumbers);
    if (limitedNumbers.length <= 7) {
      return FORMAT_PATTERNS.DDD_AND_PARTIAL(
        limitedNumbers.slice(0, 2), 
        limitedNumbers.slice(2)
      );
    }
    return FORMAT_PATTERNS.COMPLETE(
      limitedNumbers.slice(0, 2),
      limitedNumbers.slice(2, 7),
      limitedNumbers.slice(7)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);
    
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite teclas de navegação
    if (isNavigationKey(e.key)) {
      return;
    }
    
    // Permite combinações de teclas (Ctrl+A, Ctrl+C, etc.)
    if (isAllowedModifierKey(e.key, e.ctrlKey)) {
      return;
    }
    
    // Se não é um número, previne a entrada
    if (!isNumericKey(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formatted = formatPhoneNumber(pastedText);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const isValidPhone = (): boolean => {
    return isValidPhoneNumber(value, PHONE_CONSTANTS.MIN_DIGITS);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="tel"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="tel"
          maxLength={maxLength}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base ${
            disabled 
              ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
              : isValidPhone() 
                ? 'border-green-300 bg-green-50' 
                : value && !isValidPhone()
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
          } ${className}`}
        />
      </div>
      {value && !isValidPhone() && (
        <p className="text-xs text-red-500 mt-1">
          {VALIDATION_MESSAGES.PHONE.INVALID}
        </p>
      )}
      {value && isValidPhone() && (
        <p className="text-xs text-green-600 mt-1">
          {VALIDATION_MESSAGES.PHONE.VALID}
        </p>
      )}
      {!value && (
        <p className="text-xs text-gray-500 mt-1">
          {VALIDATION_MESSAGES.PHONE.HELPER}
        </p>
      )}
    </div>
  );
};
