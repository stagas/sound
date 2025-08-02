export class DattorroReverb {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate

    // Dattorro reverb parameters
    this.diffusion1 = 0.75
    this.diffusion2 = 0.625
    this.damping = 0.5
    this.decay = 0.5
    this.wet = 0.3
    this.dry = 0.7

    // Delay line lengths (in samples) - classic Dattorro values
    this.delay1 = Math.floor(0.0297 * sampleRate) // 29.7ms
    this.delay2 = Math.floor(0.0371 * sampleRate) // 37.1ms
    this.delay3 = Math.floor(0.0411 * sampleRate) // 41.1ms
    this.delay4 = Math.floor(0.0437 * sampleRate) // 43.7ms
    this.delay5 = Math.floor(0.0050 * sampleRate) // 5.0ms
    this.delay6 = Math.floor(0.0017 * sampleRate) // 1.7ms

    // Create delay buffers
    this.buffer1 = new Float32Array(this.delay1)
    this.buffer2 = new Float32Array(this.delay2)
    this.buffer3 = new Float32Array(this.delay3)
    this.buffer4 = new Float32Array(this.delay4)
    this.buffer5 = new Float32Array(this.delay5)
    this.buffer6 = new Float32Array(this.delay6)

    // Write indices
    this.write1 = 0
    this.write2 = 0
    this.write3 = 0
    this.write4 = 0
    this.write5 = 0
    this.write6 = 0

    // All-pass filter states
    this.ap1_state = 0
    this.ap2_state = 0
    this.ap3_state = 0
    this.ap4_state = 0

    // Damping filter states
    this.damp1_state = 0
    this.damp2_state = 0
  }

  setDiffusion1(value) {
    this.diffusion1 = Math.max(0, Math.min(value, 1))
  }

  setDiffusion2(value) {
    this.diffusion2 = Math.max(0, Math.min(value, 1))
  }

  setDamping(value) {
    this.damping = Math.max(0, Math.min(value, 1))
  }

  setDecay(value) {
    this.decay = Math.max(0, Math.min(value, 0.99))
  }

  setWet(value) {
    this.wet = Math.max(0, Math.min(value, 1))
    this.dry = 1 - this.wet
  }

  // All-pass filter implementation
  allPass(input, delayBuffer, writeIndex, delayLength, coefficient) {
    const readIndex = (writeIndex + 1) % delayLength
    const delayed = delayBuffer[readIndex]

    const output = -coefficient * input + delayed
    delayBuffer[writeIndex] = input + coefficient * delayed

    return output
  }

  // Damping filter
  dampingFilter(input, coefficient, stateIndex) {
    const state = stateIndex === 1 ? this.damp1_state : this.damp2_state
    const output = input * (1 - coefficient) + state * coefficient
    if (stateIndex === 1) {
      this.damp1_state = output
    }
    else {
      this.damp2_state = output
    }
    return output
  }

  processSample(input) {
    // Input diffusion network
    const diff1 = this.allPass(input, this.buffer1, this.write1, this.delay1, this.diffusion1)
    this.write1 = (this.write1 + 1) % this.delay1

    const diff2 = this.allPass(diff1, this.buffer2, this.write2, this.delay2, this.diffusion1)
    this.write2 = (this.write2 + 1) % this.delay2

    const diff3 = this.allPass(diff2, this.buffer3, this.write3, this.delay3, this.diffusion2)
    this.write3 = (this.write3 + 1) % this.delay3

    const diff4 = this.allPass(diff3, this.buffer4, this.write4, this.delay4, this.diffusion2)
    this.write4 = (this.write4 + 1) % this.delay4

    // Damping and feedback
    const damped1 = this.dampingFilter(diff4, this.damping, 1)
    const damped2 = this.dampingFilter(diff4, this.damping, 2)

    // Feedback network
    const feedback1 = this.allPass(damped1, this.buffer5, this.write5, this.delay5, this.decay)
    this.write5 = (this.write5 + 1) % this.delay5

    const feedback2 = this.allPass(damped2, this.buffer6, this.write6, this.delay6, this.decay)
    this.write6 = (this.write6 + 1) % this.delay6

    // Cross-feedback
    const cross1 = feedback1 + feedback2 * 0.5
    const cross2 = feedback2 + feedback1 * 0.5

    // Output mixing
    const left = this.dry * input + this.wet * cross1
    const right = this.dry * input + this.wet * cross2

    // Return mono output (average of left and right)
    return (left + right) * 0.5
  }

  reset() {
    this.buffer1.fill(0)
    this.buffer2.fill(0)
    this.buffer3.fill(0)
    this.buffer4.fill(0)
    this.buffer5.fill(0)
    this.buffer6.fill(0)

    this.write1 = 0
    this.write2 = 0
    this.write3 = 0
    this.write4 = 0
    this.write5 = 0
    this.write6 = 0

    this.ap1_state = 0
    this.ap2_state = 0
    this.ap3_state = 0
    this.ap4_state = 0
    this.damp1_state = 0
    this.damp2_state = 0
  }
}
