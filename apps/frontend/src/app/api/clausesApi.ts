import axios from 'axios';
import { Clause } from '../types';
import { CLAUSES_BASE_URL } from '../constants';

export const fetchClauses = async () => {
  try {
    const response = await axios.get(CLAUSES_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching clauses:', error);
    return [];
  }
};
