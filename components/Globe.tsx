'use client'

import { useEffect, useRef } from 'react'

export default function Globe({ news = [] }: { news?: any[] }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const newsRef = useRef<any[]>(news)

  useEffect(() => { newsRef.current = news }, [news])

  useEffect(() => {
    if (!mountRef.current) return
    let animationId: number

    async function init() {
      const el = mountRef.current!
      const width = el.clientWidth
      const height = el.clientHeight

      const THREE = await import('three')
      const { default: ThreeGlobe } = await import('three-globe')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.z = 280

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)

      const globe = new ThreeGlobe({ animateIn: false })
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .showAtmosphere(true)
        .atmosphereColor('#1a3a8a')
        .atmosphereAltitude(0.15)

      const res = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      const countries = await res.json()

      globe
        .polygonsData(countries.features)
        .polygonCapColor(() => 'rgba(124, 58, 237, 0.05)')
        .polygonSideColor(() => 'rgba(124, 58, 237, 0.1)')
        .polygonStrokeColor(() => '#7c3aed')
        .polygonAltitude(0.001)

      // 25 major trading-relevant countries only
      const regions = [
        { name: 'United States', lat: 39.5, lng: -98.35 },
        { name: 'Canada', lat: 60.0, lng: -96.0 },
        { name: 'Mexico', lat: 23.0, lng: -102.0 },
        { name: 'Brazil', lat: -10.0, lng: -55.0 },
        { name: 'Argentina', lat: -35.0, lng: -65.0 },
        { name: 'United Kingdom', lat: 54.0, lng: -2.0 },
        { name: 'France', lat: 46.0, lng: 2.0 },
        { name: 'Germany', lat: 51.0, lng: 10.0 },
        { name: 'Italy', lat: 42.0, lng: 12.5 },
        { name: 'Spain', lat: 40.0, lng: -4.0 },
        { name: 'Russia', lat: 61.5, lng: 90.0 },
        { name: 'Ukraine', lat: 49.0, lng: 31.0 },
        { name: 'Turkey', lat: 39.0, lng: 35.0 },
        { name: 'Saudi Arabia', lat: 24.0, lng: 45.0 },
        { name: 'UAE', lat: 24.0, lng: 54.0 },
        { name: 'Iran', lat: 32.0, lng: 53.0 },
        { name: 'Israel', lat: 31.5, lng: 34.8 },
        { name: 'India', lat: 20.0, lng: 78.0 },
        { name: 'Pakistan', lat: 30.0, lng: 69.0 },
        { name: 'China', lat: 35.0, lng: 103.0 },
        { name: 'Japan', lat: 36.0, lng: 138.0 },
        { name: 'South Korea', lat: 37.0, lng: 127.0 },
        { name: 'Indonesia', lat: -2.0, lng: 118.0 },
        { name: 'Australia', lat: -25.0, lng: 134.0 },
        { name: 'New Zealand', lat: -41.0, lng: 174.0 },
        { name: 'South Africa', lat: -29.0, lng: 25.0 },
        { name: 'Nigeria', lat: 9.0, lng: 8.0 },
        { name: 'Egypt', lat: 26.0, lng: 30.0 },
        { name: 'Kazakhstan', lat: 48.0, lng: 68.0 },
        { name: 'Mongolia', lat: 46.0, lng: 103.0 },
      ]

      const financialCities = [
        { name: 'NEW YORK', lat: 40.7, lng: -74.0 },
        { name: 'LONDON', lat: 51.5, lng: -0.1 },
        { name: 'TOKYO', lat: 35.7, lng: 139.7 },
        { name: 'FRANKFURT', lat: 50.1, lng: 8.7 },
        { name: 'HONG KONG', lat: 22.3, lng: 114.2 },
        { name: 'SINGAPORE', lat: 1.3, lng: 103.8 },
        { name: 'CHICAGO', lat: 41.9, lng: -87.6 },
        { name: 'DUBAI', lat: 25.2, lng: 55.3 },
        { name: 'SYDNEY', lat: -33.9, lng: 151.2 },
        { name: 'SHANGHAI', lat: 31.2, lng: 121.5 },
      ]

      const allLabels = [
        ...regions.map(r => ({ ...r, type: 'country' })),
        ...financialCities.map(c => ({ ...c, type: 'city' })),
      ]

      globe
        .labelsData(allLabels)
        .labelLat('lat')
        .labelLng('lng')
        .labelText('name')
        .labelSize((d: any) => d.type === 'city' ? 1.6 : 1.1)
        .labelColor((d: any) => d.type === 'city' ? '#FFD700' : 'rgba(210,220,255,0.9)')
        .labelAltitude((d: any) => d.type === 'city' ? 0.05 : 0.03)
        .labelResolution(6)
        .labelDotRadius((d: any) => d.type === 'city' ? 0.4 : 0)
        .labelDotOrientation(() => 'bottom')
        .labelIncludeDot((d: any) => d.type === 'city')

      scene.add(globe)

      scene.add(new THREE.AmbientLight(0x334466, 1.8))
      const sun = new THREE.DirectionalLight(0xffffff, 1.0)
      sun.position.set(200, 100, 200)
      scene.add(sun)
      const rim = new THREE.DirectionalLight(0x7c3aed, 0.4)
      rim.position.set(-200, -100, -200)
      scene.add(rim)

      // News pillars
      const countryCoords: Record<string, { lat: number, lng: number }> = {
        'united states': { lat: 39.5, lng: -98.35 },
        'iran': { lat: 32.0, lng: 53.0 },
        'israel': { lat: 31.5, lng: 34.8 },
        'russia': { lat: 61.5, lng: 90.0 },
        'china': { lat: 35.0, lng: 103.0 },
        'ukraine': { lat: 49.0, lng: 31.0 },
        'lebanon': { lat: 33.9, lng: 35.5 },
        'united kingdom': { lat: 54.0, lng: -2.0 },
        'germany': { lat: 51.0, lng: 10.0 },
        'france': { lat: 46.0, lng: 2.0 },
        'japan': { lat: 36.0, lng: 138.0 },
        'saudi arabia': { lat: 24.0, lng: 45.0 },
        'pakistan': { lat: 30.0, lng: 69.0 },
        'india': { lat: 20.0, lng: 78.0 },
        'turkey': { lat: 39.0, lng: 35.0 },
        'brazil': { lat: -10.0, lng: -55.0 },
        'south korea': { lat: 37.0, lng: 127.0 },
        'australia': { lat: -25.0, lng: 134.0 },
      }

      const GLOBE_RADIUS = 100
      const pillarMeshes: { mesh: any, data: any }[] = []

      newsRef.current.forEach((a: any) => {
        const headline = (a.headline || '').toLowerCase()
        let coord: { lat: number, lng: number } | null = null
        for (const [country, c] of Object.entries(countryCoords)) {
          if (headline.includes(country)) { coord = c; break }
        }
        if (!coord) return

        const color = a.importance === 'RED' ? '#ef4444' : a.importance === 'ORANGE' ? '#f97316' : '#eab308'
        const pillarHeight = a.importance === 'RED' ? 30 : a.importance === 'ORANGE' ? 20 : 12

        const phi = (90 - coord.lat) * (Math.PI / 180)
        const theta = (coord.lng + 180) * (Math.PI / 180)
        const r = GLOBE_RADIUS + pillarHeight / 2 + 1

        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.2, pillarHeight, 8),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
        )

        mesh.position.set(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          -r * Math.sin(phi) * Math.sin(theta)
        )
        mesh.lookAt(0, 0, 0)
        mesh.rotateX(Math.PI / 2)
        ;(mesh as any).__data = a
        globe.add(mesh)
        pillarMeshes.push({ mesh, data: a })
      })

      // Popup
      el.style.position = 'relative'
      const popup = document.createElement('div')
      popup.style.cssText = `
        position:absolute;display:none;
        background:rgba(8,8,8,0.97);
        border:1px solid #d4a017;
        border-left: 3px solid #d4a017;
        padding:14px;max-width:280px;
        font-family:monospace;font-size:11px;
        color:#e5e7eb;z-index:100;
        line-height:1.6;
      `
      el.appendChild(popup)

      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      let popupOpen = false

      renderer.domElement.addEventListener('click', (e) => {
        if (popupOpen) { popup.style.display = 'none'; popupOpen = false; return }
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(pillarMeshes.map(p => p.mesh))
        if (hits.length > 0) {
          const d = (hits[0].object as any).__data
          const impactColor = d.impact?.startsWith('-') ? '#ef4444' : '#22c55e'
          const arrow = d.impact?.startsWith('-') ? '↓' : '↑'
          const borderColor = d.importance === 'RED' ? '#ef4444' : d.importance === 'ORANGE' ? '#f97316' : '#eab308'
          const labelColor = borderColor
          popup.style.borderLeftColor = borderColor
          popup.innerHTML = `
            <div style="color:${labelColor};font-weight:bold;font-size:10px;margin-bottom:8px;letter-spacing:0.1em">[${d.importance}] NEWS ALERT</div>
            <div style="color:#e5e7eb;margin-bottom:10px;font-size:12px">${d.headline}</div>
            <div style="color:#6b7280;font-style:italic;margin-bottom:10px;font-size:10px;line-height:1.5">${d.analysis || ''}</div>
            <div style="color:${impactColor};font-weight:bold;font-size:16px">${arrow} ${d.impact}</div>
            <div style="color:#4b5563;font-size:9px;margin-top:8px;letter-spacing:0.05em">CLICK ANYWHERE TO CLOSE</div>
          `
          popup.style.left = (e.clientX - rect.left + 14) + 'px'
          popup.style.top = (e.clientY - rect.top - 14) + 'px'
          popup.style.display = 'block'
          popupOpen = true
        }
      })

      // Drag with momentum
      let isDragging = false
      let prev = { x: 0, y: 0 }
      let velocity = { x: 0, y: 0 }
      const canvas = renderer.domElement
      canvas.style.cursor = 'grab'

      canvas.addEventListener('mousedown', (e) => {
        isDragging = true
        velocity = { x: 0, y: 0 }
        prev = { x: e.clientX, y: e.clientY }
        canvas.style.cursor = 'grabbing'
      })
      window.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab' })
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return
        velocity.x = (e.clientY - prev.y) * 0.003
        velocity.y = (e.clientX - prev.x) * 0.003
        globe.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, globe.rotation.x + velocity.x))
        globe.rotation.y += velocity.y
        prev = { x: e.clientX, y: e.clientY }
      })

      let targetZ = 280
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault()
        targetZ = Math.max(140, Math.min(500, targetZ + e.deltaY * 0.25))
      }, { passive: false })

      let frame = 0
      function animate() {
        animationId = requestAnimationFrame(animate)
        frame++
        if (frame % 2 !== 0) return

        if (!isDragging) {
          globe.rotation.y += 0.0006 + velocity.y
          globe.rotation.x += velocity.x
          velocity.x *= 0.92
          velocity.y *= 0.92
        }
        camera.position.z += (targetZ - camera.position.z) * 0.08
        renderer.render(scene, camera)
      }
      animate()

      ;(el as any)._cleanup = () => {
        cancelAnimationFrame(animationId)
        renderer.dispose()
        if (el.contains(canvas)) el.removeChild(canvas)
        if (el.contains(popup)) el.removeChild(popup)
      }
    }

    init()
    return () => {
      const el = mountRef.current
      if (el && (el as any)._cleanup) (el as any)._cleanup()
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}