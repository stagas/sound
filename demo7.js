export const demo7 = `bpm(144)
const kick = lp(pk(hp(sin(52+80*exp(1/2,10),sync(1/2,.002))*exp(1/2,182),190,1.1),220,.25,-10),150,.5)*4
const chords = 'iii'.chords('phrygian')
const chord = chords[0]
const note = chord.pick(adv(1/2,sync(1/4))).ntof(1)
const bass = delay(lp(ls(tri(note)*.25*ar(.0003,.014,euc(12,4)),52,2.2,-15),200,.55)*3,1/9,.80,.35)*2.5
const hihat = delay(pk(hp((tri(4612)+tri(3244)+tri(5733)+tri(5033)+white())*(ar(.001,.041,sync(1/8,.41))),7000+tri(.125)*2000,1.22,0),8000,2.5,1.5)*.0134,1/4,.85,.4)
const perc = delay(hp(tri(chord[0].ntof(2), sync(1/16,.001)),200,2.85)*ar(.00008,.001,sync(1/4)),1/9,.8,.25)*.7
out = compressor(ls(reverb(compressor(kick,-30,25,.01,.04,10)*1.5+bass+hihat+perc,.5,.5,.75,.5,.06),200,.5,-19),-30,25,.01,.04,10)*9
`
