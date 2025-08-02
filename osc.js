export class Sin {
  constructor() {
    this.phase = 0.0
    this.frequency = 440.0
    this.dt = 0
  }

  setFrequency(freq = 0) {
    this.frequency = freq
    this.dt = freq / sampleRate
  }

  process() {
    const output = Math.sin(this.phase * 2 * Math.PI)

    // Update phase
    this.phase += this.dt
    if (this.phase >= 1.0) {
      this.phase -= 1.0
    }

    return output
  }
}

export class Tri {
  constructor() {
    this.phase = 0.0
    this.frequency = 440.0
    this.dt = 0
  }

  setFrequency(freq = 0) {
    this.frequency = freq
    this.dt = freq / sampleRate
  }

  process() {
    const output = Math.abs(1 - (2 * this.phase) % 2) * 2 - 1

    // Update phase
    this.phase += this.dt
    if (this.phase >= 1.0) {
      this.phase -= 1.0
    }

    return output
  }
}
