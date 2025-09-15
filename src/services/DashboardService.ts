// src/services/DashboardService.ts
import { supabase } from '../lib/supabase'

/* ===================== Tipos públicos ===================== */
export interface KPIData {
  whatsapp: number;
  mapa: number;
  impressoes: number;
  ctr: number;
  deltaKpis: { whatsapp: number; mapa: number; impressoes: number; ctr: number; };
}
export interface SerieData {
  title: string;
  labels: string[];
  values: number[];
  total: number;
  prevTotal: number;
  delta: number;
}
export interface AtividadeRecente {
  tipo: 'WPP' | 'MAPA';
  ts: Date;
  termo?: string;
}
export interface TopItemMeu {
  nome: string;
  interesses: number;
  meuPreco?: number | null;
  mediana?: number | null;
  diffPct?: number | null;
  lojas?: number;
}
export interface TopItemGeral {
  nome: string;
  interesses: number;
  mediana: number | null;
  lojas: number;
  hasMine: boolean;
  meuPreco?: number | null;
  diffPct?: number | null;
}

/* ===================== Helpers de tempo ===================== */
type Period = '7d' | '30d';

function rangeFor(period: Period) {
  const now = new Date()
  const end = new Date(now)
  const start = new Date(now)
  if (period === '7d') start.setDate(start.getDate() - 6) // 7 dias corridos
  else start.setDate(start.getDate() - 29) // 30 dias corridos

  // período anterior de mesmo tamanho
  const prevEnd = new Date(start)
  const prevStart = new Date(prevEnd)
  if (period === '7d') prevStart.setDate(prevStart.getDate() - 7)
  else prevStart.setDate(prevStart.getDate() - 30)

  return { start, end, prevStart, prevEnd }
}
const iso = (d: Date) => d.toISOString()

/* ===================== Helpers numéricos ===================== */
function median(values: Array<number | null | undefined>): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number').sort((a,b) => a - b)
  if (!xs.length) return null
  const mid = Math.floor(xs.length / 2)
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2
}
function diffPct(meu?: number | null, med?: number | null) {
  if (meu == null || med == null || med <= 0) return null
  return (meu - med) / med
}

/* ===================== Tipos dos selects ===================== */
type ProductRow = {
  id: number
  nome: string | null
  preco: number | null
  loja_id: number
  updated_at?: string
}

type ClickRow = {
  id: number
  loja_id: number
  produto_id: number
  tipo_clique: string
  clicked_at: string
  produtos: { id: number; nome: string | null; preco: number | null; loja_id: number } | null
}

/* ===================== Fetch básicos ===================== */
async function getMyStoreId(): Promise<number | null> {
  const { data: s } = await supabase.auth.getSession()
  const userId = s?.session?.user?.id
  if (!userId) return null

  // Tabela real é "lojas"
  const { data, error } = await supabase
    .from('lojas')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.id ?? null
}

async function getMyProducts(storeId: number): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('id, nome, preco, loja_id, updated_at')
    .eq('loja_id', storeId)

  if (error) throw error
  return (data ?? []) as ProductRow[]
}

async function getClicksInRange(range: { start: Date, end: Date }, lojaId?: number): Promise<ClickRow[]> {
  // Seleciona relação 1:1 com produtos; se vier array por qualquer motivo, normalizamos em seguida.
  let q = supabase
    .from('eventos_de_clique')
    .select('id, loja_id, produto_id, tipo_clique, clicked_at, produtos(id, nome, preco, loja_id)')
    .gte('clicked_at', iso(range.start))
    .lt('clicked_at', iso(range.end)) // exclusivo em end
  if (lojaId) q = q.eq('loja_id', lojaId)

  const { data, error } = await q
  if (error) throw error

  const rows = (data ?? []) as any[]
  // Normaliza "produtos" para objeto único (não array)
  const normalized: ClickRow[] = rows.map(r => {
    const prod = Array.isArray(r.produtos) ? (r.produtos[0] ?? null) : (r.produtos ?? null)
    return {
      id: Number(r.id),
      loja_id: Number(r.loja_id),
      produto_id: Number(r.produto_id),
      tipo_clique: String(r.tipo_clique ?? ''),
      clicked_at: String(r.clicked_at),
      produtos: prod
        ? {
            id: Number(prod.id),
            nome: prod.nome ?? null,
            preco: typeof prod.preco === 'number' ? prod.preco : (prod.preco == null ? null : Number(prod.preco)),
            loja_id: Number(prod.loja_id),
          }
        : null,
    }
  })
  return normalized
}

/* ===================== Agregadores ===================== */
function bucketDaily(range: { start: Date, end: Date }, clicks: ClickRow[]) {
  const days: string[] = []
  const labels: string[] = []
  const cur = new Date(range.start)
  while (cur <= range.end) {
    const y = cur.getFullYear()
    const m = (cur.getMonth()+1).toString().padStart(2,'0')
    const d = cur.getDate().toString().padStart(2,'0')
    days.push(`${y}-${m}-${d}`)
    labels.push(cur.toLocaleDateString('pt-BR', { weekday: 'short' })) // dom, seg...
    cur.setDate(cur.getDate() + 1)
  }

  const counts = new Map<string, number>(days.map(k => [k, 0]))
  for (const ev of clicks) {
    const d = new Date(ev.clicked_at)
    const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return { labels, values: days.map(k => counts.get(k) ?? 0) }
}

function bucketWeekly(range: { start: Date, end: Date }, clicks: ClickRow[]) {
  const labels = ['Sem 1','Sem 2','Sem 3','Sem 4']
  const values = [0,0,0,0]
  const totalDays = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000) + 1)
  for (const ev of clicks) {
    const d = new Date(ev.clicked_at)
    const idx = Math.min(3, Math.floor(((d.getTime() - range.start.getTime()) / 86400000) / (totalDays / 4)))
    if (idx >= 0 && idx < 4) values[idx]++
  }
  return { labels, values }
}

/* ===================== Serviço principal ===================== */
export function createDashboardService() {
  async function getDashboardData(periodo: Period) {
    const { start, end, prevStart, prevEnd } = rangeFor(periodo)

    const storeId = await getMyStoreId()
    if (!storeId) {
      const empty: KPIData = { whatsapp: 0, mapa: 0, impressoes: 0, ctr: 0, deltaKpis: { whatsapp: 0, mapa: 0, impressoes: 0, ctr: 0 } }
      const serie: SerieData = { title: periodo === '7d' ? 'Suas Impressões na Semana' : 'Suas Impressões no Mês', labels: [], values: [], total: 0, prevTotal: 0, delta: 0 }
      return { kpis: empty, serie, topMeus: [], topGeral: [], activities: [], tips: [], storeProfile: null }
    }

    const [myProducts, myClicks, myClicksPrev, globalClicks] = await Promise.all([
      getMyProducts(storeId),
      getClicksInRange({ start, end }, storeId),
      getClicksInRange({ start: prevStart, end: prevEnd }, storeId),
      getClicksInRange({ start, end }) // mercado geral
    ])

    // Guards defensivos
    const safeMyProducts = Array.isArray(myProducts) ? myProducts : []
    const safeMyClicks = Array.isArray(myClicks) ? myClicks : []
    const safeMyClicksPrev = Array.isArray(myClicksPrev) ? myClicksPrev : []
    const safeGlobalClicks = Array.isArray(globalClicks) ? globalClicks : []

    const isWpp  = (t: string) => (t || '').toLowerCase().includes('wpp')   || (t || '').toLowerCase().includes('whats')
    const isMapa = (t: string) => (t || '').toLowerCase().includes('map')   || (t || '').toLowerCase().includes('maps')

    /* ---------------- KPIs ---------------- */
    const wppNow   = safeMyClicks.filter(c => isWpp(c.tipo_clique)).length
    const mapaNow  = safeMyClicks.filter(c => isMapa(c.tipo_clique)).length
    const totalNow = safeMyClicks.length // MVP: cliques como "impressões"
    const ctrNow   = totalNow > 0 ? (wppNow + mapaNow) / totalNow : 0

    const wppPrev   = safeMyClicksPrev.filter(c => isWpp(c.tipo_clique)).length
    const mapaPrev  = safeMyClicksPrev.filter(c => isMapa(c.tipo_clique)).length
    const totalPrev = safeMyClicksPrev.length
    const ctrPrev   = totalPrev > 0 ? (wppPrev + mapaPrev) / totalPrev : 0

    const kpis: KPIData = {
      whatsapp: wppNow,
      mapa: mapaNow,
      impressoes: totalNow,
      ctr: ctrNow,
      deltaKpis: {
        whatsapp:   wppPrev   > 0 ? (wppNow - wppPrev)     / wppPrev   : (wppNow   > 0 ? 1 : 0),
        mapa:       mapaPrev  > 0 ? (mapaNow - mapaPrev)   / mapaPrev  : (mapaNow  > 0 ? 1 : 0),
        impressoes: totalPrev > 0 ? (totalNow - totalPrev) / totalPrev : (totalNow > 0 ? 1 : 0),
        ctr:        ctrPrev   > 0 ? (ctrNow - ctrPrev)     / ctrPrev   : (ctrNow   > 0 ? 1 : 0),
      }
    }

    /* ---------------- Série (gráfico) ---------------- */
    const series = periodo === '7d'
      ? bucketDaily({ start, end }, safeMyClicks)
      : bucketWeekly({ start, end }, safeMyClicks)

    const totalSeries = series.values.reduce((s, v) => s + v, 0)
    const serie: SerieData = {
      title: periodo === '7d' ? 'Suas Impressões na Semana' : 'Suas Impressões no Mês',
      labels: series.labels,
      values: series.values,
      total: totalSeries,
      prevTotal: myClicksPrev.length,
      delta: myClicksPrev.length > 0 ? (totalSeries - myClicksPrev.length) / myClicksPrev.length : (totalSeries > 0 ? 1 : 0)
    }

    /* ---------------- Activities ---------------- */
    const activities: AtividadeRecente[] =
      safeMyClicks
        .slice()
        .sort((a,b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
        .slice(0, 8)
        .map(ev => ({
          tipo: isWpp(ev.tipo_clique) ? 'WPP' : 'MAPA',
          ts: new Date(ev.clicked_at),
        }))

    /* ---------------- Top Geral (mercado) ---------------- */
    type AggGeral = { interesses: number; lojas: Set<number>; precos: number[] }
    const aggGeral = new Map<string, AggGeral>()

    for (const ev of safeGlobalClicks) {
      const nome = ev.produtos?.nome?.trim() || '—'
      const loja = ev.produtos?.loja_id ?? -1
      const preco = ev.produtos?.preco ?? null

      if (!aggGeral.has(nome)) {
        aggGeral.set(nome, { interesses: 0, lojas: new Set<number>(), precos: [] })
      }
      const g = aggGeral.get(nome)!
      // Garantias defensivas:
      if (!g.lojas || typeof (g.lojas as any).add !== 'function') g.lojas = new Set<number>()
      if (!Array.isArray(g.precos)) g.precos = []

      g.interesses++
      if (loja >= 0) g.lojas.add(loja)
      if (typeof preco === 'number') g.precos.push(preco)
    }

    const myNames = new Set(safeMyProducts.map(p => (p.nome ?? '').trim()))
    const myPricesByName = new Map<string, number | null>()
    for (const p of safeMyProducts) myPricesByName.set((p.nome ?? '').trim(), p.preco ?? null)

    const topGeral: TopItemGeral[] =
      Array.from(aggGeral.entries())
        .map(([nome, g]) => {
          const med = median(g.precos)
          const mine = myNames.has(nome)
          const meuPreco = mine ? (myPricesByName.get(nome) ?? null) : null
          return {
            nome,
            interesses: g.interesses,
            mediana: med,
            lojas: g.lojas.size,
            hasMine: mine,
            meuPreco,
            diffPct: diffPct(meuPreco, med)
          }
        })
        .sort((a,b) => b.interesses - a.interesses)
        .slice(0, 5)

    /* ---------------- Top Meus (minha loja) ---------------- */
    const clicksByProduct = new Map<number, number>()
    for (const ev of myClicks) {
      clicksByProduct.set(ev.produto_id, (clicksByProduct.get(ev.produto_id) ?? 0) + 1)
    }

    const medianaPorNome = new Map<string, number | null>()
    for (const [nome, g] of aggGeral) medianaPorNome.set(nome, median(g.precos))

    const topMeus: TopItemMeu[] =
      safeMyProducts
        .map(p => {
          const nome = (p.nome ?? '').trim()
          const interesses = clicksByProduct.get(p.id) ?? 0
          const med = medianaPorNome.get(nome) ?? null
          return {
            nome,
            interesses,
            meuPreco: p.preco ?? null,
            mediana: med,
            lojas: aggGeral.get(nome)?.lojas.size ?? 1,
            diffPct: diffPct(p.preco ?? null, med)
          }
        })
        .sort((a,b) => b.interesses - a.interesses)
        .slice(0, 5)

    /* ---------------- Tips ---------------- */
    const tips: Array<{ termo: string; qtd: number }> = []

    return { kpis, serie, topMeus, topGeral, activities, tips, storeProfile: { id: storeId } }
  }

  return { getDashboardData }
}
