export const range = n =>
  Array.from(Array(n).keys())

export const degreesToRadians = degrees =>
  degrees * Math.PI / 180

export const getTimestamp = () =>
  new Date().getTime()
