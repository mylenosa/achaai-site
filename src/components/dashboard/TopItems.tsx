// Single Responsibility: Top Itens (duas visões, mesma estrutura visual)
// Open/Closed: ajustes de labels/células sem mexer em páginas

import React, { useState } from 'react';
import { Plus, Eye, Info } from 'lucide-react';
import { formatBRL, formatPct, formatNumber } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;          // “Buscas Loja”
  meuPreco?: number | null;
  mediana?: number | null;    // média/mediana na cidade
  diffPct?: number | null;    // (meu - mediana)/mediana
}

export interface TopItemGeral {
  nome: string;
  mediana?: number | null;
  lojas: number;              // nº de lojas
  hasMine: boolean;           // se minha loja tem esse item
  // buscas?: number;         // opcional (quando o serviço passar)
}

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

/** Popover de info para “Média Cidade” (mobile-friendly) */
const MediaCidadeCell: React.FC<{
  value?: number | null;
  lojas?: number | null;
}> = ({ value, lojas }) => {
  const [open, setOpen] = useState(false);
  const n = typeof lojas === 'number' ? lojas : null;
  const baseValida = (n == null && value != null) || (n != null && n >= 5 && value != null);

  if (!baseValida) {
    // base insuficiente (n<5 ou sem valor)
    return <span className="text-xs text-gray-500">Coletando</span>;
  }

  const price = value!;
  // faixa aproximada ±15% (trocar por min/max reais quando houver)
  const min = Math.max(0, Math.round(price * 0.85));
  const max = Math.round(price * 1.15);

  return (
    <div className="inline-flex items-center gap-1 relative">
      <span className="text-gray-900">{formatBRL(price)}</span>
      {n != null && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {n} lojas
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Detalhes da mediana"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 rounded-md border border-gray-200 bg-white shadow-md p-2 text-xs text-gray-700 w-56"
        >
          {n != null && n < 5 ? (
            <div className="text-amber-600 font-medium">Baixa confiança</div>
          ) : (
            <div className="text-gray-900 font-medium">Base confiável</div>
          )}
          <div className="mt-1">
            Base: {n ?? '—'} lojas • Faixa {formatBRL(min)} – {formatBRL(max)}
          </div>
        </div>
      )}
    </div>
  );
};

/** Badge de comparativo – só mostra quando há base válida; senão vira CTA/feedback */
const Comparativo: React.FC<{
  diff?: number | null;
  hasPrice: boolean;
  lojas?: number | null;
  onAddPrice: () => void;
}> = ({ diff, hasPrice, lojas, onAddPrice }) => {
  const baseConfiavel = lojas == null || lojas >= 5; // quando não temos n (minha loja), assumimos validação no serviço

  if (!hasPrice) {
    return (
      <button
        onClick={onAddPrice}
        className="text-emerald-600 hover:text-emerald-700 text-xs font-medium underline"
      >
        + Adicionar preço para ver
      </button>
    );
  }

  if (!baseConfiavel || diff == null) {
    return <span className="text-xs text-amber-600">Base insuficiente</span>;
  }

  const up = diff > 0;
  const cls = up ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {up ? '↑' : '↓'} {formatPct(Math.abs(diff), false)}
    </span>
  );
};

const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'minha' | 'cidade'>('minha');

  // Ordenação garantida antes do Top 5
  const meusTop = [...meus].sort((a, b) => b.conversas - a.conversas).slice(0, 5);
  const geralTop = [...geral].slice(0, 5); // mantenha a ordem do serviço (ou troque para buscas quando existir)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {tab === 'minha' ? 'Top 5 Itens mais buscados — Minha loja' : 'Top 5 Itens mais buscados — Cidade'}
          </h3>
          <p className="text-sm text-gray-500">
            {tab === 'minha'
              ? 'Produto → Buscas Loja → Média Cidade → Preço & Comparativo.'
              : 'Produto → Buscas Cidade → Média Cidade → Ação.'}
          </p>
        </div>

        <div className="bg-gray-100 rounded-xl p-1">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'minha' ? 'bg-white shadow-sm font-medium' : ''}`}
            onClick={() => setTab('minha')}
          >
            Minha loja
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'cidade' ? 'bg-white shadow-sm font-medium' : ''}`}
            onClick={() => setTab('cidade')}
          >
            Cidade
          </button>
        </div>
      </div>

      {/* Tabela com 4 colunas em ambos os modos (consistência visual) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                {tab === 'minha' ? 'Buscas Loja' : 'Buscas Cidade'}
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Média Cidade</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                {tab === 'minha' ? 'Preço & Comparativo' : 'Ação'}
              </th>
            </tr>
          </thead>

          <tbody>
            {tab === 'minha'
              ? meusTop.map((it) => (
                  <tr key={it.nome} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">{it.nome}</td>
                    <td className="py-3 px-4 text-center text-gray-800">{formatNumber(it.conversas)}</td>
                    <td className="py-3 px-4 text-center">
                      <MediaCidadeCell value={it.mediana} lojas={null} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {it.meuPreco != null ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-gray-900">{formatBRL(it.meuPreco)}</span>
                          <Comparativo
                            diff={it.diffPct}
                            hasPrice={true}
                            lojas={null}
                            onAddPrice={() => onAddPrice(it.nome)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddPrice(it.nome)}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                          + Adicionar preço
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              : geralTop.map((it) => {
                  const buscas = (it as any).buscas as number | undefined;
                  const temBuscas = typeof buscas === 'number';

                  return (
                    <tr key={it.nome} className="border-b">
                      <td className="py-3 px-4 font-medium text-gray-900">{it.nome}</td>
                      <td className="py-3 px-4 text-center text-gray-800">
                        {temBuscas ? formatNumber(buscas!) : <span className="text-xs text-gray-500">Coletando</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <MediaCidadeCell value={it.mediana} lojas={it.lojas} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {it.hasMine ? (
                          <button
                            onClick={() => onViewInStock(it.nome)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            👁 Ver no estoque
                          </button>
                        ) : (
                          <button
                            onClick={() => onAddItem(it.nome)}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            + Adicionar ao estoque
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopItems;
