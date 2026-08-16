// Alertas Sonoros Sintetizados via Web Audio API (100% Offline, Zero Latência, Sem Arquivos Externos)

import { getSaved, setSaved } from '../config/storage.js';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return getSaved('sound_enabled', 'true') !== 'false';
}

export function setSoundEnabled(enabled) {
  setSaved('sound_enabled', enabled ? 'true' : 'false');
}

export function isAudioMuted() {
  return !isSoundEnabled();
}

export function setAudioMuted(muted) {
  setSoundEnabled(!muted);
}

/**
 * Toca uma nota sintetizada com envelope suave (attack/decay)
 */
function playTone(freq, duration = 0.15, type = 'sine', startTimeOffset = 0, gainLevel = 0.15) {
  try {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startTimeOffset);
    gain.gain.exponentialRampToValueAtTime(gainLevel, ctx.currentTime + startTimeOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTimeOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTimeOffset);
    osc.stop(ctx.currentTime + startTimeOffset + duration + 0.05);
  } catch (e) {}
}

/**
 * Bipe sutil de atenção (Dois tons rápidos: D5 -> A5)
 */
export function playAttentionSound() {
  try {
    playTone(587.33, 0.12, 'sine', 0, 0.12);
    playTone(880.00, 0.18, 'sine', 0.10, 0.15);
  } catch (e) {}
}

/**
 * Som de sucesso de conclusão de tema (Tríade ascendente: C5 -> E5 -> G5)
 */
export function playSuccessSound() {
  try {
    playTone(523.25, 0.12, 'sine', 0, 0.12);
    playTone(659.25, 0.12, 'sine', 0.10, 0.12);
    playTone(783.99, 0.25, 'sine', 0.20, 0.18);
  } catch (e) {}
}

/**
 * Fanfarra festiva de 100% de conclusão de matéria / lote (C5 -> E5 -> G5 -> C6 com sustentação)
 */
export function playCelebrationFanfare() {
  try {
    playTone(523.25, 0.15, 'triangle', 0, 0.15);
    playTone(659.25, 0.15, 'triangle', 0.12, 0.15);
    playTone(783.99, 0.18, 'triangle', 0.24, 0.18);
    playTone(1046.50, 0.50, 'triangle', 0.38, 0.22);
    playTone(1318.51, 0.60, 'sine', 0.42, 0.15);
  } catch (e) {}
}

/**
 * Som de erro / aviso (Tom descendente grave)
 */
export function playErrorSound() {
  try {
    playTone(329.63, 0.15, 'sawtooth', 0, 0.08);
    playTone(220.00, 0.25, 'sawtooth', 0.12, 0.08);
  } catch (e) {}
}
