// Single Responsibility: Serviço dedicado para operações de endereço
// Open/Closed: Extensível para outros provedores de CEP
export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressProvider {
  searchByCep(cep: string): Promise<AddressData | null>;
}

// Liskov Substitution: Implementação específica do ViaCEP
export class ViaCepProvider implements AddressProvider {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async searchByCep(cep: string): Promise<AddressData | null> {
    if (!/^\d{8}$/.test(cep)) {
      throw new Error('CEP deve ter exatamente 8 dígitos');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CEP');
      }

      const data = await response.json();
      
      if (data.erro) {
        return null; // CEP não encontrado
      }

      return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw new Error('Falha na consulta do CEP');
    }
  }
}

// Dependency Inversion: Serviço que depende de abstração
export class AddressService {
  constructor(private provider: AddressProvider) {}

  async searchByCep(cep: string): Promise<AddressData | null> {
    const cleanCep = cep.replace(/\D/g, '');
    return this.provider.searchByCep(cleanCep);
  }
}

// Factory para criar instância configurada
export const createAddressService = (): AddressService => {
  return new AddressService(new ViaCepProvider());
};