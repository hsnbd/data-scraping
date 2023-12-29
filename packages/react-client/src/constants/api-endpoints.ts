import * as process from 'process';

const BaseUrl = process.env.REACT_APP_API_SERVICE_ENDPOINT;

const apiEndpoints = {
  Login: `${BaseUrl}/login`,
  ProfileFetch: `${BaseUrl}/profile`,
  Signup: `${BaseUrl}/registration`,
  KeywordList: `${BaseUrl}/keyword-records`,
  KeywordReportMarkAsRead: (id: string) => `${BaseUrl}/keyword-records/${id}/mark-as-read`,
};
export default Object.freeze(apiEndpoints);
