export const demo4 = `const c = 'i ii vi v'.chords('mixolydian').pick(saw(1/2)).ntof(3)
const guitar =
    ks(c[0],sync(1/2))*.4
  + ks(c[1],sync(1/3))*.3
  + ks(c[2],sync(1/4))*.2
out = reverb(delay(guitar,1/3,.125,.24),.6,.5,.32,.55,.1)
`
