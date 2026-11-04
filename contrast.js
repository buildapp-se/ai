// WCAG-kontrast för färgtokens. Används av contrast.test.js; egna tester i contrast-math.test.js.
// Formlerna följer WCAG 2.x: relativ luminans med sRGB-linjärisering, kvot (L1 + 0.05) / (L2 + 0.05).

// "#rrggbb", "rgb(r g b)" eller "rgb(r g b / a)" -> [r,g,b,a]
// Hela strängen måste matcha: "#rrggbbaa", "color-mix(... rgb(...) ...)" och liknande ger fel
// i stället för att tyst räknas på en del av värdet.
const parse = (s) => {
  if (/^#[0-9a-f]{6}$/i.test(s)) return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)).concat(1);
  const m = s.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)$/);
  if (!m) throw new Error(`okänt färgformat: ${s}`);
  return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
};
// Halvgenomskinlig förgrund lagd över en ogenomskinlig bakgrund.
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
const lum = (rgb) => {
  const c = rgb.map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
// Kontrastkvot mellan två färgsträngar; förgrunden får ha alfa, bakgrunden räknas som ogenomskinlig.
const ratio = (fgColor, bgColor) => {
  const bg = parse(bgColor);
  const fg = over(parse(fgColor), bg);
  const [hi, lo] = [lum(fg), lum(bg.slice(0, 3))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

module.exports = { parse, over, lum, ratio };
