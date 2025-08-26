import { Testimonial } from '../lib/types';

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Daniel',
    location: 'Setor 2, Ariquemes',
    content: 'Rodei a cidade toda atrás de WD-40 e não achava. Mandei no AchaAí e em 1 minuto me indicaram 3 lojas que tinham. Fui na mais perto e resolvi o problema. Salvou meu dia!',
    type: 'customer'
  },
  {
    id: '2',
    name: 'Mariana',
    location: 'Loja de Tintas (Centro)',
    content: 'Tinha umas latas de tinta de uma cor específica paradas no estoque. Pelo AchaAí, toda semana aparece alguém procurando exatamente por elas. Vendi tudo e ganhei novos clientes.',
    type: 'store'
  },
  {
    id: '3',
    name: 'Rogério',
    location: 'Bazar Central',
    content: 'Antes, o WhatsApp da loja era uma loucura de gente perguntando "tem isso?". Agora, o cliente que chega pelo AchaAí já vem pra comprar. Otimizou demais nosso atendimento.',
    type: 'store'
  }
];
