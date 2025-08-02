export class KarplusStrong {
  constructor() {
    this.buffer = []
    this.index = 0
    this.bufferSize = 0
    this.frequency = 440
    this.isActive = false
  }

  setFrequency(freq) {
    this.frequency = freq
    // Calculate delay time based on frequency
    const delayTime = sampleRate / freq
    this.bufferSize = Math.ceil(delayTime)

    // Initialize buffer
    this.buffer = new Array(this.bufferSize).fill(0)
    this.index = 0
  }

  pluck() {
    // Fill buffer with white noise
    for (let i = 0; i < this.bufferSize; i++) {
      this.buffer[i] = (Math.random() * 2 - 1) * 0.5
    }
    this.isActive = true
  }

  process() {
    if (!this.isActive || this.bufferSize === 0) {
      return 0
    }

    // Read current sample
    const output = this.buffer[this.index]

    // Get next sample for filtering
    const nextIndex = (this.index + 1) % this.bufferSize
    const nextSample = this.buffer[nextIndex]

    // Apply very subtle low-pass filter (this creates natural decay)
    // Using 0.98 instead of 0.5 for much more gradual decay
    const filtered = (output + nextSample) * 0.49 // 999

    // Write filtered sample back to buffer
    this.buffer[this.index] = filtered

    // Move to next position
    this.index = (this.index + 1) % this.bufferSize

    // Check if we should stop (much lower threshold for longer sustain)
    if (Math.abs(filtered) < 0.00001) {
      this.isActive = false
    }

    return output
  }
}
