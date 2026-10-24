'use client';

// Standard Google Tag Manager / GA4 window declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsEventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Dispatches custom telemetry events to:
 * 1. Google Analytics 4 (window.gtag)
 * 2. Google Tag Manager (window.dataLayer)
 * 3. Browser Console (structured formatting for local dev inspection)
 */
export const trackEvent = (
  eventName: string,
  params: AnalyticsEventParams = {}
): void => {
  if (typeof window === 'undefined') return;

  const payload = {
    ...params,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  // 1. GA4 gtag dispatch
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  // 2. Google Tag Manager dataLayer push
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  // 3. Developer Console Telemetry logger
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.info(
      `%c📊 [Analytics] %c${eventName}`,
      'background: #7C3AED; color: #FFFFFF; font-weight: bold; border-radius: 4px; padding: 2px 6px;',
      'color: #7C3AED; font-weight: bold;',
      payload
    );
  }
};
