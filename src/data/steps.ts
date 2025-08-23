import { FeatureStep } from '../lib/types';

export const howItWorksSteps: FeatureStep[] = [
  {
    id: '1',
    step: 1,
    title: 'Pergunte no WhatsApp',
    description: 'Digite o que você procura: "Onde encontro tinta spray vermelha em Ariquemes?"',
    icon: 'message-circle'
  },
  {
    id: '2',
    step: 2,
    title: 'Receba endereços',
    description: 'Em minutos você recebe endereço e telefone das lojas que têm o produto',
    icon: 'list'
  },
  {
    id: '3',
    step: 3,
    title: 'Vá até a loja',
    description: 'Ligue ou vá direto na loja mais próxima. Simples e rápido!',
    icon: 'map-pin'
  }
];