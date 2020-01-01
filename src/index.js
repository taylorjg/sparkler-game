/* eslint-env browser */

const canvas = document.getElementById('canvas')
const width = canvas.scrollWidth
const height = canvas.scrollHeight
canvas.width = width
canvas.height = height
const ctx = canvas.getContext('2d')

const randomVelocity = () => (Math.random() - 0.5) * 10

const PARTICLE_COLOUR = 'magenta'
const PARTICLE_SIZE = 5
const CENTRE_X = width / 2
const CENTRE_Y = height / 2
let particles = []

const createParticle = () => ({
  x: CENTRE_X,
  y: CENTRE_Y,
  velocityX: randomVelocity(),
  velocityY: randomVelocity()
})

const stillActive = p => {
  const dx = Math.abs(p.x - CENTRE_X)
  const dy = Math.abs(p.y - CENTRE_Y)
  const MAX_DISTANCE_X = PARTICLE_SIZE * (5 + Math.random() * 20)
  const MAX_DISTANCE_Y = PARTICLE_SIZE * (5 + Math.random() * 20)
  return dx < MAX_DISTANCE_X && dy < MAX_DISTANCE_Y
}

const animate = () => {
  particles.push(createParticle())
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = PARTICLE_COLOUR
  particles.forEach(particle => {
    const { x, y, velocityX, velocityY } = particle
    ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE)
    particle.x += velocityX
    particle.y -= velocityY
  })
  particles = particles.filter(stillActive)
  requestAnimationFrame(animate)
}

animate()
