import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { generateReport, getReport, getReportHistory } from '@/features/reports/api/reports.api';

export const reportKeys = {
  all: ['reports'] as const,
  list: (page: number, limit: number) => [...reportKeys.all, 'list', page, limit] as const,
  detail: (date: string) => [...reportKeys.all, 'detail', date] as const,
};

export function useReport(date: string, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.detail(date),
    queryFn: ({ signal }) => getReport(date, signal),
    enabled,
    retry: false,
  });
}

export function useReportHistory(page: number, limit = 10) {
  return useQuery({
    queryKey: reportKeys.list(page, limit),
    queryFn: ({ signal }) => getReportHistory(page, limit, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateReport,
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(report.reportDate), report);
      void queryClient.invalidateQueries({
        queryKey: reportKeys.all,
        predicate: (query) => query.queryKey[1] === 'list',
      });
    },
  });
}
