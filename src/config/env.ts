const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Copy .env.example to .env and set the backend URL.');
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ''),
};
