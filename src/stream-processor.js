class StreamProcessor extends AudioWorkletProcessor {
  process(inputs) {
    this.port.postMessage(inputs)
    return true
  }
}

registerProcessor('stream-processor', StreamProcessor)
