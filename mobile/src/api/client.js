import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest?.extra?.apiUrl ||
  'http://localhost:4000';

export const API_URL = apiUrl;

console.log('[Volconok] API URL:', apiUrl);

export const api = axios.create({
  baseURL: `${apiUrl}/api`,
  timeout: 15000,
});

const TOKEN_KEY = 'volconok_token';

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.log('SecureStore getToken error:', e);
    return null;
  }
}

export async function setToken(token) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (e) {
    console.log('SecureStore setToken error:', e);
  }
}

api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log('Request interceptor error:', e);
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.error || err.message || 'Network error';
    err.displayMessage = msg;
    console.log('[API Error]', msg);
    return Promise.reject(err);
  },
);

export async function uploadImage(asset) {
  const form = new FormData();
  const filename = asset.fileName || asset.uri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = asset.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');
  form.append('file', { uri: asset.uri, name: filename, type });
  const { data } = await api.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
