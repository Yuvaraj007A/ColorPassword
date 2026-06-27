const argon2 = require('argon2');

/**
 * Quantizes an RGB component to the nearest multiple of 10.
 * This maps values to bins of size 10 (e.g., 15-24 all map to 20),
 * implementing a ±5 RGB tolerance while keeping the hashing secure.
 */
const quantizeComponent = (val) => {
  const num = parseInt(val, 10);
  if (isNaN(num)) return 0;
  // Clamp between 0 and 255
  const clamped = Math.max(0, Math.min(255, num));
  return Math.round(clamped / 10) * 10;
};

/**
 * Converts a sequence of 5 color objects {r, g, b} into a quantized string representation.
 * Format: "R-G-B|R-G-B|R-G-B|R-G-B|R-G-B"
 */
const colorPatternToString = (colors) => {
  if (!Array.isArray(colors) || colors.length !== 5) {
    throw new Error('Color password must consist of exactly 5 colors.');
  }

  return colors
    .map((c) => {
      const r = quantizeComponent(c.r);
      const g = quantizeComponent(c.g);
      const b = quantizeComponent(c.b);
      return `${r}-${g}-${b}`;
    })
    .join('|');
};

/**
 * Hashes a quantized color sequence using Argon2.
 */
const hashColorPattern = async (colors) => {
  const colorStr = colorPatternToString(colors);
  return await argon2.hash(colorStr, {
    type: argon2.argon2id, // recommended type
    memoryCost: 2 ** 16,  // 64MB memory
    timeCost: 3,          // 3 iterations
    parallelism: 4        // 4 threads
  });
};

/**
 * Verifies if the input colors match the stored hash.
 */
const verifyColorPattern = async (hash, colors) => {
  try {
    const colorStr = colorPatternToString(colors);
    return await argon2.verify(hash, colorStr);
  } catch (error) {
    console.error('Error verifying color pattern hash:', error);
    return false;
  }
};

module.exports = {
  quantizeComponent,
  colorPatternToString,
  hashColorPattern,
  verifyColorPattern,
};
