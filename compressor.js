import { clamp } from './util.js'

export class Compressor {
  constructor() {
    this.threshold = -24
    this.ratio = 4
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

    // Calculate compression curve
    let gainReduction = 0

    if (this.knee > 0) {
      // Soft knee
      const kneeLower = this.threshold - this.knee / 2
      const kneeUpper = this.threshold + this.knee / 2

      if (inputLevel < kneeLower) {
        gainReduction = 0
      }
      else if (inputLevel > kneeUpper) {
        gainReduction = (inputLevel - this.threshold) * (1 - 1 / this.ratio)
      }
      else {
        // Soft knee region
        const kneeRatio = 1 + (this.ratio - 1) * (inputLevel - kneeLower) / this.knee
        gainReduction = (inputLevel - this.threshold) * (1 - 1 / kneeRatio)
      }
    }
    else {
      // Hard knee
      if (inputLevel > this.threshold) {
        gainReduction = (inputLevel - this.threshold) * (1 - 1 / this.ratio)
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
