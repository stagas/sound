export class Delay {
  constructor(maxDelayTime = 2.0) {
    this.maxDelayTime = maxDelayTime
    this.bufferSize = Math.ceil(maxDelayTime * sampleRate) // Default sample rate
    this.buffer = new Float32Array(this.bufferSize)
    this.writeIndex = 0
    this.readIndex = 0
    this.delayTime = 0.1
    this.feedback = 0.3
    this.wet = 0.5
    this.dry = 0.5
  }

  setDelayTime(time) {
    this.delayTime = Math.max(0, Math.min(time, this.maxDelayTime))
  }

  setFeedback(feedback) {
    this.feedback = Math.max(0, Math.min(feedback, 0.99))
  }

  setWet(wet) {
    this.wet = Math.max(0, Math.min(wet, 1))
    this.dry = 1 - this.wet
  }

  processSample(input) {
    // Calculate read position with cubic interpolation
    const delaySamples = this.delayTime * 44100
    const readPos = this.writeIndex - delaySamples

    // Handle wrap-around
    const wrappedReadPos = readPos < 0 ? readPos + this.bufferSize : readPos

    // Cubic interpolation
    const index = Math.floor(wrappedReadPos)
    const fraction = wrappedReadPos - index

    // Get four samples for cubic interpolation
    const i0 = (index - 1 + this.bufferSize) % this.bufferSize
    const i1 = index % this.bufferSize
    const i2 = (index + 1) % this.bufferSize
    const i3 = (index + 2) % this.bufferSize

    const s0 = this.buffer[i0]
    const s1 = this.buffer[i1]
    const s2 = this.buffer[i2]
    const s3 = this.buffer[i3]

    // Cubic interpolation coefficients
    const a0 = -0.5 * s0 + 1.5 * s1 - 1.5 * s2 + 0.5 * s3
    const a1 = s0 - 2.5 * s1 + 2 * s2 - 0.5 * s3
    const a2 = -0.5 * s0 + 0.5 * s2
    const a3 = s1

    // Calculate interpolated sample
    const delayedSample = a0 * fraction * fraction * fraction
      + a1 * fraction * fraction
      + a2 * fraction
      + a3

    // Write input + feedback to buffer
    this.buffer[this.writeIndex] = input + this.feedback * delayedSample

    // Update write index
    this.writeIndex = (this.writeIndex + 1) % this.bufferSize

    // Return dry + wet mix
    return this.dry * input + this.wet * delayedSample
  }

  reset() {
    this.buffer.fill(0)
    this.writeIndex = 0
    this.readIndex = 0
  }
}
