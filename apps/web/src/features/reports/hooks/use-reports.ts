import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { generateReport, getReport } from '@/features/reports/api/reports.api';

export const reportKeys = {
  all: ['reports'] as const,
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

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateReport,
    onSuccess: (report) => queryClient.setQueryData(reportKeys.detail(report.reportDate), report),
  });
}
