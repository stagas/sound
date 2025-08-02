export const demo2 = `const piano = x =>
    saw(x)
  + tri(x * 2) * 0.15
  + tri(x * 4) * 0.45
  + tri(x * 8) * 0.1
  + tri(x * 16) * 0.52

const piano_env = exp(1/4, 10)
const piano_snd = lp(
    piano('c a f e'.notes.pick(saw(1, sync(1)).w).oct(4).ntof)
  , 1000 + 900 * piano_env, .5) * piano_env

out = piano_snd
`
