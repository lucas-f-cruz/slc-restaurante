let audioCtx: AudioContext | null = null;

export function playNotifSound() {
  try {
    audioCtx = audioCtx ?? new (window.AudioContext || (window as any).webkitAudioContext)();
    [660, 880].forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, audioCtx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.13, audioCtx!.currentTime + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx!.currentTime + i * 0.14 + 0.22);
      osc.connect(gain); gain.connect(audioCtx!.destination);
      osc.start(audioCtx!.currentTime + i * 0.14);
      osc.stop(audioCtx!.currentTime + i * 0.14 + 0.24);
    });
  } catch { /* áudio indisponível */ }
}
