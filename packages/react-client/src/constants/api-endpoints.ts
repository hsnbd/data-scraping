const apiEndpoints = {
  Login: 'http://localhost:4000/login',
  ProfileFetch: 'http://localhost:4000/profile',
  Signup: 'http://localhost:4000/registration',
  KeywordList: 'http://localhost:4000/keyword-records',
  KeywordReportMarkAsRead: (id: string) => `http://localhost:4000/keyword-records/${id}/mark-as-read`,
};

export default Object.freeze(apiEndpoints);
