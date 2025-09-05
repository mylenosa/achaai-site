// Single Responsibility: Serviço dedicado para operações Excel
// Open/Closed: Extensível para outros formatos de arquivo
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

interface ExcelData {
  headers: string[];
  rows: ExcelRow[];
}

interface ExcelProcessor {
  parseFile(file: File): Promise<ExcelData>;
  generateTemplate(): void;
}

/**
 * Helpers para normalização de texto/cabeçalhos
 * - norm: lower + trim + remove acentos (para comparar sem variações)
 * - canon: mapeia cabeçalhos "criativos" para chaves canônicas ('item', 'preco')
 */
const norm = (s: any) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const canon = (h: string) => {
  const n = norm(h);
  if (['item', 'produto', 'titulo', 'título', 'nome do produto'].includes(n)) return 'item';
  if (
    [
      'preco',
      'preço',
      'preco (opcional)',
      'preço (opcional)',
      'valor',
      'price',
      'valor unitario',
      'valor unitário',
    ].includes(n)
  )
    return 'preco';
  return n; // mantém chave normalizada para outros casos
};

// Liskov Substitution: Implementação específica para XLSX
class XLSXProcessor implements ExcelProcessor {
  async parseFile(file: File): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buf = e.target?.result as ArrayBuffer;
          if (!buf) throw new Error('Arquivo inválido (sem dados)');

          const workbook = XLSX.read(buf, { type: 'array' });
          if (!workbook.SheetNames?.length) throw new Error('Nenhuma planilha encontrada');

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) throw new Error('Planilha vazia');

          // Convert to JSON with header row (header:1 retorna matriz)
          const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          }) as string[][];

          if (jsonData.length === 0) {
            throw new Error('Arquivo vazio');
          }

          const [rawHeaders, ...dataRows] = jsonData;

          // 🔧 Mudança: normalizar/canonicalizar cabeçalhos para aceitar variações (Item/Produto/Título, Preço/Valor etc.)
          const headers = rawHeaders.map((h) => canon(h));

          // Monta as linhas usando as chaves canônicas
          const rows = dataRows.map((row) => {
            const rowObj: ExcelRow = {};
            headers.forEach((header, index) => {
              const val = row[index] ?? '';
              rowObj[header] = typeof val === 'string' ? val.trim() : val;
            });
            return rowObj;
          });

          resolve({ headers, rows });
        } catch (error: any) {
          // 🔧 Mudança: preservar a causa real no erro (facilita debug)
          reject(new Error(`Erro ao processar arquivo Excel: ${error?.message || String(error)}`));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  generateTemplate(): void {
    const data = [
      ['Item', 'Preço (opcional)'],
      ['Tinta Spray Vermelha 400ml', '15,90'],
      ['WD-40 300ml', '25.50'],
      ['Parafuso Phillips 3x20', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');

    // Set column widths
    (ws as any)['!cols'] = [
      { width: 30 }, // Item column
      { width: 15 }, // Price column
    ];

    XLSX.writeFile(wb, 'modelo_estoque.xlsx');
  }
}

// Interface Segregation: Interface específica para importação
export interface ImportResult {
  imported: number;
  updated: number;
  ignored: number;
  errors: ImportError[];
}

interface ImportError {
  line: number;
  reason: string;
}

// Single Responsibility: Validação de dados de importação
class ImportValidator {
  static validateTitle(title: string): string | null {
    const trimmed = title?.toString().trim();
    if (!trimmed || trimmed.length < 2) {
      return 'Título deve ter pelo menos 2 caracteres';
    }
    return null;
  }

  static validatePrice(price: string): { value: number | null; error: string | null } {
    if (!price || price.toString().trim() === '') {
      return { value: null, error: null };
    }

    const parsed = this.parseCurrency(price.toString());
    if (parsed === null) {
      return { value: null, error: 'Preço inválido' };
    }

    if (parsed < 0) {
      return { value: null, error: 'Preço deve ser maior ou igual a zero' };
    }

    return { value: parsed, error: null };
  }

  private static parseCurrency(str: string): number | null {
    if (!str || str.trim() === '') return null;

    // 🔧 Mudança: remover também NBSP (\u00A0), além de símbolos e espaços
    const cleaned = str.replace(/[R$\s\u00A0]/g, '');

    // Handle Brazilian format (1.999,90) and US format (1,999.90)
    let normalized = cleaned;

    if (cleaned.includes(',') && cleaned.includes('.')) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',') && !cleaned.includes('.')) {
      normalized = cleaned.replace(',', '.');
    }

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : Math.max(0, parsed);
  }
}

// Dependency Inversion: Serviço que depende de abstrações
export class ExcelImportService {
  constructor(private processor: ExcelProcessor) {}

  async importFile(
    file: File,
    existingItems: any[]
  ): Promise<ImportResult & { updatedItems: any[] }> {
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      ignored: 0,
      errors: [],
    };

    // Create a copy to avoid mutating the original array
    const items = [...existingItems];

    try {
      const excelData = await this.processor.parseFile(file);
      const processedTitles = new Set<string>();

      for (let i = 0; i < excelData.rows.length; i++) {
        const row = excelData.rows[i];
        const lineNumber = i + 2; // Excel line number (header is line 1)

        try {
          // 🔧 Mudança: usar apenas chaves canônicas vindas do parser
          const titleValue = row['item'] || '';
          const priceValue = row['preco'] || '';

          // Skip empty rows
          if (!titleValue && !priceValue) {
            continue;
          }

          // Validate title
          const titleError = ImportValidator.validateTitle(titleValue);
          if (titleError) {
            result.errors.push({ line: lineNumber, reason: titleError });
            result.ignored++;
            continue;
          }

          const title = titleValue.toString().trim();
          const titleKey = norm(title); // chave normalizada para comparar

          // Check for duplicates within the file
          if (processedTitles.has(titleKey)) {
            result.errors.push({ line: lineNumber, reason: 'Item duplicado no arquivo' });
            result.ignored++;
            continue;
          }
          processedTitles.add(titleKey);

          // Validate price
          const { value: price, error: priceError } = ImportValidator.validatePrice(priceValue);
          if (priceError) {
            result.errors.push({ line: lineNumber, reason: priceError });
            result.ignored++;
            continue;
          }

          // Check if item exists (case/acentos/espacos agnóstico)
          const existingIndex = items.findIndex(
            (item) => norm(item.title) === titleKey
          );

          if (existingIndex >= 0) {
            // Update existing item
            items[existingIndex] = {
              ...items[existingIndex],
              title, // mantém título canonizado/trimado
              price,
              updatedAt: new Date().toISOString(),
            };
            result.updated++;
          } else {
            // Create new item
            const newItem = {
              id: `import-${Date.now()}-${i}`,
              title,
              price,
              updatedAt: new Date().toISOString(),
            };
            items.unshift(newItem);
            result.imported++;
          }
        } catch (error) {
          result.errors.push({ line: lineNumber, reason: 'Erro ao processar linha' });
          result.ignored++;
        }
      }
    } catch (error) {
      // mantém a mensagem detalhada vinda do parseFile
      throw new Error(error instanceof Error ? error.message : 'Erro ao importar arquivo');
    }

    return { ...result, updatedItems: items };
  }

  generateTemplate(): void {
    this.processor.generateTemplate();
  }
}

// Factory para criar instância configurada
export const createExcelImportService = (): ExcelImportService => {
  return new ExcelImportService(new XLSXProcessor());
};
