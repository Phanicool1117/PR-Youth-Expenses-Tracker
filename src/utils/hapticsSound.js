// Apple-Style Web Haptics & Web Audio Chime Utility

export function triggerHaptic(pattern = 15) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Fallback for browsers with restricted vibration permissions
    }
  }
}

export function playSuccessSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Apple-style double chime (E5 -> A5 notes)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0.16, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.24);
  } catch (err) {
    // Ignore audio context restriction policies if user hasn't interacted yet
  }
}
