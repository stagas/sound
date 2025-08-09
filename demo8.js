export const demo8 = `bpm(144)
const kick = sin(60,sync(1/2))*exp(1/2,120)*20
const hihat = bp(white()*0.2*exp(1/8,120+tri(8,sync(1,.14))*100),8500,1.35)*8
const bass = lp(tanh(tri(52), 5.7),220,1.85)*.95*ar(.3,.01,sync(1/2,.325))
out = compressor(ls(reverb(delay(kick,.81,.35,.35)+hihat+bass,.5,.5,.75,.35,.065),200,.5,-18),-30,25,.01,.04,10)
`
