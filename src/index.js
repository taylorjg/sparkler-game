/* eslint-env browser */

const canvas = document.getElementById('canvas')
const width = canvas.scrollWidth
const height = canvas.scrollHeight
canvas.width = width
canvas.height = height
const ctx = canvas.getContext('2d')

const randomSpeedX = () => (Math.random() - 0.5) * 5
const randomSpeedY = () => 5 + Math.random() * 5

const size = 10
let speedX = randomSpeedX()
let speedY = randomSpeedY()
let x = height - size
let y = (width - size) / 2

const animate = () => {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'magenta'
  ctx.fillRect(x, y, size, size)
  x += speedX
  y -= speedY
  if (y < 0) {
    speedX = randomSpeedX()
    speedY = randomSpeedY()
    x = height - size
    y = (width - size) / 2
  }
  requestAnimationFrame(animate)
}

animate()
