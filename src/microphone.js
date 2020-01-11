import 'audioworklet-polyfill'
import log from 'loglevel'

export default config => {

  const audioState = {
    pending: false,
    audioContext: undefined,
    mediaStream: undefined,
    microphoneOn: false
  }

  class StreamWorklet extends AudioWorkletNode {
    constructor(audioContext, name) {
      log.info(`[StreamWorklet#constructor] name: ${name}; sampleRate: ${audioContext.sampleRate}`)
      super(audioContext, name)
      this.port.onmessage = message => {
        log.info('[StreamWorklet#onMessage]')
        if (!audioState.microphoneOn) return
        const channelData = message.data
        if (channelData.some(value => value >= config.NOISE_LEVEL_THRESHOLD)) {
          config.applyBoost()
        }
      }
    }
  }

  const microphoneOn = async () => {
    try {
      log.info('[microphoneOn]')
      audioState.pending = true
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(mediaStream)
      const moduleUrl = `${location.origin}/stream-processor.js`
      await audioContext.audioWorklet.addModule(moduleUrl)
      const streamWorklet = new StreamWorklet(audioContext, 'stream-processor')
      source.connect(streamWorklet)
      streamWorklet.connect(audioContext.destination)
      audioState.audioContext = audioContext
      audioState.mediaStream = mediaStream
      audioState.microphoneOn = true
    } catch (error) {
      log.error(`[microphoneOn] ${error.message}`)
    }
    finally {
      audioState.pending = false
    }
  }

  const microphoneOff = () => {
    try {
      log.info('[microphoneOff]')
      if (audioState.microphoneOn) {
        audioState.mediaStream.getTracks().forEach(track => track.stop())
        audioState.audioContext.close()
        audioState.audioContext = undefined
        audioState.mediaStream = undefined
        audioState.microphoneOn = false
      }
    } catch (error) {
      log.error(`[microphoneOff] ${error.message}`)
    }
  }

  return {
    microphoneOn,
    microphoneOff
  }
}
