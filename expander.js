import { clamp } from './util.js'

export class Expander {
  constructor() {
    this.threshold = -24
    this.ratio = 2
    this.attack = 0.003
    this.release = 0.25
    this.knee = 0

    // State variables
    this.envelope = 0
    this.gain = 1
  }

  setThreshold(threshold) {
    this.threshold = threshold
  }

  setRatio(ratio) {
    this.ratio = clamp(ratio, 1, 20)
  }

  setAttack(attack) {
    this.attack = clamp(attack, 0.001, 1)
  }

  setRelease(release) {
    this.release = clamp(release, 0.001, 1)
  }

  setKnee(knee) {
    this.knee = clamp(knee, 0, 40)
  }

  reset() {
    this.envelope = 0
    this.gain = 1
  }

  processSample(input) {
    // Calculate input level in dB
    const inputLevel = 20 * Math.log10(Math.abs(input) + 1e-10)

    // Calculate expansion curve (opposite of compression)
    let gainReduction = 0

    if (this.knee > 0) {
      // Soft knee
      const kneeLower = this.threshold - this.knee / 2
      const kneeUpper = this.threshold + this.knee / 2

      if (inputLevel > kneeUpper) {
        gainReduction = 0
      }
      else if (inputLevel < kneeLower) {
        gainReduction = (this.threshold - inputLevel) * (this.ratio - 1)
      }
      else {
        // Soft knee region
        const kneeRatio = 1 + (this.ratio - 1) * (kneeUpper - inputLevel) / this.knee
        gainReduction = (this.threshold - inputLevel) * (kneeRatio - 1)
      }
    }
    else {
      // Hard knee
      if (inputLevel < this.threshold) {
        gainReduction = (this.threshold - inputLevel) * (this.ratio - 1)
      }
    }

    // Apply attack/release envelope
    const targetGain = Math.pow(10, -gainReduction / 20)

    if (targetGain < this.gain) {
      // Attack phase
      this.gain += (targetGain - this.gain) * (1 - Math.exp(-1 / (this.attack * sampleRate)))
    }
    else {
      // Release phase
      this.gain += (targetGain - this.gain) * (1 - Math.exp(-1 / (this.release * sampleRate)))
    }

    return input * this.gain
  }
}
