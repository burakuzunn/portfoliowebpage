import { Component, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'showtime';
  private model: THREE.Object3D | null = null; // Modeli takip etmek için

  ngAfterViewInit(): void {
    const width = window.innerWidth, height = window.innerHeight;

    // Kamera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 1, 3); // Kamera biraz daha uzakta başlasın

    // Sahne
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3dd); // Açık mavi arkaplan

    // Işıklar
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // OrbitControls (Kullanıcının modeli çevirmesine izin verir)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // GLTF Modeli Yükleme
    const loader = new GLTFLoader();
    loader.load('/assets/iphone-16.glb', (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, -10);
      model.scale.set(0.5, 0.5, 0.5);
      scene.add(model);

      this.model = model; // Modeli kaydet

      controls.target.copy(model.position);
      controls.update();
    }, undefined, (error) => {
      console.error('Model yüklenirken hata oluştu:', error);
    });

    // Ekran boyutu değiştiğinde güncelleme
    window.addEventListener('resize', () => {
      const width = window.innerWidth, height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // Animasyon fonksiyonu (Model kendi ekseni etrafında dönecek)
    const animate = () => {
      requestAnimationFrame(animate);

      if (this.model) {
        this.model.rotation.y += 0.01; // Modeli Y ekseninde sürekli döndür
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }
}
