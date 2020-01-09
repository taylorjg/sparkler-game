class StreamProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]
    const channelData = input[0]
    this.port.postMessage(channelData)
    return true
  }
}

registerProcessor('stream-processor', StreamProcessor)
