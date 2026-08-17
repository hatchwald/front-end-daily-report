import type { GitProvider } from '@/features/connections/connection.types';

export type ActivityCategory = 'commit' | 'merge_request' | 'review';

export interface ReportSource {
  category: ActivityCategory;
  externalId: string;
  title: string;
  url: string | null;
}

export interface ReportItem {
  provider: GitProvider;
  repositoryName: string;
  category: ActivityCategory;
  title: string;
  description: string;
  activityCount: number;
  sourceData: ReportSource[];
}

export interface Report {
  id: string;
  reportDate: string;
  summary: string;
  totalCommits: number;
  totalMergeRequests: number;
  totalReviews: number;
  generatedAt: string;
  items: ReportItem[];
}

export interface GenerateReportInput {
  date: string;
  connectionIds: string[];
}
