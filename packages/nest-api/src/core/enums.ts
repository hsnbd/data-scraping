export enum UserRowStatus {
  PENDING = 0,
  ACTIVE = 1,
  DEACTIVATE = 99,
}
export enum KeywordRecordStatus {
  DRAFT = 0,
  PROCESSING = 1,
  DONE = 2,
}
export enum GooglePageSelectors {
  SPONSOR_1_LINKS = '#taw a',
  ALL_PAGE_LINKS = 'body a',
  SPONSOR_2_LINKS = '#idonnoyet a',
  RESULT_STATS = '#result-stats',
}

export enum RmqMessagePatterns {
  SCRAPE_KEYWORD = 'SCRAPE_KEYWORD',
  SCRAPING_JOB_DONE = 'SCRAPING_JOB_DONE',
}
