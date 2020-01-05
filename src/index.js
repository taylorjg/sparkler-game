const COLOURS = [
  '#ffffff',
  '#ffffff',
  '#ff00ff',
  '#ffff00',
  '#ffff00',
  '#90ee90',
  '#90ee90'
]
const GRAVITY = 9.81
const BOOST = GRAVITY * 2.5
const SPARKLER_PARTICLE_ITERATIONS = 50
const SPARKLER_PARTICLE_SIZE = 5
const BURST_PARTICLE_ITERATIONS = 5
const BURST_PARTICLE_SIZE = 3
const BURST_PARTICLE_VELOCITY = 20
const MARGIN_Y = 50
const MAX_BOOSTS = 8
const UP_ARROW_KEY = 38
const B_KEY = 66

const globals = {
  CTX: undefined,
  WIDTH: 0,
  HEIGHT: 0,
  MIN_Y: 0,
  MAX_Y: 0,
  INITIAL_X: 0,
  INITIAL_Y: 0,

  currentVelocityY: 0,
  currentY: 0,
  remainingBoosts: 0,
  sparklerParticles: [],
  burstParticles: [],
  obastacles: [],
  lastRenderTimestamp: 0,

  audioContext: undefined,
  mediaStream: undefined,
  microphoneOn: false
}

const range = n => Array.from(Array(n).keys())

const getTimestamp = () => new Date().getTime()

const randomVelocity = () => (Math.random() - 0.5) * 2.5

const createSparklerParticle = () => ({
  x: globals.INITIAL_X,
  y: globals.currentY,
  velocityX: randomVelocity(),
  velocityY: randomVelocity(),
  iterations: SPARKLER_PARTICLE_ITERATIONS,
  size: SPARKLER_PARTICLE_SIZE
})

const calculateAccelerationY = deltaTime => {

  const MULTIPLIER = 100

  if (globals.currentY <= globals.MIN_Y) {
    const accelerationY = GRAVITY
    globals.currentVelocityY = accelerationY * deltaTime
    const movementY = globals.currentVelocityY * deltaTime * MULTIPLIER
    return movementY
  }

  if (globals.currentY >= globals.MAX_Y) {
    const accelerationY = 0 - (globals.remainingBoosts ? BOOST : 0)
    globals.currentVelocityY = accelerationY * deltaTime
    const movementY = globals.currentVelocityY * deltaTime * MULTIPLIER
    return movementY
  }

  const accelerationY = GRAVITY - (globals.remainingBoosts ? BOOST : 0)
  globals.currentVelocityY += accelerationY * deltaTime
  const movementY = globals.currentVelocityY * deltaTime * MULTIPLIER
  return movementY
}

const render = () => {
  globals.sparklerParticles.push(createSparklerParticle())
  const thisRenderTimestamp = getTimestamp()
  const deltaTime = (thisRenderTimestamp - globals.lastRenderTimestamp) / 1000
  globals.lastRenderTimestamp = thisRenderTimestamp
  const movementY = calculateAccelerationY(deltaTime)
  globals.currentY += movementY
  if (globals.remainingBoosts > 0) {
    globals.remainingBoosts -= 1
  }
  globals.CTX.clearRect(0, 0, globals.WIDTH, globals.HEIGHT)
  globals.sparklerParticles.forEach(sparklerParticle => {
    const { x, y, velocityX, velocityY, iterations, size } = sparklerParticle
    const numColours = COLOURS.length
    const colourIndex = numColours - Math.floor(iterations / SPARKLER_PARTICLE_ITERATIONS * numColours)
    const rgbStr = COLOURS[colourIndex]
    const alpha = 127 + Math.floor(iterations / SPARKLER_PARTICLE_ITERATIONS * 128)
    const alphaStr = alpha.toString(16).padStart(2, '0')
    globals.CTX.fillStyle = rgbStr + alphaStr
    globals.CTX.fillRect(x - size / 2, y - size / 2, size, size)
    sparklerParticle.x += velocityX
    sparklerParticle.y += velocityY + movementY
    sparklerParticle.iterations -= 1
    sparklerParticle.size *= 0.99
  })
  globals.sparklerParticles = globals.sparklerParticles.filter(p => p.iterations > 0)
  if (globals.sparklerParticles.length === 0) {
    globals.currentVelocityY = 0
    globals.currentY = globals.INITIAL_Y
  }

  globals.burstParticles.forEach(burstParticle => {
    const { x, y, size, angle } = burstParticle
    globals.CTX.fillStyle = '#ffffff'
    globals.CTX.fillRect(x - size / 2, y - size / 2, size, size)
    burstParticle.x += BURST_PARTICLE_VELOCITY * 2 * Math.cos(angle)
    burstParticle.y += BURST_PARTICLE_VELOCITY * 2 * Math.sin(angle)
    burstParticle.iterations -= 1
    burstParticle.size *= 0.99
  })
  globals.burstParticles = globals.burstParticles.filter(p => p.iterations > 0)

  requestAnimationFrame(render)
  updateButtonState()
}

const applyBoost = () => {
  if (globals.remainingBoosts === 0) {
    globals.remainingBoosts = MAX_BOOSTS
  }
}

const applyBurst = () => {
  if (globals.burstParticles.length === 0) {
    const angles = range(8).map(n => n * 45).map(a => a * Math.PI / 180)
    const hypotenuses = range(3).map(n => n + 1).map(n => n * BURST_PARTICLE_VELOCITY)
    angles.forEach(angle =>
      hypotenuses.forEach(hypotenuse => {
        const burstParticle = {
          x: globals.INITIAL_X + hypotenuse * Math.cos(angle),
          y: globals.currentY + hypotenuse * Math.sin(angle),
          iterations: BURST_PARTICLE_ITERATIONS,
          size: BURST_PARTICLE_SIZE,
          angle
        }
        globals.burstParticles.push(burstParticle)
      }))
  }
}

const onKeyDown = e => {
  log.info(`[onKeyDown] e.keyCode: ${e.keyCode}`)
  switch (e.keyCode) {
    case UP_ARROW_KEY: return applyBoost()
    case B_KEY: return applyBurst()
  }
}

const drawMicrophoneSignal = (canvasId, data) => {
  new Chart(canvasId, {
    type: 'line',
    data: {
      labels: range(data.length),
      datasets: [{
        data,
        borderColor: 'green',
        borderWidth: 1,
        pointStyle: 'line',
        radius: 1,
        fill: false,
      }]
    },
    options: {
      events: [],
      legend: {
        display: false
      },
      animation: {
        duration: 0
      },
      scales: {
        xAxes: [{
          type: 'category',
          labels: range(data.length),
          ticks: {
            fontSize: 8,
            autoSkip: false,
            callback: x => x % 16 === 0 || x === data.length - 1 ? x : null
          }
        }],
        yAxes: [{
          type: 'linear',
          ticks: {
            fontSize: 8,
            min: -0.5,
            max: +0.5
          }
        }]
      }
    }
  })
}

class StreamWorklet extends AudioWorkletNode {

  constructor(audioContext, name) {
    console.log(`[StreamWorklet#constructor] name: ${name}; sampleRate: ${audioContext.sampleRate}`)
    super(audioContext, name)
    this.port.onmessage = this.onMessage
  }

  onMessage(message) {
    if (!globals.microphoneOn) return
    const input = message.data[0]
    const channel = input[0]
    if (channel.some(value => value >= 0.25)) {
      applyBoost()
    }
    drawMicrophoneSignal('microphone-signal', channel)
  }
}

const onMicrophoneOn = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioContext = new AudioContext({ sampleRate: 8000 })
  const source = audioContext.createMediaStreamSource(mediaStream)
  await audioContext.audioWorklet.addModule('stream-processor.js')
  const streamProcessor = new StreamWorklet(audioContext, 'stream-processor')
  source.connect(streamProcessor)
  streamProcessor.connect(audioContext.destination)
  globals.audioContext = audioContext
  globals.mediaStream = mediaStream
  globals.microphoneOn = true
}

const onMicrophoneOff = () => {
  globals.mediaStream.getTracks().forEach(track => track.stop())
  globals.audioContext.close()
  globals.audioContext = undefined
  globals.mediaStream = undefined
  globals.microphoneOn = false
  const canvas = document.getElementById('microphone-signal')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const updateButtonState = () => {
  const microphoneOnButton = document.getElementById('microphone-on-btn')
  const microphoneOffButton = document.getElementById('microphone-off-btn')
  microphoneOnButton.disabled = globals.microphoneOn
  microphoneOffButton.disabled = !globals.microphoneOn
}

const init = async () => {
  const canvas = document.getElementById('canvas')
  const width = canvas.scrollWidth
  const height = canvas.scrollHeight
  canvas.width = width
  canvas.height = height

  globals.CTX = canvas.getContext('2d')
  globals.WIDTH = width
  globals.HEIGHT = height
  globals.MIN_Y = MARGIN_Y
  globals.MAX_Y = height - MARGIN_Y
  globals.INITIAL_X = width * 0.25
  globals.INITIAL_Y = globals.MAX_Y

  globals.currentY = globals.INITIAL_Y
  globals.lastRenderTimestamp = getTimestamp()

  document.addEventListener('keydown', onKeyDown)

  const microphoneOnButton = document.getElementById('microphone-on-btn')
  microphoneOnButton.addEventListener('click', onMicrophoneOn)

  const microphoneOffButton = document.getElementById('microphone-off-btn')
  microphoneOffButton.addEventListener('click', onMicrophoneOff)

  render()
}

init()
