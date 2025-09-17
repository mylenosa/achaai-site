import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

export interface PriceInputProps {
  value: string;
  onChange: (formattedValue: string, numericValue: number | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  placeholder = "0,00",
  label = "Valor",
  required = false,
  disabled = false,
  className = "",
  id,
  name
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Atualizar displayValue quando value mudar externamente
  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  // Formatar valor como BRL
  const formatAsBRL = (digits: string): string => {
    if (!digits) return "";
    
    // Converter string de dígitos para número (dividir por 100)
    const numericValue = parseInt(digits, 10) / 100;
    
    // Formatar com Intl.NumberFormat
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  // Extrair apenas dígitos de uma string
  const extractDigits = (str: string): string => {
    return str.replace(/\D/g, '');
  };

  // Obter valor numérico (Number) a partir do estado
  const getNumericValue = (digits: string): number | null => {
    if (!digits) return null;
    return parseInt(digits, 10) / 100;
  };

  // Verificar se é tecla de navegação permitida
  const isNavigationKey = (key: string): boolean => {
    const navigationKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    return navigationKeys.includes(key);
  };

  // Verificar se é tecla de modificador permitida (Ctrl+A, Ctrl+C, etc.)
  const isModifierKey = (key: string, ctrlKey: boolean): boolean => {
    if (!ctrlKey) return false;
    const modifierKeys = ['a', 'c', 'v', 'x'];
    return modifierKeys.includes(key.toLowerCase());
  };

  // Verificar se é dígito (0-9)
  const isDigit = (key: string): boolean => {
    return /^[0-9]$/.test(key);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digits = extractDigits(inputValue);
    const formatted = formatAsBRL(digits);
    const numericValue = getNumericValue(digits);
    
    setDisplayValue(formatted);
    onChange(formatted, numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite teclas de navegação
    if (isNavigationKey(e.key)) {
      return;
    }
    
    // Permite combinações de teclas (Ctrl+A, Ctrl+C, etc.)
    if (isModifierKey(e.key, e.ctrlKey)) {
      return;
    }
    
    // Se não é um dígito, previne a entrada
    if (!isDigit(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = extractDigits(pastedText);
    const formatted = formatAsBRL(digits);
    const numericValue = getNumericValue(digits);
    
    setDisplayValue(formatted);
    onChange(formatted, numericValue);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="off"
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base ${
            disabled 
              ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
              : 'border-gray-300'
          } ${className}`}
        />
      </div>
      {!value && (
        <p className="text-xs text-gray-500 mt-1">
          Digite apenas números (ex: 1234 = R$ 12,34)
        </p>
      )}
    </div>
  );
};