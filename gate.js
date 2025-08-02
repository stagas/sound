import { clamp } from './util.js'

export class Gate {
  constructor() {
    this.threshold = -24
    this.attack = 0.003
    this.release = 0.25
    this.hold = 0.1
    this.range = -60

    // State variables
    this.envelope = 0
    this.gain = 1
    this.holdTime = 0
    this.isOpen = false
  }

  setThreshold(threshold) {
    this.threshold = threshold
  }

  setAttack(attack) {
    this.attack = clamp(attack, 0.001, 1)
  }

  setRelease(release) {
    this.release = clamp(release, 0.001, 1)
  }

  setHold(hold) {
    this.hold = clamp(hold, 0, 2)
  }

  setRange(range) {
    this.range = clamp(range, -60, 0)
  }

  reset() {
    this.envelope = 0
    this.gain = 1
    this.holdTime = 0
    this.isOpen = false
  }

  processSample(input) {
    // Calculate input level in dB
    const inputLevel = 20 * Math.log10(Math.abs(input) + 1e-10)

    // Determine if gate should be open
    const shouldBeOpen = inputLevel > this.threshold

    // Handle hold time
    if (shouldBeOpen) {
      this.holdTime = this.hold
      this.isOpen = true
    }
    else if (this.holdTime > 0) {
      this.holdTime -= 1 / sampleRate
      if (this.holdTime <= 0) {
        this.isOpen = false
      }
    }

    // Calculate target gain
    const targetGain = this.isOpen ? 1 : Math.pow(10, this.range / 20)

    // Apply attack/release envelope
    if (targetGain > this.gain) {
      // Attack phase (opening gate)
      this.gain += (targetGain - this.gain) * (1 - Math.exp(-1 / (this.attack * sampleRate)))
    }
    else {
      // Release phase (closing gate)
      this.gain += (targetGain - this.gain) * (1 - Math.exp(-1 / (this.release * sampleRate)))
    }

    return input * this.gain
  }
}
