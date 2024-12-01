import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// gui
const gui = new dat.GUI();

const scene = new THREE.Scene();
const canvas = document.getElementById("root");

// window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};
window.addEventListener("resize", () => {
    // update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

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

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

// loop
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const loop = () => {
    // delta time
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;

    renderer.render(scene, camera);
    controls.update(deltaTime);
    window.requestAnimationFrame(loop);
};

loop();
