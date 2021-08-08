import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { ParametricBufferGeometry } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 75000
parameters.size = 0.0175
parameters.radius = 5
parameters.branches = 5
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3.25
parameters.insideColor = '#cf7c4d'
parameters.outsideColor = '#3f6b9d'

let particleGeometry = null
let particleMaterial = null
let galaxyparticles = null

const galaxygenerator = () =>
{

    //Destroy Galaxy
    if( galaxyparticles != null)
    {
        particleGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(galaxyparticles)
    }

    particleGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array( parameters.count * 3)
    const colors = new Float32Array( parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for( let i =0; i < parameters.count; i++)
    {   
        const i3 = i * 3

        //Postions
        const randomX = Math.pow(Math.random() , parameters.randomnessPower) * (Math.random()< 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random() , parameters.randomnessPower) * (Math.random()< 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random() , parameters.randomnessPower) * (Math.random()< 0.5 ? 1 : -1)


        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        positions[i3] = (Math.cos(branchAngle + spinAngle) * radius) + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = (Math.sin(branchAngle + spinAngle) * radius) + randomZ

        //Colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    particleGeometry.setAttribute( 'position', new THREE.BufferAttribute(positions, 3))
   
    particleGeometry.setAttribute( 'color', new THREE.BufferAttribute(colors, 3))

    particleMaterial = new THREE.PointsMaterial( {
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    galaxyparticles = new THREE.Points(particleGeometry,particleMaterial)
    scene.add(galaxyparticles)
}

galaxygenerator()

gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(galaxygenerator)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.01).onFinishChange(galaxygenerator)
gui.add(parameters, 'radius').min(0.1).max(20).step(0.1).onFinishChange(galaxygenerator)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(galaxygenerator)
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(galaxygenerator)
gui.add(parameters, 'randomness').min(0).max(2).step(0.01).onFinishChange(galaxygenerator)
gui.add(parameters, 'randomnessPower').min(0).max(10).step(0.01).onFinishChange(galaxygenerator)
gui.addColor(parameters, 'insideColor').onFinishChange(galaxygenerator)
gui.addColor(parameters, 'outsideColor').onFinishChange(galaxygenerator)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    galaxyparticles.rotation.y = elapsedTime * 0.075

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()