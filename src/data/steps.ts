import { FeatureStep } from '../lib/types';

export const howItWorksSteps: FeatureStep[] = [
  {
    id: '1',
    step: 1,
    title: 'Mande sua pergunta',
    description: 'Digite no WhatsApp o que você procura: "Tem tinta spray vermelha?"',
    icon: 'message-circle'
  },
  {
    id: '2',
    step: 2,
    title: 'Receba as opções',
    description: 'Em minutos você recebe lista de lojas que têm o produto disponível',
    icon: 'list'
  },
  {
    id: '3',
    step: 3,
    title: 'Retire na loja',
    description: 'Vá direto na loja escolhida e retire seu produto. Simples assim!',
    icon: 'map-pin'
  }
];