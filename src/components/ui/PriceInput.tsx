import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { parseBRL } from '../../utils/formatters';
import { PRICE_CONSTANTS, VALIDATION_MESSAGES } from './constants';
import { formatPriceForDisplay, formatPriceForEditing } from './helpers';
import { PriceInputProps } from './types';

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  placeholder = PRICE_CONSTANTS.PLACEHOLDER,
  label = "Valor (R$)",
  required = false,
  disabled = false,
  className = "",
  id,
  name
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Atualizar displayValue quando value mudar externamente
  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue("");
    } else {
      setDisplayValue(formatPriceForDisplay(value));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Se vazio, limpar
    if (inputValue.trim() === '') {
      setDisplayValue('');
      onChange(null);
      return;
    }
    
    // Usar a função parseBRL existente para converter
    const parsedValue = parseBRL(inputValue);
    
    if (parsedValue === null) {
      // Se não conseguiu parsear, manter o que foi digitado
      setDisplayValue(inputValue);
    } else {
      // Se conseguiu parsear, atualizar o valor e formatar
      onChange(parsedValue);
      setDisplayValue(formatPriceForDisplay(parsedValue));
    }
  };

  const handleBlur = () => {
    // Ao sair do campo, garantir que está formatado corretamente
    if (value !== null && value !== undefined) {
      setDisplayValue(formatPriceForDisplay(value));
    }
  };

  const handleFocus = () => {
    // Ao focar, mostrar apenas números para facilitar edição
    if (value !== null && value !== undefined) {
      setDisplayValue(formatPriceForEditing(value));
    }
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">{PRICE_CONSTANTS.CURRENCY_SYMBOL}</span>
        </div>
        <input
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="decimal"
          autoComplete="off"
          className={`w-full pl-8 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {VALIDATION_MESSAGES.PRICE.HELPER}
      </p>
    </div>
  );
};
