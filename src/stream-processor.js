console.log('stream-processor.js loaded')

class StreamProcessor extends AudioWorkletProcessor {

  constructor() {
    console.log('[StreamProcessor#constructor]')
    super()
  }

  process(inputs) {
    this.port.postMessage(inputs)
    return true
  }
}

registerProcessor('stream-processor', StreamProcessor)
