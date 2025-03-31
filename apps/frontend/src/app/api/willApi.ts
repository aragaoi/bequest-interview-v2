import axios from 'axios';
import { Document } from '../types';
import { WILL_BASE_URL } from '../constants';

const willClient = axios.create({
  baseURL: WILL_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const getWill = async (id: string) => {
  const response = await willClient.get(`/${id}`, { responseType: 'blob' });
  return {
    id: Number(id),
    mimeType: response.data.type,
    size: response.data.size,
    buffer: response.data,
    blob: response.data,
  };
};

export const saveWill = async (file: File, id?: string) => {
  if (id) {
    await willClient.put(`/${id}`, { file });
    return null;
  } else {
    const response = await willClient.post('', { file });
    return response.data;
  }
};
