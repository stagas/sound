import { clamp } from './util.js'

export class AR {
  constructor() {
    this.attack = 0.1
    this.release = 0.5
    this.envelope = 0
    this.state = 'idle'
    this.time = 0
    this.startValue = 0
  }

  setAttack(attack) {
    this.attack = clamp(attack, 0.0000001, 10)
  }

  setRelease(release) {
    this.release = clamp(release, 0.000001, 10)
  }

  reset() {
    this.envelope = 0
    this.state = 'idle'
    this.time = 0
    this.startValue = 0
  }

  processSample(trigger) {
    if (trigger && this.state === 'idle') {
      this.state = 'attack'
      this.time = 0
      this.startValue = 0
    }

    if (trigger && this.state === 'release') {
      this.state = 'attack'
      this.time = 0
      this.startValue = this.envelope
    }

    if (this.state === 'attack') {
      this.time += 1 / sampleRate
      const progress = this.time / this.attack

      if (progress >= 1) {
        this.envelope = 1
        this.state = 'release'
        this.time = 0
      }
      else {
        this.envelope = this.startValue + (1 - this.startValue) * progress
      }
    }

    if (this.state === 'release') {
      this.time += 1 / sampleRate
      const progress = this.time / this.release

      if (progress >= 1) {
        this.envelope = 0
        this.state = 'idle'
      }
      else {
        this.envelope = 1 - progress
      }
    }

    return clamp(this.envelope, 0, 1)
  }
}
