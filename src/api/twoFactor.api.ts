import axios from 'axios';

// Assumes you have an axios instance with baseURL + auth interceptor
// e.g. import api from '@/lib/axios'
// If not, replace `api` with `axios` and pass the token manually.
import api from '@/lib/axios';

export interface Setup2FAResponse {
  qrCode: string;  // data:image/png;base64,...
  secret: string;
}

export const setup2faApi = {
  /** Called when user clicks "Enable 2FA" — generates secret + QR */
  initSetup: () =>
    api.post<Setup2FAResponse>('/2fa/setup').then((r) => r.data),

  /** Called after user scans QR and enters first code to confirm */
   verifySetup: async (code: string) => {
    const { data } = await api.post('/2fa/verify-setup', { code })
    return data
  },

  /** Called during login when requires2fa === true. Uses tempToken. */
  verifyLogin: (code: string, tempToken: string) =>
    axios
      .post<{ accessToken: string }>(
        `${import.meta.env.VITE_API_URL}/2fa/verify-login`,
        { code },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      )
      .then((r) => r.data),
};