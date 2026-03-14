export type Verdict = "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED";

export interface Source {
  title: string;
  url: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  sources: Source[];
  createdAt: string;
  updatedAt: string;
}

export interface FactCheckRequest {
  title: string;
  content: string;
}

export interface FactCheckResponse {
  message: string;
  id: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  sources: Source[];
}

export interface VerdictCount {
  verdict: Verdict;
  count: number;
}

export interface HistoryItem {
  date: string;
  count: number;
}

export interface StatsResponse {
  total: number;
  verdicts: VerdictCount[];
  history: HistoryItem[];
}

export interface NewsState {
  items: NewsItem[];
  selectedItem: NewsItem | null;
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
  searchResults: NewsItem[];
}