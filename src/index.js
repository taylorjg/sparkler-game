/* eslint-env browser */

const COLOURS = [
  '#ffffff',
  '#ffffff',
  '#ff00ff',
  '#ff00ff',
  '#ffff00',
  '#ffff00',
  '#90ee90',
  '#90ee90'
]
const GRAVITY = 9.81
const BOOST = GRAVITY * 2.5
const PARTICLE_ITERATIONS = 50
const PARTICLE_SIZE = 5
const MARGIN_Y = 50
const MAX_BOOSTS = 8
const UP_ARROW_KEY = 38

const globals = {
  CANVAS: undefined,
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
  particles: [],
  lastRenderTimestamp: 0
}

const getTimestamp = () => new Date().getTime()

const randomVelocity = () => (Math.random() - 0.5) * 2.5

const createParticle = () => ({
  x: globals.INITIAL_X,
  y: globals.currentY,
  velocityX: randomVelocity(),
  velocityY: randomVelocity(),
  iterations: PARTICLE_ITERATIONS,
  size: PARTICLE_SIZE
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
  globals.particles.push(createParticle())
  const thisRenderTimestamp = getTimestamp()
  const deltaTime = (thisRenderTimestamp - globals.lastRenderTimestamp) / 1000
  globals.lastRenderTimestamp = thisRenderTimestamp
  const movementY = calculateAccelerationY(deltaTime)
  globals.currentY += movementY
  if (globals.remainingBoosts > 0) {
    globals.remainingBoosts -= 1
  }
  globals.CTX.clearRect(0, 0, globals.WIDTH, globals.HEIGHT)
  globals.particles.forEach(particle => {
    const { x, y, velocityX, velocityY, iterations, size } = particle
    const numColours = COLOURS.length
    const colourIndex = numColours - Math.floor(iterations / PARTICLE_ITERATIONS * numColours)
    const rgbStr = COLOURS[colourIndex]
    const alpha = Math.floor(iterations / PARTICLE_ITERATIONS * 255)
    const alphaStr = alpha.toString(16).padStart(2, '0')
    globals.CTX.fillStyle = rgbStr + alphaStr
    globals.CTX.fillRect(x, y, size, size)
    particle.x += velocityX
    particle.y += velocityY + movementY
    particle.iterations -= 1
    particle.size *= 0.99
  })
  globals.particles = globals.particles.filter(p => p.iterations > 0)
  if (globals.particles.length === 0) {
    globals.currentVelocityY = 0
    globals.currentY = globals.INITIAL_Y
  }
  requestAnimationFrame(render)
}

const onKeyDown = e => {
  if (e.keyCode === UP_ARROW_KEY) {
    if (globals.remainingBoosts === 0) {
      globals.remainingBoosts = MAX_BOOSTS
    }
  }
}

const init = () => {
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

  render()
}

init()
