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
const BURST_PARTICLE_ITERATIONS = 10
const BURST_PARTICLE_SIZE = 3
const BURST_PARTICLE_VELOCITY = 20
const OBSTACLE_WIDTH = 75
const OBSTACLE_MIN_PERCENT = 25
const OBSTACLE_MAX_PERCENT = 40
const MARGIN_Y = 50
const MAX_BOOSTS = 8
const UP_ARROW_KEY = 38
const B_KEY = 66
const M_KEY = 77
const V_KEY = 86
const RETURN_KEY = 13

const globals = {
  CTX: undefined,
  WIDTH: 0,
  HEIGHT: 0,
  SPARKLER_X: 0,
  MIN_SPARKLER_Y: 0,
  MAX_SPARKLER_Y: 0,
  INITIAL_SPARKLER_Y: 0,

  gameOver: false,
  currentScore: 0,
  currentSparklerVelocityX: 0,
  currentSparklerVelocityY: 0,
  currentSparklerY: 0,
  remainingBoosts: 0,
  sparklerParticles: [],
  burstParticles: [],
  obstacle: undefined,
  lastRenderTimestamp: 0,

  audioContext: undefined,
  mediaStream: undefined,
  microphoneOn: false,
  microphoneVisualisationOn: false,
  microphoneVisualisationChart: undefined
}

const range = n => Array.from(Array(n).keys())

const getTimestamp = () => new Date().getTime()

const randomVelocity = () => (Math.random() - 0.5) * 2.5

const createSparklerParticle = () => ({
  x: globals.SPARKLER_X,
  y: globals.currentSparklerY,
  velocityX: randomVelocity(),
  velocityY: randomVelocity(),
  iterations: SPARKLER_PARTICLE_ITERATIONS,
  size: SPARKLER_PARTICLE_SIZE
})

const createBurstParticle = (angle, hypotenuse) => ({
  x: globals.SPARKLER_X + hypotenuse * Math.cos(angle),
  y: globals.currentSparklerY + hypotenuse * Math.sin(angle),
  iterations: BURST_PARTICLE_ITERATIONS,
  size: BURST_PARTICLE_SIZE,
  angle
})

const createObstacle = (percent, first) => {
  const obstacleHeight = globals.HEIGHT * percent / 100
  const obstacleX = first ? globals.WIDTH * 0.8 : globals.WIDTH + 1
  const upper = [
    { x: obstacleX, y: 0 },
    { x: obstacleX, y: obstacleHeight - OBSTACLE_WIDTH / 2 },
    { x: obstacleX + OBSTACLE_WIDTH, y: obstacleHeight - OBSTACLE_WIDTH / 2 },
    { x: obstacleX + OBSTACLE_WIDTH, y: 0 }
  ]
  const lower = upper.map(pt => ({ x: pt.x, y: globals.HEIGHT - pt.y }))
  return {
    upper,
    lower,
    percent
  }
}

const updateObstacle = (obstacle, velocityX) => {
  const { upper, lower } = obstacle
  upper.forEach(pt => pt.x += velocityX)
  lower.forEach(pt => pt.x += velocityX)
}

const calculateAccelerationY = deltaTime => {

  const MULTIPLIER = 100

  if (globals.currentSparklerY <= globals.MIN_SPARKLER_Y) {
    const accelerationY = GRAVITY
    globals.currentSparklerVelocityY = accelerationY * deltaTime
    const movementY = globals.currentSparklerVelocityY * deltaTime * MULTIPLIER
    return movementY
  }

  if (globals.currentSparklerY >= globals.MAX_SPARKLER_Y) {
    const accelerationY = 0 - (globals.remainingBoosts ? BOOST : 0)
    globals.currentSparklerVelocityY = accelerationY * deltaTime
    const movementY = globals.currentSparklerVelocityY * deltaTime * MULTIPLIER
    return movementY
  }

  const accelerationY = GRAVITY - (globals.remainingBoosts ? BOOST : 0)
  globals.currentSparklerVelocityY += accelerationY * deltaTime
  const movementY = globals.currentSparklerVelocityY * deltaTime * MULTIPLIER
  return movementY
}

const render = () => {
  globals.sparklerParticles.push(createSparklerParticle())
  const thisRenderTimestamp = getTimestamp()
  const deltaTime = (thisRenderTimestamp - globals.lastRenderTimestamp) / 1000
  globals.lastRenderTimestamp = thisRenderTimestamp
  const movementY = calculateAccelerationY(deltaTime)
  globals.currentSparklerY += movementY
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
    globals.currentSparklerVelocityY = 0
    globals.currentSparklerY = globals.INITIAL_SPARKLER_Y
  }

  globals.burstParticles.forEach(burstParticle => {
    const { x, y, size, angle } = burstParticle
    globals.CTX.fillStyle = '#ffffff'
    globals.CTX.fillRect(x - size / 2, y - size / 2, size, size)
    burstParticle.x += BURST_PARTICLE_VELOCITY * 1 * Math.cos(angle)
    burstParticle.y += BURST_PARTICLE_VELOCITY * 1 * Math.sin(angle)
    burstParticle.iterations -= 1
    burstParticle.size *= 0.99
  })
  globals.burstParticles = globals.burstParticles.filter(p => p.iterations > 0)

  let collided = false

  if (globals.obstacle) {
    const { upper, lower, percent } = globals.obstacle
    const leftX = upper[0].x
    const rightX = upper[3].x
    const r = (rightX - leftX) / 2
    const upperPath = new Path2D()
    upperPath.moveTo(upper[0].x, upper[0].y)
    upperPath.lineTo(upper[1].x, upper[1].y)
    upperPath.arc(upper[1].x + r, upper[1].y + r, r, Math.PI, 0, true)
    upperPath.lineTo(upper[3].x, upper[3].y)
    const lowerPath = new Path2D()
    lowerPath.moveTo(lower[0].x, lower[0].y)
    lowerPath.lineTo(lower[1].x, lower[1].y)
    lowerPath.arc(lower[1].x + r, lower[1].y - r, r, Math.PI, 0, false)
    lowerPath.lineTo(lower[3].x, lower[3].y)
    globals.CTX.strokeStyle = 'lightblue'
    globals.CTX.lineWidth = 2
    globals.CTX.stroke(upperPath)
    globals.CTX.stroke(lowerPath)
    const dx = globals.SPARKLER_X - rightX
    if (globals.currentSparklerVelocityX && dx >= 0 && dx <= Math.abs(globals.currentSparklerVelocityX)) {
      createBurst()
      globals.currentScore++
    }
    const x = globals.SPARKLER_X
    const y = globals.currentSparklerY
    const paths = [upperPath, lowerPath]
    collided = paths.some(path => globals.CTX.isPointInPath(path, x, y))
    updateObstacle(globals.obstacle, globals.currentSparklerVelocityX)
    if (rightX <= 0) {
      globals.obstacle = createObstacle(Math.min(percent + 1, OBSTACLE_MAX_PERCENT))
    }
  }

  if (collided) {
    globals.CTX.font = '50px VectorBattle'
    globals.CTX.textAlign = 'center'
    globals.CTX.textBaseline = 'middle'
    globals.CTX.fillStyle = 'magenta'
    const cx = globals.WIDTH / 2
    const cy = globals.HEIGHT / 2
    globals.CTX.fillText(`score ${globals.currentScore}`, cx, cy - 40)
    globals.CTX.fillText('Press RETURN', cx, cy + 40)
    globals.gameOver = true
  } else {
    globals.CTX.font = '50px VectorBattle'
    globals.CTX.fillStyle = 'magenta'
    globals.CTX.fillText(globals.currentScore, 20, 80)
    requestAnimationFrame(render)
  }
}

const applyBoost = () => {
  if (globals.remainingBoosts === 0) {
    if (globals.currentSparklerVelocityX === 0) {
      globals.currentSparklerVelocityX = -5
    }
    globals.remainingBoosts = MAX_BOOSTS
  }
}

const createBurst = () => {
  if (globals.burstParticles.length === 0) {
    const angles = range(8).map(n => n * 45).map(a => a * Math.PI / 180)
    const hypotenuses = range(3).map(n => n + 1).map(n => n * BURST_PARTICLE_VELOCITY)
    angles.forEach(angle =>
      hypotenuses.forEach(hypotenuse =>
        globals.burstParticles.push(createBurstParticle(angle, hypotenuse))))
  }
}

const toggleMicrophone = () => {
  globals.microphoneOn
    ? microphoneOff()
    : microphoneOn()
}

const toggleMicrophoneVisualisation = () => {
  globals.microphoneVisualisationOn
    ? microphoneVisualisationOff()
    : microphoneVisualisationOn()
}

const reset = () => {
  globals.gameOver = false
  globals.currentScore = 0
  globals.currentSparklerVelocityX = 0
  globals.currentSparklerVelocityY = 0
  globals.currentSparklerY = globals.INITIAL_SPARKLER_Y
  globals.lastRenderTimestamp = getTimestamp()
  globals.obstacle = createObstacle(25, true)
  render()
}

const onKeyDown = e => {
  log.info(`[onKeyDown] e.keyCode: ${e.keyCode}`)
  switch (e.keyCode) {
    case UP_ARROW_KEY: return applyBoost()
    case B_KEY: return createBurst()
    case M_KEY: return toggleMicrophone()
    case V_KEY: return toggleMicrophoneVisualisation()
    case RETURN_KEY: return globals.gameOver ? reset() : undefined
  }
}

const createMicrophoneVisualisationChart = (canvasId, data) => {
  return new Chart(canvasId, {
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

const updateMicrophoneVisualisationChart = (chart, data) => {
  chart.data.datasets[0].data = data
  chart.update()
}

const microphoneOn = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  // const audioContext = new AudioContext({ sampleRate: 8000 })
  const audioContext = new AudioContext()
  const source = audioContext.createMediaStreamSource(mediaStream)
  const moduleUrl = `${location.origin}/stream-processor.js`
  await audioContext.audioWorklet.addModule(moduleUrl)
  const streamWorklet = new StreamWorklet(audioContext, 'stream-processor')
  source.connect(streamWorklet)
  streamWorklet.connect(audioContext.destination)
  globals.audioContext = audioContext
  globals.mediaStream = mediaStream
  globals.microphoneOn = true
  microphoneVisualisationOff()
}

const microphoneOff = () => {
  globals.mediaStream.getTracks().forEach(track => track.stop())
  globals.audioContext.close()
  globals.audioContext = undefined
  globals.mediaStream = undefined
  globals.microphoneOn = false
  const canvas = document.getElementById('microphone-signal')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const microphoneVisualisationOn = () => {
  globals.microphoneVisualisationOn = true
  globals.microphoneVisualisationChart = undefined
  document.getElementById('microphone-signal').style.visibility = 'visible'
}

const microphoneVisualisationOff = () => {
  globals.microphoneVisualisationOn = false
  globals.microphoneVisualisationChart = undefined
  document.getElementById('microphone-signal').style.visibility = 'hidden'
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
  globals.SPARKLER_X = width * 0.25
  globals.MIN_SPARKLER_Y = MARGIN_Y
  globals.MAX_SPARKLER_Y = height - MARGIN_Y
  globals.INITIAL_SPARKLER_Y = globals.MAX_SPARKLER_Y

  globals.currentSparklerY = globals.INITIAL_SPARKLER_Y
  globals.lastRenderTimestamp = getTimestamp()

  globals.obstacle = createObstacle(OBSTACLE_MIN_PERCENT, true)

  document.addEventListener('keydown', onKeyDown)

  render()
}

class StreamWorklet extends AudioWorkletNode {

  constructor(audioContext, name) {
    log.info(`[StreamWorklet#constructor] name: ${name}; sampleRate: ${audioContext.sampleRate}`)
    super(audioContext, name)
    this.port.onmessage = this.onMessage
    console.dir(this.port)
  }

  onMessage(message) {

    console.log(`[StreamWorklet#onMessage] globals.microphoneOn: ${globals.microphoneOn}; globals.microphoneVisualisationOn: ${globals.microphoneVisualisationOn}`)
    console.dir(message)

    if (!globals.microphoneOn) return

    const input = message.data[0]
    const channel = input[0]
    if (channel.some(value => value >= 0.25)) {
      applyBoost()
    }

    if (globals.microphoneVisualisationOn) {
      if (globals.microphoneVisualisationChart) {
        const chart = globals.microphoneVisualisationChart
        updateMicrophoneVisualisationChart(chart, channel)
      } else {
        const chart = createMicrophoneVisualisationChart('microphone-signal', channel)
        globals.microphoneVisualisationChart = chart
      }
    }
  }
}

init()
