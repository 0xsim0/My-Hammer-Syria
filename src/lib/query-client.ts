import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,         // 1 Minute — Daten gelten 1min als frisch
        gcTime: 5 * 60 * 1000,        // 5 Minuten im Cache behalten
        retry: 1,
        refetchOnWindowFocus: false,   // Kein automatisches Refetch beim Tab-Wechsel
      },
    },
  });
}
