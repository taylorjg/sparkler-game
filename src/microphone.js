import log from 'loglevel'
import * as MV from './microphoneVisualisation'

export default config => {

  const audioState = {
    audioContext: undefined,
    mediaStream: undefined,
    microphoneOn: false,
    microphoneVisualisationOn: false,
    microphoneVisualisationChart: undefined
  }

  class StreamWorklet extends AudioWorkletNode {

    constructor(audioContext, name) {
      log.info(`[StreamWorklet#constructor] name: ${name}; sampleRate: ${audioContext.sampleRate}`)
      super(audioContext, name)
      this.port.onmessage = this.onMessage.bind(this)
    }

    onMessage(message) {

      log.info('[StreamWorklet#onMessage]')

      if (!audioState.microphoneOn) return

      const input = message.data[0]
      const channel = input[0]

      if (channel.some(value => value >= config.NOISE_LEVEL_THRESHOLD)) {
        config.applyBoost()
      }

      if (audioState.microphoneVisualisationOn) {
        if (audioState.microphoneVisualisationChart) {
          const chart = audioState.microphoneVisualisationChart
          MV.updateMicrophoneVisualisationChart(chart, channel)
        } else {
          const chart = MV.createMicrophoneVisualisationChart('microphone-signal', channel)
          audioState.microphoneVisualisationChart = chart
        }
      }
    }
  }

  const microphoneOn = async () => {
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
    microphoneVisualisationOff()
  }

  const microphoneOff = () => {
    audioState.mediaStream.getTracks().forEach(track => track.stop())
    audioState.audioContext.close()
    audioState.audioContext = undefined
    audioState.mediaStream = undefined
    audioState.microphoneOn = false
    microphoneVisualisationOff()
  }

  const microphoneVisualisationOn = () => {
    audioState.microphoneVisualisationOn = true
    document.getElementById('microphone-signal').style.visibility = 'visible'
  }

  const microphoneVisualisationOff = () => {
    audioState.microphoneVisualisationOn = false
    document.getElementById('microphone-signal').style.visibility = 'hidden'
  }

  const toggleMicrophone = () => {
    audioState.microphoneOn
      ? microphoneOff()
      : microphoneOn()
  }

  const toggleMicrophoneVisualisation = () => {
    audioState.microphoneVisualisationOn
      ? microphoneVisualisationOff()
      : microphoneVisualisationOn()
  }

  return {
    toggleMicrophone,
    toggleMicrophoneVisualisation
  }
}
