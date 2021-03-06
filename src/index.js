import './AudioContextMonkeyPatch'
import log from 'loglevel'
import configureMicrophoneModule from './microphone'
import * as U from './utils'

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
const OBSTACLE_MIN_PERCENT = 30
const OBSTACLE_MAX_PERCENT = 40
const MARGIN_Y = 50
const MAX_BOOSTS = 8
const NOISE_LEVEL_THRESHOLD = 0.5
const UP_ARROW_KEY = 38
const RETURN_KEY = 13

const globals = {
  CTX: undefined,
  WIDTH: 0,
  HEIGHT: 0,
  SPARKLER_X: 0,
  MIN_SPARKLER_Y: 0,
  MAX_SPARKLER_Y: 0,
  INITIAL_SPARKLER_Y: 0,
  OBSTACLE_WIDTH: 0,
  FONT_SIZE: 0,

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
}

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

const createObstacle = (percent, initialPosition) => {
  const ratio = Math.random() - 0.5
  const height = globals.HEIGHT * percent / 100
  const height1 = (1 + ratio) * height
  const height2 = (1 - ratio) * height
  const r = globals.OBSTACLE_WIDTH / 2
  const centreX = initialPosition ? globals.WIDTH * 0.8 : globals.WIDTH + r + 2
  const leftX = centreX - r
  const rightX = centreX + r
  const upper = [
    { x: leftX, y: 0 },
    { x: leftX, y: height1 - r },
    { x: rightX, y: height1 - r },
    { x: rightX, y: 0 }
  ]
  const lower = [
    { x: leftX, y: globals.HEIGHT },
    { x: leftX, y: globals.HEIGHT - height2 + r },
    { x: rightX, y: globals.HEIGHT - height2 + r },
    { x: rightX, y: globals.HEIGHT }
  ]
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
  const thisRenderTimestamp = U.getTimestamp()
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
    const { x, y, iterations, size, angle } = burstParticle
    globals.CTX.fillStyle = '#ffffff'
    globals.CTX.fillRect(x - size / 2, y - size / 2, size, size)
    const factor = (BURST_PARTICLE_ITERATIONS - iterations + 1) * 1.2
    burstParticle.x += BURST_PARTICLE_VELOCITY * factor * Math.cos(angle)
    burstParticle.y += BURST_PARTICLE_VELOCITY * factor * Math.sin(angle)
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
    upperPath.arc(upper[1].x + r, upper[1].y, r, Math.PI, 0, true)
    upperPath.lineTo(upper[3].x, upper[3].y)
    const lowerPath = new Path2D()
    lowerPath.moveTo(lower[0].x, lower[0].y)
    lowerPath.lineTo(lower[1].x, lower[1].y)
    lowerPath.arc(lower[1].x + r, lower[1].y, r, Math.PI, 0, false)
    lowerPath.lineTo(lower[3].x, lower[3].y)
    globals.CTX.strokeStyle = 'lightblue'
    globals.CTX.lineWidth = 2
    globals.CTX.stroke(upperPath)
    globals.CTX.stroke(lowerPath)
    const dx = globals.SPARKLER_X - rightX
    if (globals.currentSparklerVelocityX && dx >= 0 && dx <= Math.abs(globals.currentSparklerVelocityX)) {
      createBurst()
      globals.currentScore++
      globals.currentSparklerVelocityX -= 0.5
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

  globals.CTX.font = `${globals.FONT_SIZE}px VectorBattle`
  globals.CTX.fillStyle = 'magenta'

  if (collided) {
    globals.CTX.textAlign = 'center'
    globals.CTX.textBaseline = 'middle'
    const cx = globals.WIDTH / 2
    const cy = globals.HEIGHT / 2
    globals.CTX.fillText(`score ${globals.currentScore}`, cx, cy - 40)
    globals.CTX.fillText('Tap to play again', cx, cy + 40)
    globals.gameOver = true
  } else {
    globals.CTX.textAlign = 'left'
    globals.CTX.textBaseline = 'top'
    globals.CTX.fillText(globals.currentScore, 20, 20)
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
    const angles = U.range(8).map(n => n * 45).map(U.degreesToRadians)
    const hypotenuses = U.range(3).map(n => n + 1).map(n => n * BURST_PARTICLE_VELOCITY)
    angles.forEach(angle =>
      hypotenuses.forEach(hypotenuse =>
        globals.burstParticles.push(createBurstParticle(angle, hypotenuse))))
  }
}

const reset = () => {
  globals.gameOver = false
  globals.currentScore = 0
  globals.currentSparklerVelocityX = 0
  globals.currentSparklerVelocityY = 0
  globals.currentSparklerY = globals.INITIAL_SPARKLER_Y
  globals.lastRenderTimestamp = U.getTimestamp()
  globals.sparklerParticles = []
  globals.burstParticles = []
  globals.obstacle = createObstacle(OBSTACLE_MIN_PERCENT, true)
  render()
}

const onKeyDown = e => {
  log.info(`[onKeyDown] e.keyCode: ${e.keyCode}`)
  switch (e.keyCode) {
    case UP_ARROW_KEY: return applyBoost()
    case RETURN_KEY: return globals.gameOver ? reset() : undefined
  }
}

const onMouseDown = e => {
  log.info(`[onMouseDown] e.button: ${e.button}`)
  if (globals.gameOver) {
    reset()
  } else {
    applyBoost()
  }
}

const microphoneModule = configureMicrophoneModule({
  NOISE_LEVEL_THRESHOLD,
  applyBoost
})

const updateMicrophonePanel = microphoneIsOn => {
  const microphoneIsOnIcon = document.getElementById('microphone-is-on-icon')
  const microphoneIsOffIcon = document.getElementById('microphone-is-off-icon')
  microphoneIsOnIcon.style.display = microphoneIsOn ? '' : 'none'
  microphoneIsOffIcon.style.display = microphoneIsOn ? 'none' : ''
}

const turnMicrophoneOn = () => {
  microphoneModule.microphoneOn()
  updateMicrophonePanel(true)
}

const turnMicrophoneOff = () => {
  microphoneModule.microphoneOff()
  updateMicrophonePanel(false)
}

const onTurnMicrophoneOn = e => {
  log.info('[turnMicrophoneOn]')
  e.stopPropagation()
  turnMicrophoneOn()
}

const onTurnMicrophoneOff = e => {
  log.info('[turnMicrophoneOff]')
  e.stopPropagation()
  turnMicrophoneOff()
}

const onResize = () => {
  log.info('[onResize]')

  const canvas = document.getElementById('canvas')
  const clientRect = canvas.getBoundingClientRect()
  const width = clientRect.width
  const height = clientRect.height
  canvas.width = width
  canvas.height = height

  const scaleX = width / globals.WIDTH
  const scaleY = height / globals.HEIGHT
  log.info(`[onResize] scaleX: ${scaleX}; scaleY: ${scaleY}`)

  globals.CTX = canvas.getContext('2d')
  globals.WIDTH = width
  globals.HEIGHT = height
  globals.SPARKLER_X = width * 0.2
  globals.MIN_SPARKLER_Y = MARGIN_Y
  globals.MAX_SPARKLER_Y = height - MARGIN_Y
  globals.INITIAL_SPARKLER_Y = globals.MAX_SPARKLER_Y
  globals.OBSTACLE_WIDTH = globals.WIDTH / 20
  globals.FONT_SIZE = U.roundEven(globals.WIDTH / 30)

  globals.currentSparklerY *= scaleY;

  const scaleCoord = coord => {
    coord.x *= scaleX
    coord.y *= scaleY
  }

  globals.sparklerParticles.forEach(scaleCoord)
  globals.burstParticles.forEach(scaleCoord)
  globals.obstacle.upper.forEach(scaleCoord)
  globals.obstacle.lower.forEach(scaleCoord)
}

const main = async () => {

  log.setLevel('info')
  window.log = log

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('service-worker.js')
      log.info('Successfully registered service worker', registration)
    } catch (error) {
      log.error(`Failed to register service worker: ${error.message}`)
    }
  }

  const canvas = document.getElementById('canvas')
  const clientRect = canvas.getBoundingClientRect()
  const width = clientRect.width
  const height = clientRect.height
  canvas.width = width
  canvas.height = height

  globals.CTX = canvas.getContext('2d')
  globals.WIDTH = width
  globals.HEIGHT = height
  globals.SPARKLER_X = width * 0.2
  globals.MIN_SPARKLER_Y = MARGIN_Y
  globals.MAX_SPARKLER_Y = height - MARGIN_Y
  globals.INITIAL_SPARKLER_Y = globals.MAX_SPARKLER_Y
  globals.OBSTACLE_WIDTH = globals.WIDTH / 20
  globals.FONT_SIZE = U.roundEven(globals.WIDTH / 30)

  globals.currentSparklerY = globals.INITIAL_SPARKLER_Y
  globals.lastRenderTimestamp = U.getTimestamp()

  globals.obstacle = createObstacle(OBSTACLE_MIN_PERCENT, true)

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('mousedown', onMouseDown)

  window.addEventListener('resize', onResize)

  const microphoneIsOnIcon = document.getElementById('microphone-is-on-icon')
  const microphoneIsOffIcon = document.getElementById('microphone-is-off-icon')
  microphoneIsOnIcon.addEventListener('mousedown', onTurnMicrophoneOff)
  microphoneIsOffIcon.addEventListener('mousedown', onTurnMicrophoneOn)

  render()
}

main()
