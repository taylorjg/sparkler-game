/* eslint-env browser */

const canvas = document.getElementById('canvas')
const width = canvas.scrollWidth
const height = canvas.scrollHeight
canvas.width = width
canvas.height = height
const ctx = canvas.getContext('2d')

const randomVelocity = () => (Math.random() - 0.5) * 10

const GRAVITY = 2
const PARTICLE_COLOUR = 'magenta'
const PARTICLE_SIZE = 5
const CENTRE_X = width / 2
const CENTRE_Y = height / 2
let centreOffsetY = 0
let particles = []

const createParticle = () => ({
  x: CENTRE_X,
  y: CENTRE_Y + centreOffsetY,
  velocityX: randomVelocity(),
  velocityY: randomVelocity(),
  colour: PARTICLE_COLOUR,
  brightness: 5
})

const stillActive = p => {
  const currentCentreY = CENTRE_Y + centreOffsetY
  const dx = Math.abs(p.x - CENTRE_X)
  const dy = Math.abs(p.y - currentCentreY)
  const COEFFICIENT_1 = 5
  const COEFFICIENT_2 = 20
  const MAX_DISTANCE_X = PARTICLE_SIZE * (COEFFICIENT_1 + Math.random() * COEFFICIENT_2)
  const MAX_DISTANCE_Y = PARTICLE_SIZE * (COEFFICIENT_1 + Math.random() * COEFFICIENT_2)
  return dx < MAX_DISTANCE_X && dy < MAX_DISTANCE_Y
}

const animate = () => {
  const currentCentreY = CENTRE_Y + centreOffsetY
  if (currentCentreY < height) {
    particles.push(createParticle())
  }
  centreOffsetY += GRAVITY
  ctx.clearRect(0, 0, width, height)
  particles.forEach(particle => {
    const { x, y, velocityX, velocityY, colour, brightness } = particle
    ctx.fillStyle = colour
    const filter = `brightness(${brightness})`
    ctx.filter = filter
    ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE)
    particle.x += velocityX
    particle.y += velocityY
    particle.y += GRAVITY
    particle.brightness -= 0.05
  })
  particles = particles.filter(stillActive)
  console.log(particles.length)
  if (particles.length) {
    requestAnimationFrame(animate)
  }
}

animate()
