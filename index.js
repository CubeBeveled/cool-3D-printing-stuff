const { ReadlineParser } = require('@serialport/parser-readline')
const { SerialPort } = require('serialport')
//const chalk = require('chalk');
const data = require('./data.json')
const defaults = require('./defaults.json')
const portPath = '/COM6'
let pointList = [];
let gcodeList = []
let gcode = ""

const port = new SerialPort({
  path: portPath,
  baudRate: 115200,
  parity: 'none'
})

const parser = new ReadlineParser()

port.pipe(parser)

parser.on('data', (line) => {
  console.log(line)
})

port.on('open', () => {
  console.log(`Port ${portPath} opened`)
})

gcodeList.push(`G21`)//Set units to millimeters
gcodeList.push(`G90`)//Set to absolute positioning

if (data.fanSpeed < 1) {
  gcodeList.push(`M106 P0 S${data.fanSpeed}`)
  console.log(`Setting fan speed to ${data.fanSpeed}`)
} else if (!data.fanSpeed && data.nozzleTemp > 20 && data.safety) {
  console.log(`Setting fan speed to default ${defaults.fanSpeed}`)//Set default
  gcodeList.push(`M106 P0 S${defaults.fanSpeed}`)
} else if (!data.fanSpeed || data.fanSpeed < 0.9) {
  console.log(`Turning off fan`)
  gcodeList.push(`M106 P0 S0`)
}

if(data.heatNozzle) {
  gcodeList.push(`M104 S${data.nozzleTemp}`)//Set nozzle temp
  console.log(`Set nozzle temp to ${data.nozzleTemp}`)
}

if(data.heatBed) {
  gcodeList.push(`M140 S${data.nozzleTemp}`)//Set bed temp
  console.log(`Bed temp set to ${data.nozzleTemp}`)
}

gcodeList.push(`G28`)//Home axes

if(data.heatNozzle) {
  gcodeList.push(`${gcode}M104 S${data.nozzleTemp}`)//Wait for nozzle to reach temp
  console.log(`Nozzle temp set to ${data.nozzleTemp}`)
}

if(data.heatBed) gcodeList.push(`M190 S${data.bedTemp}`)//Wait for bed to reach temp

if (data.genType.toLowerCase() == 'random point cloud') {
  for(let i; i < data.pointCloudNumber; i++) {
    const randomx = Math.floor(Math.random() * data.x - 5)
    const randomy = Math.floor(Math.random() * data.y - 5)
    const randomz = Math.floor(Math.random() * data.z - 5)
    pointList.push({
      x: randomx,
      y: randomy,
      z: randomz
    })
  }
}