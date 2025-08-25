@@ .. @@
+import { PricingPlan } from './types';
+import { config } from './config';
+
 export function cn(...inputs: (string | undefined)[]): string {
   return inputs.filter(Boolean).join(' ');
}

// Single Responsibility: Função específica para criar links mailto dos planos
// Open/Closed: Extensível para diferentes tipos de e-mail
export function createPlanMailtoLink(plan: PricingPlan): string {
  const subject = `Interesse no Plano ${plan.name}`;
  
  const bodyLines = [
    'Olá,',
    '',
    `Tenho interesse no Plano ${plan.name} (${plan.price}${plan.period || ''}) com as seguintes funcionalidades:`,
    '',
    ...plan.features.map(feature => `• ${feature}`),
    '',
    'Gostaria de mais informações sobre:',
    '• Processo de cadastro',
    '• Forma de pagamento',
    '• Prazo para ativação',
    '',
    'Aguardo retorno.',
    '',
    'Atenciosamente.'
  ];
  
  const body = bodyLines.join('\n');
  
  const params = new URLSearchParams({
    subject,
    body
  });
  
  return `mailto:${config.app.contactEmail}?${params.toString()}`;
-}