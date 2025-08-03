export class Cross {
  constructor() {
    this.previousInput = 0
    this.output = false
  }

  processSample(input) {
    // Detect zero crossing: previous input was negative and current input is positive
    // or previous input was positive and current input is negative
    const crossed = (this.previousInput < 0 && input >= 0) || (this.previousInput > 0 && input <= 0)

    // Store current input for next frame
    this.previousInput = input

    // Output true for one frame when crossing occurs
    this.output = crossed

    return this.output
  }
}
