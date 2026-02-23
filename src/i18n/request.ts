import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Cache messages in production to avoid repeated file system reads
const messageCache = new Map<string, Record<string, string>>();

async function getMessagesCached(locale: string) {
  // Return cached messages if available
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }
  
  // Load and cache messages
  const messages = (await import(`../../messages/${locale}.json`)).default;
  messageCache.set(locale, messages);
  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback to default locale if invalid
  if (!locale || !routing.locales.includes(locale as "ar" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await getMessagesCached(locale),
  };
});
