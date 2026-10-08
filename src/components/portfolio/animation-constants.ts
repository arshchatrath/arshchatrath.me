// Narrow glyphs used while the hero name flickers into place.
export const NAME_NOISE = "ABCDEFGHKLNOPRSTUVXYZ0123456789#%&*";
// What the intro flickers through before it settles.
export const LEAD_NOISE = "01{}[]<>/\\|=+*-_:;#%&?";
// Water-drop hover: a displacement map for a round lens, drawn once. Red and
// green hold how far to pull each pixel towards the centre (128 = stay put),
// fading to nothing at the rim, so the edge of the drop is seamless.
let lensMap = "";
export function getLensMap() {
  if (lensMap) return lensMap;
  const n = 128;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(n, n);
  const peak = 0.2862; // max of u(1-u^2)^2, so the strongest pull maps to full range
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = (x + 0.5) / n * 2 - 1;
      const v = (y + 0.5) / n * 2 - 1;
      const r2 = u * u + v * v;
      const g = r2 < 1 ? (1 - r2) * (1 - r2) / peak : 0;
      const o = (y * n + x) * 4;
      img.data[o] = Math.round(128 - 127 * u * g);
      img.data[o + 1] = Math.round(128 - 127 * v * g);
      img.data[o + 2] = 128;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return (lensMap = c.toDataURL());
}


// Venn circle circumference for r=118
export const VENN_CIRC = 741.4;
