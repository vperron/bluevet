/* global L */

import {
  gmaps_loader,
  helpers,
  leaflet_google,
  logger,
} from 'vanitils'

import 'leaflet/dist/leaflet.css'

import 'src/styles.css'

import logoPng from 'src/logo.png'

import bluevetPng1 from 'src/images/bluevet.png'
import bluevetPng2 from 'src/images/bluevet2.png'
import bluevetPng3 from 'src/images/bluevet3.png'
import bluevetPng4 from 'src/images/bluevet4.png'
import bluevetPng5 from 'src/images/bluevet5.png'
import bluevetPng6 from 'src/images/bluevet6.png'

import {CITIES} from 'src/cities'
import mapStyle from 'src/gmaps-style.json'
import darkMapStyle from 'src/gmaps-style-dark.json'

const API_KEY = 'AIzaSyAEKADDbfh4NsgOuAtaeazXJi9XZrkVcjQ'
const NUM_BLUEVETS = 20
const CITY_SWITCH_TIMEOUT = 20000

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
  makeIcon(bluevetPng5, 199),
  makeIcon(bluevetPng6, 192),
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

  const logoParent = document.getElementById('logo')
  const logoItem = document.createElement('img')
  logoItem.src = logoPng
  logoItem.height = '40'
  logoParent.appendChild(logoItem)


  const mapElement = document.getElementById('map')
  var map = new L.Map(mapElement, {
    maxZoom: 19,
    minZoom: 11,
    scrollWheelZoom: true,
    zoomControl: true,
  })

  gmaps_loader.load({apiKey: API_KEY}).then(() => {
    leaflet_google.load()

    for (let city of CITIES) {
      const coords = range(NUM_BLUEVETS).map(() => [
				city.center[0] + rand() * 0.02,
				city.center[1] + rand() * 0.05
      ])
      city.markers = coords.map((coord, i) => L.marker(coord, {
        icon: bouvIcons[i % bouvIcons.length],
      }))
      for (let marker of city.markers) {
        marker.addTo(map)
      }
    }

    let currentCity = 0
    let tileLayer = null
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

      const googleOptions = {
        mapOptions: {styles: rand() < 0 ? darkMapStyle : mapStyle}
      }
      if (tileLayer) map.removeLayer(tileLayer.googleLayer)
      tileLayer = new L.GoogleGridLayer(null, googleOptions)
      map.addLayer(tileLayer)

      const city = CITIES[currentCity]
      map.setView(city.center, city.zoom)

      movingLoop = setInterval(moveMarkers(city.markers), 100)

      currentCity += 1
    }

		setInterval(switchCity, CITY_SWITCH_TIMEOUT)
    switchCity()
  })
}

window.bluevet = {
  bootstrap: bootstrap,
}
