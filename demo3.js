export const demo3 = `// Dattorro reverb demo with different parameters
const freq = 220 + sin(0.1) * 100
const input = sin(freq) * 0.2

// Try different reverb settings:
// - High diffusion for more realistic reverb
// - Medium damping for natural decay
// - High decay for longer tail
// - Moderate wet mix
out = reverb(input, 0.8, 0.7, 0.6, 0.8, 0.5)
`
