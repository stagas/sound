import loader from 'https://esm.sh/@monaco-editor/loader'
import { AR } from './ar.js'
import { Biquad } from './biquad.js'
import { Compressor } from './compressor.js'
import { Cross } from './cross.js'
import { Delay } from './delay.js'
import { demo } from './demo.js'
import { demo2 } from './demo2.js'
import { demo3 } from './demo3.js'
import { demo4 } from './demo4.js'
import { demo5 } from './demo5.js'
import { demo6 } from './demo6.js'
import { Expander } from './expander.js'
import { Gate } from './gate.js'
import './help.js'
import { KarplusStrong } from './karplus-strong.js'
import { Sin } from './osc.js'
import { PolyBlepOscillator } from './polyblep-oscillator.js'
import { DattorroReverb } from './reverb.js'
import { clamp } from './util.js'
import { Waveshaper } from './waveshaper.js'

const g = window.globalThis
g.out = 0

const uiConsole = document.getElementById('console')
function log(...args) {
  uiConsole.textContent = args.join(' ')
}
g.log = log

Array.prototype.pick = function(value) {
  const index = Math.floor(value * this.length)
  return this[clamp(index, 0, this.length - 1)]
}

Array.prototype.chord = function(oscillator, ...rest) {
  return this.reduce((sum, freq) => {
    return sum + oscillator(freq, ...rest)
  }, 0)
}

Array.prototype.ntof = function(octave = 0) {
  return this.map(semitone => semitone.ntof(octave))
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

Number.prototype.ntof = function(octave = 0) {
  return 16.35 * Math.pow(2, (this + (octave * 12)) / 12)
}

Object.defineProperty(String.prototype, 'notes', {
  get: function() {
    const noteMap = {
      'c': 0,
      'c#': 1,
      'db': 1,
      'd': 2,
      'd#': 3,
      'eb': 3,
      'e': 4,
      'f': 5,
      'f#': 6,
      'gb': 6,
      'g': 7,
      'g#': 8,
      'ab': 8,
      'a': 9,
      'a#': 10,
      'bb': 10,
      'b': 11,
    }

    return this.trim().split(/\s+/).map(note => {
      const match = note.toLowerCase().match(/^([a-g][#b]?)(\d*)$/)
      if (!match) return null

      const [, noteName, octave] = match
      const baseNote = noteMap[noteName]
      if (baseNote === undefined) return null

      const octaveNum = octave ? parseInt(octave) : 0
      return baseNote + (octaveNum * 12)
    }).filter(note => note !== null)
  },
})

String.prototype.chords = function(scale) {
  const scaleMap = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor': [0, 2, 3, 5, 7, 8, 10],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'locrian': [0, 1, 3, 5, 6, 8, 10],
    'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
    'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
    'pentatonic-major': [0, 2, 4, 7, 9],
    'pentatonic-minor': [0, 3, 5, 7, 10],
  }

  const scaleDegrees = scaleMap[scale.toLowerCase()]
  if (!scaleDegrees) {
    throw new Error(`Unknown scale: ${scale}`)
  }

  const chordQualities = {
    'i': [0, 2, 4], // minor in dorian
    'ii': [1, 3, 5], // minor in dorian
    'iii': [2, 4, 6], // major in dorian
    'iv': [3, 5, 7], // major in dorian
    'v': [4, 6, 8], // minor in dorian
    'vi': [5, 7, 9], // diminished in dorian
    'vii': [6, 8, 10], // minor in dorian
    'I': [0, 2, 4], // major
    'II': [1, 3, 5], // major
    'III': [2, 4, 6], // major
    'IV': [3, 5, 7], // major
    'V': [4, 6, 8], // major
    'VI': [5, 7, 9], // major
    'VII': [6, 8, 10], // major
  }

  return this.trim().split(/\s+/).map(chord => {
    const quality = chordQualities[chord.toLowerCase()]
    if (!quality) return null

    return quality.map(degree => scaleDegrees[degree % scaleDegrees.length])
  }).filter(chord => chord !== null)
}

Number.prototype.mul = function(other = 0) {
  return this * other
}

Number.prototype.add = function(other = 0) {
  return this + other
}

Number.prototype.sub = function(other = 0) {
  return this - other
}

Number.prototype.div = function(other = 0) {
  return this / other
}

function sync(period, offset = 0) {
  return (t + offset) % period < 0.0000001
}
g.sync = sync

function euclidean(steps, beats, rotation = 0, offset = 0, period = 1) {
  // Validate inputs
  steps = Math.max(1, Math.floor(steps))
  beats = Math.max(0, Math.min(beats, steps))
  rotation = ((rotation % steps) + steps) % steps
  period = Math.max(0.001, period)

  // Calculate the pattern using the Bjorklund algorithm
  let pattern = []

  if (beats === 0) {
    // No beats, all zeros
    for (let i = 0; i < steps; i++) {
      pattern.push(0)
    }
  }
  else if (beats === steps) {
    // All beats, all ones
    for (let i = 0; i < steps; i++) {
      pattern.push(1)
    }
  }
  else {
    // Use the Bjorklund algorithm
    const groups = Math.floor(steps / beats)
    const remainder = steps % beats

    let index = 0
    for (let i = 0; i < beats; i++) {
      const groupSize = groups + (i < remainder ? 1 : 0)
      for (let j = 0; j < groupSize; j++) {
        pattern[index++] = (j === 0) ? 1 : 0
      }
    }
  }

  // Apply rotation
  const rotatedPattern = []
  for (let i = 0; i < steps; i++) {
    const index = (i + rotation) % steps
    rotatedPattern[i] = pattern[index]
  }

  // Calculate current step based on time with proper musical timing
  const stepTime = period / steps
  const currentTime = (t + offset) % period
  const step = Math.floor(currentTime / stepTime) % steps

  // Calculate previous step to detect step transitions
  const prevTime = ((t - 1 / sampleRate + offset) % period + period) % period
  const prevStep = Math.floor(prevTime / stepTime) % steps

  // Return true only when we transition to a new step that has a beat
  return step !== prevStep && rotatedPattern[step] === 1
}
g.euc = euclidean

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

let karplus_i = 0
const karplus = []
function karplusStrong(freq, pluck) {
  let ks
  if (karplus_i >= karplus.length) {
    karplus.push(ks = new KarplusStrong())
  }
  else {
    ks = karplus[karplus_i]
  }
  if (freq !== ks.frequency) {
    ks.setFrequency(freq)
  }
  if (pluck) {
    ks.pluck()
  }
  karplus_i++
  return ks.process()
}
g.ks = karplusStrong

function exp(period = 0, rate = 0) {
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

let delays_i = 0
const delays = []
function delay(input, time, feedback, wet) {
  let delay
  if (delays_i >= delays.length) {
    delays.push(delay = new Delay())
  }
  else {
    delay = delays[delays_i]
  }
  delay.setDelayTime(time)
  delay.setFeedback(feedback)
  delay.setWet(wet)
  delays_i++
  return delay.processSample(input)
}
g.delay = delay

let reverbs_i = 0
const reverbs = []
function reverb(input, diffusion1, diffusion2, damping, decay, wet) {
  let reverb
  if (reverbs_i >= reverbs.length) {
    reverbs.push(reverb = new DattorroReverb(sampleRate))
  }
  else {
    reverb = reverbs[reverbs_i]
  }
  reverb.setDiffusion1(diffusion1)
  reverb.setDiffusion2(diffusion2)
  reverb.setDamping(damping)
  reverb.setDecay(decay)
  reverb.setWet(wet)
  reverbs_i++
  return reverb.processSample(input)
}
g.reverb = reverb

let waveshapers_i = 0
const waveshapers = []
function createWaveshaper(type) {
  return function(input, amount) {
    let waveshaper
    if (waveshapers_i >= waveshapers.length) {
      waveshapers.push(waveshaper = new Waveshaper())
    }
    else {
      waveshaper = waveshapers[waveshapers_i]
    }
    waveshaper.setAmount(amount || 1)
    waveshapers_i++
    return waveshaper.processSample(input, type)
  }
}
g.tanh = createWaveshaper('tanh')
g.atan = createWaveshaper('atan')
g.cubic = createWaveshaper('cubic')
g.soft = createWaveshaper('softClip')
g.hard = createWaveshaper('hardClip')
g.fold = createWaveshaper('fold')
g.cheb = createWaveshaper('chebyshev')
g.crush = createWaveshaper('bitCrush')
g.reduce = createWaveshaper('sampleRateReduce')

// Dynamic components
let compressors_i = 0
const compressors = []
function compressor(input, threshold, ratio, attack, release, knee) {
  let comp
  if (compressors_i >= compressors.length) {
    compressors.push(comp = new Compressor())
  }
  else {
    comp = compressors[compressors_i]
  }
  comp.setThreshold(threshold || -24)
  comp.setRatio(ratio || 4)
  comp.setAttack(attack || 0.003)
  comp.setRelease(release || 0.25)
  comp.setKnee(knee || 0)
  compressors_i++
  return comp.processSample(input)
}
g.compressor = compressor

let expanders_i = 0
const expanders = []
function expander(input, threshold, ratio, attack, release, knee) {
  let exp
  if (expanders_i >= expanders.length) {
    expanders.push(exp = new Expander())
  }
  else {
    exp = expanders[expanders_i]
  }
  exp.setThreshold(threshold || -24)
  exp.setRatio(ratio || 2)
  exp.setAttack(attack || 0.003)
  exp.setRelease(release || 0.25)
  exp.setKnee(knee || 0)
  expanders_i++
  return exp.processSample(input)
}
g.expander = expander

let gates_i = 0
const gates = []
function gate(input, threshold, attack, release, hold, range) {
  let g
  if (gates_i >= gates.length) {
    gates.push(g = new Gate())
  }
  else {
    g = gates[gates_i]
  }
  g.setThreshold(threshold || -24)
  g.setAttack(attack || 0.003)
  g.setRelease(release || 0.25)
  g.setHold(hold || 0.1)
  g.setRange(range || -60)
  gates_i++
  return g.processSample(input)
}
g.gate = gate

let ars_i = 0
const ars = []
function ar(attack, release, trigger) {
  let ar
  if (ars_i >= ars.length) {
    ars.push(ar = new AR())
  }
  else {
    ar = ars[ars_i]
  }
  ar.setAttack(attack || 0.1)
  ar.setRelease(release || 0.5)
  ars_i++
  return ar.processSample(trigger)
}
g.ar = ar

let crosses_i = 0
const crosses = []
function cross(input) {
  let cross
  if (crosses_i >= crosses.length) {
    crosses.push(cross = new Cross())
  }
  else {
    cross = crosses[crosses_i]
  }
  crosses_i++
  return cross.processSample(input)
}
g.cross = cross

class Adv {
  constructor(step = 0.25) {
    this.step = step
    this.value = 0
    this.previousTrigger = false
  }

  setStep(step) {
    this.step = step
  }

  reset() {
    this.value = 0
    this.previousTrigger = false
  }

  processSample(trigger) {
    // Detect rising edge of trigger
    const triggerRising = trigger && !this.previousTrigger

    if (triggerRising) {
      // Advance by step and cycle back to 0 if >= 1
      this.value += this.step
      if (this.value >= 1) {
        this.value = 0
      }
    }

    // Store current trigger state for next frame
    this.previousTrigger = trigger

    return this.value
  }
}

let advs_i = 0
const advs = []
function adv(step, trigger) {
  let adv
  if (advs_i >= advs.length) {
    advs.push(adv = new Adv(step))
  }
  else {
    adv = advs[advs_i]
    adv.setStep(step)
  }
  advs_i++
  return adv.processSample(trigger)
}
g.adv = adv

g.t = 0
g.f = 0
let fn = function() {}

const ctx = new AudioContext()
ctx.suspend()
g.sampleRate = ctx.sampleRate

// Create gain node for volume control
const gainNode = ctx.createGain()
gainNode.connect(ctx.destination)

// Create analyser node for visualization
const analyser = ctx.createAnalyser()
analyser.fftSize = 2048
analyser.smoothingTimeConstant = 0.8
gainNode.connect(analyser)

const script = ctx.createScriptProcessor(4096, 1, 1)
script.connect(gainNode)

// Canvas visualizer setup
const canvas = document.getElementById('visualizer')
const canvasCtx = canvas.getContext('2d', { alpha: false })
const waveformCanvas = document.getElementById('waveform')
const waveformCtx = waveformCanvas.getContext('2d', { alpha: false })
const waveformDisplayCanvas = document.getElementById('waveformDisplay')
const waveformDisplayCtx = waveformDisplayCanvas.getContext('2d', { alpha: false })
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

// Playback state
let isPlaying = false
let isStopped = true

function updateVisualizer() {
  if (!isPlaying) return

  // Get time domain data for actual waveform
  analyser.getByteTimeDomainData(dataArray)

  // Use peak amplitude from a small sample for more variation
  let peak = 0
  const sampleSize = Math.min(32, dataArray.length) // Use smaller sample for more variation
  for (let i = 0; i < sampleSize; i++) {
    const sample = Math.abs((dataArray[i] - 128) / 128) // Convert to 0 to 1 range
    peak = Math.max(peak, sample)
  }

  // Shift the entire canvas content left by 1 pixel using getImageData/putImageData
  const imageData = canvasCtx.getImageData(1, 0, canvas.width - 1, canvas.height)
  canvasCtx.putImageData(imageData, 0, 0)

  // Clear the rightmost column
  canvasCtx.clearRect(canvas.width - 1, 0, 1, canvas.height)

  // Draw the new amplitude bar on the right
  const barHeight = Math.max(1, peak * canvas.height)
  const y = (canvas.height - barHeight) / 2

  canvasCtx.fillStyle = '#007acc'
  canvasCtx.fillRect(canvas.width - 1, y, 1, barHeight)

  requestAnimationFrame(updateVisualizer)
}

function updateWaveform() {
  if (!isPlaying) return

  // Get frequency data for FFT display
  analyser.getByteFrequencyData(dataArray)

  // Clear the entire canvas
  waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height)

  // Draw FFT bars
  const barWidth = waveformCanvas.width / dataArray.length
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * waveformCanvas.height
    const x = i * barWidth
    const y = waveformCanvas.height - barHeight

    waveformCtx.fillStyle = '#009900'
    waveformCtx.fillRect(x, y, barWidth + 1, barHeight)
  }

  requestAnimationFrame(updateWaveform)
}

function updateWaveformDisplay() {
  if (!isPlaying) return

  // Get time domain data for actual waveform
  analyser.getByteTimeDomainData(dataArray)

  // Clear the entire canvas
  waveformDisplayCtx.clearRect(0, 0, waveformDisplayCanvas.width, waveformDisplayCanvas.height)

  // Draw waveform
  waveformDisplayCtx.beginPath()
  waveformDisplayCtx.strokeStyle = '#ff00ff'
  waveformDisplayCtx.lineWidth = 1

  for (let i = 0; i < dataArray.length; i++) {
    const x = (i / dataArray.length) * waveformDisplayCanvas.width
    const sample = (dataArray[i] - 128) / 128 // Convert to -1 to 1 range
    const y = (waveformDisplayCanvas.height / 2) + (sample * (waveformDisplayCanvas.height / 2))

    if (i === 0) {
      waveformDisplayCtx.moveTo(x, y)
    }
    else {
      waveformDisplayCtx.lineTo(x, y)
    }
  }

  waveformDisplayCtx.stroke()

  requestAnimationFrame(updateWaveformDisplay)
}

script.onaudioprocess = function(e) {
  const output = e.outputBuffer.getChannelData(0)

  for (let i = 0; i < output.length; i++) {
    sines_i =
      polybleps_i =
      biquads_i =
      delays_i =
      reverbs_i =
      waveshapers_i =
      compressors_i =
      expanders_i =
      gates_i =
      ars_i =
      crosses_i =
      advs_i =
      karplus_i =
        0

    g.t = g.f / sampleRate
    g.f++

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
    declare function sync(period: number, offset?: number): boolean
    /** Euclidean rhythm generator. Distributes beats evenly across steps.
     * @param {number} steps The total number of steps in the pattern.
     * @param {number} beats The number of beats to distribute.
     * @param {number} rotation The rotation offset of the pattern (0 to steps-1).
     * @param {number} offset The time offset to drift from.
     * @param {number} period The period in seconds for the pattern to repeat (default: 1).
     * @returns {boolean} true when a beat occurs, false otherwise
     */
    declare function euclidean(steps: number, beats: number, rotation?: number, offset?: number, period?: number): boolean
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
    /** Delay with cubic interpolation.
     * @param {number} input The input signal.
     * @param {number} time The delay time in seconds.
     * @param {number} feedback The feedback amount (0-0.99).
     * @param {number} wet The wet mix amount (0-1).
     * @returns {number} The output sample.
     */
    declare function delay(input: number, time: number, feedback: number, wet: number): number

    /** Dattorro reverb effect.
     * @param {number} input The input signal.
     * @param {number} diffusion1 The first diffusion amount (0-1).
     * @param {number} diffusion2 The second diffusion amount (0-1).
     * @param {number} damping The damping amount (0-1).
     * @param {number} decay The decay amount (0-0.99).
     * @param {number} wet The wet mix amount (0-1).
     * @returns {number} The output sample.
     */
    declare function reverb(input: number, diffusion1: number, diffusion2: number, damping: number, decay: number, wet: number): number

    /** Tanh waveshaping for soft saturation.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function tanh(input: number, amount?: number): number
    /** Arctangent waveshaping for hard saturation.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function atan(input: number, amount?: number): number
    /** Cubic waveshaping for asymmetric distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function cubic(input: number, amount?: number): number
    /** Soft clipping waveshaping.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function soft(input: number, amount?: number): number
    /** Hard clipping waveshaping.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function hard(input: number, amount?: number): number
    /** Wave folding distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function fold(input: number, amount?: number): number
    /** Chebyshev harmonic distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function cheb(input: number, amount?: number): number
    /** Bit crusher distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function crush(input: number, amount?: number): number
    /** Sample rate reduction distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function reduce(input: number, amount?: number): number
    /** Dynamic range compressor.
     * @param {number} input The input signal.
     * @param {number} threshold The threshold in dB (-60 to 0).
     * @param {number} ratio The compression ratio (1-20).
     * @param {number} attack The attack time in seconds (0.001-1).
     * @param {number} release The release time in seconds (0.001-1).
     * @param {number} knee The knee width in dB (0-40).
     * @returns {number} The output sample.
     */
    declare function compressor(input: number, threshold?: number, ratio?: number, attack?: number, release?: number, knee?: number): number
    /** Dynamic range expander.
     * @param {number} input The input signal.
     * @param {number} threshold The threshold in dB (-60 to 0).
     * @param {number} ratio The expansion ratio (1-20).
     * @param {number} attack The attack time in seconds (0.001-1).
     * @param {number} release The release time in seconds (0.001-1).
     * @param {number} knee The knee width in dB (0-40).
     * @returns {number} The output sample.
     */
    declare function expander(input: number, threshold?: number, ratio?: number, attack?: number, release?: number, knee?: number): number
    /** Noise gate.
     * @param {number} input The input signal.
     * @param {number} threshold The threshold in dB (-60 to 0).
     * @param {number} attack The attack time in seconds (0.001-1).
     * @param {number} release The release time in seconds (0.001-1).
     * @param {number} hold The hold time in seconds (0-2).
     * @param {number} range The gate range in dB (-60 to 0).
     * @returns {number} The output sample.
     */
    declare function gate(input: number, threshold?: number, attack?: number, release?: number, hold?: number, range?: number): number
    /** An attack-release envelope generator.
     * @param {number} attack The attack time in seconds (0.001-10).
     * @param {number} release The release time in seconds (0.001-10).
     * @param {boolean} trigger When true, triggers the envelope.
     * @returns {number} The envelope value (0-1).
     */
    declare function ar(attack?: number, release?: number, trigger: boolean): number
    /** Zero crossing detector. Outputs true for one frame when the input crosses zero.
     * @param {number} input The input signal.
     * @returns {boolean} true when zero crossing occurs, false otherwise.
     */
    declare function cross(input: number): boolean
    /** Advances by a step each time trigger is true, cycling from 0 to 1.
     * @param {number} step The step size (0..1).
     * @param {boolean} trigger Advance when true.
     * @returns {number} Current value (0..1).
     */
    declare function adv(step: number, trigger: boolean): number

    interface Array<T> {
      /** Pick a value from an array.
       * @param {number} value 0..1 scales to the array length.
       * @returns {T} The picked value.
       */
      pick(value: number): T
      /** Plays the frequencies in the array with the oscillator in a chord.
       * @param {function} oscillator The oscillator function to use (e.g., sin, saw, sqr).
       * @param {...any} rest Rest of the arguments to pass to the oscillator.
       * @returns {number} The summed output of all oscillators.
       */
      chord(oscillator: (freq: number, ...rest: any[]) => number, ...rest: any[]): number
      /** Converts semitone numbers in the array to frequencies. Octave 0 corresponds to C0 (16.35 Hz).
       * @param {number} octave The octave to transpose to (defaults to 0). C0 is octave 0.
       * @returns {number[]} Array of frequencies.
       */
      ntof(octave?: number): number[]
    }

    interface Number {
      /** Scales a -1..1 value to 0..1 */
      readonly o1: number
      /** Folds a -1..1 value to 0..1 */
      readonly w: number
      /** Converts a semitone number to a frequency. Octave 0 corresponds to C0 (16.35 Hz). */
      ntof(octave?: number): number
      /** Multiplies a number by another. */
      mul(other?: number): number
      /** Adds a number to another. */
      add(other?: number): number
      /** Subtracts a number from another. */
      sub(other?: number): number
      /** Divides a number by another. */
      div(other?: number): number

    }

    type Scale =
      | 'major'
      | 'minor'
      | 'dorian'
      | 'phrygian'
      | 'lydian'
      | 'mixolydian'
      | 'locrian'
      | 'harmonic-minor'
      | 'melodic-minor'
      | 'pentatonic-major'
      | 'pentatonic-minor'

    interface String {
      /** Parses a string of notes and returns an array of semitone numbers.
       * @example 'c c# d d# g2 a3 a#3'.notes returns [0, 1, 2, 3, 7, 9, 10]
       */
      readonly notes: number[]
      /** Parses a string of chord progressions and returns an array of chord arrays.
       * @param {Scale} scale The scale to use (e.g., 'dorian', 'major', 'minor').
       * @returns {number[][]} Array of chord arrays, each containing semitone numbers.
       * @example 'i iv iii v'.chords('dorian') returns [[0,2,4], [3,5,7], [2,4,6], [4,6,8]]
       */
      chords(scale: Scale): number[][]
    }

    /** Writes to the console.
     * @param {...any} args The arguments to log.
     */
    declare function log(...args: any[]): void
    `,
  ].join('\n')

  var libUri = 'ts:filename/env.d.ts'
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri)
  monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri))
  monaco.editor.setTheme('vs-dark')
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: localStorage.getItem('code') || demo,
    language: 'javascript',
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
    parameterHints: {
      enabled: true,
      cycle: true,
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
    },
    suggest: {
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
    },
    hover: {
      enabled: true,
      delay: 300,
      sticky: false,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: true,
  })

  window.addEventListener('resize', () => {
    editor.layout()
  })

  function compile() {
    const code = editor.getValue()
    localStorage.setItem('code', code)
    try {
      fn = new Function(code)
      log('')
    }
    catch (e) {
      log(e.stack.split('\n')[0])
      console.error(e)
    }
  }

  editor.onDidChangeModelContent(compile)
  compile()

  // Force parameter hints to show when cursor moves inside function calls
  editor.onDidChangeCursorPosition((e) => {
    const model = editor.getModel()
    const position = e.position
    const lineContent = model.getLineContent(position.lineNumber)
    const char = lineContent.charAt(position.column - 1)

    // If cursor is inside parentheses, trigger parameter hints
    if (char === '(' || char === ',' || char === ' ') {
      const word = model.getWordAtPosition(position)
      if (word) {
        // Trigger parameter hints
        editor.trigger('keyboard', 'editor.action.triggerParameterHints', {})
      }
    }
  })

  // Demo picker functionality
  const demoPicker = document.getElementById('demoPicker')

  const demos = {
    demo,
    demo2,
    demo3,
    demo4,
    demo5,
    demo6,
  }
  function loadDemo(demoName) {
    const demoContent = demos[demoName]
    editor.setValue(demoContent)
    localStorage.setItem('code', demoContent)
    compile()
  }

  demoPicker.addEventListener('change', (e) => {
    loadDemo(e.target.value)
  })
})

// Playback controls
function play() {
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  isPlaying = true
  isStopped = false
  updatePlayButton()
  updateVisualizer()
  updateWaveform()
  updateWaveformDisplay()
}

function pause() {
  ctx.suspend()
  isPlaying = false
  updatePlayButton()
}

function stop() {
  ctx.suspend()
  isPlaying = false
  isStopped = true
  g.t = 0
  g.f = 0
  updatePlayButton()
}

function updatePlayButton() {
  const button = document.getElementById('playPause')
  const playIcon = button.querySelector('.icon:not(.pause)')
  const pauseIcon = button.querySelector('.icon.pause')

  if (isPlaying) {
    button.classList.add('playing')
    playIcon.style.display = 'none'
    pauseIcon.style.display = 'inline'
  }
  else {
    button.classList.remove('playing')
    playIcon.style.display = 'inline'
    pauseIcon.style.display = 'none'
  }
}

// Event listeners
document.getElementById('playPause').addEventListener('click', () => {
  if (isPlaying) {
    pause()
  }
  else {
    play()
  }
})

document.getElementById('stop').addEventListener('click', stop)

document.getElementById('volume').addEventListener('input', (e) => {
  gainNode.gain.value = e.target.value
})
