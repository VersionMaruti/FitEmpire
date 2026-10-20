/**
 * FitEmpire Ecosystem App Links
 * Automatically resolves to local dev ports in development / localhost
 * and production URLs when deployed in the cloud.
 */

export const getPartnerAppUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return 'http://localhost:3001';
    }
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  return (
    process.env.NEXT_PUBLIC_PARTNER_APP_URL ||
    'https://fitempirepartner.vercel.app'
  );
};

export const getMemberAppUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return 'http://localhost:8081';
    }
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8081';
  }
  return (
    process.env.NEXT_PUBLIC_MEMBER_APP_URL ||
    'https://fitempiremobile.vercel.app'
  );
};

export const getAdminAppUrl = (): string => {
  return '/admin';
};

