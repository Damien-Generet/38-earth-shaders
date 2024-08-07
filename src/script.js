import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import athmosphereVertexShader from './shaders/athmosphere/vertex.glsl'
import athmosphereFragmentShader from './shaders/athmosphere/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */

const earthParameters = {}
earthParameters.athmosphereDayColor = '#00aaff'
earthParameters.athmosphereTwilightColor = '#ff6600'
earthParameters.time = 0

//Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8
const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8
const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthSpecularCloudsTexture.anisotropy = 8

// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAthmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.athmosphereDayColor)),
        uAthmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.athmosphereTwilightColor)),
        uTime: new THREE.Uniform(earthParameters.time)
    }
})




//gui earth
gui.addColor(earthParameters, 'athmosphereDayColor').name('athmosphere day color').onChange(() =>{
    earthMaterial.uniforms.uAthmosphereDayColor.value.set(earthParameters.athmosphereDayColor)
    athmosphereMateriall.uniforms.uAthmosphereDayColor.value.set(earthParameters.athmosphereDayColor)
})
gui.addColor(earthParameters, 'athmosphereTwilightColor').name('athmosphere twilight color').onChange(() =>{
    earthMaterial.uniforms.uAthmosphereTwilightColor.value.set(earthParameters.athmosphereTwilightColor)
    athmosphereMateriall.uniforms.uAthmosphereTwilightColor.value.set(earthParameters.athmosphereTwilightColor)
})

const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

//athmosphere
const athmosphereMateriall = new THREE.ShaderMaterial(
    {
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,

        vertexShader: athmosphereVertexShader,
        fragmentShader: athmosphereFragmentShader,
        uniforms:
        {
            uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
            uAthmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.athmosphereDayColor)),
            uAthmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.athmosphereTwilightColor))
        }

    }
)

const athmosphere = new THREE.Mesh(earthGeometry, athmosphereMateriall)
scene.add(athmosphere)
athmosphere.scale.set(1.04, 1.04, 1.04)

//Sun
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5)
const sunDirection = new THREE.Vector3()

//debugsun
const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial(
    )
)
scene.add(debugSun)

// update sun
const updateSun = () =>{
    sunDirection.setFromSpherical(sunSpherical)
    debugSun.position.copy(sunDirection).multiplyScalar(5)

    earth.material.uniforms.uSunDirection.value.copy(sunDirection)
    athmosphere.material.uniforms.uSunDirection.value.copy(sunDirection)

}

updateSun()

// Debug
gui.add(sunSpherical, 'phi').min(0).max(Math.PI).step(0.01).name('sun phi').onChange(updateSun)
gui.add(sunSpherical, 'theta').min(0).max(Math.PI * 2).step(0.01).name('sun theta').onChange(updateSun)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    earthParameters.time = elapsedTime

    // Mise à jour de uTime
    earth.material.uniforms.uTime.value = earthParameters.time

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()