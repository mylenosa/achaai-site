// Single Responsibility Principle: Serviço dedicado para operações de estoque
// Dependency Inversion: Usa abstrações, não implementações concretas
export interface InventoryItem {
  id: string;
  title: string;
  price: number | null;
  available: boolean;
  verifiedAt?: string;
  updatedAt: string;
}

export interface InventoryRepository {
  getAll(): Promise<InventoryItem[]>;
  save(items: InventoryItem[]): Promise<void>;
  findByTitle(title: string): Promise<InventoryItem | null>;
}

export interface ImportResult {
  imported: number;
  updated: number;
  ignored: number;
  errors: { line: number; reason: string }[];
}

// Interface Segregation: Interfaces específicas para cada responsabilidade
export interface InventoryValidator {
  validateItem(item: Partial<InventoryItem>): string[];
  validateTitle(title: string): string | null;
  validatePrice(price: number | null): string | null;
}

export interface CurrencyParser {
  parse(value: string): number | null;
  format(value: number | null): string;
}

// Open/Closed: Extensível para novos tipos de validação
export class DefaultInventoryValidator implements InventoryValidator {
  validateItem(item: Partial<InventoryItem>): string[] {
    const errors: string[] = [];
    
    const titleError = this.validateTitle(item.title || '');
    if (titleError) errors.push(titleError);
    
    const priceError = this.validatePrice(item.price);
    if (priceError) errors.push(priceError);
    
    return errors;
  }

  validateTitle(title: string): string | null {
    if (!title || title.trim().length < 2) {
      return 'Título deve ter pelo menos 2 caracteres';
    }
    return null;
  }

  validatePrice(price: number | null): string | null {
    if (price !== null && price < 0) {
      return 'Preço deve ser maior ou igual a zero';
    }
    return null;
  }
}

// Single Responsibility: Apenas parsing de moeda
export class BrazilianCurrencyParser implements CurrencyParser {
  parse(value: string): number | null {
    if (!value || value.trim() === '') return null;
    
    // Remove currency symbols and spaces
    const cleaned = value.replace(/[R$\s]/g, '');
    
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

  format(value: number | null): string {
    if (value === null || value === undefined) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}

// Dependency Inversion: Depende de abstrações
export class InventoryService {
  constructor(
    private repository: InventoryRepository,
    private validator: InventoryValidator,
    private currencyParser: CurrencyParser
  ) {}

  async getAllItems(): Promise<InventoryItem[]> {
    return this.repository.getAll();
  }

  async saveItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const errors = this.validator.validateItem(item);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: item.id || Date.now().toString(),
      title: item.title!.trim(),
      price: item.price || null,
      available: item.available ?? true,
      verifiedAt: item.available ? now : item.verifiedAt,
      updatedAt: now
    };

    const items = await this.repository.getAll();
    const existingIndex = items.findIndex(i => i.id === newItem.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = newItem;
    } else {
      items.unshift(newItem);
    }

    await this.repository.save(items);
    return newItem;
  }

  async deleteItem(id: string): Promise<void> {
    const items = await this.repository.getAll();
    const filtered = items.filter(item => item.id !== id);
    await this.repository.save(filtered);
  }

  async confirmAvailability(itemIds: string[]): Promise<number> {
    const items = await this.repository.getAll();
    const now = new Date().toISOString();
    let updated = 0;

    const updatedItems = items.map(item => {
      if (itemIds.includes(item.id)) {
        updated++;
        return {
          ...item,
          available: true,
          verifiedAt: now,
          updatedAt: now
        };
      }
      return item;
    });

    await this.repository.save(updatedItems);
    return updated;
  }

  // Single Responsibility: Apenas lógica de importação
  async importFromData(
    data: { title: string; price: number | null }[],
    markAsAvailable: boolean
  ): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      ignored: 0,
      errors: []
    };

    const items = await this.repository.getAll();
    const now = new Date().toISOString();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const lineNumber = i + 2; // Excel line number

      try {
        const errors = this.validator.validateItem(row);
        if (errors.length > 0) {
          result.errors.push({ line: lineNumber, reason: errors.join(', ') });
          result.ignored++;
          continue;
        }

        const titleKey = row.title.toLowerCase().trim();
        const existingIndex = items.findIndex(item => 
          item.title.toLowerCase().trim() === titleKey
        );

        if (existingIndex >= 0) {
          // Update existing
          items[existingIndex] = {
            ...items[existingIndex],
            price: row.price,
            available: markAsAvailable,
            verifiedAt: markAsAvailable ? now : items[existingIndex].verifiedAt,
            updatedAt: now
          };
          result.updated++;
        } else {
          // Create new
          const newItem: InventoryItem = {
            id: `import-${Date.now()}-${i}`,
            title: row.title,
            price: row.price,
            available: markAsAvailable,
            verifiedAt: markAsAvailable ? now : undefined,
            updatedAt: now
          };
          items.unshift(newItem);
          result.imported++;
        }
      } catch (error) {
        result.errors.push({ line: lineNumber, reason: 'Erro ao processar linha' });
        result.ignored++;
      }
    }

    await this.repository.save(items);
    return result;
  }
}

// Liskov Substitution: Implementação específica para localStorage
export class LocalStorageInventoryRepository implements InventoryRepository {
  constructor(private storageKey: string = 'inventory_items') {}

  async getAll(): Promise<InventoryItem[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultItems();
    } catch {
      return this.getDefaultItems();
    }
  }

  async save(items: InventoryItem[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      throw new Error('Erro ao salvar no localStorage');
    }
  }

  async findByTitle(title: string): Promise<InventoryItem | null> {
    const items = await this.getAll();
    const titleKey = title.toLowerCase().trim();
    return items.find(item => item.title.toLowerCase().trim() === titleKey) || null;
  }

  private getDefaultItems(): InventoryItem[] {
    return [
      {
        id: '1',
        title: 'Tinta Spray Vermelha 400ml',
        price: 15.90,
        available: true,
        verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'WD-40 300ml',
        price: 25.50,
        available: true,
        verifiedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}