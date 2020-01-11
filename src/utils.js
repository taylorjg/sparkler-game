export const range = n =>
  Array.from(Array(n).keys())

export const degreesToRadians = degrees =>
  degrees * Math.PI / 180

export const getTimestamp = () =>
  new Date().getTime()

export const roundEven = n => {
  const rounded = Math.round(n)
  return rounded % 2 === 0 ? rounded : rounded + 1
}
