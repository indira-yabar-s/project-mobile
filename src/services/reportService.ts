import type { GroupedSales, ProductRanking, RankingCriterion, SalesGrouping, SalesSummary } from '../types/reports';
import api from './api';

interface DateRangeParams {
  desde: string;
  hasta: string;
}

export const reportService = {
  async getSummary({ desde, hasta }: DateRangeParams, signal?: AbortSignal): Promise<SalesSummary> {
    const { data } = await api.get<SalesSummary>('/reports/summary', { params: { desde, hasta }, signal });
    return data;
  },

  async getTopProducts(
    { desde, hasta, criterio = 'UNIDADES', limite = 5 }: DateRangeParams & { criterio?: RankingCriterion; limite?: number },
    signal?: AbortSignal,
  ): Promise<ProductRanking[]> {
    const { data } = await api.get<ProductRanking[]>('/reports/top-products', {
      params: { desde, hasta, criterio, limite },
      signal,
    });
    return data;
  },

  async getGroupedSales(
    { desde, hasta, por }: DateRangeParams & { por: SalesGrouping },
    signal?: AbortSignal,
  ): Promise<GroupedSales[]> {
    const { data } = await api.get<GroupedSales[]>('/reports/grouped-sales', {
      params: { desde, hasta, por },
      signal,
    });
    return data;
  },
};
