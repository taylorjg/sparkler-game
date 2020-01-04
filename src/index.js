/* eslint-env browser */

let canvas = document.getElementById('canvas')
let width = canvas.scrollWidth
let height = canvas.scrollHeight
let ctx = canvas.getContext('2d')

canvas.width = width
canvas.height = height

const randomVelocity = () => (Math.random() - 0.5) * 2.5

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

const getTimestamp = () => new Date().getTime()

const GRAVITY = 9.81
const BOOST = GRAVITY * 2
const PARTICLE_ITERATIONS = 50
const PARTICLE_SIZE = 5
const MARGIN_Y = 50
const MIN_Y = MARGIN_Y
const MAX_Y = height - MARGIN_Y
const INITIAL_X = width * 0.25
const INITIAL_Y = MAX_Y
let numBoosts = 0
let currentVelocityY = 0
let currentY = INITIAL_Y
let particles = []
let lastRenderTimestamp = getTimestamp()

const createParticle = () => ({
  x: INITIAL_X,
  y: currentY,
  velocityX: randomVelocity(),
  velocityY: randomVelocity(),
  iterations: PARTICLE_ITERATIONS,
  size: PARTICLE_SIZE
})

const calculateMovementY = deltaTime => {
  if (currentY <= MIN_Y) {
    currentY = MIN_Y
    const accelerationY = GRAVITY
    currentVelocityY = accelerationY * deltaTime
    const movementY = currentVelocityY * deltaTime * 100
    return movementY
  }

  if (currentY >= MAX_Y) {
    currentY = MAX_Y
    const accelerationY = 0 - (numBoosts ? BOOST : 0)
    currentVelocityY = accelerationY * deltaTime
    const movementY = currentVelocityY * deltaTime * 100
    return movementY
  }

  const accelerationY = GRAVITY - (numBoosts ? BOOST : 0)
  currentVelocityY += accelerationY * deltaTime
  const movementY = currentVelocityY * deltaTime * 100
  return movementY
}

const stillActive = p => p.iterations > 0

const render = () => {
  particles.push(createParticle())
  const thisRenderTimestamp = getTimestamp()
  const deltaTime = (thisRenderTimestamp - lastRenderTimestamp) / 1000
  lastRenderTimestamp = thisRenderTimestamp
  const movementY = calculateMovementY(deltaTime)
  currentY += movementY
  if (numBoosts > 0) {
    numBoosts -= 1
  }
  ctx.clearRect(0, 0, width, height)
  particles.forEach(particle => {
    const { x, y, velocityX, velocityY, iterations, size } = particle
    const numColours = COLOURS.length
    const colourIndex = numColours - Math.floor(iterations / PARTICLE_ITERATIONS * numColours)
    const rgbStr = COLOURS[colourIndex]
    const alpha = Math.floor(iterations / PARTICLE_ITERATIONS * 255)
    const alphaStr = alpha.toString(16).padStart(2, '0')
    ctx.fillStyle = rgbStr + alphaStr
    ctx.fillRect(x, y, size, size)
    particle.x += velocityX
    particle.y += velocityY + movementY
    particle.iterations -= 1
    particle.size *= 0.99
  })
  particles = particles.filter(stillActive)
  if (particles.length === 0) {
    currentVelocityY = 0
    currentY = INITIAL_Y
  }
  requestAnimationFrame(render)
}

const onKeyDown = e => {
  if (e.keyCode === 38) {
    numBoosts = 12
  }
}

document.addEventListener('keydown', onKeyDown)

render()
