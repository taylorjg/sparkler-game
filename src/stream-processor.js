class StreamProcessor extends AudioWorkletProcessor {

  constructor() {
    super()
  }

  process(inputs) {
    this.port.postMessage(inputs)
    return true
  }
}

registerProcessor('stream-processor', StreamProcessor)
