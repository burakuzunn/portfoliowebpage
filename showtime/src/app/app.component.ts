import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'portfoliowebpage';
  private environment: Environment | null = null;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.preload();
  }

  goToPhone(): void {
    this.router.navigate(['/phone']);
  }

  preload(): void {
    let manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      if (this.environment) {
        // Environment zaten oluşturulmuş
        return;
      }
      const typo = (window as any).loadedFont;
      const particle = (window as any).loadedParticle;
      if (typo && particle) {
        this.environment = new Environment(typo, particle);
      }
    };

    var typo: any = null;
    const loader = new FontLoader(manager);
    loader.load('https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json', (font) => {
      typo = font;
      (window as any).loadedFont = font;
      if ((window as any).loadedParticle) {
        manager.onLoad();
      }
    });

    const particleLoader = new THREE.TextureLoader(manager);
    particleLoader.load('https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png', (texture) => {
      (window as any).loadedParticle = texture;
      if ((window as any).loadedFont) {
        manager.onLoad();
      }
    });
  }
}

class Environment {
  font: any;
  particle: THREE.Texture;
  container: HTMLElement;
  scene: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  createParticles!: CreateParticles;
  createParticlesComingSoon!: CreateParticles;

  constructor(font: any, particle: THREE.Texture) {
    this.font = font;
    this.particle = particle;
    this.container = document.querySelector('#magic')!;
    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.setup();
    this.bindEvents();
  }

  bindEvents(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setup(): void {
    // Mobil cihazlar için text size'ı ayarla
    const isMobile = this.isMobileDevice();
    const screenWidth = window.innerWidth;
    
    // Ekran genişliğine göre dinamik text size
    let mainTextSize: number;
    let subTextSize: number;
    let yOffset: number;
    
    if (screenWidth < 480) {
      // Çok küçük ekranlar (telefonlar)
      mainTextSize = 8;
      subTextSize = 5;
      yOffset = -15;
    } else if (screenWidth < 768) {
      // Küçük ekranlar (tabletler)
      mainTextSize = 10;
      subTextSize = 6;
      yOffset = -20;
    } else {
      // Büyük ekranlar
      mainTextSize = 16;
      subTextSize = 10;
      yOffset = -30;
    }
    
    this.createParticles = new CreateParticles(
      this.scene,
      this.font,
      this.particle,
      this.camera,
      this.renderer,
      'Burak Uzun',
      mainTextSize,
      0
    );
    this.createParticlesComingSoon = new CreateParticles(
      this.scene,
      this.font,
      this.particle,
      this.camera,
      this.renderer,
      'Coming Soon',
      subTextSize,
      yOffset
    );
  }

  isMobileDevice(): boolean {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  render(): void {
    this.createParticles.render();
    this.createParticlesComingSoon.render();
    this.renderer.render(this.scene, this.camera);
  }

  createCamera(): void {
    // Mobil için camera FOV'u ayarla
    const isMobile = this.isMobileDevice();
    const fov = isMobile ? 75 : 65;
    
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.container.clientWidth / this.container.clientHeight,
      1,
      10000
    );
    // Mobil için camera pozisyonunu biraz daha uzaklaştır
    const zPosition = isMobile ? 120 : 100;
    this.camera.position.set(0, 0, zPosition);
  }

  createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(() => {
      this.render();
    });
  }

  onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    
    // Mobil için camera FOV'u güncelle
    const isMobile = this.isMobileDevice();
    const fov = isMobile ? 75 : 65;
    this.camera.fov = fov;
    
    // Mobil için camera pozisyonunu güncelle
    const zPosition = isMobile ? 120 : 100;
    this.camera.position.z = zPosition;
    
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}

class CreateParticles {
  scene: THREE.Scene;
  font: any;
  particleImg: THREE.Texture;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  colorChange: THREE.Color;
  buttom: boolean;
  data: any;
  planeArea!: THREE.Mesh;
  particles!: THREE.Points;
  geometryCopy!: THREE.BufferGeometry;

  constructor(
    scene: THREE.Scene,
    font: any,
    particleImg: THREE.Texture,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    text: string = 'Burak Uzun',
    textSize: number = 16,
    yOffset: number = 0
  ) {
    this.scene = scene;
    this.font = font;
    this.particleImg = particleImg;
    this.camera = camera;
    this.renderer = renderer;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);

    this.colorChange = new THREE.Color();

    this.buttom = false;

    // Mobil cihazlar için particle sayısını azalt
    const screenWidth = window.innerWidth;
    let particleAmount: number;
    
    if (screenWidth < 480) {
      particleAmount = 600; // Çok küçük ekranlar için daha az particle
    } else if (screenWidth < 768) {
      particleAmount = 800; // Küçük ekranlar için
    } else {
      particleAmount = 1500; // Büyük ekranlar için
    }
    
    this.data = {
      text: text,
      amount: particleAmount,
      particleSize: 1,
      particleColor: 0xffffff,
      textSize: textSize,
      area: 250,
      ease: 0.05,
      yOffset: yOffset
    };

    this.setup();
    this.bindEvents();
  }

  setup(): void {
    // PlaneArea'yı tam ekranı kapsayacak şekilde büyüt (3x daha büyük)
    const depth = this.camera.position.z;
    const width = this.visibleWidthAtZDepth(depth, this.camera) * 3; // 3x genişlik
    const height = this.visibleHeightAtZDepth(depth, this.camera) * 3; // 3x yükseklik
    
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
    });
    this.planeArea = new THREE.Mesh(geometry, material);
    this.planeArea.visible = false;
    this.createText();
  }

  bindEvents(): void {
    // Mouse events
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('mouseleave', this.onMouseUp.bind(this));
    
    // Touch events for mobile
    document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    document.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: true });
  }

  onMouseDown(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    vector.unproject(this.camera);
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const currenPosition = this.camera.position.clone().add(dir.multiplyScalar(distance));

    const pos = this.particles.geometry.attributes['position'];
    this.buttom = true;
    this.data.ease = 0.01;
  }

  onMouseUp(): void {
    this.buttom = false;
    this.data.ease = 0.05;
  }

  onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault(); // Mouse event'lerini engelle
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

      const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
      vector.unproject(this.camera);
      const dir = vector.sub(this.camera.position).normalize();
      const distance = -this.camera.position.z / dir.z;
      const currenPosition = this.camera.position.clone().add(dir.multiplyScalar(distance));

      const pos = this.particles.geometry.attributes['position'];
      this.buttom = true;
      this.data.ease = 0.01;
    }
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault(); // Scroll'u engelle ve mouse event'lerini engelle
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    // Touch bittiğinde buton durumunu sıfırla ama animasyon devam etsin
    this.buttom = false;
    this.data.ease = 0.05;
    // Mouse pozisyonunu son dokunma pozisyonunda bırak ki animasyon devam etsin
    // Eğer changedTouches yoksa, son dokunma pozisyonunu koru veya ekranın ortasına ayarla
    if (event.changedTouches && event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    } else {
      // Eğer changedTouches yoksa, mouse pozisyonunu ekranın ortasına ayarla
      // Böylece animasyon devam eder
      this.mouse.x = 0;
      this.mouse.y = 0;
    }
  }

  render(level?: number): void {
    const time = ((0.001 * performance.now()) % 12) / 12;
    const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.planeArea);

    // Her zaman particle'ları güncelle ki animasyon devam etsin
    const pos = this.particles.geometry.attributes['position'];
    const copy = this.geometryCopy.attributes['position'];
    const coulors = this.particles.geometry.attributes['customColor'];
    const size = this.particles.geometry.attributes['size'];

    if (intersects.length > 0) {
      const mx = intersects[0].point.x;
      const my = intersects[0].point.y;
      const mz = intersects[0].point.z;

      for (var i = 0, l = pos.count; i < l; i++) {
        const initX = copy.getX(i);
        const initY = copy.getY(i);
        const initZ = copy.getZ(i);

        let px = pos.getX(i);
        let py = pos.getY(i);
        let pz = pos.getZ(i);

        this.colorChange.setHSL(0.5, 1, 1);
        coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
        coulors.needsUpdate = true;

        size.array[i] = this.data.particleSize;
        size.needsUpdate = true;

        let dx = mx - px;
        let dy = my - py;
        const dz = mz - pz;

        const mouseDistance = this.distance(mx, my, px, py);
        let d = (dx = mx - px) * dx + (dy = my - py) * dy;
        const f = -this.data.area / d;

        if (this.buttom) {
          // Orijinal mantık: basılı tutunca partiküller mouse'dan uzaklaşıyor
          const t = Math.atan2(dy, dx);
          px -= f * Math.cos(t);
          py -= f * Math.sin(t);

          this.colorChange.setHSL(0.5 + zigzagTime, 1.0, 0.5);
          coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
          coulors.needsUpdate = true;

          if (
            px > initX + 70 ||
            px < initX - 70 ||
            py > initY + 70 ||
            py < initY - 70
          ) {
            this.colorChange.setHSL(0.15, 1.0, 0.5);
            coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
            coulors.needsUpdate = true;
          }
        } else {
          // Orijinal mantık: mouse yakınındaki partiküller mouse'a doğru hareket ediyor
          if (mouseDistance < this.data.area) {
            if (i % 5 == 0) {
              const t = Math.atan2(dy, dx);
              px -= 0.03 * Math.cos(t);
              py -= 0.03 * Math.sin(t);

              this.colorChange.setHSL(0.15, 1.0, 0.5);
              coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
              coulors.needsUpdate = true;

              size.array[i] = this.data.particleSize / 1.2;
              size.needsUpdate = true;
            } else {
              const t = Math.atan2(dy, dx);
              px += f * Math.cos(t);
              py += f * Math.sin(t);

              pos.setXYZ(i, px, py, pz);
              pos.needsUpdate = true;

              size.array[i] = this.data.particleSize * 1.3;
              size.needsUpdate = true;
            }

            if (
              px > initX + 10 ||
              px < initX - 10 ||
              py > initY + 10 ||
              py < initY - 10
            ) {
              this.colorChange.setHSL(0.15, 1.0, 0.5);
              coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
              coulors.needsUpdate = true;

              size.array[i] = this.data.particleSize / 1.8;
              size.needsUpdate = true;
            }
          }
        }

        // Orijinal mantık: partiküller başlangıç pozisyonlarına dönüyor
        px += (initX - px) * this.data.ease;
        py += (initY - py) * this.data.ease;
        pz += (initZ - pz) * this.data.ease;

        pos.setXYZ(i, px, py, pz);
        pos.needsUpdate = true;
      }
    } else {
      // Eğer mouse pozisyonu planeArea ile kesişmiyorsa, sadece particle'ları başlangıç pozisyonlarına döndür
      // Renk ve boyut değişikliklerini yapmıyoruz, çünkü bunlar orijinal mantıkta zaten yönetiliyor
      for (var i = 0, l = pos.count; i < l; i++) {
        const initX = copy.getX(i);
        const initY = copy.getY(i);
        const initZ = copy.getZ(i);

        let px = pos.getX(i);
        let py = pos.getY(i);
        let pz = pos.getZ(i);

        // Particle'ları başlangıç pozisyonlarına yavaşça döndür (orijinal mantık)
        px += (initX - px) * this.data.ease;
        py += (initY - py) * this.data.ease;
        pz += (initZ - pz) * this.data.ease;

        pos.setXYZ(i, px, py, pz);
        pos.needsUpdate = true;
      }
    }
  }

  createText(): void {
    let thePoints: THREE.Vector3[] = [];

    let shapes = this.font.generateShapes(this.data.text, this.data.textSize);
    let geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    const xMid =
      -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
    const yMid =
      (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y) / 2.85;

    geometry.center();

    let holeShapes: any[] = [];

    for (let q = 0; q < shapes.length; q++) {
      let shape = shapes[q];

      if ((shape as any).holes && (shape as any).holes.length > 0) {
        for (let j = 0; j < (shape as any).holes.length; j++) {
          let hole = (shape as any).holes[j];
          holeShapes.push(hole);
        }
      }
    }
    shapes.push.apply(shapes, holeShapes);

    let colors: number[] = [];
    let sizes: number[] = [];

    for (let x = 0; x < shapes.length; x++) {
      let shape = shapes[x];

      const amountPoints =
        (shape as any).type == 'Path' ? this.data.amount / 2 : this.data.amount;

      let points = shape.getSpacedPoints(amountPoints);

      points.forEach((element: any, z: number) => {
        const a = new THREE.Vector3(element.x, element.y, 0);
        thePoints.push(a);
        colors.push(this.colorChange.r, this.colorChange.g, this.colorChange.b);
        sizes.push(1);
      });
    }

    let geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
    geoParticles.translate(xMid, yMid + this.data.yOffset, 0);

    geoParticles.setAttribute(
      'customColor',
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geoParticles.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    const vertexShader = document.getElementById('vertexshader')!.textContent!;
    const fragmentShader = document.getElementById('fragmentshader')!.textContent!;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: this.particleImg },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    this.particles = new THREE.Points(geoParticles, material);
    this.scene.add(this.particles);

    this.geometryCopy = new THREE.BufferGeometry();
    this.geometryCopy.copy(this.particles.geometry);
  }

  visibleHeightAtZDepth(depth: number, camera: THREE.PerspectiveCamera): number {
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    const vFOV = (camera.fov * Math.PI) / 180;

    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  visibleWidthAtZDepth(depth: number, camera: THREE.PerspectiveCamera): number {
    const height = this.visibleHeightAtZDepth(depth, camera);
    return height * camera.aspect;
  }

  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }
}
