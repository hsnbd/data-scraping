export interface ScrapeKeywordPayload {
  id: number;
  keyword: string;
}
export interface ScrapeJobDonePayload extends ScrapeKeywordPayload {
  id: number;
  keyword: string;
  total_search_results: string;
  total_advertisers: number;
  total_links: number;
  html_code: string;
}
