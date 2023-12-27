import axios, { AxiosRequestConfig, AxiosResponse, Method as HTTPMethod, ResponseType } from 'axios';

export const defaultOptions: { responseType: ResponseType } = {
  responseType: 'json',
};

/**
 * The main API access function that comes preconfigured with useful defaults.
 *
 * @param {string} [method] - the HTTP method to use
 * @param {string} [endpoint] - the API endpoint to use
 * @param {Object} [requestOptions] - params and date to be sent
 * @return {Promise} a Promise that will resolve into an object or reject with
 *                   an error object for its reason
 */

const requestManager = <T>(method: HTTPMethod, endpoint: string, requestOptions: AxiosRequestConfig = {}): Promise<T> => {
  const requestParams: AxiosRequestConfig = {
    method,
    url: endpoint,
    ...defaultOptions,
    ...requestOptions,
  };

  return axios.request(requestParams).then((response: AxiosResponse) => {
    return response.data;
  });
};

export default requestManager;
