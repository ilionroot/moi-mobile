import axios from 'axios';

export const api = axios.create({
  // baseURL: 'http://192.168.15.200:3000/',
  baseURL: 'https://ilion-personal-moi-api-efefb8555b02.herokuapp.com',
});
