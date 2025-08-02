export const demo2 = `const piano = x =>
    saw(x)
  + tri(x * 2) * 0.15
  + tri(x * 4) * 0.45
  + tri(x * 8) * 0.1
  + tri(x * 16) * 0.52

const piano_env = exp(1/4, 10)
const piano_snd = lp(
    piano([3,4,5,4,5,8].pick(tri(.1, sync(4)).w).oct(4).ntof)
  + piano([6,8,8,6,9,12].pick(tri(.1, sync(4)).w).oct(4).ntof)
, 1000 + 900 * piano_env, .5) * piano_env

out = piano_snd
`
