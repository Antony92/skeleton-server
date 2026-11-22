import { SearchParams } from '../types/request.type.js';

export const searchParamsToQuery = (params: SearchParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.size > 0 ? `?${search.toString()}` : ``;
  return query;
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
