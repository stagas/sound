export const demo8 = `bpm(120)
// Test the improved sync function
// This should create a clean kick drum that only triggers when crossing the period boundary

const kick = sin(60, sync(1/2)) * exp(1/2, 20) * 0.3
const hihat = white() * 0.1 * (sync(1/8) ? 1 : 0)

out = kick + hihat
`
