import { clamp } from './util.js'

const MIN_FREQUENCY = 20

export class Biquad {
  constructor() {
    this.frequency = 0
    this.q = 0
    this.gain = 0

    this.b0 = 0
    this.b1 = 0
    this.b2 = 0
    this.a1 = 0
    this.a2 = 0

    // State variables for the filter
    this.x1 = 0
    this.x2 = 0
    this.y1 = 0
    this.y2 = 0
  }

  // Set filter coefficients
  setCoefficients(b0, b1, b2, a1, a2) {
    this.b0 = b0
    this.b1 = b1
    this.b2 = b2
    this.a1 = a1
    this.a2 = a2
  }

  // Low-pass filter
  setLowPass(frequency, q) {
    if (frequency === this.frequency && q === this.q) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)

    const b0 = (1 - cosw0) / 2
    const b1 = 1 - cosw0
    const b2 = (1 - cosw0) / 2
    const a0 = 1 + alpha
    const a1 = -2 * cosw0
    const a2 = 1 - alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // High-pass filter
  setHighPass(frequency, q) {
    if (frequency === this.frequency && q === this.q) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)

    const b0 = (1 + cosw0) / 2
    const b1 = -(1 + cosw0)
    const b2 = (1 + cosw0) / 2
    const a0 = 1 + alpha
    const a1 = -2 * cosw0
    const a2 = 1 - alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // Band-pass filter
  setBandPass(frequency, q) {
    if (frequency === this.frequency && q === this.q) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)

    const b0 = alpha
    const b1 = 0
    const b2 = -alpha
    const a0 = 1 + alpha
    const a1 = -2 * cosw0
    const a2 = 1 - alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // Notch filter
  setNotch(frequency, q) {
    if (frequency === this.frequency && q === this.q) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)

    const b0 = 1
    const b1 = -2 * cosw0
    const b2 = 1
    const a0 = 1 + alpha
    const a1 = -2 * cosw0
    const a2 = 1 - alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // All-pass filter
  setAllPass(frequency, q) {
    if (frequency === this.frequency && q === this.q) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)

    const b0 = 1 - alpha
    const b1 = -2 * cosw0
    const b2 = 1 + alpha
    const a0 = 1 + alpha
    const a1 = -2 * cosw0
    const a2 = 1 - alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // Peaking filter
  setPeaking(frequency, q, gain) {
    if (frequency === this.frequency && q === this.q && gain === this.gain) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q
    this.gain = gain

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)
    const A = Math.pow(10, gain / 40)

    const b0 = 1 + alpha * A
    const b1 = -2 * cosw0
    const b2 = 1 - alpha * A
    const a0 = 1 + alpha / A
    const a1 = -2 * cosw0
    const a2 = 1 - alpha / A

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // Low-shelf filter
  setLowShelf(frequency, q, gain) {
    if (frequency === this.frequency && q === this.q && gain === this.gain) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q
    this.gain = gain

    const w0 = 2 * Math.PI * frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)
    const A = Math.pow(10, gain / 40)

    const b0 = A * ((A + 1) - (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha)
    const b1 = 2 * A * ((A - 1) - (A + 1) * cosw0)
    const b2 = A * ((A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha)
    const a0 = (A + 1) + (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha
    const a1 = -2 * ((A - 1) + (A + 1) * cosw0)
    const a2 = (A + 1) + (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // High-shelf filter
  setHighShelf(frequency, q, gain) {
    if (frequency === this.frequency && q === this.q && gain === this.gain) return
    this.frequency = clamp(frequency, MIN_FREQUENCY, sampleRate / 2)
    this.q = q
    this.gain = gain

    const w0 = 2 * Math.PI * this.frequency / sampleRate
    const alpha = Math.sin(w0) / (2 * q)
    const cosw0 = Math.cos(w0)
    const A = Math.pow(10, gain / 40)

    const b0 = A * ((A + 1) + (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha)
    const b1 = -2 * A * ((A - 1) + (A + 1) * cosw0)
    const b2 = A * ((A + 1) + (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha)
    const a0 = (A + 1) - (A - 1) * cosw0 + 2 * Math.sqrt(A) * alpha
    const a1 = 2 * ((A - 1) - (A + 1) * cosw0)
    const a2 = (A + 1) - (A - 1) * cosw0 - 2 * Math.sqrt(A) * alpha

    this.setCoefficients(b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0)
  }

  // Reset filter state
  reset() {
    this.x1 = 0
    this.x2 = 0
    this.y1 = 0
    this.y2 = 0
  }

  // Process a single sample
  processSample(sample) {
    const output = this.b0 * sample + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2

    // Update state variables
    this.x2 = this.x1
    this.x1 = sample
    this.y2 = this.y1
    this.y1 = output

    return output
  }

  // Process audio buffer
  process(input, output) {
    const inputChannel = input[0]
    const outputChannel = output[0]

    for (let i = 0; i < inputChannel.length; i++) {
      const sample = inputChannel[i]
      outputChannel[i] = this.processSample(sample)
    }
  }
}
