// Geminis ljudmotor för terminal.html, oförändrad (2026-10-17). Laddas med terminal.html?ljud=gemini för att jämföra.
const audio = (() => {
  let ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let curStyle = null, activeGain = null, timer = null;
  let step = 0, nextTime = 0, tempoMult = 1.0, userVol = 0.8, isMuted = false;

  // MIDI till Hz (0 eller null = paus)
  const m2f = m => m ? 440 * Math.pow(2, (m - 69) / 12) : 0;

  // 8-takters mönster (128 16-delar). Lätt att redigera!
  // Ackord: [Am, F, C, G] x2 för menu/calm/drive, [Am, F, Dm, E] x2 för panic
  const STYLES = {
    menu: {
      bpm: 70,
      pad: [57, 53, 48, 55, 57, 53, 48, 55],
      arp: [69,0,72,0, 76,0,72,0, 69,0,72,0, 76,0,0,0, 65,0,69,0, 72,0,69,0, 65,0,69,0, 72,0,0,0,
            60,0,64,0, 67,0,64,0, 60,0,64,0, 67,0,0,0, 55,0,59,0, 62,0,59,0, 55,0,59,0, 62,0,0,0]
    },
    calm: {
      bpm: 100,
      pad: [57, 53, 48, 55, 57, 53, 48, 55],
      bass: [45,0,0,45, 0,0,45,0, 41,0,0,41, 0,0,41,0, 36,0,0,36, 0,0,36,0, 43,0,0,43, 0,0,43,0],
      lead: [69,0,0,72, 0,0,76,0, 0,0,72,0, 69,0,0,0, 65,0,0,69, 0,0,72,0, 0,0,69,0, 64,0,0,0,
             60,0,0,64, 0,0,67,0, 0,0,64,0, 62,0,0,0, 55,0,0,59, 0,0,62,0, 0,0,64,0, 62,0,0,0]
    },
    drive: {
      bpm: 130,
      bass: [45,0,57,0, 45,0,57,0, 41,0,53,0, 41,0,53,0, 36,0,48,0, 36,0,48,0, 43,0,55,0, 43,0,55,0],
      lead: [69,0,72,0, 76,0,69,0, 72,0,76,0, 79,0,76,0, 65,0,69,0, 72,0,65,0, 69,0,72,0, 76,0,72,0,
             60,0,64,0, 67,0,60,0, 64,0,67,0, 72,0,67,0, 62,0,67,0, 71,0,62,0, 67,0,71,0, 74,0,71,0],
      hat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1]
    },
    panic: {
      bpm: 160,
      bass: [45,57,45,57, 45,57,45,57, 41,53,41,53, 41,53,41,53, 38,50,38,50, 38,50,38,50, 40,52,40,52, 40,52,40,52],
      lead: [69,0,72,69, 76,0,72,69, 77,0,76,72, 76,0,0,0, 65,0,69,65, 72,0,69,65, 74,0,72,69, 72,0,0,0,
             62,0,65,62, 69,0,65,62, 71,0,69,65, 69,0,0,0, 64,0,68,64, 71,0,68,64, 72,0,71,68, 76,0,0,0],
      hat:  [1,0,1,1, 1,0,1,1]
    }
  };

  // Skapar en vitbrus-buffert för trummor och ljudeffekter
  function makeNoise() {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  // Syntetiserar en enskild ton med mjuk attack/release (inga klick)
  function tone(freq, t, dur, type = 'sine', vol = 0.2, dest = sfxBus, cut = 3000, slide = 0) {
    if (!ctx || !freq) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);

    f.type = 'lowpass';
    f.frequency.setValueAtTime(cut, t);

    const att = Math.min(0.015, dur * 0.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.connect(f); f.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // Syntetiserar filtrerat brus (för hi-hats, dunsar och explosioner)
  function noise(t, dur, vol = 0.1, dest = sfxBus, freq = 5000, type = 'highpass', slide = 0) {
    if (!ctx) return;
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; s.loop = true;
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t); s.stop(t + dur + 0.02);
  }

  // Spelar upp ett 16-delssteg för vald musikstil
  function playStep(st, s, t, stepDur, dest) {
    const p = STYLES[st];
    if (!p) return;
    const barStep = s % 16, bar = Math.floor(s / 16) % 8;

    // Pad (ackord i bakgrunden på ettan i varje takt)
    if (p.pad && barStep === 0) {
      const root = p.pad[bar];
      [root, root + 7, root + 12].forEach(n =>
        tone(m2f(n), t, stepDur * 16, 'sawtooth', 0.05, dest, 700)
      );
    }
    // Arpeggio (menu)
    if (p.arp) {
      const n = p.arp[s % p.arp.length];
      if (n) tone(m2f(n), t, stepDur * 2.5, 'triangle', 0.09, dest, 1200);
    }
    // Basgång
    if (p.bass) {
      const idx = (st === 'panic' ? s : Math.floor(s / 2)) % p.bass.length;
      const n = (st === 'panic' || s % 2 === 0) ? p.bass[idx] : 0;
      if (n) tone(m2f(n), t, stepDur * 1.5, 'sawtooth', 0.12, dest, 550);
    }
    // Melodi / Lead (hålls mjuk med lågpassfilter)
    if (p.lead) {
      const idx = Math.floor(s / 2) % p.lead.length;
      const n = (s % 2 === 0) ? p.lead[idx] : 0;
      if (n) {
        const wave = st === 'calm' ? 'triangle' : 'square';
        tone(m2f(n), t, stepDur * 1.8, wave, 0.07, dest, 1400);
      }
    }
    // Hi-hats
    if (p.hat && p.hat[s % p.hat.length]) {
      noise(t, 0.04, 0.04, dest, 7000, 'highpass');
    }
    // Mjuk puls-kick på fjärdedelar i drive/panic
    if ((st === 'drive' || st === 'panic') && s % 4 === 0) {
      tone(110, t, 0.09, 'sine', 0.16, dest, 300, 35);
    }
  }

  // Lookahead-scheduler som körs var 25:e ms och schemalägger 100 ms framåt
  function scheduler() {
    if (!curStyle || !ctx) return;
    while (nextTime < ctx.currentTime + 0.1) {
      const bpm = STYLES[curStyle].bpm * tempoMult;
      const stepDur = (60 / bpm) / 4; // 16-delsnot
      playStep(curStyle, step, nextTime, stepDur, activeGain);
      nextTime += stepDur;
      step = (step + 1) % 128; // 8 takter * 16 steg
    }
  }

  return {
    init() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        master = ctx.createGain();
        musicBus = ctx.createGain();
        sfxBus = ctx.createGain();

        // Lågpassfilter på musikbussen så att musiken aldrig stör skrivandet
        const musicFilter = ctx.createBiquadFilter();
        musicFilter.type = 'lowpass';
        musicFilter.frequency.value = 1800;

        musicBus. gain.value = 0.65;
        sfxBus.gain.value = 1.0;
        master.gain.value = isMuted ? 0 : userVol;

        musicBus.connect(musicFilter);
        musicFilter.connect(master);
        sfxBus.connect(master);
        master.connect(ctx.destination);
        noiseBuf = makeNoise();
      }
      if (ctx.state === 'suspended') ctx.resume();
    },

    play(style) {
      this.init();
      if (!STYLES[style] || style === curStyle) return;
      const now = ctx.currentTime;

      // Crossfade: tona ut gammal stil under 1 sekund
      if (activeGain) {
        const old = activeGain;
        old.gain.setValueAtTime(old.gain.value, now);
        old.gain.linearRampToValueAtTime(0.0001, now + 1.0);
        setTimeout(() => old.disconnect(), 1100);
      }

      // Skapa ny kanal och tona in under 1 sekund
      const nextGain = ctx.createGain();
      nextGain.gain.setValueAtTime(0.0001, now);
      nextGain.gain.linearRampToValueAtTime(1.0, now + 1.0);
      nextGain.connect(musicBus);

      if (!curStyle) {
        step = 0;
        nextTime = now + 0.05;
      }
      curStyle = style;
      activeGain = nextGain;
      if (!timer) timer = setInterval(scheduler, 25);
    },

    stop() {
      if (!ctx || !curStyle) return;
      const now = ctx.currentTime;
      if (activeGain) {
        const old = activeGain;
        old.gain.setValueAtTime(old.gain.value, now);
        old.gain.linearRampToValueAtTime(0.0001, now + 0.4);
        setTimeout(() => old.disconnect(), 500);
      }
      curStyle = null;
      activeGain = null;
      clearInterval(timer);
      timer = null;
    },

    setTempo(mult) {
      tempoMult = Math.max(0.5, Math.min(2.0, mult));
    },

    setVolume(v) {
      userVol = Math.max(0, Math.min(1, v));
      if (ctx && !isMuted) master.gain.setTargetAtTime(userVol, ctx.currentTime, 0.02);
    },

    mute(on) {
      isMuted = !!on;
      if (ctx) master.gain.setTargetAtTime(isMuted ? 0 : userVol, ctx.currentTime, 0.02);
    },

    sfx: {
      clear() {
        audio.init();
        const t = ctx.currentTime;
        tone(587.33, t, 0.07, 'sine', 0.25);        // D5
        tone(880, t + 0.04, 0.11, 'triangle', 0.25); // A5
      },
      combo(n = 2) {
        audio.init();
        const t = ctx.currentTime;
        const base = 65 + Math.min(n, 8) * 2; // Stiger i tonhöjd med n
        [0, 4, 7].forEach((iv, i) =>
          tone(m2f(base + iv), t + i * 0.045, 0.12, 'triangle', 0.25, sfxBus, 3500)
        );
      },
      error() {
        audio.init();
        const t = ctx.currentTime;
        // Mjukt, dovt brum som inte blir irriterande vid upprepade feltryck
        tone(135, t, 0.14, 'sawtooth', 0.18, sfxBus, 380, 105);
        tone(128, t, 0.14, 'triangle', 0.18, sfxBus, 380, 98);
      },
      levelUp() {
        audio.init();
        const t = ctx.currentTime;
        [60, 64, 67, 72, 76, 79, 84].forEach((m, i) =>
          tone(m2f(m), t + i * 0.08, 0.22, 'triangle', 0.22, sfxBus, 3000)
        );
      },
      bomb() {
        audio.init();
        const t = ctx.currentTime;
        // Filter-svep med brus + djup sub-drop
        noise(t, 0.9, 0.35, sfxBus, 2200, 'bandpass', 80);
        tone(180, t, 0.8, 'sine', 0.35, sfxBus, 600, 28);
      },
      land() {
        audio.init();
        const t = ctx.currentTime;
        // Kort, dov duns
        tone(110, t, 0.07, 'sine', 0.28, sfxBus, 250, 38);
        noise(t, 0.03, 0.1, sfxBus, 300, 'lowpass');
      },
      gameOver() {
        audio.init();
        const t = ctx.currentTime;
        [69, 67, 65, 64].forEach((m, i) =>
          tone(m2f(m), t + i * 0.22, i === 3 ? 0.7 : 0.2, 'sawtooth', 0.18, sfxBus, 800)
        );
      },
      newHighscore() {
        audio.init();
        const t = ctx.currentTime;
        const notes = [69, 73, 76, 81, 76, 81];
        const times = [0, 0.1, 0.2, 0.32, 0.48, 0.62];
        notes.forEach((m, i) =>
          tone(m2f(m), t + times[i], i === 5 ? 0.5 : 0.14, 'square', 0.18, sfxBus, 2400)
        );
      }
    }
  };
})();
