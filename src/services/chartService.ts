import type { ChartResult, ChartSpec } from '../types/charts';
import api from './api';

export const chartService = {
  /** Pide a la IA un gráfico a partir de una frase. Consume una consulta del límite diario. */
  async ask(pregunta: string): Promise<ChartResult> {
    const { data } = await api.post<ChartResult>('/assistant/chart', { pregunta }, { timeout: 120000 });
    return data;
  },

  /** Calcula un gráfico a partir de su receta, sin IA. */
  async run(spec: ChartSpec, signal?: AbortSignal): Promise<ChartResult> {
    const { data } = await api.post<ChartResult>('/reports/chart', spec, { signal });
    return data;
  },
};
