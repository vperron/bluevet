/* global L */

import {
  gmaps_loader,
  helpers,
  leaflet_google,
  logger,
} from 'vanitils'

import 'leaflet/dist/leaflet.css'

import 'src/styles.css'

import bluevetPng1 from 'src/images/bluevet.png'
import bluevetPng2 from 'src/images/bluevet2.png'
import bluevetPng3 from 'src/images/bluevet3.png'
import bluevetPng4 from 'src/images/bluevet4.png'

import {CITIES} from 'src/cities'

const logHandler = logger.getLogger()

function makeIcon (iconUrl, width) {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [width / 2, 64],
    iconAnchor: [width / 4, 32],
  })
}

const bouvIcons = [
  makeIcon(bluevetPng1, 80),
  makeIcon(bluevetPng2, 96),
  makeIcon(bluevetPng3, 103),
  makeIcon(bluevetPng4, 106),
]


const rand = () => 2 * Math.random() - 1

const randAngle = () => rand() * Math.PI

function range (a = null, b = 0) {
  if (a == null) {
    return []
  }
  return [...Array.from(Array(Math.abs(b - a)).keys())].map((x) => x + Math.min(a, b))
}

function bootstrap () {
  logHandler.debug('app loaded.')

  const mapElement = document.getElementById('map')
  var map = new L.Map(mapElement, {
    maxZoom: 19,
    minZoom: 11,
    scrollWheelZoom: true,
    zoomControl: true,
  })

  gmaps_loader.load().then(() => {
    leaflet_google.load()
    map.addLayer(new L.GoogleGridLayer())

    for (let city of CITIES) {
      const coords = range(8).map(() => [
				city.center[0] + rand() * 0.02,
				city.center[1] + rand() * 0.05
      ])
      city.markers = coords.map((coord, i) => L.marker(coord, {
        icon: bouvIcons[i % 4],
      }))
      for (let marker of city.markers) {
        marker.addTo(map)
      }
    }

    let currentCity = 0
    let movingLoop = null

    function moveMarkers (markers) {
      return () => {
        for (let m of markers) {
          m.angle = m.angle ? m.angle : randAngle()  // modify the angle slightly
          m.angle = Math.abs(m.angle > 1) ? randAngle() : m.angle + randAngle() * 0.2
          const d = 0.0002
          let p = m.getLatLng()
          p.lat += d * Math.cos(m.angle)
          p.lng += d * Math.sin(m.angle)
          m.setLatLng(p).update()
        }
      }
    }

    function switchCity () {
      if (currentCity === CITIES.length) currentCity = 0

      clearInterval(movingLoop)

      const city = CITIES[currentCity]
      map.setView(city.center, city.zoom)

      movingLoop = setInterval(moveMarkers(city.markers), 100)

      currentCity += 1
    }

		setInterval(switchCity, 30000)
    switchCity()
  })
}

window.bluevet = {
  bootstrap: bootstrap,
}
