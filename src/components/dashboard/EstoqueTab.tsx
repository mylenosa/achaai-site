import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  Download, 
  Package, 
  Hash,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { PriceInput } from '../ui';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface EstoqueItem {
  external_id: string;
  titulo: string;
  descricao: string;
  preco: number;
  quantidade: number;
  ativo: boolean;
  attrs: Record<string, any>;
}

interface EstoqueTabProps {
  lojaId: string;
}

interface ValidationResult {
  valid: number;
  invalid: number;
  errors: string[];
  items: EstoqueItem[];
}

export const EstoqueTab: React.FC<EstoqueTabProps> = ({ lojaId }) => {
  // Estados do formulário manual
  const [manualForm, setManualForm] = useState({
    titulo: '',
    quantidade: '',
    valor: ''
  });
  
  // Estados da importação
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<EstoqueItem[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importStep, setImportStep] = useState<'select' | 'validate' | 'commit'>('select');
  
  // Estados de loading
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  
  // Estados de feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalizar valor (aceitar vírgula e ponto)
  const normalizeValue = (value: string): number => {
    const cleaned = value.replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  // Adicionar item manual
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualForm.titulo.trim()) {
      setMessage({ type: 'error', text: 'Título é obrigatório' });
      return;
    }

    setIsAddingItem(true);
    setMessage(null);

    try {
      const item: EstoqueItem = {
        external_id: `AUTO-${Date.now()}`,
        titulo: manualForm.titulo.trim(),
        descricao: '',
        preco: normalizeValue(manualForm.valor),
        quantidade: Math.max(0, parseInt(manualForm.quantidade) || 0),
        ativo: true,
        attrs: {}
      };

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loja_id: lojaId,
          mode: 'commit',
          items: [item]
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar item');
      }

      // Limpar formulário
      setManualForm({ titulo: '', quantidade: '', valor: '' });
      setMessage({ type: 'success', text: 'Item adicionado com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar item. Tente novamente.' });
    } finally {
      setIsAddingItem(false);
    }
  };

  // Processar arquivo CSV/Excel
  const processFile = (file: File): Promise<EstoqueItem[]> => {
    return new Promise((resolve, reject) => {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      
      if (isExcel) {
        // Processar Excel
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Converter para formato padrão
            const [headers, ...rows] = jsonData as string[][];
            const csvText = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const items = parseImportData(results.data);
                resolve(items);
              },
              error: reject
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Processar CSV
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const items = parseImportData(results.data);
            resolve(items);
          },
          error: reject
        });
      }
    });
  };

  // Mapear dados importados
  const parseImportData = (data: any[]): EstoqueItem[] => {
    return data.map((row, index) => {
      // Mapear colunas flexíveis
      const external_id = row.external_id || row.sku || `IMPORT-${Date.now()}-${index}`;
      const titulo = row.titulo || row.nome || '';
      const preco = normalizeValue(String(row.preco || row.valor || '0'));
      const quantidade = Math.max(0, parseInt(row.quantidade || row.qtd || '0') || 0);
      const ativo = row.ativo !== undefined ? Boolean(row.ativo) : true;
      
      let attrs = {};
      try {
        attrs = row.attrs ? JSON.parse(row.attrs) : {};
      } catch {
        attrs = {};
      }

      return {
        external_id,
        titulo,
        descricao: row.descricao || '',
        preco,
        quantidade,
        ativo,
        attrs
      };
    });
  };

  // Validar importação
  const handleValidateImport = async () => {
    if (!importFile) return;

    setIsValidating(true);
    setMessage(null);

    try {
      const items = await processFile(importFile);
      setImportData(items);

      // Dry-run no servidor
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loja_id: lojaId,
          mode: 'dry-run',
          items
        })
      });

      if (!response.ok) {
        throw new Error('Erro na validação');
      }

      const result = await response.json();
      setValidationResult(result);
      setImportStep('validate');
    } catch (error) {
      console.error('Erro na validação:', error);
      setMessage({ type: 'error', text: 'Erro ao validar arquivo. Verifique o formato.' });
    } finally {
      setIsValidating(false);
    }
  };

  // Confirmar importação
  const handleCommitImport = async () => {
    if (!importData.length) return;

    setIsCommitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loja_id: lojaId,
          mode: 'commit',
          items: importData
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao importar');
      }

      // Reset do estado
      setImportFile(null);
      setImportData([]);
      setValidationResult(null);
      setImportStep('select');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setMessage({ type: 'success', text: `${importData.length} itens importados com sucesso!` });
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erro ao importar:', error);
      setMessage({ type: 'error', text: 'Erro ao importar itens. Tente novamente.' });
    } finally {
      setIsCommitting(false);
    }
  };

  // Reset da importação
  const resetImport = () => {
    setImportFile(null);
    setImportData([]);
    setValidationResult(null);
    setImportStep('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Estoque</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie os produtos da sua loja</p>
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm sm:text-base">{message.text}</span>
        </motion.div>
      )}

      {/* Adicionar Item Manual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Plus className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Adicionar Item</h2>
        </div>

        <form onSubmit={handleAddItem} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Título do Produto *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={manualForm.titulo}
                onChange={(e) => setManualForm(prev => ({ ...prev, titulo: e.target.value }))}
                required
                autoComplete="off"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="Ex: Tinta Spray Vermelha 400ml"
              />
            </div>

            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Quantidade
              </label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                value={manualForm.quantidade}
                onChange={(e) => setManualForm(prev => ({ ...prev, quantidade: e.target.value }))}
                min="0"
                step="1"
                autoComplete="off"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <PriceInput
                value={manualForm.valor ? parseFloat(manualForm.valor.replace(',', '.')) : null}
                onChange={(value) => setManualForm(prev => ({ 
                  ...prev, 
                  valor: value ? value.toString().replace('.', ',') : '' 
                }))}
                placeholder="0,00"
                label="Valor (R$)"
                id="valor"
                name="valor"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAddingItem}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              >
                {isAddingItem ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {isAddingItem ? 'Adicionando...' : 'Adicionar Item'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Importar CSV/Excel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Upload className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Importar Estoque</h2>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Precisa de um modelo?</h3>
              <p className="text-sm text-blue-600">
                Baixe nosso template CSV com exemplos de produtos
              </p>
            </div>
            <a
              href="/estoque_template.csv"
              download="estoque_template.csv"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Baixar Template
            </a>
          </div>
        </div>

        {importStep === 'select' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Arquivo (.csv ou .xlsx)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                name="file-upload"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Colunas aceitas: external_id/sku, titulo/nome, preco/valor, quantidade/qtd, ativo, attrs
              </p>
            </div>

            {importFile && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleValidateImport}
                  disabled={isValidating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {isValidating ? 'Validando...' : 'Pré-validar'}
                </button>
                
                <button
                  onClick={resetImport}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {importStep === 'validate' && validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Resultado da Validação:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>{validationResult.valid}</strong> itens válidos</span>
                </div>
                {validationResult.invalid > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span><strong>{validationResult.invalid}</strong> itens com erro</span>
                  </div>
                )}
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">Erros encontrados:</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {validationResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li>• ... e mais {validationResult.errors.length - 5} erros</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {validationResult.valid > 0 && (
                <button
                  onClick={handleCommitImport}
                  disabled={isCommitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCommitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {isCommitting ? 'Importando...' : `Confirmar Importação (${validationResult.valid} itens)`}
                </button>
              )}
              
              <button
                onClick={resetImport}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Estatísticas do Estoque */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
          <div className="bg-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">-</div>
          <div className="text-sm text-gray-600">Total de Itens</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Hash className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">-</div>
          <div className="text-sm text-gray-600">Em Estoque</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 text-center">
          <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">-</div>
          <div className="text-sm text-gray-600">Estoque Baixo</div>
        </div>
      </motion.div>

      {/* Instruções */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
      >
        <h3 className="font-medium text-emerald-800 mb-2">Como funciona o estoque:</h3>
        <ul className="text-sm text-emerald-700 space-y-1">
          <li>• <strong>Adicionar manual:</strong> Para poucos itens, use o formulário acima</li>
          <li>• <strong>Importar arquivo:</strong> Para muitos itens, use CSV/Excel</li>
          <li>• <strong>Pré-validação:</strong> Sempre valide antes de confirmar a importação</li>
          <li>• <strong>Template:</strong> Use nosso modelo para facilitar a importação</li>
        </ul>
      </motion.div>
    </div>
  );
};