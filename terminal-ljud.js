// Ljudmotor för terminal.html: musik och effekter syntade med Web Audio, inga filer.
// Samma gränssnitt som terminal-ljud-gemini.js, så spelet kan byta med ?ljud=gemini.
const audio = (() => {
  let ctx, master, music, sfxBus, noiseBuf, timer;
  let voices = [], tempo = 1, target = 1, vol = .8, muted = false;

  // Melodier: 16 steg per takt, '.' är paus. A-delen spelas takt 1–4, B-delen takt 5–8.
  // Ackorden byts varje takt. r = grundton, o = oktaven över, x = slag.
  const STYLES = {
    menu: {bpm: 72, wave: 'triangle', len: 3, chords: ['D3 F3 A3', 'Bb2 D3 F3', 'F3 A3 C4', 'C3 E3 G3'], pad: .035, arp: true},
    calm: {bpm: 96, wave: 'triangle', len: 2.5, chords: ['D3 F3 A3', 'Bb2 D3 F3', 'F3 A3 C4', 'C3 E3 G3'], pad: .03,
      bass: 'r.....r.r.......', kick: 'x.......x.......', hat: '..x...x...x...x.',
      lead: [
        'A4 . . . F4 . A4 . C5 . . . A4 . . .', 'D5 . . . . . C5 . Bb4 . . . F4 . . .',
        'A4 . . . C5 . . . F5 . . . E5 . C5 .', 'E5 . . . D5 . C5 . G4 . . . . . . .',
        'D5 . . . . . F5 . E5 . D5 . A4 . . .', 'F5 . . . D5 . . . Bb4 . C5 . D5 . . .',
        'C5 . . . A4 . . . C5 . F5 . A5 . . .', 'G5 . . . E5 . . . D5 . . . C5 . . .']},
    drive: {bpm: 128, wave: 'square', len: 1.4, chords: ['D3 F3 A3', 'Bb2 D3 F3', 'F3 A3 C4', 'C3 E3 G3'],
      bass: 'r.o.r.o.r.o.r.o.', kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
      lead: [
        'D5 . D5 . A4 . D5 . F5 . . E5 . D5 . .', 'D5 . D5 . Bb4 . D5 . F5 . . G5 . F5 . .',
        'C5 . C5 . A4 . C5 . F5 . . E5 . C5 . .', 'E5 . . G5 . . E5 . D5 . C5 . D5 . E5 .',
        'A5 . . . F5 . . . D5 . F5 . A5 . G5 .', 'F5 . . . D5 . . . Bb4 . D5 . F5 . E5 .',
        'F5 . . . C5 . . . A4 . C5 . F5 . A5 .', 'G5 . . . E5 . . . C5 . . . E5 . . .']},
    panic: {bpm: 156, wave: 'sawtooth', len: 1.2, chords: ['D3 F3 A3', 'Bb2 D3 F3', 'G2 Bb2 D3', 'A2 C#3 E3'], pad: .02,
      bass: 'rrorrorrrrorrorr', kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx',
      lead: [
        'D5 . A4 D5 F5 . E5 D5 . . A4 . D5 . E5 .', 'F5 . D5 F5 Bb5 . A5 F5 . . D5 . F5 . G5 .',
        'G5 . D5 G5 Bb5 . A5 G5 . . D5 . G5 . F5 .', 'E5 . C#5 E5 A5 . G5 E5 C#5 . . . A4 . . .',
        'A5 . . F5 . . D5 . E5 . F5 . E5 . D5 .', 'D5 . . Bb4 . . F4 . G4 . A4 . Bb4 . D5 .',
        'D5 . . G4 . . Bb4 . D5 . G5 . F5 . D5 .', 'C#5 . . E5 . . A5 . G5 . E5 . C#5 . A4 .']},
  };

  // 'C#5' -> Hz
  const hz = n => {
    const [, l, acc, oct] = n.match(/([A-G])([#b]?)(\d)/);
    const semi = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[l] + (acc === '#') - (acc === 'b');
    return 440 * 2 ** ((semi + (oct - 4) * 12 - 9) / 12);
  };
  for (const s of Object.values(STYLES)) {
    s.chords = s.chords.map(c => c.split(' ').map(hz));
    if (s.lead) s.lead = s.lead.map(bar => bar.split(' ').map(n => (n === '.' ? 0 : hz(n))));
  }

  // En ton med mjuk attack och release, så att inget klickar
  function tone(f, t, dur, {type = 'sine', v = .1, to = 0, cut = 2400, out = sfxBus, att = .008} = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    lp.frequency.value = cut;
    g.gain.setValueAtTime(.0001, t);
    g.gain.linearRampToValueAtTime(v, t + att);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(lp).connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + .05);
  }

  function hiss(t, dur, {v = .05, type = 'highpass', f = 7000, to = 0, out = sfxBus} = {}) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    s.buffer = noiseBuf;
    fl.type = type;
    fl.frequency.setValueAtTime(f, t);
    if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl).connect(g).connect(out);
    s.start(t);
    s.stop(t + dur + .05);
  }

  // Ett sextondelssteg i en stil
  function step(st, n, t, d, out) {
    const i = n % 16, bar = Math.floor(n / 16), chord = st.chords[bar % 4], root = chord[0] / 2;
    if (i === 0 && st.pad) chord.forEach(f => [-4, 4].forEach(cent =>
      tone(f * 2 ** (cent / 1200), t, d * 16, {type: 'sawtooth', v: st.pad, cut: 900, att: d * 4, out})));
    if (st.arp && i % 2 === 0) {
      const tones = [...chord, chord[0] * 2];
      tone(tones[[0, 1, 2, 3, 2, 1, 0, 1][i / 2]] * 2, t, d * st.len, {type: st.wave, v: .07, cut: 1600, out});
    }
    const b = st.bass?.[i];
    if (b && b !== '.') tone(b === 'o' ? root * 2 : root, t, d * 1.6, {type: st.wave === 'sawtooth' ? 'sawtooth' : 'triangle', v: .14, cut: 600, out});
    const f = st.lead?.[bar % 8][i];
    if (f) tone(f, t, d * st.len, {type: st.wave, v: st.wave === 'triangle' ? .09 : .045, cut: 1800, out});
    if (st.kick?.[i] === 'x') tone(150, t, .14, {v: .3, to: 42, cut: 800, out});
    if (st.snare?.[i] === 'x') hiss(t, .12, {v: .07, type: 'bandpass', f: 1800, out});
    if (st.hat?.[i] === 'x') hiss(t, .03, {v: st.bpm > 140 ? .015 : .025, out});
  }

  // Lookahead: var 25:e ms schemaläggs allt som ska låta de närmaste 120 ms.
  // Stilar som tonar ut fortsätter spela tills de tystnat, därför en lista med röster.
  function schedule() {
    const ahead = ctx.currentTime + .12;
    for (const v of voices) {
      const st = STYLES[v.style];
      while (v.next < ahead && v.next < v.until) {
        tempo += (target - tempo) * .05; // glid mjukt mot nytt tempo
        const d = 60 / (st.bpm * tempo) / 4;
        step(st, v.n, v.next, d, v.bus);
        v.next += d;
        v.n = (v.n + 1) % 128;
      }
    }
    voices = voices.filter(v => v.until > ctx.currentTime);
  }

  function fadeOut(v, sec) {
    const now = ctx.currentTime;
    v.bus.gain.setValueAtTime(v.bus.gain.value, now);
    v.bus.gain.linearRampToValueAtTime(.0001, now + sec);
    v.until = now + sec;
    setTimeout(() => v.bus.disconnect(), sec * 1000 + 300);
  }

  const now = () => (audio.init(), ctx.currentTime);
  const seq = (notes, gap, o) => { const t = now(); notes.forEach((n, i) => tone(hz(n), t + i * gap, gap * 2.5, o)); };

  return {
    init() {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : vol;
        master.connect(ctx.destination);
        const lp = ctx.createBiquadFilter(); // musiken ligger bakom ett lågpass, skrivandet ska stå i fokus
        lp.frequency.value = 2200;
        music = ctx.createGain();
        music.gain.value = .55;
        music.connect(lp).connect(master);
        sfxBus = ctx.createGain();
        sfxBus.connect(master);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        noiseBuf.getChannelData(0).forEach((_, i, a) => { a[i] = Math.random() * 2 - 1; });
      }
      if (ctx.state === 'suspended') ctx.resume();
    },
    play(style) {
      this.init();
      const cur = voices.find(v => v.until === Infinity);
      if (!STYLES[style] || cur?.style === style) return;
      if (cur) fadeOut(cur, 1);
      const bus = ctx.createGain();
      bus.gain.setValueAtTime(.0001, ctx.currentTime);
      bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 1);
      bus.connect(music);
      voices.push({style, bus, n: cur ? cur.n : 0, next: cur ? cur.next : ctx.currentTime + .05, until: Infinity});
      timer ??= setInterval(schedule, 25);
    },
    stop() {
      voices.filter(v => v.until === Infinity).forEach(v => fadeOut(v, .4));
    },
    setTempo(m) { target = Math.max(.5, Math.min(2, m)); },
    setVolume(v) {
      vol = Math.max(0, Math.min(1, v));
      if (ctx && !muted) master.gain.setTargetAtTime(vol, ctx.currentTime, .02);
    },
    mute(on) {
      muted = !!on;
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : vol, ctx.currentTime, .02);
    },
    sfx: {
      clear: () => seq(['A5', 'E6'], .045, {type: 'triangle', v: .16}),
      combo: n => seq(['D5', 'F#5', 'A5', 'D6', 'F#6', 'A6'].slice(0, Math.min(6, n + 1)), .055, {type: 'square', v: .07, cut: 3500}),
      error: () => { const t = now(); [110, 116].forEach(f => tone(f, t, .16, {type: 'sawtooth', v: .07, to: f * .8, cut: 500})); },
      land: () => { const t = now(); tone(120, t, .22, {v: .35, to: 38, cut: 500}); hiss(t, .08, {v: .08, type: 'lowpass', f: 400}); },
      levelUp: () => seq(['D5', 'F#5', 'A5', 'D6', 'A5', 'D6'], .085, {type: 'square', v: .06, cut: 3000}),
      bomb: () => { const t = now(); hiss(t, .9, {v: .25, type: 'bandpass', f: 3000, to: 90}); tone(90, t, .8, {v: .35, to: 28, cut: 400}); },
      gameOver: () => seq(['A4', 'F4', 'D4', 'A3'], .2, {type: 'triangle', v: .14, cut: 1500}),
      newHighscore: () => seq(['D5', 'D5', 'D5', 'A5', 'F#5', 'A5', 'D6'], .09, {type: 'square', v: .07, cut: 3500}),
    },
  };
})();
