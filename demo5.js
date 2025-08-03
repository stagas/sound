export const demo5 = `// AR envelope demo - shows envelope always completes attack and release
// Create a trigger pattern that changes at different intervals
const trigger = sync(0.3) || (t > 2 && t < 2.1) || (t > 4 && t < 4.05)

// Create AR envelope with 0.2s attack and 0.8s release
const envelope = ar(0.2, 0.8, trigger)

// Use the envelope to modulate a sine wave
const freq = 220 + envelope * 440 // Frequency from 220Hz to 660Hz
const signal = sin(freq) * 0.3

// Add some visual feedback
log('Envelope:', envelope.toFixed(3), 'Trigger:', trigger)

out = signal
`
