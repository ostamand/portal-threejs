import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";

// states
const states = {
    axePlaying: false,
};

// gui
const debugObject = {};
const gui = new dat.GUI({ width: 400 });
//gui.hide();

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

// raycaster
const raycaster = new THREE.Raycaster();

// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2; // don't go below ground

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    //antialias: true,
});
renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.shadowMap.autoUpdate = true;
renderer.receiveShadow = true;
//renderer.outputEncoding = THREE.sRGBEncoding;
//renderer.physicallyCorrectLights = true;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

debugObject.clearColor = "#140d13";
renderer.setClearColor(debugObject.clearColor);

gui.addColor(debugObject, "clearColor").onChange(() =>
    renderer.setClearColor(debugObject.clearColor)
);

// lights

const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
//ambientLight.castShadow = true;
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.castShadow = true;
//directionalLight.shadow.camera.near = 0.1;

gui.add(directionalLight.shadow, "bias").min(-0.01).max(0.01).step(0.00001);
//gui.add(directionalLight.shadow.camera, "near").min(0).max(100).step(1);
//gui.add(directionalLight.shadow.camera, "far").min(0).max(100).step(1);
/* 
gui.add(directionalLight.shadow.camera, "top").min(-10).max(10).step(1);
gui.add(directionalLight.shadow.camera, "right").min(-10).max(10).step(1);
gui.add(directionalLight.shadow.camera, "bottom").min(-10).max(10).step(1);
gui.add(directionalLight.shadow.camera, "left").min(-10).max(10).step(1); */
gui.add(directionalLight.shadow, "radius").min(0).max(10).step(1);
//directionalLight.shadow.mapSize.width = 1024;
//directionalLight.shadow.mapSize.height = 1024;

//directionalLight.shadow.bias = -0.0005;
//directionalLight.position.set(-12.8855, 8.7629, 10.0596);
directionalLight.position.set(-12, 20.0, -15);

gui.add(directionalLight.position, "x").min(-20).max(20).step(0.1);
gui.add(directionalLight.position, "y").min(-20).max(50).step(0.1);
gui.add(directionalLight.position, "z").min(-20).max(20).step(0.1);

scene.add(directionalLight);

//directionalLight.shadow.mapSize.width = 1024;
//directionalLight.shadow.mapSize.height = 1024;
//directionalLight.shadow.camera.near = 12;
//directionalLight.shadow.camera.far = 30;

const helper = new THREE.DirectionalLightHelper(directionalLight);
//scene.add(helper);
/*
const directionalLightCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera
);
scene.add(directionalLightCameraHelper);
*/

//const dlHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
//scene.add(dlHelper);

//directionalLight.shadow.mapSize.width = 1024;
//directionalLight.shadow.mapSize.height = 1024;
//directionalLight.shadow.camera.near = 1;
//directionalLight.shadow.camera.far = 2;

// loaders
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// textures
const bakedTexture = textureLoader.load("models/baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

// materials
const bakedMaterial = new THREE.MeshStandardMaterial({
    map: bakedTexture,
    metalness: 0,
    roughness: 1,
});

/*
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(cubeGeometry, bakedMaterial);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.y = 2;
scene.add(cube);

const planeGeometry = new THREE.PlaneGeometry(5, 5, 5);
const plane = new THREE.Mesh(planeGeometry, bakedMaterial);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;
scene.add(plane);
*/

const poleLightMaterial = new THREE.MeshStandardMaterial({ color: 0xede8c7 });
const portalLightMaterial = new THREE.MeshStandardMaterial({
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
let mixer = null;
let environmentModel = null;

const actions = {};
gltfLoader.load("models/portal_baked_v5.glb", (loadedAsset) => {
    // hard coded test
    let trunks = loadedAsset.scene.children.filter(
        (mesh) => mesh.name === "Cylinder" || mesh.name == "Cylinder001"
    );
    trunks.forEach((trunk) => (trunk.receiveShadow = true));

    //console.log(loadedAsset);

    // hard coded plane
    const plane = loadedAsset.scene.children.find(
        (mesh) => mesh.name === "Plane"
    );
    plane.receiveShadow = true;

    // hard coded axe
    const axe = loadedAsset.scene.children.find((mesh) => mesh.name === "axe");
    axe.children.forEach((mesh) => {
        mesh.castShadow = true;
    });

    /*
    loadedAsset.scene.children.find((mesh) => mesh.name === "baked").material =
        bakedMaterial;
    */
    loadedAsset.scene.traverse((child) => {
        /*
        if (object.isMesh) {
            object.material = bakedMaterial;
            object.castShadow = true;
            object.receiveShadow = true;
            object.material.metalness = 0;
            object.material.rougness = 1;
            console.log(object);
        }

        */

        if (child.isMesh) {
            child.material = bakedMaterial;
            //child.castShadow = true;
            //child.receiveShadow = true;

            /*
            child.material.map = bakedTexture;
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.metalness = 0;
            child.material.rougness = 1;

            //child.geometry.computeVertexNormals();

            */
        }
    });

    loadedAsset.scene.children.find((mesh) => mesh.name === "lightA").material =
        poleLightMaterial;
    loadedAsset.scene.children.find((mesh) => mesh.name === "lightB").material =
        poleLightMaterial;

    const portal = loadedAsset.scene.children.find(
        (mesh) => mesh.name === "portal"
    );
    portal.material = portalLightMaterial;

    // mixer for animation
    mixer = new THREE.AnimationMixer(loadedAsset.scene);
    mixer.addEventListener("loop", (event) => {
        //console.log(event);
    });

    const action = mixer.clipAction(loadedAsset.animations[0]);
    action.repetitions = 2;

    actions.axe = action;

    environmentModel = loadedAsset.scene;

    //console.log(loadedAsset.scene.children);
    //console.log(loadedAsset.scene);
    loadedAsset.scene.castShadow = true;
    loadedAsset.scene.receiveShadow = true;
    scene.add(loadedAsset.scene);
});

// events

// events: window resize
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

// events: click
window.addEventListener("click", (event) => {
    if (event.target === canvas) {
        const mouse = {
            x: (event.clientX / sizes.width) * 2 - 1,
            y: -((event.clientY / sizes.height) * 2 - 1),
        };

        // raycast
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(environmentModel);

        // check if clicked on axe
        if (!states.axePlaying) {
            const axes = intersects.filter((intersect) =>
                intersect.object.name.startsWith("axe")
            );
            if (axes.length) {
                actions.axe.reset();
                actions.axe.play();
            }
        }
    }
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

    // animations
    mixer?.update(deltaTime);

    renderer.render(scene, camera);
    controls.update(deltaTime);
    window.requestAnimationFrame(loop);
};

loop();
