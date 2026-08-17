import type {
  GenerateReportInput,
  Report,
  ReportHistoryPage,
} from '@/features/reports/report.types';
import { apiClient } from '@/lib/api-client';

interface ReportResponse {
  success: boolean;
  data: Report;
}

export async function getReport(date: string, signal?: AbortSignal): Promise<Report> {
  const response = await apiClient.get<ReportResponse>(
    `/api/v1/reports/${encodeURIComponent(date)}`,
    signal,
  );
  return response.data;
}

export async function generateReport(input: GenerateReportInput): Promise<Report> {
  const response = await apiClient.post<ReportResponse>('/api/v1/reports/generate', input);
  return response.data;
}

export async function getReportHistory(
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<ReportHistoryPage> {
  return apiClient.get<ReportHistoryPage>(`/api/v1/reports?page=${page}&limit=${limit}`, signal);
}
