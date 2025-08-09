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
