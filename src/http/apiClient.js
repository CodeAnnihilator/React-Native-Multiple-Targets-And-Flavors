import axios from 'axios';
import Config from 'react-native-config';

const BASE_URL = Config.BASE_URL;

const isStagingOrProduction =
  BASE_URL.includes('safe-to-connect') ||
  BASE_URL.includes('stramplerbande') ||
  BASE_URL.includes('mobile.stramplerbande.org');

export const apiURL = isStagingOrProduction
  ? `${BASE_URL}/posts/api`
  : `${BASE_URL}:8095/api`;

const _axios = axios.create({
  baseURL: apiURL,
});

export default _axios;
