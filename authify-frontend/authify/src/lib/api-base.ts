const envBase = process.env.NEXT_PUBLIC_API_URL;

export const API_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : envBase && envBase.startsWith('http')
      ? envBase
      : 'http://localhost:5000/api';
