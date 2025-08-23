import { CommunityImpact } from '../lib/types';

export const communityImpacts: CommunityImpact[] = [
  {
    id: '1',
    title: 'Economia Local',
    description: 'Fortalecemos o comércio de Ariquemes conectando consumidores às lojas da cidade',
    value: 'R$ 2.3M',
    label: 'movimentados localmente',
    icon: 'trending-up'
  },
  {
    id: '2',
    title: 'Sustentabilidade',
    description: 'Reduzimos deslocamentos desnecessários e otimizamos o estoque das lojas',
    value: '40%',
    label: 'menos deslocamentos',
    icon: 'leaf'
  },
  {
    id: '3',
    title: 'Empregos',
    description: 'Ajudamos pequenos negócios a crescer e gerar mais oportunidades',
    value: '+85',
    label: 'empregos apoiados',
    icon: 'users'
  },
  {
    id: '4',
    title: 'Tempo Economizado',
    description: 'Consumidores economizam horas procurando produtos pela cidade',
    value: '15 min',
    label: 'tempo médio economizado',
    icon: 'clock'
  }
];