'use client';

import { useEffect } from 'react';
import { useGraphStore } from '@/lib/graphStore';

// Aplica la clase "dark" al <html> según el store (persistido en localStorage
// vía Zustand). La rehidratación del store ocurre en un efecto, después del
// primer render del cliente, así que nunca desincroniza el HTML que React
// hidrata (a diferencia de la técnica de <script> inyectado de next-themes,
// que React 19 ya no acepta como hijo renderizado).
export default function ThemeSync() {
  const isDarkTheme = useGraphStore((s) => s.isDarkTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  return null;
}
