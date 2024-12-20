import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = -2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

const objectsToTest = [object1, object2, object3]

/**
 * Model
 */
let model = null
const gltfLoader = new GLTFLoader()

// Load Duck model
gltfLoader.load(
    './models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene
        model.position.y = -1.2
        scene.add(model)
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error)
    }
)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
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
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Mouse
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
    console.log(mouse) // Logs normalized mouse coordinates
})

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

let currentIntersect = null

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Animate objects (spheres)
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Cast a ray from the camera based on the mouse position
    raycaster.setFromCamera(mouse, camera)

    // Intersect the spheres
    const intersects = raycaster.intersectObjects(objectsToTest)
    for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff')
    }
    for (const object of objectsToTest) {
        if (!intersects.find((intersect) => intersect.object === object)) {
            object.material.color.set('#ff0000')
        }
    }

    // Check for intersection with the Duck model (only if model is loaded)
    if (model) {
        const modelIntersects = raycaster.intersectObject(model)  // Intersect the Duck model

        if (modelIntersects.length) {
            // If intersected, scale the model up
            model.scale.set(1.2, 1.2, 1.2)  // Increase size when hovered
        } else {
            // If not intersected, revert to original size
            model.scale.set(1, 1, 1)  // Reset size when not hovered
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
