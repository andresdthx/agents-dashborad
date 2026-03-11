"use client";

import { useRef, useCallback } from "react";

/**
 * Reproduce un beep sintetizado usando Web Audio API.
 * No requiere archivos de audio externos.
 *
 * Limitacion de browsers: el AudioContext solo se activa tras la primera
 * interaccion del usuario con la pagina (click, keydown, etc.).
 */
export function useNotificationSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = getContext();

      const playBeep = (startTime: number, frequency: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playBeep(now, 880, 0.15);        // La5, 150ms
      playBeep(now + 0.2, 1047, 0.2);  // Do6, 200ms
    } catch {
      // Silenciar errores de autoplay o falta de soporte
    }
  }, [getContext]);

  return { playNotificationSound };
}
