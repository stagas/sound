export const demo5 = `const c = 'i iii iv v'.chords('dorian').pick(adv(1/4,sync(1/1)))
const lead = c.ntof(3).chord(ks,sync(1/4))
const bass = lp(saw(c[0].ntof(2)) * ar(.01,.2,sync(1/4)), 100, 2)
const kick = hard(pk(hp(sin(30 + 185 * exp(1/2, 20), sync(1/2, .001)) * exp(1/2, 27), 70, 3), 80, .85, 5), .5) * 1.2
const hihat = pk(hp(white() * (-1 - saw(8) + saw(1).o1), 7010, 1.2, 0), 10000, 1.5, 3.5) * .3
out = compressor(kick + (hihat+lead+bass)*(1-kick.o1), -15, 10, .05, .5, 10)
`
