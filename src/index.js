/* eslint-env browser */

const canvas = document.getElementById('canvas')
const width = canvas.scrollWidth
const height = canvas.scrollHeight
canvas.width = width
canvas.height = height
const ctx = canvas.getContext('2d')

const randomSpeedX = () => (Math.random() - 0.5) * 5
const randomSpeedY = () => 5 + Math.random() * 5
const randomHeight = () => MAX_HEIGHT_BASE - Math.random() * 10 * PARTICLE_SIZE

const PARTICLE_SIZE = 10
const MAX_HEIGHT_BASE = height - 20 * PARTICLE_SIZE
const NUM_PARTICLES = 20
const particles = []

const range = n => Array.from(Array(n).keys())

const initParticle = index => {
  particles[index] = {
    x: height - PARTICLE_SIZE,
    y: (width - PARTICLE_SIZE) / 2,
    speedX: randomSpeedX(),
    speedY: randomSpeedY()
  }
}

const initParticles = () => {
  range(NUM_PARTICLES).forEach(initParticle)
}

const animate = () => {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'magenta'
  particles.forEach((particle, index) => {
    const { x, y, speedX, speedY } = particle
    ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE)
    particle.x += speedX
    particle.y -= speedY
    if (particle.y < randomHeight()) {
      initParticle(index)
    }
  })
  requestAnimationFrame(animate)
}

initParticles()
animate()
