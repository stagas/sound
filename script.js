import loader from 'https://esm.sh/@monaco-editor/loader'
import { AR } from './ar.js'
import { Biquad } from './biquad.js'
import { Compressor } from './compressor.js'
import { Cross } from './cross.js'
import { Delay } from './delay.js'
import { Expander } from './expander.js'
import { Gate } from './gate.js'
import './help.js'
import { KarplusStrong } from './karplus-strong.js'
import { initMonaco } from './monaco.js'
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

Array.prototype.walk = function(period = 1, offset = 0) {
  return this.pick(adv(1 / this.length, sync(period, offset)))
}

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

// Global state tracking for string pattern functions
let fitPatterns = new Map()
let trigPatterns = new Map()
g.fitPatterns = fitPatterns
g.trigPatterns = trigPatterns

String.prototype.fit = function(period = 1, offset = 0) {
  // Convert string pattern to array of booleans
  // 'x' = trigger, '-' = no trigger, any other character = no trigger
  const pattern = this.split('').map(char => char.toLowerCase() === 'x')
  const steps = pattern.length

  if (steps === 0) return false

  // Create a unique key for this pattern and parameters
  const key = `${this}_${period}_${offset}`

  // Get or create state tracking for this pattern
  if (!fitPatterns.has(key)) {
    fitPatterns.set(key, { previousPhase: 0 })
  }
  const state = fitPatterns.get(key)

  // Use the same timing logic as Sync class
  const currentPhase = (t + offset) % period
  const previousPhase = state.previousPhase

  // Detect crossing the period boundary (when phase wraps from high to low)
  const crossed = previousPhase > currentPhase && previousPhase > period * 0.5

  state.previousPhase = currentPhase

  if (crossed) {
    // When period wraps, advance to next step in pattern
    if (!state.currentStep) state.currentStep = 0
    state.currentStep = (state.currentStep + 1) % steps
    return pattern[state.currentStep] === true
  }

  return false
}

String.prototype.trig = function(period = 1, offset = 0) {
  // Convert string pattern to array of booleans
  // 'x' = trigger, '-' = no trigger, any other character = no trigger
  const pattern = this.split('').map(char => char.toLowerCase() === 'x')
  const steps = pattern.length

  if (steps === 0) return false

  // Create a unique key for this pattern and parameters
  const key = `${this}_${period}_${offset}`

  // Get or create state tracking for this pattern
  if (!trigPatterns.has(key)) {
    trigPatterns.set(key, { previousPhase: 0, currentStep: 0 })
  }
  const state = trigPatterns.get(key)

  // Each 'x' creates a trigger with the specified period
  const totalPeriod = period * steps
  const currentPhase = (t + offset) % totalPeriod
  const previousPhase = state.previousPhase

  // Detect crossing the period boundary for the current step
  const stepPeriod = period
  const stepPhase = currentPhase % stepPeriod
  const prevStepPhase = previousPhase % stepPeriod

  const crossed = prevStepPhase > stepPhase && prevStepPhase > stepPeriod * 0.5

  state.previousPhase = currentPhase

  if (crossed) {
    // When step period wraps, advance to next step in pattern
    state.currentStep = (state.currentStep + 1) % steps
    return pattern[state.currentStep] === true
  }

  return false
}

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
    // Triad degrees relative to the selected scale (quality is implied by the scale)
    'i': [0, 2, 4],
    'ii': [1, 3, 5],
    'iii': [2, 4, 6],
    'iv': [3, 5, 7],
    'v': [4, 6, 8],
    'vi': [5, 7, 9],
    'vii': [6, 8, 10],
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

class Sync {
  constructor() {
    this.period = 1
    this.offset = 0
    this.previousPhase = 0
  }

  setPeriod(period) {
    this.period = period
  }

  setOffset(offset) {
    this.offset = offset
  }

  reset() {
    this.previousPhase = 0
  }

  processSample() {
    const currentPhase = (t + this.offset) % this.period
    const previousPhase = this.previousPhase

    // Detect crossing the period boundary (when phase wraps from high to low)
    const crossed = previousPhase > currentPhase && previousPhase > this.period * 0.5

    this.previousPhase = currentPhase
    return crossed
  }
}

let syncs_i = 0
const syncs = []
g.syncs = syncs
function sync(period, offset = 0) {
  let sync
  if (syncs_i >= syncs.length) {
    syncs.push(sync = new Sync())
  }
  else {
    sync = syncs[syncs_i]
  }
  sync.setPeriod(period)
  sync.setOffset(offset)
  syncs_i++
  return sync.processSample()
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
g.advs = advs
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

class Bpm {
  constructor() {
    this.bpm = 120
    this.multiplier = 1
  }

  setBpm(bpm) {
    this.bpm = bpm
    // Convert BPM to time multiplier
    // At 120 BPM, 1 beat = 0.5 seconds, so we want t to advance at normal speed
    // At 60 BPM, 1 beat = 1 second, so we want t to advance at half speed
    // At 240 BPM, 1 beat = 0.25 seconds, so we want t to advance at double speed
    this.multiplier = bpm / 120
    // Store the multiplier globally so it can be used in time calculation
    g.bpmMultiplier = this.multiplier
  }

  processSample() {
    return this.multiplier
  }
}

let bpms_i = 0
const bpms = []
function bpm(bpmValue) {
  let bpm
  if (bpms_i >= bpms.length) {
    bpms.push(bpm = new Bpm())
  }
  else {
    bpm = bpms[bpms_i]
  }
  bpm.setBpm(bpmValue)
  bpms_i++
  return bpm.processSample()
}
g.bpm = bpm

g.t = 0
g.f = 0
g.bpmMultiplier = 1
g.fn = function() {}

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
      bpms_i =
      syncs_i =
        0

    g.t = (g.f / sampleRate) * g.bpmMultiplier
    g.f++

    fn()

    output[i] = Number.isFinite(out) ? out : 0
  }
}

loader.init().then(initMonaco)

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
  g.bpmMultiplier = 1

  // Reset pattern state tracking
  fitPatterns.clear()
  trigPatterns.clear()

  // Reset all Adv instances
  advs.forEach(adv => adv.reset())

  // Reset all Sync instances
  syncs.forEach(sync => sync.reset())

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
