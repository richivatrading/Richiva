import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = {
  version: 8,
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm-raster',
    },
  ],
}

export default function LocationPicker({ value, onChange }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [position, setPosition] = useState(value || null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (value) {
      setPosition({ lat: value.lat, lng: value.lng })
      setAddress(value.address || '')
    }
  }, [value])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const styleUrl = URL.createObjectURL(
      new Blob([JSON.stringify(MAP_STYLE)], { type: 'application/json' })
    )

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: position ? [position.lng, position.lat] : [85.324, 27.7172],
      zoom: 13,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      URL.revokeObjectURL(styleUrl)
    })

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      handleMapClick({ lat, lng })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (position) {
      if (markerRef.current) {
        markerRef.current.setLngLat([position.lng, position.lat])
      } else {
        markerRef.current = new maplibregl.Marker({ color: '#FF4F12' })
          .setLngLat([position.lng, position.lat])
          .addTo(map)
      }
      map.flyTo({ center: [position.lng, position.lat], zoom: 15 })
    }
  }, [position])

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const latlng = { lat: latitude, lng: longitude }
        setPosition(latlng)
        await fetchAddress(latitude, longitude)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        alert('Unable to retrieve your location')
        setLoading(false)
      }
    )
  }

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      const addr = data.display_name || ''
      setAddress(addr)
      onChange?.({ lat, lng, address: addr })
    } catch (err) {
      console.error('Reverse geocoding failed', err)
      onChange?.({ lat, lng, address: '' })
    }
  }

  const handleMapClick = async (latlng) => {
    setPosition(latlng)
    await fetchAddress(latlng.lat, latlng.lng)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={loading}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          {loading ? 'Locating...' : 'Use my location'}
        </button>
      </div>
      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
      {address && (
        <p className="text-sm text-gray-600 break-words">Selected: {address}</p>
      )}
      {!address && position && (
        <p className="text-sm text-gray-500">Click on the map to confirm location</p>
      )}
    </div>
  )
}
