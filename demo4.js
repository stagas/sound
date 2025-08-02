export const demo4 = `const c = 'i ii vi v'.chords('mixolydian').pick(saw(1/2)).ntof(3)
const string1 = ks(c[0], sync(1/2)) * 0.4
const string2 = ks(c[1], sync(1/3)) * 0.3
const string3 = ks(c[2], sync(1/4)) * 0.2
out = reverb(string1 + string2 + string3, 0.6, 0.5, 0.32, 0.55, 0.1)
`
