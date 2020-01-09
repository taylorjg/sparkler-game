import Chart from 'chart.js'
import * as U from './utils'

export const createMicrophoneVisualisationChart = (canvasId, data) =>
  new Chart(canvasId, {
    type: 'line',
    data: {
      labels: U.range(data.length),
      datasets: [{
        data,
        borderColor: 'green',
        borderWidth: 2,
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
          labels: U.range(data.length),
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

export const updateMicrophoneVisualisationChart = (chart, data) => {
  chart.data.datasets[0].data = data
  chart.update()
}
