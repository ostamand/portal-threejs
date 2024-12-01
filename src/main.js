import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";

// gui
const debugObject = {};
const gui = new dat.GUI({ width: 400 });
gui.hide();

// canvas
const scene = new THREE.Scene();

// scene
const canvas = document.getElementById("root");

// window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// camera
const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.set(2, 3, 5);

// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2; // don't go below ground

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

debugObject.clearColor = "#140d13";
renderer.setClearColor(debugObject.clearColor);

gui.addColor(debugObject, "clearColor").onChange(() =>
    renderer.setClearColor(debugObject.clearColor)
);

// loaders
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// textures
const bakedTexture = textureLoader.load("models/baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

// materials
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xede8c7 });
const portalLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xedd1d3,
    side: THREE.DoubleSide,
});
/* const firefliesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
}); */
const firefliesMaterial = new THREE.ShaderMaterial({
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: 100 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});
gui.add(firefliesMaterial.uniforms.uSize, "value")
    .min(0)
    .max(500)
    .step(1)
    .name("fireflies");

// fireflies
const firefliesGeometry = new THREE.BufferGeometry();
const fireFliesCount = 30;
const positionArray = new Float32Array(fireFliesCount * 3);
const scaleArray = new Float32Array(fireFliesCount);

for (let i = 0; i < fireFliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
    positionArray[i * 3 + 1] = Math.random() * 1.5;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

    scaleArray[i] = Math.random();
}
firefliesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
);
firefliesGeometry.setAttribute(
    "aScale",
    new THREE.BufferAttribute(scaleArray, 1)
);

const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

// load environment
gltfLoader.load("models/portal_baked_v3.glb", (loadedAsset) => {
    loadedAsset.scene.children.find((mesh) => mesh.name === "baked").material =
        bakedMaterial;

    loadedAsset.scene.children.find((mesh) => mesh.name === "lightA").material =
        poleLightMaterial;
    loadedAsset.scene.children.find((mesh) => mesh.name === "lightB").material =
        poleLightMaterial;

    const portal = loadedAsset.scene.children.find(
        (mesh) => mesh.name === "portal"
    );
    portal.material = portalLightMaterial;

    scene.add(loadedAsset.scene);
});

window.addEventListener("resize", () => {
    // update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // update renderer
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(pixelRatio);

    // update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = pixelRatio;
});

// loop
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const loop = () => {
    // delta time
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;

    // update materials
    firefliesMaterial.uniforms.uTime.value = elapsedTime;

    renderer.render(scene, camera);
    controls.update(deltaTime);
    window.requestAnimationFrame(loop);
};

loop();
