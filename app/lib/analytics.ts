/**
 * Google Analytics conversion tracking utilities
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Track contact conversion event
 * @param contactType - Type of contact (email, telegram, telegram_sales)
 * @param contactValue - Contact value (email address or Telegram username)
 */
export function trackContactConversion(
  contactType: 'email' | 'telegram' | 'telegram_sales',
  contactValue: string
) {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'contact_click', {
    event_category: 'Contact',
    event_label: contactType,
    contact_type: contactType,
    contact_value: contactValue,
    value: 1,
  });

  // Track as conversion
  window.gtag('event', 'conversion', {
    send_to: 'G-F55Q439F8J',
    event_category: 'Contact',
    event_label: contactType,
    value: 1,
    currency: 'USD',
  });
}

/**
 * Track email click conversion
 */
export function trackEmailClick(email: string) {
  trackContactConversion('email', email);
}

/**
 * Track Telegram click conversion
 */
export function trackTelegramClick(username: string) {
  trackContactConversion('telegram', username);
}

/**
 * Track FreightTender sales Telegram click conversion
 */
export function trackTelegramSalesClick(username: string) {
  trackContactConversion('telegram_sales', username);
}
