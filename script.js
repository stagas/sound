import loader from 'https://esm.sh/@monaco-editor/loader'
import { Biquad } from './biquad.js'
import { demo } from './demo.js'
import { demo2 } from './demo2.js'
import { Sin, Tri } from './osc.js'
import { PolyBlepOscillator } from './polyblep-oscillator.js'
import { clamp } from './util.js'

const g = window.globalThis
g.out = 0

const uiConsole = document.getElementById('console')
function log(...args) {
  uiConsole.textContent = args.join(' ')
}

Array.prototype.pick = function(value) {
  const index = Math.floor(value * this.length)
  return this[clamp(index, 0, this.length - 1)]
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

Object.defineProperty(Number.prototype, 'ntof', {
  get: function() {
    return 440 * Math.pow(2, (this - 69) / 12)
  },
})

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

Number.prototype.oct = function(other = 0) {
  return this + (12 * other)
}

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

let tris_i = 0
const tris = []
function tri(freq, sync) {
  let osc
  if (tris_i >= tris.length) {
    tris.push(osc = new Tri())
  }
  else {
    osc = tris[tris_i]
  }
  if (freq !== osc.frequency) {
    osc.setFrequency(freq)
  }
  tris_i++
  if (sync) {
    osc.phase = 0
  }
  return osc.process()
}
g.tri = tri

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
      tris_i =
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
      /** Converts a semitone number to a frequency. */
      readonly ntof: number
      /** Multiplies a number by another. */
      mul(other?: number): number
      /** Adds a number to another. */
      add(other?: number): number
      /** Subtracts a number from another. */
      sub(other?: number): number
      /** Divides a number by another. */
      div(other?: number): number
      /** Octaves a number by another. */
      oct(other?: number): Number
    }

    `,
  ].join('\n')

  var libUri = 'ts:filename/facts.d.ts'
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

  // Demo picker functionality
  const demoPicker = document.getElementById('demoPicker')

  function loadDemo(demoName) {
    const demoContent = demoName === 'demo2' ? demo2 : demo
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
  t = 0
  n = 0
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
