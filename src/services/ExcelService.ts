// Single Responsibility: Serviço dedicado para operações Excel
// Open/Closed: Extensível para outros formatos de arquivo
export interface ExcelRow {
  [key: string]: any;
}

export interface ExcelData {
  headers: string[];
  rows: ExcelRow[];
}

export interface ExcelProcessor {
  parseFile(file: File): Promise<ExcelData>;
  generateTemplate(): void;
}

// Liskov Substitution: Implementação específica para XLSX
export class XLSXProcessor implements ExcelProcessor {
  async parseFile(file: File): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
          }) as string[][];
          
          if (jsonData.length === 0) {
            throw new Error('Arquivo vazio');
          }
          
          const [headers, ...dataRows] = jsonData;
          const rows = dataRows.map(row => {
            const rowObj: ExcelRow = {};
            headers.forEach((header, index) => {
              rowObj[header] = row[index] || '';
            });
            return rowObj;
          });
          
          resolve({ headers, rows });
        } catch (error) {
          reject(new Error('Erro ao processar arquivo Excel'));
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
      ['Parafuso Phillips 3x20', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 }, // Item column
      { width: 15 }  // Price column
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

export interface ImportError {
  line: number;
  reason: string;
}

// Single Responsibility: Validação de dados de importação
export class ImportValidator {
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
    
    // Remove currency symbols and spaces
    const cleaned = str.replace(/[R$\s]/g, '');
    
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

  async importFile(file: File, existingItems: any[]): Promise<ImportResult & { updatedItems: any[] }> {
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      ignored: 0,
      errors: []
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
          // Extract data from row (flexible column mapping)
          const titleValue = row['Item'] || row['item'] || row['titulo'] || row['Titulo'] || row['Produto'] || row['produto'] || '';
          const priceValue = row['Preço (opcional)'] || row['Preço'] || row['preco'] || row['Valor'] || row['valor'] || '';

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
          const titleKey = title.toLowerCase();

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

          // Check if item exists (case-insensitive)
          const existingIndex = items.findIndex(item => 
            item.title.toLowerCase().trim() === titleKey
          );

          if (existingIndex >= 0) {
            // Update existing item
            items[existingIndex] = {
              ...items[existingIndex],
              price,
              updatedAt: new Date().toISOString()
            };
            result.updated++;
          } else {
            // Create new item
            const newItem = {
              id: `import-${Date.now()}-${i}`,
              title,
              price,
              updatedAt: new Date().toISOString()
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