export class Waveshaper {
  constructor() {
    this.amount = 1
  }

  setAmount(amount) {
    this.amount = amount
  }

  // Tanh waveshaping - creates soft saturation
  tanh(input) {
    return Math.tanh(input * this.amount)
  }

  // Arctangent waveshaping - creates hard saturation
  atan(input) {
    return Math.atan(input * this.amount) / Math.atan(this.amount)
  }

  // Cubic waveshaping - creates asymmetric distortion
  cubic(input) {
    const x = input * this.amount
    return x - (x * x * x) / 3
  }

  // Soft clipping waveshaping
  softClip(input) {
    const x = input * this.amount
    if (x > 1) return 1
    if (x < -1) return -1
    return x - (x * x * x) / 3
  }

  // Hard clipping waveshaping
  hardClip(input) {
    const x = input * this.amount
    return Math.max(-1, Math.min(1, x))
  }

  // Fold waveshaping - creates wave folding distortion
  fold(input) {
    const x = input * this.amount
    return Math.sin(x) * 0.5
  }

  // Chebyshev waveshaping - creates harmonic distortion
  chebyshev(input, harmonics = [1, 0.5, 0.25]) {
    const x = input * this.amount
    let result = 0
    for (let i = 0; i < harmonics.length; i++) {
      result += harmonics[i] * Math.cos((i + 1) * Math.acos(x))
    }
    return result / harmonics.reduce((a, b) => a + b, 0)
  }

  // Bit crusher waveshaping
  bitCrush(input, bits = 8) {
    const x = input * this.amount
    const levels = Math.pow(2, bits)
    return Math.round(x * levels) / levels
  }

  // Sample rate reduction waveshaping
  sampleRateReduce(input, factor = 4) {
    const x = input * this.amount
    // Simple bit reduction effect
    const levels = Math.pow(2, Math.floor(16 / factor))
    return Math.round(x * levels) / levels
  }

  // Process sample with specified waveshaping function
  processSample(input, type = 'tanh') {
    switch (type) {
      case 'tanh':
        return this.tanh(input)
      case 'atan':
        return this.atan(input)
      case 'cubic':
        return this.cubic(input)
      case 'softClip':
        return this.softClip(input)
      case 'hardClip':
        return this.hardClip(input)
      case 'fold':
        return this.fold(input)
      case 'chebyshev':
        return this.chebyshev(input)
      case 'bitCrush':
        return this.bitCrush(input)
      case 'sampleRateReduce':
        return this.sampleRateReduce(input)
      default:
        return this.tanh(input)
    }
  }

  reset() {
    // Reset any internal state if needed
  }
}
