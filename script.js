import * as THREE from 'three';
import Spheres2Background from './assets/spheres2.cdn.min.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const bg = Spheres2Background(document.getElementById('webgl-canvas'), {
    count: 900,
    colors: [0xff0000, 0x0, 0xffffff],
    minSize: 0.2,
    maxSize: 0.4
});

// Küre merkezini çekim noktası olarak ayarla
bg.spheres.config.center = { x: 0, y: 0, z: 0 };

// Yerçekimini başlangıçta tam olarak ayarla
bg.spheres.config.gravity = 1;


window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            section.style.opacity = 1;
            section.style.transform = 'translateY(0)';
        } else {
            section.style.opacity = 0;
            section.style.transform = 'translateY(50px)';
        }
    });
});

// const canvas = document.getElementById('webgl-canvas');
// canvas.style.width = '100%';
// canvas.style.height = '100%';

// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xbfe3dd);
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ canvas });
// renderer.setSize(window.innerWidth, window.innerHeight);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.target.set(0, 0, 0);

// const loader = new GLTFLoader();
// loader.load(
//     './assets/iphone-16.glb',
//     (gltf) => {
//         const model = gltf.scene;
//         console.log(model)
//         model.position.set(0, 0, 0);
//         model.scale.set(0.5, 0.5, 0.5);
//         scene.add(model);


//         controls.target.copy(model.position);
//         controls.update();
//     },


//     undefined,
//     (error) => {
//         console.error('Model yüklenirken bir hata oluştu:', error);
//     }
// );

// camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();