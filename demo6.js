export const demo6 =
  `const kick = lp(pk(hp(sin(52+80*exp(1/2,10),sync(1/2,.004))*exp(1/2,182),190,1.1),220,.25,-10),150,.5)*3.4+sin(52,sync(1/2))*exp(1/2,30)*.06
const hihat = pk(hp(white()*(-1-saw(2,sync(1/2,.25))+saw(2).o1),7000+tri(.025)*2000,1.82,0),6000,2.5,1.5)*.04
const chords = 'vii'.chords('phrygian')
const chord = chords.pick(adv(1/4,sync(2)))
const note = chord[0].ntof(1)
const bass = lp(tanh(tri(note), 5.7),240,1.85)*.15*ar(.3,.01,sync(1/2,.25))
const pad = bp(bp(chord.ntof(2).chord(saw)*ar(.7,0.4,sync(1)),250,3),100,1)*.4
out = compressor(ls(reverb(compressor(kick,-30,25,.01,.04,10)*1.5 + bass + pad + hihat,.5,.5,.75,.5,.1),200,.5,-18),-30,25,.01,.04,10)*9
`
