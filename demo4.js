export const demo4 = `// Waveshaper demo - different distortion effects
const bass = lp(saw([50, 100, 80, 60].pick(saw(1/3))) * .2, 3100 + 300 * saw(4) + 350 * sin(3), 2.9, 0)
const kick = pk(hp(sin(52 + 195 * exp(1/2, 30), sync(1/2, .001)) * exp(1/2, 17), 70, 3), 120, .5, 5)
const hihat = pk(hp(white() * (-1 - saw(8) + saw(1).o1), 9010, 1.2, 0), 10000, 1.5, 5.5)
const snare = bp(white() * (-1 - saw(1/2)), 1000, 1.2)

// Apply different waveshapers to create distortion effects
const distortedBass = tanh(bass, 3) // Soft saturation
const distortedKick = atan(kick, 2) // Hard saturation
const distortedHihat = crush(hihat, 4) // Bit crushing
const distortedSnare = fold(snare, 5) // Wave folding

out = distortedKick * .5 + (distortedBass * .5 + distortedHihat * .25 + distortedSnare * .25) * (.5 - (distortedKick * .5).o1 ** .005)
`
