export const demo8 = `bpm(144)
const kick = sin(60,sync(1/2))*exp(1/2,120)*0.3
const hihat = bp(white()*0.2*exp(1/8,120+tri(8,sync(1,.14))*100),8500,1.35)

out = delay(kick,.81,.35,.35)+hihat
`
