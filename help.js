import { createPopper } from 'https://esm.sh/@popperjs/core'

// Help modal functionality
const helpModal = document.getElementById('helpModal')
const helpContent = document.getElementById('helpContent')
const helpBtn = document.getElementById('helpBtn')
const closeHelp = document.getElementById('closeHelp')

const componentData = {
  oscillators: [
    {
      name: 'sin',
      signature: 'sin(freq: number, sync?: boolean): number',
      description: 'A sine oscillator.',
      parameters: [
        'freq: The frequency of the oscillator.',
        'sync: Reset phase when true.',
      ],
    },
    {
      name: 'saw',
      signature: 'saw(freq: number, sync?: boolean): number',
      description: 'A sawtooth oscillator.',
      parameters: [
        'freq: The frequency of the oscillator.',
        'sync: Reset phase when true.',
      ],
    },
    {
      name: 'sqr',
      signature: 'sqr(freq: number, sync?: boolean): number',
      description: 'A square oscillator.',
      parameters: [
        'freq: The frequency of the oscillator.',
        'sync: Reset phase when true.',
      ],
    },
    {
      name: 'tri',
      signature: 'tri(freq: number, sync?: boolean): number',
      description: 'A triangle oscillator.',
      parameters: [
        'freq: The frequency of the oscillator.',
        'sync: Reset phase when true.',
      ],
    },
    {
      name: 'white',
      signature: 'white(): number',
      description: 'White noise.',
      parameters: [],
    },
    {
      name: 'exp',
      signature: 'exp(period: number, rate: number): number',
      description: 'Exponential decay.',
      parameters: [
        'period: The period.',
        'rate: The decay rate.',
      ],
    },
    {
      name: 'ks',
      signature: 'ks(freq: number, pluck?: boolean): number',
      description: 'Karplus-Strong plucked string synthesis.',
      parameters: [
        'freq: The frequency of the string.',
        'pluck: Trigger a new pluck when true.',
      ],
    },
  ],
  sync: [
    {
      name: 'sync',
      signature: 'sync(period: number, offset?: number): boolean',
      description: 'Used to sync the phase of an oscillator.',
      parameters: [
        'period: The period to sync to.',
        'offset: The time offset to drift from.',
      ],
    },
    {
      name: 'euclidean',
      signature:
        'euclidean(steps: number, beats: number, rotation?: number, offset?: number, period?: number): boolean',
      description: 'Euclidean rhythm generator. Distributes beats evenly across steps.',
      parameters: [
        'steps: The total number of steps in the pattern.',
        'beats: The number of beats to distribute.',
        'rotation: The rotation offset of the pattern (0 to steps-1).',
        'offset: The time offset to drift from.',
        'period: The period in seconds for the pattern to repeat (default: 1).',
      ],
    },
    {
      name: 'cross',
      signature: 'cross(input: number): boolean',
      description: 'Zero crossing detector. Outputs true for one frame when the input crosses zero.',
      parameters: [
        'input: The input signal.',
      ],
    },
    {
      name: 'adv',
      signature: 'adv(step: number, trigger: boolean): number',
      description: 'Advances by a step each time trigger is true, cycling from 0 to 1.',
      parameters: [
        'step: The step size (0..1).',
        'trigger: Advance when true.',
      ],
    },
  ],
  filters: [
    {
      name: 'lp',
      signature: 'lp(input: number, cut: number, res: number): number',
      description: 'Low pass filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
      ],
    },
    {
      name: 'hp',
      signature: 'hp(input: number, cut: number, res: number): number',
      description: 'High pass filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
      ],
    },
    {
      name: 'bp',
      signature: 'bp(input: number, cut: number, res: number): number',
      description: 'Band pass filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
      ],
    },
    {
      name: 'nt',
      signature: 'nt(input: number, cut: number, res: number): number',
      description: 'Notch filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
      ],
    },
    {
      name: 'ap',
      signature: 'ap(input: number, cut: number, res: number): number',
      description: 'All pass filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
      ],
    },
    {
      name: 'pk',
      signature: 'pk(input: number, cut: number, res: number, gain: number): number',
      description: 'Peaking filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
        'gain: The gain.',
      ],
    },
    {
      name: 'ls',
      signature: 'ls(input: number, cut: number, res: number, gain: number): number',
      description: 'Low shelf filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
        'gain: The gain.',
      ],
    },
    {
      name: 'hs',
      signature: 'hs(input: number, cut: number, res: number, gain: number): number',
      description: 'High shelf filter.',
      parameters: [
        'input: The input signal.',
        'cut: The cutoff frequency.',
        'res: The resonance.',
        'gain: The gain.',
      ],
    },
  ],
  effects: [
    {
      name: 'delay',
      signature: 'delay(input: number, time: number, feedback: number, wet: number): number',
      description: 'Delay with cubic interpolation.',
      parameters: [
        'input: The input signal.',
        'time: The delay time in seconds.',
        'feedback: The feedback amount (0-0.99).',
        'wet: The wet mix amount (0-1).',
      ],
    },
    {
      name: 'reverb',
      signature:
        'reverb(input: number, diffusion1: number, diffusion2: number, damping: number, decay: number, wet: number): number',
      description: 'Dattorro reverb effect.',
      parameters: [
        'input: The input signal.',
        'diffusion1: The first diffusion amount (0-1).',
        'diffusion2: The second diffusion amount (0-1).',
        'damping: The damping amount (0-1).',
        'decay: The decay amount (0-0.99).',
        'wet: The wet mix amount (0-1).',
      ],
    },
  ],
  waveshapers: [
    {
      name: 'tanh',
      signature: 'tanh(input: number, amount?: number): number',
      description: 'Tanh waveshaping for soft saturation.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'atan',
      signature: 'atan(input: number, amount?: number): number',
      description: 'Arctangent waveshaping for hard saturation.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'cubic',
      signature: 'cubic(input: number, amount?: number): number',
      description: 'Cubic waveshaping for asymmetric distortion.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'soft',
      signature: 'soft(input: number, amount?: number): number',
      description: 'Soft clipping waveshaping.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'hard',
      signature: 'hard(input: number, amount?: number): number',
      description: 'Hard clipping waveshaping.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'fold',
      signature: 'fold(input: number, amount?: number): number',
      description: 'Wave folding distortion.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'cheb',
      signature: 'cheb(input: number, amount?: number): number',
      description: 'Chebyshev harmonic distortion.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'crush',
      signature: 'crush(input: number, amount?: number): number',
      description: 'Bit crusher distortion.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
    {
      name: 'reduce',
      signature: 'reduce(input: number, amount?: number): number',
      description: 'Sample rate reduction distortion.',
      parameters: [
        'input: The input signal.',
        'amount: The waveshaping amount (1-10).',
      ],
    },
  ],
  dynamics: [
    {
      name: 'compressor',
      signature:
        'compressor(input: number, threshold?: number, ratio?: number, attack?: number, release?: number, knee?: number): number',
      description: 'Dynamic range compressor.',
      parameters: [
        'input: The input signal.',
        'threshold: The threshold in dB (-60 to 0).',
        'ratio: The compression ratio (1-20).',
        'attack: The attack time in seconds (0.001-1).',
        'release: The release time in seconds (0.001-1).',
        'knee: The knee width in dB (0-40).',
      ],
    },
    {
      name: 'expander',
      signature:
        'expander(input: number, threshold?: number, ratio?: number, attack?: number, release?: number, knee?: number): number',
      description: 'Dynamic range expander.',
      parameters: [
        'input: The input signal.',
        'threshold: The threshold in dB (-60 to 0).',
        'ratio: The expansion ratio (1-20).',
        'attack: The attack time in seconds (0.001-1).',
        'release: The release time in seconds (0.001-1).',
        'knee: The knee width in dB (0-40).',
      ],
    },
    {
      name: 'gate',
      signature:
        'gate(input: number, threshold?: number, attack?: number, release?: number, hold?: number, range?: number): number',
      description: 'Noise gate.',
      parameters: [
        'input: The input signal.',
        'threshold: The threshold in dB (-60 to 0).',
        'attack: The attack time in seconds (0.001-1).',
        'release: The release time in seconds (0.001-1).',
        'hold: The hold time in seconds (0-2).',
        'range: The gate range in dB (-60 to 0).',
      ],
    },
    {
      name: 'ar',
      signature: 'ar(attack?: number, release?: number, trigger: boolean): number',
      description: 'An attack-release envelope generator.',
      parameters: [
        'attack: The attack time in seconds (0.001-10).',
        'release: The release time in seconds (0.001-10).',
        'trigger: When true, triggers the envelope.',
      ],
    },
  ],
  utilities: [
    {
      name: 'log',
      signature: 'log(...args: any[]): void',
      description: 'Writes to the console.',
      parameters: [
        'args: The arguments to log.',
      ],
    },
    {
      name: 'bpm',
      signature: 'bpm(bpm: number): number',
      description: 'Sets the tempo in BPM and returns a time multiplier.',
      parameters: [
        'bpm: The tempo in beats per minute.',
      ],
    },
  ],
  extensions: [
    {
      name: 'Array.pick',
      signature: 'array.pick(value: number): T',
      description: 'Pick a value from an array using a 0..1 index.',
      parameters: [
        'value: 0..1 scales to the array length.',
      ],
    },
    {
      name: 'Array.chord',
      signature: 'array.chord(oscillator: function, ...rest?: any): number',
      description: 'Plays the frequencies in the array with the oscillator in a chord.',
      parameters: [
        'oscillator: The oscillator function to use (e.g., sin, saw, sqr).',
        '...rest: Rest of the arguments to pass to the oscillator.',
      ],
    },
    {
      name: 'Array.ntof',
      signature: 'array.ntof(octave?: number): number[]',
      description: 'Converts semitone numbers in the array to frequencies. Octave 0 corresponds to C0 (16.35 Hz).',
      parameters: [
        'octave: The octave to transpose to (defaults to 0). C0 is octave 0.',
      ],
    },
    {
      name: 'Number.o1',
      signature: 'number.o1: number',
      description: 'Scales a -1..1 value to 0..1 range.',
      parameters: [],
    },
    {
      name: 'Number.w',
      signature: 'number.w: number',
      description: 'Folds a -1..1 value to 0..1 range (absolute value).',
      parameters: [],
    },
    {
      name: 'Number.ntof',
      signature: 'number.ntof(octave?: number): number',
      description: 'Converts a semitone number to a frequency. Octave 0 corresponds to C0 (16.35 Hz).',
      parameters: [
        'octave: The octave to transpose to (defaults to 0). C0 is octave 0.',
      ],
    },
    {
      name: 'String.notes',
      signature: 'string.notes: number[]',
      description: 'Parses a string of notes and returns an array of semitone numbers.',
      parameters: [],
    },
    {
      name: 'String.chords',
      signature: 'string.chords(scale: string): number[][]',
      description:
        'Parses a string of chord progressions and returns an array of chord arrays. Roman numerals are case-insensitive; chord quality is implied by the selected scale.',
      parameters: [
        'scale: The scale to use (e.g., "dorian", "major", "minor").',
      ],
    },
    {
      name: 'Number.mul',
      signature: 'number.mul(other?: number): number',
      description: 'Multiplies a number by another.',
      parameters: [
        'other: The number to multiply by (defaults to 0).',
      ],
    },
    {
      name: 'Number.add',
      signature: 'number.add(other?: number): number',
      description: 'Adds a number to another.',
      parameters: [
        'other: The number to add (defaults to 0).',
      ],
    },
    {
      name: 'Number.sub',
      signature: 'number.sub(other?: number): number',
      description: 'Subtracts a number from another.',
      parameters: [
        'other: The number to subtract (defaults to 0).',
      ],
    },
    {
      name: 'Number.div',
      signature: 'number.div(other?: number): number',
      description: 'Divides a number by another.',
      parameters: [
        'other: The number to divide by (defaults to 0).',
      ],
    },
  ],
}

function createComponentHTML(component) {
  return `
    <div class="function-item" data-function-name="${component.name}">
      <div class="function-name">${component.name}</div>
      <div class="function-signature">${component.signature}</div>
    </div>
  `
}

function populateHelpContent() {
  let html = ''

  for (const [sectionName, components] of Object.entries(componentData)) {
    const sectionTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
    html += `
      <div class="component-section">
        <h3 class="section-title">${sectionTitle}</h3>
        <div class="functions-grid">
          ${components.map(createComponentHTML).join('')}
        </div>
      </div>
    `
  }

  helpContent.innerHTML = html

  // Initialize Popper.js for all tooltips
  const functionItems = helpContent.querySelectorAll('.function-item')
  functionItems.forEach(item => {
    const functionName = item.dataset.functionName
    const component = findComponentByName(functionName)

    if (component) {
      // Create tooltip element and append to body
      const tooltip = document.createElement('div')
      tooltip.className = 'function-tooltip'
      tooltip.setAttribute('role', 'tooltip')

      const parametersHTML = component.parameters.length > 0
        ? `<div class="tooltip-parameters">${
          component.parameters.map(p => `<div class="tooltip-parameter">• ${p}</div>`).join('')
        }</div>`
        : ''

      tooltip.innerHTML = `
        <div class="tooltip-description">${component.description}</div>
        ${parametersHTML}
        <div class="tooltip-arrow" data-popper-arrow></div>
      `

      document.body.appendChild(tooltip)

      const popperInstance = createPopper(item, tooltip, {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
            },
          },
        ],
      })

      // Show tooltip on hover
      item.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1'
        tooltip.style.visibility = 'visible'
        popperInstance.update()
      })

      // Hide tooltip on leave
      item.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0'
        tooltip.style.visibility = 'hidden'
      })
    }
  })
}

function findComponentByName(name) {
  for (const components of Object.values(componentData)) {
    const found = components.find(comp => comp.name === name)
    if (found) return found
  }
  return null
}

function showHelp() {
  helpModal.classList.add('show')
  populateHelpContent()
}

function hideHelp() {
  helpModal.classList.remove('show')
}

// Help modal event listeners
helpBtn.addEventListener('click', showHelp)
closeHelp.addEventListener('click', hideHelp)

// Close modal when clicking outside
helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    hideHelp()
  }
})

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && helpModal.classList.contains('show')) {
    hideHelp()
  }
})
