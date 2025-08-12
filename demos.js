export const demo =
  `const bass = lp(saw([50, 100, 80, 60].pick(saw(1/3))) * .2, 3100 + 300 * saw(4) + 350 * sin(3), 2.9, 0)
const kick = pk(hp(sin(52 + 195 * exp(1/2, 30), sync(1/2, .001)) * exp(1/2, 17), 70, 3), 120, .5, 5)
const hihat = pk(hp(white() * (-1 - saw(8) + saw(1).o1), 9010, 1.2, 0), 10000, 1.5, 5.5)
const snare = bp(white() * (-1 - saw(1/2)), 1000, 1.2)
const piano = lp(tri([50, 100, 80, 60].pick(saw(1 / 3)) * 4) * .2
    + tri([50, 100, 80, 60].pick(saw(1 / 6)) * 5) * .2, 200 + sin(3).o1 * 2000, 3.7)
out = kick * .5 + (bass * .5 + hihat * .25 + snare * .25 + piano) * (.5 - (kick * .5).o1 ** .005)
`

export const demo2 = `const piano = x =>
    saw(x)
  + tri(x * 2) * 0.15
  + tri(x * 4) * 0.45
  + tri(x * 8) * 0.1
  + tri(x * 16) * 0.52

const piano_env = exp(1/4, 10)
const piano_snd = lp(
    piano('c a f e'.notes.pick(saw(1, sync(1)).w).ntof(3))
  , 1000 + 900 * piano_env, .5) * piano_env

out = piano_snd
`

export const demo3 =
  `out = lp('i iii vii v'.chords('dorian').pick(saw(1/8,sync(16)).o1).ntof(3).chord(saw,sync(1/4))*exp(1/4,10)*0.1,2000+sin(.1)*1500,1.25)
`

export const demo4 = `const c = 'i ii vi v'.chords('mixolydian').pick(saw(1/2)).ntof(3)
const guitar =
    ks(c[0],sync(1/2))*.4
  + ks(c[1],sync(1/3))*.3
  + ks(c[2],sync(1/4))*.2
out = reverb(delay(guitar,1/3,.125,.24),.6,.5,.32,.55,.1)
`

export const demo5 = `const c = 'i iii iv v'.chords('dorian').pick(adv(1/4,sync(1/1)))
const lead = c.ntof(3).chord(ks,sync(1/4))
const bass = lp(saw(c[0].ntof(2)) * ar(.01,.2,sync(1/4)), 100, 2)
const kick = hard(pk(hp(sin(30 + 185 * exp(1/2, 20), sync(1/2, .001)) * exp(1/2, 27), 70, 3), 80, .85, 5), .5) * 1.2
const hihat = pk(hp(white() * (-1 - saw(8) + saw(1).o1), 7010, 1.2, 0), 10000, 1.5, 3.5) * .3
out = compressor(kick + (hihat+lead+bass)*(1-kick.o1), -15, 10, .05, .5, 10)
`

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

export const demo7 = `bpm(144)
const kick = lp(pk(hp(sin(52+80*exp(1/2,10),sync(1/2,.001))*exp(1/2,182),200,1.1),300,.25,-15),100,.25)*4+sin(52,sync(1/2))*exp(1/2,30)*.12
const chords = 'ii'.chords('phrygian')
const chord = chords[0]
const note = chord.pick(adv(1/2,sync(1/4))).ntof(1)
const bass = delay(lp(ls(tri(note)*.25*ar(.02,.000139,sync(1/4)),62,1.2,-12),100,.75)*3,1/9,.85,.124)*1.5
const hihat = delay(pk(hp((tri(4612)+tri(3244)+tri(5733)+tri(5033)+white()*.6)*(ar(.001,.0241,sync(1/8,.41))),8000+tri(.125)*4000,1.22,0),9000,2.5,1.5)*.0134,1/4,.85,.4)*.7
const perc = delay(hp(tri(chord[0].ntof(3),sync(1/3,.48)),300,1.85)*ar(.00033,.0001,sync(1/4)),1/9,.5,.25)*.3
out = compressor(ls(reverb(compressor(kick,-30,25,.01,.04,10)*1.5+bass+hihat+perc,.5,.5,.75,.5,.06),200,.5,-14),-30,25,.01,.04,10)*9
`

export const demo8 = `bpm(144)
const kick = sin(60,sync(1/2))*exp(1/2,120)*20
const hihat = bp(white()*0.2*exp(1/8,120+tri(8,sync(1,.14))*100),8500,1.35)*8
const bass = lp(tanh(tri(52), 5.7),220,1.85)*.95*ar(.3,.01,sync(1/2,.325))
out = compressor(ls(reverb(delay(kick,.81,.35,.35)+hihat+bass,.5,.5,.75,.35,.065),200,.5,-18),-30,25,.01,.04,10)
`

export const demo9 = `bpm(144)
const kick = sin(50, sync(1/4)) * ar(.001, .05, 'x-'.fit(1/4))
const hh = hp(white() * ar(.001, .1, 'x'.trig(1/8)),9000,1.26)*.035
const bass = lp(saw( [55, 58, 164, 77].walk(1/2) ),120,.25) * ar(.012, .06, '--xx'.fit(1/8))*.57
out=compressor(ls(kick+hh+bass,200,.5,-14),-20,8,.001,.01,30)*4
`
