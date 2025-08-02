export const demo5 = `// Dynamic components demo
// This demo showcases compressor, expander, and gate effects

// Create a drum-like sound with noise and envelope
const noise = white() * exp(0.1, 20)
const drum = noise * (1 - exp(0.05, 30))

// Apply compressor to control dynamics
const compressed = compressor(drum, -20, 4, 0.01, 0.1, 6)

// Apply expander to increase dynamic range
const expanded = expander(compressed, -30, 3, 0.005, 0.2, 12)

// Apply noise gate to reduce background noise
const gated = gate(expanded, -40, 0.002, 0.15, 0.05, -30)

// Add some reverb for space
const withReverb = reverb(gated, 0.7, 0.5, 0.3, 0.8, 0.3)

// Output the processed signal
out = withReverb * 0.5`
