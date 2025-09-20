import React, { useState } from 'react';
import { PriceInput } from './PriceInput';

// Exemplo de uso do PriceInput
export const PriceInputExample: React.FC = () => {
  const [price, setPrice] = useState("");
  const [numericValue, setNumericValue] = useState<number | null>(null);

  const handlePriceChange = (formattedValue: string, numericValue: number | null) => {
    setPrice(formattedValue);
    setNumericValue(numericValue);
  };

  const handleSubmit = () => {
    console.log('Valor formatado:', price);
    console.log('Valor numérico:', numericValue);
    // Enviar numericValue para o backend
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Exemplo PriceInput</h2>
      
      <PriceInput
        value={price}
        onChange={handlePriceChange}
        label="Preço do Produto"
        placeholder="0,00"
        required
        id="price"
        name="price"
      />
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p><strong>Valor formatado:</strong> {price || 'vazio'}</p>
        <p><strong>Valor numérico:</strong> {numericValue !== null ? numericValue : 'null'}</p>
      </div>
      
      <button 
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Enviar
      </button>
      
      <div className="mt-4 text-sm text-gray-600">
        <h4 className="font-semibold">Exemplos de digitação:</h4>
        <ul className="list-disc list-inside">
          <li>Digite "1" → R$ 0,01</li>
          <li>Digite "12" → R$ 0,12</li>
          <li>Digite "1000" → R$ 10,00</li>
          <li>Digite "123456" → R$ 1.234,56</li>
        </ul>
      </div>
    </div>
  );
};
