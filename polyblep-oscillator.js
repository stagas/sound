export class PolyBlepOscillator {
  constructor() {
    this.phase = 0.0
    this.frequency = 440.0
    this.lastOutput = 0.0
    this.waveform = 0 // 0 = sawtooth, 1 = square, 2 = triangle
    this.dt = 0.0
  }

  setFrequency(freq) {
    this.frequency = freq
    this.dt = freq / sampleRate
  }

  setWaveform(waveform) {
    this.waveform = waveform
  }

  polyBlep(t) {
    const dt = this.dt

    if (dt === 0.0) return 0.0

    // PolyBLEP for removing discontinuity at t = 0
    if (t < dt) {
      t /= dt
      return t + t - t * t - 1.0
    }
    // PolyBLEP for removing discontinuity at t = 1 (wrapped to negative)
    else if (t > 1.0 - dt) {
      t = (t - 1.0) / dt
      return t * t + t + t + 1.0
    }
    else {
      return 0.0
    }
  }

  process() {
    if (this.frequency <= 0) {
      return 0.0
    }

    const dt = this.dt
    let output = 0.0

    switch (this.waveform) {
      case 0: // Sawtooth
        // Naive sawtooth: ramp from 1 to -1 (falling)
        output = 1.0 - (2.0 * this.phase)
        // Add PolyBLEP to remove discontinuity at phase wraparound
        output += this.polyBlep(this.phase)
        break

      case 1: // Square
        if (this.phase < 0.5) {
          output = 1.0
        }
        else {
          output = -1.0
        }
        // Add PolyBLEP at rising edge (phase = 0)
        output += this.polyBlep(this.phase)
        // Subtract PolyBLEP at falling edge (phase = 0.5)
        output -= this.polyBlep((this.phase + 0.5) % 1.0)
        break

      case 2: // Triangle (integrated square)
        // Generate square wave first
        let square = 0.0
        if (this.phase < 0.5) {
          square = 1.0
        }
        else {
          square = -1.0
        }
        square += this.polyBlep(this.phase)
        square -= this.polyBlep((this.phase + 0.5) % 1.0)

        // Integrate to get triangle (leaky integrator)
        const leak = 0.995
        this.lastOutput = this.lastOutput * leak + (square * dt * 4.0)
        output = this.lastOutput
        break

      default:
        output = 0.0
        break
    }

    // Update phase
    this.phase += dt
    if (this.phase >= 1.0) {
      this.phase -= 1.0
    }

    return output
  }
}
