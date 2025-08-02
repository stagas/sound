import loader from 'https://esm.sh/@monaco-editor/loader'
import { Biquad } from './biquad.js'
import { PolyBlepOscillator } from './polyblep-oscillator.js'
import { Sin } from './sin.js'
import { clamp } from './util.js'

const g = window.globalThis
g.out = 0

Array.prototype.pick = function(value) {
  return this[clamp(Math.floor(value * this.length), 0, this.length - 1)]
}

Object.defineProperty(Number.prototype, 'o1', {
  get: function() {
    return this * 0.5 + 0.5
  },
})

Object.defineProperty(Number.prototype, 'w', {
  get: function() {
    return this < 0 ? -this : this
  },
})

function sync(period, offset = 0) {
  return (t + offset) % period < 0.0000001
}
g.sync = sync

let sines_i = 0
const sines = []
function sin(freq, sync) {
  let osc
  if (sines_i >= sines.length) {
    sines.push(osc = new Sin())
  }
  else {
    osc = sines[sines_i]
  }
  if (freq !== osc.frequency) {
    osc.setFrequency(freq)
  }
  sines_i++
  if (sync) {
    osc.phase = 0
  }
  return osc.process()
}
g.sin = sin

let polybleps_i = 0
const polybleps = []
function createPolyBlep(waveform) {
  return function(freq, sync) {
    let osc
    if (polybleps_i >= polybleps.length) {
      polybleps.push(osc = new PolyBlepOscillator())
    }
    else {
      osc = polybleps[polybleps_i]
    }
    if (freq !== osc.frequency) {
      osc.setFrequency(freq)
    }
    if (waveform !== osc.waveform) {
      osc.setWaveform(waveform)
    }
    polybleps_i++
    if (sync) {
      osc.phase = 0
    }
    return osc.process()
  }
}
g.saw = createPolyBlep(0)
g.sqr = createPolyBlep(1)
g.tri = createPolyBlep(2)

function white() {
  return Math.random() * 2 - 1
}
g.white = white

function exp(period, rate) {
  return Math.exp(-(t % period) * rate)
}
g.exp = exp

let biquads_i = 0
const biquads = []
function createBiquad(type) {
  const method = 'set' + type
  return function(input, cut, res, gain) {
    let biquad
    if (biquads_i >= biquads.length) {
      biquads.push(biquad = new Biquad())
    }
    else {
      biquad = biquads[biquads_i]
    }
    biquad[method](cut, res, gain)
    biquads_i++
    return biquad.processSample(input)
  }
}
g.lp = createBiquad('LowPass')
g.hp = createBiquad('HighPass')
g.bp = createBiquad('BandPass')
g.nt = createBiquad('Notch')
g.ap = createBiquad('AllPass')
g.pk = createBiquad('Peaking')
g.ls = createBiquad('LowShelf')
g.hs = createBiquad('HighShelf')

let t = 0
let n = 0
let fn = function() {}

const ctx = new AudioContext()
g.sampleRate = ctx.sampleRate
ctx.resume()
const script = ctx.createScriptProcessor(1024, 1, 1)
script.connect(ctx.destination)
script.onaudioprocess = function(e) {
  const output = e.outputBuffer.getChannelData(0)

  for (let i = 0; i < output.length; i++) {
    sines_i =
      polybleps_i =
      biquads_i =
        0

    t = n / sampleRate
    n++

    fn()

    output[i] = out
  }
}

loader.init().then(monaco => {
  // extra libraries
  var libSource = [
    `
    /** A sine oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function sin(freq: number, sync?: boolean): number
    /** A sawtooth oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function saw(freq: number, sync?: boolean): number
    /** A square oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function sqr(freq: number, sync?: boolean): number
    /** A triangle oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function tri(freq: number, sync?: boolean): number
    /** White noise.
     * @returns {number} The output sample.
     */
    declare function white(): number
    /** Exponential decay.
     * @param {number} period The period.
     * @param {number} rate The decay rate.
     * @returns {number} The output sample.
     */
    declare function exp(period: number, rate: number): number

    /** Used to sync the phase of an oscillator.
     * @param {number} period The period to sync to.
     * @param {number} offset The time offset to drift from.
     * @returns {boolean} true When phase resets, false otherwise
     */
    declare function sync(period: number, offset?: number): number
    /** Low pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function lp(input: number, cut: number, res: number): number
    /** High pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function hp(input: number, cut: number, res: number): number
    /** Band pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function bp(input: number, cut: number, res: number): number
    /** Notch filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function nt(input: number, cut: number, res: number): number
    /** All pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function ap(input: number, cut: number, res: number): number
    /** Peaking filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @param {number} gain The gain.
     * @returns {number} The output sample.
     */
    declare function pk(input: number, cut: number, res: number, gain: number): number
    /** Low shelf filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @param {number} gain The gain.
     * @returns {number} The output sample.
     */
    declare function ls(input: number, cut: number, res: number): number
    /** High shelf filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @param {number} gain The gain.
     * @returns {number} The output sample.
     */
    declare function hs(input: number, cut: number, res: number): number

    interface Array<T> {
      /** Pick a value from an array.
       * @param {number} value 0..1 scales to the array length.
       * @returns {T} The picked value.
       */
      pick(value: number): T
    }

    interface Number {
      /** Scales a -1..1 value to 0..1 */
      readonly o1: number
      /** Folds a -1..1 value to 0..1 */
      readonly w: number
    }

    `,
  ].join('\n')

  var libUri = 'ts:filename/facts.d.ts'
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri)
  monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri))
  monaco.editor.setTheme('vs-dark')
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: localStorage.getItem('code') || '',
    language: 'javascript',
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
  })

  window.addEventListener('resize', () => {
    editor.layout()
  })

  editor.onDidChangeModelContent(e => {
    const code = editor.getValue()
    localStorage.setItem('code', code)
    try {
      fn = new Function(code)
    }
    catch (e) {
      console.error(e)
    }
  })
})
