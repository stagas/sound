export const demo =
  `const bass = lp(saw([50, 100, 80, 60].pick(saw(1/3))) * .2, 3100 + 300 * saw(4) + 350 * sin(3), 2.9, 0)
const kick = pk(hp(sin(52 + 195 * exp(1/2, 30), sync(1/2, .001)) * exp(1/2, 17), 70, 3), 120, .5, 5)
const hihat = pk(hp(white() * (-1 - saw(8) + saw(1).o1), 9010, 1.2, 0), 10000, 1.5, 5.5)
const snare = bp(white() * (-1 - saw(1/2)), 1000, 1.2)
const piano = lp(tri([50, 100, 80, 60].pick(saw(1 / 3)) * 4) * .2
    + tri([50, 100, 80, 60].pick(saw(1 / 6)) * 5) * .2, 200 + sin(3).o1 * 2000, 3.7)
out = kick * .5 + (bass * .5 + hihat * .25 + snare * .25 + piano) * (.5 - (kick * .5).o1 ** .005)
`
