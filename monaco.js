import { demo, demo2, demo3, demo4, demo5, demo6, demo7, demo8 } from './demos.js'

const g = window.globalThis

export function initMonaco(monaco) {
  // extra libraries
  var libSource = [
    `
    /** A sine oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function sin(freq: number, sync?: boolean): number
    /** A sawtooth oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function saw(freq: number, sync?: boolean): number
    /** A square oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function sqr(freq: number, sync?: boolean): number
    /** A triangle oscillator.
     * @param {number} freq The frequency of the oscillator.
     * @param {boolean} sync Reset phase when true.
     * @returns {number} The output sample.
     */
    declare function tri(freq: number, sync?: boolean): number
    /** White noise.
     * @returns {number} The output sample.
     */
    declare function white(): number
    /** Karplus-Strong plucked string synthesis.
     * @param {number} freq The frequency of the string.
     * @param {boolean} pluck Trigger a new pluck when true.
     * @returns {number} The output sample.
     */
    declare function ks(freq: number, pluck?: boolean): number
    /** Exponential decay.
     * @param {number} period The period.
     * @param {number} rate The decay rate.
     * @returns {number} The output sample.
     */
    declare function exp(period: number, rate: number): number

    /** Used to sync the phase of an oscillator.
     * @param {number} period The period to sync to.
     * @param {number} offset The time offset to drift from.
     * @returns {boolean} true When crossing the period boundary, false otherwise
     */
    declare function sync(period: number, offset?: number): boolean
    /** Euclidean rhythm generator. Distributes beats evenly across steps.
     * @param {number} steps The total number of steps in the pattern.
     * @param {number} beats The number of beats to distribute.
     * @param {number} rotation The rotation offset of the pattern (0 to steps-1).
     * @param {number} offset The time offset to drift from.
     * @param {number} period The period in seconds for the pattern to repeat (default: 1).
     * @returns {boolean} true when a beat occurs, false otherwise
     */
    declare function euclidean(steps: number, beats: number, rotation?: number, offset?: number, period?: number): boolean
    /** Low pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function lp(input: number, cut: number, res: number): number
    /** High pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function hp(input: number, cut: number, res: number): number
    /** Band pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function bp(input: number, cut: number, res: number): number
    /** Notch filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function nt(input: number, cut: number, res: number): number
    /** All pass filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @returns {number} The output sample.
     */
    declare function ap(input: number, cut: number, res: number): number
    /** Peaking filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @param {number} gain The gain.
     * @returns {number} The output sample.
     */
    declare function pk(input: number, cut: number, res: number, gain: number): number
    /** Low shelf filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @param {number} gain The gain.
     * @returns {number} The output sample.
     */
    declare function ls(input: number, cut: number, res: number, gain: number): number
    /** High shelf filter.
     * @param {number} input The input signal.
     * @param {number} cut The cutoff frequency.
     * @param {number} res The resonance.
     * @param {number} gain The gain.
     * @returns {number} The output sample.
     */
    declare function hs(input: number, cut: number, res: number, gain: number): number
    /** Delay with cubic interpolation.
     * @param {number} input The input signal.
     * @param {number} time The delay time in seconds.
     * @param {number} feedback The feedback amount (0-0.99).
     * @param {number} wet The wet mix amount (0-1).
     * @returns {number} The output sample.
     */
    declare function delay(input: number, time: number, feedback: number, wet: number): number

    /** Dattorro reverb effect.
     * @param {number} input The input signal.
     * @param {number} diffusion1 The first diffusion amount (0-1).
     * @param {number} diffusion2 The second diffusion amount (0-1).
     * @param {number} damping The damping amount (0-1).
     * @param {number} decay The decay amount (0-0.99).
     * @param {number} wet The wet mix amount (0-1).
     * @returns {number} The output sample.
     */
    declare function reverb(input: number, diffusion1: number, diffusion2: number, damping: number, decay: number, wet: number): number

    /** Tanh waveshaping for soft saturation.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function tanh(input: number, amount?: number): number
    /** Arctangent waveshaping for hard saturation.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function atan(input: number, amount?: number): number
    /** Cubic waveshaping for asymmetric distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function cubic(input: number, amount?: number): number
    /** Soft clipping waveshaping.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function soft(input: number, amount?: number): number
    /** Hard clipping waveshaping.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function hard(input: number, amount?: number): number
    /** Wave folding distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function fold(input: number, amount?: number): number
    /** Chebyshev harmonic distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function cheb(input: number, amount?: number): number
    /** Bit crusher distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function crush(input: number, amount?: number): number
    /** Sample rate reduction distortion.
     * @param {number} input The input signal.
     * @param {number} amount The waveshaping amount (1-10).
     * @returns {number} The output sample.
     */
    declare function reduce(input: number, amount?: number): number
    /** Dynamic range compressor.
     * @param {number} input The input signal.
     * @param {number} threshold The threshold in dB (-60 to 0).
     * @param {number} ratio The compression ratio (1-20).
     * @param {number} attack The attack time in seconds (0.001-1).
     * @param {number} release The release time in seconds (0.001-1).
     * @param {number} knee The knee width in dB (0-40).
     * @returns {number} The output sample.
     */
    declare function compressor(input: number, threshold?: number, ratio?: number, attack?: number, release?: number, knee?: number): number
    /** Dynamic range expander.
     * @param {number} input The input signal.
     * @param {number} threshold The threshold in dB (-60 to 0).
     * @param {number} ratio The expansion ratio (1-20).
     * @param {number} attack The attack time in seconds (0.001-1).
     * @param {number} release The release time in seconds (0.001-1).
     * @param {number} knee The knee width in dB (0-40).
     * @returns {number} The output sample.
     */
    declare function expander(input: number, threshold?: number, ratio?: number, attack?: number, release?: number, knee?: number): number
    /** Noise gate.
     * @param {number} input The input signal.
     * @param {number} threshold The threshold in dB (-60 to 0).
     * @param {number} attack The attack time in seconds (0.001-1).
     * @param {number} release The release time in seconds (0.001-1).
     * @param {number} hold The hold time in seconds (0-2).
     * @param {number} range The gate range in dB (-60 to 0).
     * @returns {number} The output sample.
     */
    declare function gate(input: number, threshold?: number, attack?: number, release?: number, hold?: number, range?: number): number
    /** An attack-release envelope generator.
     * @param {number} attack The attack time in seconds (0.001-10).
     * @param {number} release The release time in seconds (0.001-10).
     * @param {boolean} trigger When true, triggers the envelope.
     * @returns {number} The envelope value (0-1).
     */
    declare function ar(attack?: number, release?: number, trigger: boolean): number
    /** Zero crossing detector. Outputs true for one frame when the input crosses zero.
     * @param {number} input The input signal.
     * @returns {boolean} true when zero crossing occurs, false otherwise.
     */
    declare function cross(input: number): boolean
    /** Advances by a step each time trigger is true, cycling from 0 to 1.
     * @param {number} step The step size (0..1).
     * @param {boolean} trigger Advance when true.
     * @returns {number} Current value (0..1).
     */
    declare function adv(step: number, trigger: boolean): number
    /** Sets the tempo in BPM and returns a time multiplier.
     * @param {number} bpm The tempo in beats per minute.
     * @returns {number} Time multiplier (1.0 = normal speed, 2.0 = double speed, 0.5 = half speed).
     */
    declare function bpm(bpm: number): number

    interface Array<T> {
      /** Pick a value from an array.
       * @param {number} value 0..1 scales to the array length.
       * @returns {T} The picked value.
       */
      pick(value: number): T
      /** Plays the frequencies in the array with the oscillator in a chord.
       * @param {function} oscillator The oscillator function to use (e.g., sin, saw, sqr).
       * @param {...any} rest Rest of the arguments to pass to the oscillator.
       * @returns {number} The summed output of all oscillators.
       */
      chord(oscillator: (freq: number, ...rest: any[]) => number, ...rest: any[]): number
      /** Converts semitone numbers in the array to frequencies. Octave 0 corresponds to C0 (16.35 Hz).
       * @param {number} octave The octave to transpose to (defaults to 0). C0 is octave 0.
       * @returns {number[]} Array of frequencies.
       */
      ntof(octave?: number): number[]
    }

    interface Number {
      /** Scales a -1..1 value to 0..1 */
      readonly o1: number
      /** Folds a -1..1 value to 0..1 */
      readonly w: number
      /** Converts a semitone number to a frequency. Octave 0 corresponds to C0 (16.35 Hz). */
      ntof(octave?: number): number
      /** Multiplies a number by another. */
      mul(other?: number): number
      /** Adds a number to another. */
      add(other?: number): number
      /** Subtracts a number from another. */
      sub(other?: number): number
      /** Divides a number by another. */
      div(other?: number): number

    }

    type Scale =
      | 'major'
      | 'minor'
      | 'dorian'
      | 'phrygian'
      | 'lydian'
      | 'mixolydian'
      | 'locrian'
      | 'harmonic-minor'
      | 'melodic-minor'
      | 'pentatonic-major'
      | 'pentatonic-minor'

    interface String {
      /** Parses a string of notes and returns an array of semitone numbers.
       * @example 'c c# d d# g2 a3 a#3'.notes returns [0, 1, 2, 3, 7, 9, 10]
       */
      readonly notes: number[]
      /** Parses a string of chord progressions and returns an array of chord arrays.
       * Roman numerals are case-insensitive; chord quality is implied by the selected scale.
       * @param {Scale} scale The scale to use (e.g., 'dorian', 'major', 'minor').
       * @returns {number[][]} Array of chord arrays, each containing semitone numbers.
       * @example 'i iv iii v'.chords('dorian') returns [[0,2,4], [3,5,7], [2,4,6], [4,6,8]]
       */
      chords(scale: Scale): number[][]
    }

    /** Writes to the console.
     * @param {...any} args The arguments to log.
     */
    declare function log(...args: any[]): void
    `,
  ].join('\n')

  var libUri = 'ts:filename/env.d.ts'
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri)
  monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri))
  monaco.editor.setTheme('vs-dark')
  // Keep code in URL so it can be shared and recovered via navigation
  function encodeCode(str) {
    return btoa(encodeURIComponent(str))
  }
  function decodeCode(b64) {
    try {
      return decodeURIComponent(atob(b64))
    }
    catch (e) {
      return null
    }
  }
  function getCodeFromUrl() {
    const url = new URL(window.location.href)
    const encoded = url.searchParams.get('code')
    if (!encoded) return null
    const decoded = decodeCode(encoded)
    return decoded
  }
  function setCodeToUrl(code) {
    const url = new URL(window.location.href)
    const encoded = encodeCode(code)
    url.searchParams.set('code', encoded)
    history.replaceState(null, '', url.toString())
  }
  function setCodeToUrlPush(code) {
    const url = new URL(window.location.href)
    const encoded = encodeCode(code)
    url.searchParams.set('code', encoded)
    history.pushState(null, '', url.toString())
  }
  const urlCode = getCodeFromUrl()
  const initialCode = urlCode !== null ? urlCode : (localStorage.getItem('code') || demo)
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: initialCode,
    language: 'javascript',
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
    parameterHints: {
      enabled: true,
      cycle: true,
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
    },
    suggest: {
      showMethods: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showKeywords: true,
      showWords: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showSnippets: true,
    },
    hover: {
      enabled: true,
      delay: 300,
      sticky: false,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: true,
    fontFamily: 'JetBrains Mono',
  })

  window.addEventListener('resize', () => {
    editor.layout()
  })

  function compile() {
    const code = editor.getValue()
    localStorage.setItem('code', code)
    setCodeToUrl(code)
    try {
      g.fn = new Function('bpm(120);' + code)
      log('')
    }
    catch (e) {
      log(e.stack.split('\n')[0])
      console.error(e)
    }
  }

  editor.onDidChangeModelContent(compile)
  compile()

  // Force parameter hints to show when cursor moves inside function calls
  editor.onDidChangeCursorPosition((e) => {
    const model = editor.getModel()
    const position = e.position
    const lineContent = model.getLineContent(position.lineNumber)
    const char = lineContent.charAt(position.column - 1)

    // If cursor is inside parentheses, trigger parameter hints
    if (char === '(' || char === ',' || char === ' ') {
      const word = model.getWordAtPosition(position)
      if (word) {
        // Trigger parameter hints
        editor.trigger('keyboard', 'editor.action.triggerParameterHints', {})
      }
    }
  })

  // Demo picker functionality
  const demoPicker = document.getElementById('demoPicker')

  const demos = {
    demo,
    demo2,
    demo3,
    demo4,
    demo5,
    demo6,
    demo7,
    demo8,
  }
  function loadDemo(demoName) {
    const demoContent = demos[demoName]
    // Push a new history entry BEFORE changing the editor, so Back returns to the previous code
    setCodeToUrlPush(demoContent)
    editor.setValue(demoContent)
    localStorage.setItem('code', demoContent)
    compile()
  }

  demoPicker.addEventListener('change', (e) => {
    loadDemo(e.target.value)
  })

  // Handle browser navigation restoring code from URL if present
  window.addEventListener('popstate', () => {
    const code = getCodeFromUrl()
    if (code !== null) {
      editor.setValue(code)
      localStorage.setItem('code', code)
      compile()
    }
  })
}
